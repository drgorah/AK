//AK/Optimise/BisectMinimum.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.bisectMinimum) return;

  function bisect(x, fx, i) {
   var m = x[1]/2 + x[i]/2;

   if(m===x[1] || m===x[i]) m = x[0] = x[1] = x[2] = fx[1]<fx[i] ? x[1] : x[i];
   return m;
  }

  function update(x, fx, m, fm, i) {
   if(fm>fx[1]) {
    x[i]  = m;
    fx[i] = fm;
   }
   else {
    x[2-i] = x[1];
    x[1]   = m;

    fx[2-i] = fx[1];
    fx[1]   = fm;
   }
  }

  function minimum(f, x0, x1, eps) {
   var m  = x0!==x1 ? x0/2 + x1/2 : x0;
   var f0 = f(x0);
   var f1 = f(x1);
   var fm = f(m);
   var x  = [x0, m, x1];
   var fx = [f0, fm, f1];
   var i;

   if(!isFinite(m)) throw new Error('invalid argument in ak.bisectMinimum');
   for(i=0;i<3;++i) if(isNaN(fx[i])) fx[i] = ak.INFINITY;

   i = f0<f1 ? 0 : 2;
   while(ak.diff(x[0], x[2])>eps) {
    m = bisect(x, fx, i);
    if(isNaN(fm = f(m))) fm = ak.INFINITY;
    update(x, fx, m, fm, i);
    i = 2-i;
   }
   if(f0<fx[1] || f1<fx[1]) return f0<f1 ? x0 : x1;
   return !isNaN(f(x[1])) ? x[1] : ak.NaN;
  }

  ak.bisectMinimum = function(f, threshold) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.bisectMinimum');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 0.75) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('invalid convergence threshold in ak.bisectMinimum');

   return function(x0, x1) {return minimum(f, x0, x1, threshold);};
  };
 }

 ak.using('', define);
})();