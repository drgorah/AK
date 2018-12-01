//AK/Random/HaltonRnd.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.haltonRnd) return;

  function shuffle(base, rnd) {
   var ord, i;

   if(!isFinite(base) || base!==ak.floor(base) || base<=1) throw new Error('invalid base in ak.haltonRnd');

   ord = new Array(base);
   for(i=0;i<base;++i) ord[i] = i;
   ak.shuffle(ord, 1, base, rnd);
   return ord;
  }

  function uniHalton(base, rnd) {
   var n = 0;
   var ord = shuffle(base, rnd);

   return function() {
    var i = ++n;
    var bn = 1;
    var x = 0;

    while(i>0) {
     bn *= base;
     x += ord[i%base]/bn;
     i = ak.floor(i/base);
    }
    return x;
   };
  }

  function f(h) {
   return h();
  }

  function multiHalton(bases, rnd) {
   var n = bases.length;
   var h = new Array(n);
   var i;

   for(i=0;i<n;++i) h[i] = uniHalton(bases[i], rnd);

   return function() {
    return h.map(f);
   };
  }

  ak.haltonRnd = function(base, rnd) {
   return ak.nativeType(base)===ak.ARRAY_T ? multiHalton(base, rnd) : uniHalton(base, rnd);
  };
 }

 ak.using('Algorithm/Shuffle.js', define);
})();
