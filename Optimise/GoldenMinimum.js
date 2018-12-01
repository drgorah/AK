//AK/Optimise/GoldenMinimum.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.goldenMinimum) return;

  var D = ak.PHI-1;
  var B = 1-D;

  function bisect(x, fx) {
   var m = B*x[0] + D*x[2];

   if(m===x[1] || m===x[2]) m = x[0] = x[1] = x[2] = fx[1]<fx[2] ? x[1] : x[2];
   return m;
  }

  function update(x, fx, m, fm) {
   if(fm>fx[1]) {
    x[2] = x[0];
    x[0] = m;

    fx[2] = fx[0];
    fx[0] = fm;
   }
   else {
    x[0] = x[1];
    x[1] = m;

    fx[0] = fx[1];
    fx[1] = fm;
   }
  }

  function minimum(f, x0, x1, eps) {
   var f0 = f(x0);
   var f1 = f(x1);
   var m, fm, x, fx, i;

   if(f0<f1) {
    m  = x0; x0 = x1; x1 = m;
    fm = f0; f0 = f1; f1 = fm;
   }

   m  = x0!==x1 ? D*x0 + B*x1 : x0;
   fm = f(m);
   x  = [x0, m, x1];
   fx = [f0, fm, f1];

   if(!isFinite(m)) throw new Error('invalid argument in ak.goldenMinimum');
   for(i=0;i<3;++i) if(isNaN(fx[i])) fx[i] = ak.INFINITY;

   while(ak.diff(x[0], x[2])>eps) {
    m  = bisect(x, fx);
    if(isNaN(fm = f(m))) fm = ak.INFINITY;
    update(x, fx, m, fm);
   }
   if(f0<fx[1] || f1<fx[1]) return f0<f1 ? x0 : x1;
   return !isNaN(f(x[1])) ? x[1] : ak.NaN;
  }

  ak.goldenMinimum = function(f, threshold) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.goldenMinimum');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 0.75) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('invalid convergence threshold in ak.goldenMinimum');

   return function(x0, x1) {return minimum(f, x0, x1, threshold);};
  };
 }

 ak.using('', define);
})();