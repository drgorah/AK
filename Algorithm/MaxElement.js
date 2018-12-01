//AK/Algorithm/MaxElement.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.maxElement) return;

  ak.maxElement = function(a, compare, start, end) {
   var max;

   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.maxElement');

   start = ak.arrayIndex(a, start, 'ak.maxElement');
   end = ak.arrayIndex(a, end, 'ak.maxElement');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   max = start;
   while(++start<end) if(compare(a[start],a[max])>0) max = start;
   return max<end ? max : -1;
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
