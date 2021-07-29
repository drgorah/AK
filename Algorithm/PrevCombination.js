//AK/Algorithm/PrevCombination.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.prevCombination) return;

  ak.prevCombination = function(a, mid, compare, start, end) {
   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.prevCombination');

   mid = ak.arrayIndex(a, mid, 'ak.prevCombination');

   if(ak.nativeType(mid)===ak.UNDEFINED_T) throw new Error('invalid mid in ak.prevCombination');

   start = ak.arrayIndex(a, start, 'ak.prevCombination');
   end = ak.arrayIndex(a, end, 'ak.prevCombination');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   ak._unsafeNextCombination(a, mid, function(a, b){return -compare(a, b);}, start, end);
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js', 'Algorithm/NextCombination.js'], define);
})();
