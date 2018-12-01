//AK/Distribution/FrankCopula.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.frankCopula) return;

  function p(theta) {var e = Math.exp(-theta)-1; return function(u) {return -Math.log((Math.exp(-theta*u)-1)/e);};}
  function dp(theta) {return function(u) {return theta/(1-Math.exp(theta*u));};}
  function q(theta) {var e = Math.exp(-theta)-1; return function(t) {return -Math.log(1+e*Math.exp(-t))/theta;};}
  function dnq(theta) {var e = Math.exp(-theta)-1; return function(t, n) {return ak.div(ak.log(ak.add(1,ak.mul(e,ak.exp(ak.surreal(n, -t, -1))))),-theta);};}

  ak.frankCopula = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.frankCopula');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta)) throw new Error('invalid theta in ak.frankCopula');

   if(n<2 || theta===0) g = ak.independentCopula(n);
   else if(theta===-ak.INFINITY) g = ak.lowerCopula(n);
   else if(theta===+ak.INFINITY) g = ak.upperCopula(n);
   else g = ak.archimedeanCopula(n, p(theta), q(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.frankCopulaDensity = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.frankCopulaDensity');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta)) throw new Error('invalid theta in ak.frankCopula');

   if(n<2 || theta===0) g = ak.independentCopulaDensity(n);
   else if(theta===-ak.INFINITY) g = ak.lowerCopulaDensity(n);
   else if(theta===+ak.INFINITY) g = ak.upperCopulaDensity(n);
   else g = ak.archimedeanCopulaDensity(n, p(theta), dp(theta), dnq(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.frankCopulaRnd = function(n, theta, arg3, arg4, arg5) {
   var m, threshold, rnd, f, g;

   if(ak.nativeType(arg3)!==ak.NUMBER_T) rnd = arg3;
   else if(ak.nativeType(arg4)!==ak.NUMBER_T) rnd = arg4;
   else rnd = arg5;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.frankCopulaRnd');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta)) throw new Error('invalid theta in ak.frankCopula');
   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.frankCopulaRnd');

   if(n<2 || theta===0) g = ak.independentCopulaRnd(n, rnd);
   else if(theta===-ak.INFINITY) g = ak.lowerCopulaRnd(n, rnd);
   else if(theta===+ak.INFINITY) g = ak.upperCopulaRnd(n, rnd);
   else g = ak.archimedeanCopulaRnd(n, p(theta), q(theta), dnq(theta), arg3, arg4, arg5);

   f = function() {return g();};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};
   f.rnd = function() {return rnd;};

   return Object.freeze(f);
  };
 }

 ak.using(['Copula/ArchimedeanCopula.js', 'Copula/LowerCopula.js', 'Copula/UpperCopula.js', 'Copula/IndependentCopula.js', 'Calculus/Surreal.js'], define);
})();
