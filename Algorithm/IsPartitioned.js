//AK/Algorithm/IsPartitioned.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.isPartitioned) return;

  ak.isPartitioned = function(a, pred, start, end) {
   if(ak.nativeType(pred)!==ak.FUNCTION_T) throw new Error('invalid predicate in ak.isPartitioned');

   start = ak.arrayIndex(a, start, 'ak.isPartitioned');
   end = ak.arrayIndex(a, end, 'ak.isPartitioned');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   while(start<end && pred(a[start])) ++start;
   if(start<end) while(++start<end && !pred(a[start]));
   return start===end;
  };
 }

 ak.using(['Algorithm/Compare.js', 'Algorithm/ArrayIndex.js'], define);
})();
