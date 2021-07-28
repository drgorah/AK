//AK/Algorithm/PrevPermutation.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.prevPermutation) return;

  function reverse(a, start, end) {
   var ai;
   while(start<--end) {
    ai = a[start];
    a[start++] = a[end];
    a[end] = ai;
   }
  }

  ak.prevPermutation = function(a, compare, start, end) {
   var i, j, k, ai;

   if(ak.nativeType(compare)===ak.UNDEFINED_T) compare = ak.alphaCompare;
   else if(ak.nativeType(compare)!==ak.FUNCTION_T) throw new Error('invalid comparator in ak.prevPermutation');

   start = ak.arrayIndex(a, start, 'ak.prevPermutation');
   end = ak.arrayIndex(a, end, 'ak.prevPermutation');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;
   i = end-1;

   if(start>=i) return false;

   while(true) {
    j = i;
    if(compare(a[--i], a[j])>0) {
     k = end;
     while(compare(a[i], a[--k])<=0);
     ai = a[i];
     a[i] = a[k];
     a[k] = ai;
     reverse(a, j, end);
     return true;
    }
    if(i===start) {
     reverse(a, start, end);
     return false;
    }
   }
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
