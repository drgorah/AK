//AK/Series/GeometricSeries.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.geometricSeries) return;

  ak.geometricSeries = function(a, r) {
   var mul;

   if(ak.nativeType(a)!==ak.NUMBER_T || !isFinite(a)) throw new Error('invalid first term in ak.geometricSeries');
   if(ak.nativeType(r)!==ak.NUMBER_T || !isFinite(r)) throw new Error('invalid ratio in ak.geometricSeries');

   if(a!==0 && r<=-1) {
    mul = 1/(1-r);

    return function(i) {
     if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.geometricSeries');
     return isFinite(i+1) ? a*(1-Math.pow(r, i+1))*mul : ak.NaN;
    };
   }

   if(a!=0 && r!==1) {
    mul = 1/(1-r);

    return function(i) {
     if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.geometricSeries');
     return a*(1-Math.pow(r, i+1))*mul;
    };
   }

   if(a!==0) {
    return function(i) {
     if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.geometricSeries');
     return (i+1)*a;
    };
   }

   return function(i) {
    if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.geometricSeries');
    return 0;
   };
  };
 }
 ak.using('', define);
})();
