//AK/Algorithm/Rotate.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.rotate) return;

  ak._unsafeRotate = function(a, mid, start, end) {
   if(mid>start && mid<end) Array.prototype.splice.apply(a, [start, 0].concat(a.splice(mid, end-mid)));
  };

  ak.rotate = function(a, mid, start, end) {
   mid = ak.arrayIndex(a, mid, 'ak.rotate');
   start = ak.arrayIndex(a, start, 'ak.rotate');
   end = ak.arrayIndex(a, end, 'ak.rotate');

   if(ak.nativeType(mid)===ak.UNDEFINED_T) throw new Error('invalid mid in ak.rotate');

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   if(ak.nativeType(end)===ak.UNDEFINED_T) end = a.length;

   ak._unsafeRotate(a, mid, start, end);
  };
 }

 ak.using(['Algorithm/ArrayIndex.js'], define);
})();
