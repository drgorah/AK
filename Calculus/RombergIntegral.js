//AK/Calculus/RombergIntegral.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {

  if(ak.rombergIntegral) return;

  function rombergStep(f, x0, x1, s0, n) {
   var h = (x1-x0)/n;
   var s1 = 0;
   var i;

   if(h===0) return s0;
   for(i=1;i<n;i+=2) s1 += f(x0 + i*h);
   return s0/2 + s1*h;
  }

  function rombergPredict(a, h) {
   var i = ak.nevilleInterpolate(0);
   var terms = a.length;
   var j;

   h *= h;
   for(j=1;j<terms && h>0;++j,h/=4) i.refine(h, a[j-1]);
   return h>0 ? i.refine(h, a[terms-1]) : a[j-1];
  }

  function rombergIntegral(f, x0, x1, eps, steps) {
   var terms = 5;
   var a = [];
   var n = 1;
   var i, j, h0, s0, s1;

   if(ak.nativeType(x1)===ak.UNDEFINED_T) {
    x1 = x0;
    x0 = 0;
   }

   if(!isFinite(x0) || !isFinite(x1)) throw new Error('invalid range of integration in ak.rombergIntegral');

   h0 = x1-x0;
   a.push(0.5*(f(x0)+f(x1))*h0);
   for(i=1;i<terms;++i) a.push(rombergStep(f, x0, x1, a[i-1], n*=2));
   s0 = rombergPredict(a, h0);

   a.shift();
   a.push(rombergStep(f, x0, x1, a[terms-2], n*=2));
   s1 = rombergPredict(a, h0/=2);

   for(i=0;i<steps && ak.diff(s0, s1)>eps;++i) {
    a.shift();
    a.push(rombergStep(f, x0, x1, a[terms-2], n*=2));
    s0 = s1;
    s1 = rombergPredict(a, h0/=2);
   }
   if(!(ak.diff(s0, s1)<=eps)) throw new Error('failure to converge in ak.rombergIntegral');

   return s1;
  }

  ak.rombergIntegral = function(f, threshold, steps) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.rombergIntegral');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 0.75) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('non-numeric threshold passed to ak.rombergIntegral');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 18 : ak.floor(Math.abs(steps));
   if(isNaN(steps)) throw new Error('non-numeric steps passed to ak.rombergIntegral');

   return function(x0, x1) {
    return rombergIntegral(f, x0, x1, threshold, steps);
   };
  };
 }

 ak.using('Approx/NevilleInterpolate.js', define);
})();