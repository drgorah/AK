//AK/Algorithm/ArrayIndex.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.arrayIndex) return;

  ak.arrayIndex = function(a, i, caller) {
   var n;

   if(ak.nativeType(a)!==ak.ARRAY_T) {
    if(ak.nativeType(caller)!==ak.STRING_T) caller = 'ak.arrayIndex';
    throw new Error('invalid array in ' + caller);
   }

   if(ak.nativeType(i)===ak.UNDEFINED_T) return i;

   if(i!==ak.floor(i)) {
    if(ak.nativeType(caller)!==ak.STRING_T) caller = 'ak.arrayIndex';
    throw new Error('invalid index in ' + caller);
   }

   n = a.length;
   if(i<=-n)    i = 0;
   else if(i<0) i += n;
   else if(i>n) i = n;

   return i;
  };
 }

 ak.using('', define);
})();
