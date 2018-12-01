//AK/Algorithm/Sort.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.sort) return;

  ak._unsafeSort = function(a, compare, start, end) {
   if(start===0 && end===a.length) a.sort(compare);
   else if(start<end-1) Array.prototype.splice.apply(a, [start, end-start].concat(a.slice(start, end).sort(compare)));
  };

  ak.sort = function(a, compare, start, end) {
   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.sort');

   start = ak.arrayIndex(a, start, 'ak.sort');
   end = ak.arrayIndex(a, end, 'ak.sort');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   ak._unsafeSort(a, compare, start, end);
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
