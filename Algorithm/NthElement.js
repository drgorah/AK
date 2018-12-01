//AK/Algorithm/NthElement.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.nthElement) return;

  function pivot(a, compare, start, end) {
   var mid = ak.floor((start+end)/2);
   var a0 = a[start];
   var a1 = a[mid];
   var a2 = a[end-1];
   if(!(compare(a0,a1)>0)) {
    if(!(compare(a1,a2)>0)) return mid;
    if(!(compare(a0,a2)>0)) return end-1;
    return start;
   }
   if(!(compare(a0,a2)>0)) return start;
   if(!(compare(a2,a1)>0)) return mid;
   return end-1;
  }

  ak._unsafeNthElement = function(a, mid, compare, start, end) {
   var v, p;

   if(start>end || mid===end) return undefined;

   while(start<end-1) {
    p = pivot(a, compare, start, end);
    v = a[p]; a[p] = a[end-1]; a[end-1] = v;
    p = ak._unsafePartition(a, function(x){return compare(x, v)<0;}, start, end-1);
    v = a[p]; a[p] = a[end-1]; a[end-1] = v;

    if(p===mid)    start = end;
    else if(p<mid) start = p+1;
    else           end = p;
   }
   return a[mid];
  };

  ak.nthElement = function(a, mid, compare, start, end) {
   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.nthElement');

   mid = ak.arrayIndex(a, mid, 'ak.nthElement');

   if(ak.nativeType(mid)===ak.UNDEFINED_T) throw new Error('invalid mid in ak.nthElement');

   start = ak.arrayIndex(a, start, 'ak.nthElement');
   end = ak.arrayIndex(a, end, 'ak.nthElement');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   if(mid<start)    mid = start;
   else if(mid>end) mid = end;

   return ak._unsafeNthElement(a, mid, compare, start, end);
  };
 }

 ak.using('Algorithm/Partition.js', define);
})();
