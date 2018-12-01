//AK/Algorithm/LowerBound.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.lowerBound) return;

  ak._unsafeLowerBound = function(a, value, compare, start, end) {
   var mid;

   while(start<end) {
    mid = ak.floor((start+end)/2);
    if(compare(a[mid], value)<0) start = mid+1;
    else                         end = mid;
   }
   return start<=end ? start : -1;
  };

  ak.lowerBound = function(a, value, compare, start, end) {
   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.lowerBound');

   start = ak.arrayIndex(a, start, 'ak.lowerBound');
   end = ak.arrayIndex(a, end, 'ak.lowerBound');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   return ak._unsafeLowerBound(a, value, compare, start, end);
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
