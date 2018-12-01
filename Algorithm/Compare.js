//AK/Algorithm/Compare.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.alphaCompare) return;

  ak.alphaCompare = function(l, r) {
   l = String(l);
   r = String(r);
   return l<r ? -1 : l===r ? 0 : 1;
  };

  ak.numberCompare = function(l, r) {
   l = Number(l);
   r = Number(r);
   return l===r ? 0 : l-r;
  };

  function nanCompare(l, r) {
   return !isNaN(l) ? -1 : !isNaN(r) ? 1 : 0
  }

  ak.floatCompare = function(l, r) {
   var d;
   l = Number(l);
   r = Number(r);
   return l===r ? 0 : !isNaN(d=l-r) ? d : nanCompare(l, r);
  };
 }

 ak.using('', define);
})();
