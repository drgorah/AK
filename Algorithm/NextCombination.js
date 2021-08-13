//AK/Algorithm/NextCombination.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.nextCombination) return;

  function makeCombination(a, mid, compare, start, end) {
   ak._unsafeSort(a, compare, start, mid);
   ak._unsafeSort(a, compare, mid, end);
   ak._unsafeRotate(a, ak._unsafeUpperBound(a, a[mid-1], compare, mid, end), mid, end);
  }

  function minGreater(a, target, compare, start, end) {
   var result = end;
   while(start!==end) {
    if(compare(target, a[start])<0 && (result===end || compare(a[start], a[result])<0)) result = start;
    ++start;
   }
   return result;
  }

  ak._unsafeNextCombination = function(a, mid, compare, start, end) {
   var prev, next, pivot;
   if(mid===end) ak._unsafeSort(a, compare, start, end);
   if(mid<=start || mid>=end) return false;

   if(!ak._unsafeIsCombination(a, mid, compare, start, end)) makeCombination(a, mid, compare, start, end);
   prev = mid-1;
   next = mid;

   while(next!==end && compare(a[prev], a[next])===0) ++next;

   if(next===end || compare(a[prev], a[next])>0) {
    next = mid;
    pivot = end;
    while(pivot===end && prev!==start) if(compare(a[--prev], a[--next])!==0) pivot = minGreater(a, a[prev], compare, mid, end);
    if(pivot===end) {
     ak._unsafeRotate(a, mid, start, end);
     return false;
    }
    next = prev+1;
    ak._unsafeRotate(a, pivot, next, end);
   }
   ak._unsafeRotate(a, next, prev, end);
   return true;
  };

  ak.nextCombination = function(a, mid, compare, start, end) {
   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.nextCombination');

   mid = ak.arrayIndex(a, mid, 'ak.nextCombination');

   if(ak.nativeType(mid)===ak.UNDEFINED_T) throw new Error('invalid mid in ak.nextCombination');

   start = ak.arrayIndex(a, start, 'ak.nextCombination');
   end = ak.arrayIndex(a, end, 'ak.nextCombination');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   return ak._unsafeNextCombination(a, mid, compare, start, end);
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js', 'Algorithm/Sort.js', 'Algorithm/UpperBound.js', 'Algorithm/Rotate.js', 'Algorithm/IsCombination.js'], define);
})();
