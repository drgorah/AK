//AK/Invert/BisectInverse.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.bisectInverse) return;

  function bisect(x, fx, y) {
   var m = x[0]!==x[1] ? x[0]/2 + x[1]/2 : x[0];

   if(m===x[0] || m===x[1]) m = x[0] = x[1] = y-fx[0]<fx[1]-y ? x[0] : x[1];
   return m;
  }

  function update(x, fx, m, fm, y, eps) {
   var i = fm>y ? 1 : 0;

   if(ak.diff(fm, y)>eps) {
    x[i]  = m;
    fx[i] = fm;
   }
   else {
    x[0] = x[1] = isNaN(fm) ? ak.NaN : m;
   }
  }

  function inverse(f, y, x, eps) {
   var fx = [f(x[0]), f(x[1])];
   var m;

   //assert(isFinite(y));
   //assert((fx[0]<=y && fx[1]>=y) || (fx[0]>=y && fx[1]<=y));

   if(ak.diff(fx[0], y)<=eps || ak.diff(fx[1], y)<=eps) return Math.abs(fx[0]-y)<Math.abs(fx[1]-y) ? x[0] : x[1];

   if(fx[0]>y) {
    m =  x[0];  x[0] =  x[1];  x[1] = m;
    m = fx[0]; fx[0] = fx[1]; fx[1] = m;
   }

   m = bisect(x, fx, y);

   while(ak.diff(x[0], x[1])>2*eps) {
    update(x, fx, m, f(m), y, eps);
    m = bisect(x, fx, y);
   }
   return m;
  }

  ak.bisectInverse = function(f, threshold) {
   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 0.75) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('invalid convergence threshold in ak.bisectInverse');

   return function(y, hint) {return inverse(f, y, ak.bracketInverse(f, y, hint), threshold);};
  };
 }

 ak.using('Invert/BracketInverse.js', define);
})();