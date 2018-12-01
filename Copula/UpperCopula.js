//AK/Distribution/UpperCopula.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.upperCopula) return;

  ak.upperCopula = function(n) {
   var f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.upperCopula');

   switch(n) {
    case 0:  f = function(u) {
              if(ak.type(u)!==ak.VECTOR_T || u.dims()!==0) throw new Error('invalid argument in ak.upperCopula');
              return 1;
             };
             break;

    case 1:  f = function(u) {
              if(ak.type(u)!==ak.VECTOR_T || u.dims()!==1) throw new Error('invalid argument in ak.upperCopula');
              return Math.max(0, Math.min(1, u.at(0)));
             };
             break;

    default: f = function(u) {
              var ui, i;
              if(ak.type(u)!==ak.VECTOR_T || u.dims()!==n) throw new Error('invalid argument in ak.upperCopula');
              ui = u.at(0);
              for(i=1;i<n;++i) ui = Math.min(ui, u.at(i));
              return Math.max(0, Math.min(1, ui));
             };
             break;
   }

   f.dims = function() {return n;};

   return Object.freeze(f);
  };

  ak.upperCopulaDensity = function(n) {
   var f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.upperCopulaDensity');

   switch(n) {
    case 0:  f = function(u) {
              if(ak.type(u)!==ak.VECTOR_T || u.dims()!==0) throw new Error('invalid argument in ak.upperCopulaDensity');
              return 1;
             };
             break;

    case 1:  f = function(u) {
              if(ak.type(u)!==ak.VECTOR_T || u.dims()!==1) throw new Error('invalid argument in ak.upperCopulaDensity');
              u = u.at(0);
              return u>=0 && u<=1 ? 1 : 0;
             };
             break;

    default: f = function(u) {
              var u0, i;
              if(ak.type(u)!==ak.VECTOR_T || u.dims()!==n) throw new Error('invalid argument in ak.upperCopulaDensity');
              u0 = u.at(0);
              if(u0<0 || u0>1) return 0;
              for(i=1;i<n;++i) if(u.at(i)!==u0) return 0;
              return ak.INFINITY;
             };
             break;
   }

   f.dims = function() {return n;};

   return Object.freeze(f);
  };

  ak.upperCopulaRnd = function(n, rnd) {
   var f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.upperCopulaDensity');
   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.upperCopulaRnd');

   f = function() {return ak.vector(n, rnd());};
   f.dims = function() {return n;};
   f.rnd = function() {return rnd;};

   return Object.freeze(f);
  };
 }

 ak.using('Matrix/Vector.js', define);
})();