//AK/Series/ArithmeticSeries.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.arithmeticSeries) return;

  ak.arithmeticSeries = function(a, d) {
   if(ak.nativeType(a)!==ak.NUMBER_T || !isFinite(a)) throw new Error('invalid first term in ak.arithmeticSeries');
   if(ak.nativeType(d)!==ak.NUMBER_T || !isFinite(d)) throw new Error('invalid difference in ak.arithmeticSeries');

   if(a!==0 && d!==0) {
    return function(i) {
     if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.arithmeticSeries');
     return (i+1)*(a + 0.5*i*d);
    };
   }

   if(a!==0) {
    return function(i) {
     if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.arithmeticSeries');
     return (i+1)*a;
    };
   }

   if(d!==0) {
    return function(i) {
     if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.arithmeticSeries');
     return 0.5*i*(i+1)*d;
    };
   }

   return function(i) {
    if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.arithmeticSeries');
    return 0;
   };
  };
 }
 ak.using('', define);
})();
