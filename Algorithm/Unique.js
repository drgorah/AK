//AK/Algorithm/Unique.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.unique) return;

  ak.unique = function(a, pred, start, end) {
   var pos;

   if(ak.nativeType(pred)===ak.UNDEFINED_T) pred = ak.alphaEqual;
   else if(ak.nativeType(pred)!==ak.FUNCTION_T) throw new Error('invalid predicate in ak.unique');

   start = ak.arrayIndex(a, start, 'ak.unique');
   end = ak.arrayIndex(a, end, 'ak.unique');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   if(start>=end) return start===end ? start : -1;

   pos = start;
   while(++start<end) if(!pred(a[start],a[pos])) a[++pos] = a[start];
   return ++pos;
  };
 }

 ak.using(['Algorithm/Equal.js', 'Algorithm/ArrayIndex.js'], define);
})();
