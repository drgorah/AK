//AK/Algorithm/IsSortedUntil.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.isSortedUntil) return;

  ak.isSortedUntil = function(a, compare, start, end) {
   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.isSortedUntil');

   start = ak.arrayIndex(a, start, 'ak.isSorted');
   end = ak.arrayIndex(a, end, 'ak.isSorted');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   if(start<end) while(++start<end && !(compare(a[start-1], a[start])>0));
   return start<=end ? start : -1;
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
