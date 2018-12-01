//AK/Algorithm/UpperBound.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.upperBound) return;

  ak._unsafeUpperBound = function(a, value, compare, start, end) {
   var mid;

   while(start<end) {
    mid = ak.floor((start+end)/2);
    if(!(compare(value, a[mid])<0)) start = mid+1;
    else                            end = mid;
   }
   return start<=end ? start : -1;
  };

  ak.upperBound = function(a, value, compare, start, end) {
   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.upperBound');

   start = ak.arrayIndex(a, start, 'ak.upperBound');
   end = ak.arrayIndex(a, end, 'ak.upperBound');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   return ak._unsafeUpperBound(a, value, compare, start, end);
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
