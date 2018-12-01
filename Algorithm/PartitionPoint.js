//AK/Algorithm/PartitionPoint.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.partitionPoint) return;

  ak.partitionPoint = function(a, pred, start, end) {
   var mid;

   if(ak.nativeType(pred)!==ak.FUNCTION_T) throw new Error('invalid predicate in ak.partitionPoint');

   start = ak.arrayIndex(a, start, 'ak.partitionPoint');
   end = ak.arrayIndex(a, end, 'ak.partitionPoint');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   while(start<end) {
    mid = ak.floor(0.5*(start+end));
    if(!pred(a[mid])) end = mid;
    else              start = mid+1;
   }
   return start===end ? start : -1;
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
