//AK/Algorithm/LexicographicalCompare.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.lexicographicalCompare) return;

  ak.lexicographicalCompare = function(a1, a2, compare, start1, end1, start2, end2) {
   var c1, c2;

   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.lexicographicalCompare');

   start1 = ak.arrayIndex(a1, start1, 'ak.lexicographicalCompare');
   end1 = ak.arrayIndex(a1, end1, 'ak.lexicographicalCompare');

   start2 = ak.arrayIndex(a2, start2, 'ak.lexicographicalCompare');
   end2 = ak.arrayIndex(a2, end2, 'ak.lexicographicalCompare');

   if(ak.nativeType(start1)===ak.UNDEFINED_T) start1 = 0;
   if(ak.nativeType(end1)===ak.UNDEFINED_T) end1 = a1.length;

   if(ak.nativeType(start2)===ak.UNDEFINED_T) start2 = 0;
   if(ak.nativeType(end2)===ak.UNDEFINED_T) end2 = a2.length;

   if(start1>end1 || start2>end2) return ak.NaN;

   c1 = c2 = 0;
   while(c1===0 && start1<end1 && start2<end2) c1 = c2 = compare(a1[start1++], a2[start2++]);
   while(!c1 && start1<end1 && start2<end2) c1 = compare(a1[start1++], a2[start2++]);
   if(c1) return c1;

   if(start1<end1) c2 = 1;
   else if(start2<end2) c2 = -1;
   return c2;
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
