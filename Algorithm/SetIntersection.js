//AK/Algorithm/SetIntersection.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.setIntersection) return;

  ak.setIntersection = function(a1, a2, compare, start1, end1, start2, end2) {
   var n, out, i, c;

   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.setIntersection');

   start1 = ak.arrayIndex(a1, start1, 'ak.setIntersection');
   end1 = ak.arrayIndex(a1, end1, 'ak.setIntersection');

   start2 = ak.arrayIndex(a2, start2, 'ak.setIntersection');
   end2 = ak.arrayIndex(a2, end2, 'ak.setIntersection');

   if(ak.nativeType(start1)===ak.UNDEFINED_T) start1 = 0;
   if(ak.nativeType(end1)===ak.UNDEFINED_T) end1 = a1.length;

   if(ak.nativeType(start2)===ak.UNDEFINED_T) start2 = 0;
   if(ak.nativeType(end2)===ak.UNDEFINED_T) end2 = a2.length;

   n = Math.min(end1-start1, end2-start2);
   out = new Array(Math.max(n, 0));

   i = 0;
   while(start1<end1 && start2<end2) {
    c = compare(a1[start1], a2[start2]);
    if(c<0)      ++start1;
    else if(c>0) ++start2;
    else        {out[i++] = a1[start1++]; ++start2;}
   }
   out.length = i;
   return out;
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
