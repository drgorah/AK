//AK/Random/BaysDurhamRnd.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.baysDurhamRnd) return;

  ak.baysDurhamRnd = function(rnd, n) {
   var v, i, x;

   if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid generator in ak.baysDurhamRnd');

   if(ak.nativeType(n)===ak.UNDEFINED_T) n = 16;
   else if(ak.nativeType(n)!==ak.NUMBER_T) throw new Error('non-numeric buffer size in ak.baysDurhamRnd');
   n = Number(n);

   if(n!==ak.floor(n) || n<2) throw new Error('invalid buffer size in ak.baysDurhamRnd');

   v = new Array(n);
   for(i=0;i<n;++i) v[i] = rnd();
   x = rnd();

   return function() {
    i = ak.floor(n*x);
    x = v[i];
    v[i] = rnd();
    return x;
   };
  };
 }

 ak.using('', define);
})();
