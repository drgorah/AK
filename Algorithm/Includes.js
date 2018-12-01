//AK/Algorithm/Includes.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.includes) return;

  ak.includes = function(a1, a2, compare, start1, end1, start2, end2) {
   var c;

   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.includes');

   start1 = ak.arrayIndex(a1, start1, 'ak.includes');
   end1 = ak.arrayIndex(a1, end1, 'ak.includes');

   start2 = ak.arrayIndex(a2, start2, 'ak.includes');
   end2 = ak.arrayIndex(a2, end2, 'ak.includes');

   if(ak.nativeType(start1)===ak.UNDEFINED_T) start1 = 0;
   if(ak.nativeType(end1)===ak.UNDEFINED_T) end1 = a1.length;

   if(ak.nativeType(start2)===ak.UNDEFINED_T) start2 = 0;
   if(ak.nativeType(end2)===ak.UNDEFINED_T) end2 = a2.length;

   while(start1<end1 && start2<end2 && !((c=compare(a1[start1],a2[start2]))>0)) {
    ++start1;
    if(!c) ++start2;
   }
   return start1<=end1 && start2===end2;
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
