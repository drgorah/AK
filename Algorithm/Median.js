//AK/Algorithm/Median.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.median) return;

  ak.median = function(a, compare, start, end) {
   var i, k, mid, m0, m1;

   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.median');

   start = ak.arrayIndex(a, start, 'ak.median');
   end = ak.arrayIndex(a, end, 'ak.median');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   k = end - start;
   if(!(k>0)) return [];

   if(k%2===1) {
    mid = start+(k-1)/2;
    m0 = ak._unsafeNthElement(a, mid, compare, start, end);
    return [m0, m0];
   }
   mid = start+k/2;
   m1 = ak._unsafeNthElement(a, mid, compare, start, end);
   m0 = a[start];
   for(i=start+1;i<mid;++i) if(compare(a[i], m0)>0) m0 = a[i];
   return [m0, m1];
  };
 }

 ak.using('Algorithm/NthElement.js', define);
})();
