//AK/Algorithm/Reverse.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.reverse) return;

  ak._unsafeReverse = function(a, start, end) {
   if(start===0 && end===a.length) a.reverse();
   else if(start<end-1) Array.prototype.splice.apply(a, [start, end-start].concat(a.slice(start, end).reverse()));
  };

  ak.reverse = function(a, start, end) {
   start = ak.arrayIndex(a, start, 'ak.reverse');
   end = ak.arrayIndex(a, end, 'ak.reverse');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   ak._unsafeReverse(a, start, end);
  };
 }

 ak.using(['Algorithm/ArrayIndex.js'], define);
})();
