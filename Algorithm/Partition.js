//AK/Algorithm/Partition.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.partition) return;

  ak._unsafePartition = function(a, pred, start, end) {
   var mid, t;
   while(start<end && pred(a[start])) ++start;
   mid = start;
   while(++mid<end) {
    if(pred(a[mid])) {
     t = a[start];
     a[start++] = a[mid];
     a[mid] = t;
    }
   }
   return start<=end ? start : -1;
  };

  ak.partition = function(a, pred, start, end) {
   if(ak.nativeType(pred)!==ak.FUNCTION_T) throw new Error('invalid predicate in ak.partition');

   start = ak.arrayIndex(a, start, 'ak.partition');
   end = ak.arrayIndex(a, end, 'ak.partition');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   return ak._unsafePartition(a, pred, start, end);
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
