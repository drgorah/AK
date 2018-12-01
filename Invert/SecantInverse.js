//AK/Invert/SecantInverse.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.secantInverse) return;

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

  function bisect(f, x, fx, y, eps) {
   var m = x[0]!==x[1] ? x[0]/2 + x[1]/2 : x[0];

   if(m===x[0] || m===x[1]) x[0] = x[1] = (y-fx[0]<fx[1]-y) ? x[0] : x[1];
   else update(x, fx, m, f(m), y, eps);
  }

  function inverse(f, y, x, eps) {
   var fx = [f(x[0]), f(x[1])];
   var i  = Math.abs(fx[0]-y)<Math.abs(fx[1]-y) ? 0 : 1;
   var m, fm, bi, fn;

   //assert(isFinite(y));
   //assert((fx[0]<=y && fx[1]>=y) || (fx[0]>=y && fx[1]<=y));

   if(ak.diff(fx[i], y)<=eps) return x[i];

   if(fx[0]>y) {
    m =  x[0];  x[0] =  x[1];  x[1] = m;
    m = fx[0]; fx[0] = fx[1]; fx[1] = m;
    i = 1-i;
   }

   m  = x[i];
   fm = fx[i];

   while(ak.diff(x[0], x[1])>eps) {
    m += (y-fm)/(fx[1]-fx[0]) * (x[1]-x[0]);
    bi = m<=Math.min(x[0], x[1]) || m>=Math.max(x[0], x[1]);

    if(!bi) {
     fn = f(m);
     bi = Math.abs(fn-y)>Math.abs(fm-y)/2;
     update(x, fx, m, fn, y, eps);
    }

    if(bi && x[0]!==x[1]) bisect(f, x, fx, y, eps);

    i  = y-fx[0]<fx[1]-y ? 0 : 1;
    m  = x[i];
    fm = fx[i];
   }
   return m;
  }

  ak.secantInverse = function(f, threshold) {
   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 0.75) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('invalid convergence threshold in ak.secantInverse');

   return function(y, hint) {return inverse(f, y, ak.bracketInverse(f, y, hint), threshold);};
  };
 }

 ak.using('Invert/BracketInverse.js', define);
})();