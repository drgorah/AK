//AK/Number/GrayCode.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.toGray) return;

  ak.toGray = function(i) {
   return i ^ (i >>> 1);
  };

  ak.fromGray = function(i) {
   i ^= i >>> 1;
   i ^= i >>> 2;
   i ^= i >>> 4;
   i ^= i >>> 8;
   return i ^ (i >>> 16);
  };
 }

 ak.using('', define);
})();