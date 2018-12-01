//AK/Algorithm/EqualRange.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.equalRange) return;

  ak.equalRange = function(a, value, compare, start, end) {
   var lb, ub;

   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.equalRange');

   start = ak.arrayIndex(a, start, 'ak.equalRange');
   end = ak.arrayIndex(a, end, 'ak.equalRange');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   lb = ak._unsafeLowerBound(a, value, compare, start, end);
   ub = lb>=0 ? ak._unsafeUpperBound(a, value, compare, lb, end) : -1;

   return [lb, ub];
  };
 }

 ak.using(['Algorithm/LowerBound.js', 'Algorithm/UpperBound.js'], define);
})();
