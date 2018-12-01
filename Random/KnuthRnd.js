//AK/Random/KnuthRnd.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.knuthRnd) return;
  ak.knuthRnd = function(x0) {return ak.congruentialRnd(1664525, 4294967296, 1013904223, x0);};
 }

 ak.using('Random/CongruentialRnd.js', define);
})();
