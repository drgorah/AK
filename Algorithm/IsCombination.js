//AK/Algorithm/IsCombination.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.IsCombination) return;

  function isSorted(a, compare, start, end) {
   while(++start!==end && compare(a[start-1], a[start])<=0);
   return start===end;
  }

  ak._unsafeIsCombination = function(a, mid, compare, start, end) {
   var prev, next;
   if(!isSorted(a, compare, start, mid)) return false;
   if(mid<=start || mid>=end) return true;

   prev = mid-1;
   next = mid+1;
   while(next!==end && !(compare(a[next],a[prev])>=0 && compare(a[next],a[mid])<0)) ++next;
   if(next!==end) return false;

   prev = mid-1;
   next = mid+1;
   while(next!==end && compare(a[next], a[mid])>=0 && compare(a[prev], a[mid])<0) {++mid;++next;}
   if(next===end) return true;
   if(compare(a[prev], a[mid])>=0) return false;

   ++mid; ++next;
   while(next!==end && compare(a[next], a[mid])>=0 && compare(a[prev], a[mid])>=0) {++mid;++next;}
   return next===end;
  };

  ak.isCombination = function(a, mid, compare, start, end) {
   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.isCombination');

   mid = ak.arrayIndex(a, mid, 'ak.isCombination');

   if(ak.nativeType(mid)===ak.UNDEFINED_T) throw new Error('invalid mid in ak.isCombination');

   start = ak.arrayIndex(a, start, 'ak.isCombination');
   end = ak.arrayIndex(a, end, 'ak.isCombination');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   return ak._unsafeIsCombination(a, mid, compare, start, end);
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
