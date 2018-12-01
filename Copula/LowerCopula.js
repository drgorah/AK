//AK/Distribution/LowerCopula.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.lowerCopula) return;

  ak.lowerCopula = function(n) {
   var f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0 || n>2) throw new Error('invalid dimension in ak.lowerCopula');

   switch(n) {
    case 0: f = function(u) {
             if(ak.type(u)!==ak.VECTOR_T || u.dims()!==0) throw new Error('invalid argument in ak.lowerCopula');
             return 1;
            };
            break;

    case 1: f = function(u) {
             if(ak.type(u)!==ak.VECTOR_T || u.dims()!==1) throw new Error('invalid argument in ak.lowerCopula');
             return Math.max(0, Math.min(1, u.at(0)));
            };
            break;

    case 2: f = function(u) {
             var u0, u1;
             if(ak.type(u)!==ak.VECTOR_T || u.dims()!==2) throw new Error('invalid argument in ak.lowerCopula');
             u0 = Math.max(0, Math.min(1, u.at(0)));
             u1 = Math.max(0, Math.min(1, u.at(1)));
             return Math.max(u0+u1-1, 0);
            };
            break;
   }

   f.dims = function() {return n;};

   return Object.freeze(f);
  };

  ak.lowerCopulaDensity = function(n) {
   var f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0 || n>2) throw new Error('invalid dimension in ak.lowerCopulaDensity');

   switch(n) {
    case 0: f = function(u) {
             if(ak.type(u)!==ak.VECTOR_T || u.dims()!==0) throw new Error('invalid argument in ak.lowerCopulaDensity');
             return 1;
            };
            break;

    case 1: f = function(u) {
             if(ak.type(u)!==ak.VECTOR_T || u.dims()!==1) throw new Error('invalid argument in ak.lowerCopulaDensity');
             u = u.at(0);
             return u>=0 && u<=1 ? 1 : 0;
            };
            break;

    case 2: f = function(u) {
             var u0;
             if(ak.type(u)!==ak.VECTOR_T || u.dims()!==2) throw new Error('invalid argument in ak.lowerCopulaDensity');
             u0 = u.at(0);
             return u0>=0 && u0<=1 && u.at(1)===1-u0 ? ak.INFINITY : 0;
            };
            break;
   }

   f.dims = function() {return n;};

   return Object.freeze(f);
  };

  ak.lowerCopulaRnd = function(n, rnd) {
   var f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0 || n>2) throw new Error('invalid dimension in ak.lowerCopulaDensity');
   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.lowerCopulaRnd');

   switch(n) {
    case 0: f = function() {return ak.vector(0);}; break;
    case 1: f = function() {return ak.vector(1, rnd());}; break;
    case 2: f = function() {var u = rnd(); return ak.vector([u, 1-u]);}; break;
   }

   f.dims = function() {return n;};
   f.rnd = function() {return rnd;};

   return Object.freeze(f);
  };
 }

 ak.using('Matrix/Vector.js', define);
})();
