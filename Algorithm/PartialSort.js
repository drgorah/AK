//AK/Algorithm/PartialSort.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.partialSort) return;

  ak.partialSort = function(a, mid, compare, start, end) {
   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.partialSort');

   mid = ak.arrayIndex(a, mid, 'ak.partialSort');

   if(ak.nativeType(mid)===ak.UNDEFINED_T) throw new Error('invalid mid in ak.partialSort');

   start = ak.arrayIndex(a, start, 'ak.partialSort');
   end = ak.arrayIndex(a, end, 'ak.partialSort');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   if(mid<start)     mid = start;
   else if (mid>end) mid = end;

   ak._unsafeNthElement(a, mid-1, compare, start, end);
   ak._unsafeSort(a, compare, start, mid-1);
  };
 }

 ak.using(['Algorithm/NthElement.js', 'Algorithm/Sort.js'], define);
})();
