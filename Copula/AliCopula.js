//AK/Copula/AliCopula.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.aliCopula) return;

  function p(theta) {return function(u) {return Math.log((1-theta*(1-u))/u);};}
  function dp(theta) {return function(u) {return theta/(1-theta*(1-u)) - 1/u;};}
  function q(theta) {return function(t) {return (1-theta)/(Math.exp(t)-theta);};}
  function dnq(theta) {return function(t, n) {return ak.div(1-theta,ak.sub(ak.exp(ak.surreal(n,t,1)),theta));};}

  function p1(u) {return 1/u - 1;}
  function dp1(u) {return -Math.pow(u, -2);}
  function q1(t) {return 1/(t+1);}
  function dnq1(t, n) {return ak.inv(ak.surreal(n, t+1, 1));}

  ak.aliCopula = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.aliCopula');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && (theta<-1 || theta>1))) throw new Error('invalid theta in ak.aliCopula');

   if(n<2 || theta===0) g = ak.independentCopula(n);
   else if(theta===1) g = ak.archimedeanCopula(n, p1, q1);
   else g = ak.archimedeanCopula(n, p(theta), q(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.aliCopulaDensity = function(n, theta) {
   var f, g;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.aliCopulaDensity');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && (theta<-1 || theta>1))) throw new Error('invalid theta in ak.aliCopula');

   if(n<2 || theta===0) g = ak.independentCopulaDensity(n);
   else if(theta===1) g = ak.archimedeanCopulaDensity(n, p1, dp1, dnq1);
   else g = ak.archimedeanCopulaDensity(n, p(theta), dp(theta), dnq(theta));

   f = function(u) {return g(u);};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};

   return Object.freeze(f);
  };

  ak.aliCopulaRnd = function(n, theta, arg3, arg4, arg5) {
   var m, threshold, rnd, f, g;

   if(ak.nativeType(arg3)!==ak.NUMBER_T) rnd = arg3;
   else if(ak.nativeType(arg4)!==ak.NUMBER_T) rnd = arg4;
   else rnd = arg5;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.aliCopulaRnd');
   if(ak.nativeType(theta)!==ak.NUMBER_T || isNaN(theta) || (n>1 && (theta<-1 || theta>1))) throw new Error('invalid theta in ak.aliCopula');
   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.aliCopulaRnd');

   if(n<2 || theta===0) g = ak.independentCopulaRnd(n, rnd);
   else if(theta===1) g = ak.archimedeanCopulaRnd(n, p1, q1, dnq1, arg3, arg4, arg5);
   else g = ak.archimedeanCopulaRnd(n, p(theta), q(theta), dnq(theta), arg3, arg4, arg5);

   f = function() {return g();};
   f.dims = function() {return n;};
   f.theta = function() {return theta;};
   f.rnd = function() {return rnd;};

   return Object.freeze(f);
  };
 }

 ak.using(['Copula/ArchimedeanCopula.js', 'Copula/IndependentCopula.js', 'Calculus/Surreal.js'], define);
})();
