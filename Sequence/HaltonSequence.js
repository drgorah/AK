//AK/Random/HaltonSequence.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.haltonSequence) return;

  ak.haltonSequence = function(base) {
   if(!isFinite(base) || base!==ak.floor(base) || base<=1) throw new Error('invalid base in ak.haltonSequence');

   return function(i) {
    var bn = 1;
    var x = 0;

    if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.haltonSequence');
    if(i===ak.INFINITY) return 1;

    while(i>0) {
     bn *= base;
     x += (i%base)/bn;
     i = ak.floor(i/base);
    }
    return x;
   };
  };
 }

 ak.using('', define);
})();
