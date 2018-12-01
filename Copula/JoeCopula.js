//AK/Distribution/JoeCopula.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.joeCopula) return;

  function p(theta) {return function(u) {return -Math.log(1-Math.pow(1-u,theta));};}
  function dp(theta) {return function(u) {return theta/(1-u-Math.pow(1-u,1-theta));};}
  function q(theta) {return function(t) {return 1-Math.pow(1-Math.exp(-t), 1/theta);};}
  function dnq(theta) {return function(t, n) {return ak.sub(1, ak.pow(ak.sub(1, ak.exp(ak.surreal(n, -t, -1))), 1/theta));};}

  ak.joeCopula = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.joeCopula');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && theta<1)) throw new Error('invalid theta in ak.joeCopula');

   if(n<2 || theta===1) g = ak.independentCopula(n);
   else if(theta===ak.INFINITY) g = ak.upperCopula(n);
   else g = ak.archimedeanCopula(n, p(theta), q(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.joeCopulaDensity = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.joeCopulaDensity');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && theta<1)) throw new Error('invalid theta in ak.joeCopulaDensity');

   if(n<2 || theta===1) g = ak.independentCopulaDensity(n);
   else if(theta===ak.INFINITY) g = ak.upperCopulaDensity(n);
   else g = ak.archimedeanCopulaDensity(n, p(theta), dp(theta), dnq(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.joeCopulaRnd = function(n, theta, arg3, arg4, arg5) {
   var m, threshold, rnd, f, g;

   if(ak.nativeType(arg3)!==ak.NUMBER_T) rnd = arg3;
   else if(ak.nativeType(arg4)!==ak.NUMBER_T) rnd = arg4;
   else rnd = arg5;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.joeCopulaRnd');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && theta<1)) throw new Error('invalid theta in ak.joeCopulaRnd');
   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.joeCopulaRnd');

   if(n<2 || theta===1) g = ak.independentCopulaRnd(n, rnd);
   else if(theta===ak.INFINITY) g = ak.upperCopulaRnd(n, rnd);
   else g = ak.archimedeanCopulaRnd(n, p(theta), q(theta), dnq(theta), arg3, arg4, arg5);

   f = function() {return g();};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};
   f.rnd = function() {return rnd;};

   return Object.freeze(f);
  };
 }

 ak.using(['Copula/ArchimedeanCopula.js', 'Copula/IndependentCopula.js', 'Copula/UpperCopula.js', 'Calculus/Surreal.js'], define);
})();
