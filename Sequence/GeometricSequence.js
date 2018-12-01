//AK/Sequence/GeometricSequence.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.geometricSequence) return;

  ak.geometricSequence = function(a, r) {
   if(ak.nativeType(a)!==ak.NUMBER_T || !isFinite(a)) throw new Error('invalid first term in ak.geometricSequence');
   if(ak.nativeType(r)!==ak.NUMBER_T || !isFinite(r)) throw new Error('invalid ratio in ak.geometricSequence');

   if(a!==0 && r<=-1) {
    return function(i) {
     if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.geometricSequence');
     return isFinite(i) ? a * Math.pow(r, i) : ak.NaN;
    };
   }

   if(a!==0 && r!==1) {
    return function(i) {
     if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.geometricSequence');
     return a * Math.pow(r, i);
    };
   }

   return function(i) {
    if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.geometricSequence');
    return a;
   };
  };
 }
 ak.using('', define);
})();
