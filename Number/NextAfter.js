//AK/Number/NextAfter.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.nextAfter) return;

  var M = 2*ak.MIN_NORMAL;
  var R = 1.0-0.5*ak.EPSILON;

  ak.nextAfter = function(x, y) {
   x = Number(x);
   y = Number(y);

   if(y>x) {
    if(x>= M) return x/R;
    if(x<=-M) return x!==-ak.INFINITY ? x*R : -ak.MAX_VALUE;
    return x+ak.MIN_VALUE;
   }
   else if(y<x) {
    if(x<=-M) return x/R;
    if(x>= M) return x!==ak.INFINITY ? x*R : ak.MAX_VALUE;
    return x-ak.MIN_VALUE;
   }
   return isNaN(y) ? y : x;
  };
 }

 ak.using('', define);
})();