//AK/Distribution/GenestCopula.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.genestCopula) return;

  function p(theta) {return function(u) {return Math.pow(1-Math.pow(u,1/theta), theta);};}
  function dp(theta) {return function(u) {return -Math.pow(1-Math.pow(u,1/theta), theta-1)*Math.pow(u, 1/theta-1);};}
  function q(theta) {return function(t) {return Math.pow(1-Math.pow(t,1/theta), theta);};}
  function dnq(theta) {return function(t, n) {return ak.pow(ak.sub(1,ak.pow(ak.surreal(n,t,1),1/theta)), theta);};}

  ak.genestCopula = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.genestCopula');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n===2 && theta<1) || (n>2 && (theta<=1 || (theta!==ak.floor(theta) && theta<n-1)))) throw new Error('invalid theta in ak.genestCopula');

   if(n<2 || theta===1) g = ak.lowerCopula(n);
   else if(theta===ak.INFINITY) g = ak.upperCopula(n);
   else g = ak.archimedeanCopula(n, p(theta), q(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.genestCopulaDensity = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.genestCopulaDensity');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n===2 && theta<1) || (n>2 && (theta<=1 || (theta!==ak.floor(theta) && theta<n-1)))) throw new Error('invalid theta in ak.genestCopulaDensity');

   if(n<2 || theta===1) g = ak.lowerCopulaDensity(n);
   else if(theta===ak.INFINITY) g = ak.upperCopulaDensity(n);
   else g = ak.archimedeanCopulaDensity(n, p(theta), dp(theta), dnq(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.genestCopulaRnd = function(n, theta, arg3, arg4, arg5) {
   var m, threshold, rnd, f, g;

   if(ak.nativeType(arg3)!==ak.NUMBER_T) rnd = arg3;
   else if(ak.nativeType(arg4)!==ak.NUMBER_T) rnd = arg4;
   else rnd = arg5;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.genestCopulaRnd');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n===2 && theta<1) || (n>2 && (theta<=1 || (theta!==ak.floor(theta) && theta<n-1)))) throw new Error('invalid theta in ak.genestCopulaRnd');
   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.genestCopulaRnd');

   if(n<2 || theta===1) g = ak.lowerCopulaRnd(n, rnd);
   else if(theta===ak.INFINITY) g = ak.upperCopulaRnd(n, rnd);
   else g = ak.archimedeanCopulaRnd(n, p(theta), q(theta), dnq(theta), arg3, arg4, arg5);

   f = function() {return g();};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};
   f.rnd = function() {return rnd;};

   return Object.freeze(f);
  };
 }

 ak.using(['Copula/ArchimedeanCopula.js', 'Copula/LowerCopula.js', 'Copula/UpperCopula.js', 'Calculus/Surreal.js'], define);
})();
