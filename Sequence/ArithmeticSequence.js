//AK/Sequence/ArithmeticSequence.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.arithmeticSequence) return;

  ak.arithmeticSequence = function(a, d) {
   if(ak.nativeType(a)!==ak.NUMBER_T || !isFinite(a)) throw new Error('invalid first term in ak.arithmeticSequence');
   if(ak.nativeType(d)!==ak.NUMBER_T || !isFinite(d)) throw new Error('invalid difference in ak.arithmeticSequence');

   if(d!==0) {
    return function(i) {
     if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.arithmeticSequence');
     return a + i*d;
    };
   }

   return function(i) {
    if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.arithmeticSequence');
    return a;
   };
  };
 }
 ak.using('', define);
})();
