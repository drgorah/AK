//AK/Algorithm/Equal.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.alphaEqual) return;

  ak.alphaEqual = function(l, r) {
   return String(l)===String(r);
  };

  ak.numberEqual = function(l, r) {
   return Number(l)===Number(r);
  };

  ak.floatEqual = function(l, r) {
   l = Number(l);
   r = Number(r);
   return l===r || (isNaN(l) && isNaN(r));
  };
 }

 ak.using('', define);
})();
