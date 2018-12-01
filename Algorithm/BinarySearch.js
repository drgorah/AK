//AK/Algorithm/BinarySearch.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.binarySearch) return;

  ak.binarySearch = function(a, value, compare, start, end) {
   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.binarySearch');

   start = ak.arrayIndex(a, start, 'ak.binarySearch');
   end = ak.arrayIndex(a, end, 'ak.binarySearch');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   start = ak._unsafeLowerBound(a, value, compare, start, end);
   return start>=0 && start<end && compare(a[start], value)===0;
  };
 }

 ak.using('Algorithm/LowerBound.js', define);
})();
