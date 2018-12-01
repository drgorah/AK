//AK/Distribution/GumbelCopula.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.gumbelCopula) return;

  function p(theta) {return function(u) {return Math.pow(-Math.log(u), theta);};}
  function dp(theta) {return function(u) {return -theta*Math.pow(-Math.log(u), theta-1)/u;};}
  function q(theta) {return function(t) {return Math.exp(-Math.pow(t, 1/theta));};}
  function dnq(theta) {return function(t, n) {return ak.exp(ak.neg(ak.pow(ak.surreal(n, t, 1), 1/theta)));};}

  ak.gumbelCopula = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.gumbelCopula');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && theta<1)) throw new Error('invalid theta in ak.gumbelCopula');

   if(n<2 || theta===1) g = ak.independentCopula(n);
   else if(theta===ak.INFINITY) g = ak.upperCopula(n);
   else g = ak.archimedeanCopula(n, p(theta), q(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.gumbelCopulaDensity = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.gumbelCopulaDensity');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && theta<1)) throw new Error('invalid theta in ak.gumbelCopulaDensity');

   if(n<2 || theta===1) g = ak.independentCopulaDensity(n);
   else if(theta===ak.INFINITY) g = ak.upperCopulaDensity(n);
   else g = ak.archimedeanCopulaDensity(n, p(theta), dp(theta), dnq(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.gumbelCopulaRnd = function(n, theta, arg3, arg4, arg5) {
   var m, threshold, rnd, f, g;

   if(ak.nativeType(arg3)!==ak.NUMBER_T) rnd = arg3;
   else if(ak.nativeType(arg4)!==ak.NUMBER_T) rnd = arg4;
   else rnd = arg5;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.gumbelCopulaRnd');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && theta<1)) throw new Error('invalid theta in ak.gumbelCopulaRnd');
   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.gumbelCopulaRnd');

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
