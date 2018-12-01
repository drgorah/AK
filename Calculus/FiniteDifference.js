//AK/Calculus/FiniteDifference.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {
  if(ak.forwardDifference) return;

  ak.forwardDifference = function(f, e) {
   if(ak.nativeType(f)!==ak.FUNCTION_T)  throw new Error('non-function passed to ak.forwardDifference');
   if(ak.nativeType(e)===ak.UNDEFINED_T) e = Math.sqrt(2*ak.EPSILON);
   if(ak.nativeType(e)!==ak.NUMBER_T)    throw new Error('non-numeric epsilon passed to ak.forwardDifference');

   if(e<=0) throw new Error('non-positive epsilon passed to ak.forwardDifference');

   return function(x) {
    var d  = e*(Math.abs(x)+1);
    var x1 = x + d;
    return (f(x1)-f(x))/(x1-x);
   };
  };

  ak.symmetricDifference = function(f, e) {
   if(ak.nativeType(f)!==ak.FUNCTION_T)  throw new Error('non-function passed to ak.symmetricDifference');
   if(ak.nativeType(e)===ak.UNDEFINED_T) e = Math.pow(3*ak.EPSILON/2, 1/3);
   if(ak.nativeType(e)!==ak.NUMBER_T)    throw new Error('non-numeric epsilon passed to ak.symmetricDifference');

   if(e<=0) throw new Error('non-positive epsilon passed to ak.symmetricDifference');

   return function(x) {
    var d  = e*(Math.abs(x)+1);
    var x0 = x - d;
    var x1 = x + d;
    return (f(x1)-f(x0))/(x1-x0);
   };
  };
 }

 ak.using('', define);
})();