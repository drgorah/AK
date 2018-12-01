//AK/Distribution/ClaytonCopula.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.claytonCopula) return;

  function p(theta) {return function(u) {return (Math.pow(u, -theta)-1)/theta;};}
  function dp(theta) {return function(u) {return -Math.pow(u, -theta-1);};}
  function q(theta) {return function(t) {return Math.pow(1+theta*t, -1/theta);};}
  function dnq(theta) {return function(t, n) {return ak.pow(ak.surreal(n, 1+theta*t, theta), -1/theta);};}

  ak.claytonCopula = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.claytonCopula');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && theta<-1/(n-1))) throw new Error('invalid theta in ak.claytonCopula');

   if(n<2 || theta===0) g = ak.independentCopula(n);
   else if(theta===-1) g = ak.lowerCopula(n);
   else if(theta===ak.INFINITY) g = ak.upperCopula(n);
   else g = ak.archimedeanCopula(n, p(theta), q(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.claytonCopulaDensity = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.claytonCopulaDensity');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && theta<-1/(n-1))) throw new Error('invalid theta in ak.claytonCopulaDensity');

   if(n<2 || theta===0) g = ak.independentCopulaDensity(n);
   else if(theta===-1) g = ak.lowerCopulaDensity(n);
   else if(theta===ak.INFINITY) g = ak.upperCopulaDensity(n);
   else g = ak.archimedeanCopulaDensity(n, p(theta), dp(theta), dnq(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.claytonCopulaRnd = function(n, theta, arg3, arg4, arg5) {
   var m, threshold, rnd, f, g;

   if(ak.nativeType(arg3)!==ak.NUMBER_T) rnd = arg3;
   else if(ak.nativeType(arg4)!==ak.NUMBER_T) rnd = arg4;
   else rnd = arg5;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.claytonCopulaRnd');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && theta<-1/(n-1))) throw new Error('invalid theta in ak.claytonCopulaRnd');
   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.claytonCopulaRnd');

   if(n<2 || theta===0) g = ak.independentCopulaRnd(n, rnd);
   else if(theta===-1) g = ak.lowerCopulaRnd(n, rnd);
   else if(theta===ak.INFINITY) g = ak.upperCopulaRnd(n, rnd);
   else g = ak.archimedeanCopulaRnd(n, p(theta), q(theta), dnq(theta), arg3, arg4, arg5);

   f = function() {return g();};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};
   f.rnd = function() {return rnd;};

   return Object.freeze(f);
  };
 }

 ak.using(['Copula/ArchimedeanCopula.js', 'Copula/IndependentCopula.js', 'Copula/LowerCopula.js', 'Copula/UpperCopula.js', 'Calculus/Surreal.js'], define);
})();
