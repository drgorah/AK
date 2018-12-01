//AK/Random/RANFRnd.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.ranfRnd) return;
  ak.ranfRnd = function(x0) {return ak.congruentialRnd(44485709377909, 281474976710656, 0, x0);};
 }

 ak.using('Random/CongruentialRnd.js', define);
})();
