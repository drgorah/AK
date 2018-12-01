//AK/Distribution/IndependentCopula.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.independentCopula) return;

  ak.independentCopula = function(n) {
   var f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.independentCopula');

   f = function(u) {
    var p = 1.0;
    var i;
    if(ak.type(u)!==ak.VECTOR_T || u.dims()!==n) throw new Error('invalid argument in ak.independentCopula');
    for(i=0;i<n;++i) p *= Math.max(0, Math.min(1, u.at(i)));
    return p;
   };

   f.dims = function() {return n;};

   return Object.freeze(f);
  };

  ak.independentCopulaDensity = function(n) {
   var f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.independentCopulaDensity');

   f = function(u) {
    var i, ui;
    if(ak.type(u)!==ak.VECTOR_T || u.dims()!==n) throw new Error('invalid argument in ak.independentCopulaDensity');
    for(i=0;i<n;++i) {
     ui = u.at(i);
     if(ui<0 || ui>1) return 0;
    }
    return 1;
   };

   f.dims = function() {return n;};

   return Object.freeze(f);
  };

  ak.independentCopulaRnd = function(n, rnd) {
   var f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.independentCopulaDensity');
   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.independentCopulaRnd');

   f = function() {
    var a = new Array(n);
    var i;
    for(i=0;i<n;++i) a[i] = rnd();
    return ak.vector(a);
   };

   f.dims = function() {return n;};
   f.rnd = function() {return rnd;};

   return Object.freeze(f);
  };
 }

 ak.using('Matrix/Vector.js', define);
})();
