//AK/Distribution/StudentsTDistribution.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.studentsTPDF) return;

  ak.studentsTPDF = function() {
   var state = {nu: 2};
   var arg0  = arguments[0];
   var f, a;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   a = ak.logGamma(0.5*state.nu+0.5) - ak.logGamma(0.5*state.nu) - 0.5*Math.log(state.nu) - 0.5*Math.log(ak.PI);

   f = function(x) {return Math.exp(a - (0.5*state.nu+0.5)*Math.log(1+x*x/state.nu));};
   f.nu = function(){return state.nu;};
   return Object.freeze(f);
  };

  function cfBound(pdf, eps) {
   var b = 1;
   while(pdf(b)>eps) b *= 2;
   return b;
  }

  function cfIntegral(t, pdf, b, eps) {
   var f = function(x) {return pdf(x) * Math.cos(t*x);};
   var re = ak.rombergIntegral(f, eps);
   return ak.complex(2*re(0, b), 0);
  }

  ak.studentsTCF = function() {
   var state = {nu: 2, eps: Math.pow(ak.EPSILON, 0.5)};
   var arg0  = arguments[0];
   var pdf, b, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   pdf = ak.studentsTPDF(state.nu);
   b = cfBound(pdf, state.eps);

   f = function(t) {return cfIntegral(t, pdf, b, state.eps);};
   f.nu = function(){return state.nu;};
   return Object.freeze(f);
  };

  ak.studentsTCDF = function() {
   var state = {nu: 2};
   var arg0  = arguments[0];
   var f, a;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   a = ak.betaP(0.5*state.nu, 0.5, 1);

   f = function(x) {
    var b;
    if(x===0) return 0.5;
    b = ak.betaP(0.5*state.nu, 0.5, state.nu/(state.nu+x*x));
    return x>0 ? 0.5 + 0.5*(a-b) : 0.5 - 0.5*(a-b);
   };
   f.nu = function(){return state.nu;};
   return Object.freeze(f);
  };

  function invCDF(c, inv, cdf) {
   var b0, b1;

   if(isNaN(c)) return ak.NaN;
   if(c===0.5) return 0;
   if(c<=0) return -ak.INFINITY;
   if(c>=1) return  ak.INFINITY;

   if(c<0.5) {
    b0 = -1; b1 = 0;
    while(cdf(b0)>c) {b1 = b0; b0 *= 2;}
    return isFinite(b0) ? inv(c, [b0, b1]) : b0;
   }

   b0 = 0; b1 = 1;
   while(cdf(b1)<c) {b0 = b1; b1 *= 2;}
   return isFinite(b1) ? inv(c, [b0, b1]) : b1;
  }

  ak.studentsTInvCDF = function() {
   var state = {nu: 2, eps: Math.pow(ak.EPSILON, 0.75)};
   var arg0  = arguments[0];
   var pdf, cdf, fdf, inv, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   pdf = ak.studentsTPDF(state.nu);
   cdf = ak.studentsTCDF(state.nu);
   fdf = function(x){return [cdf(x), pdf(x)];};
   inv = ak.newtonInverse(fdf, state.eps);

   f = function(c){return invCDF(c, inv, cdf);};
   f.nu = function(){return state.nu;};
   return Object.freeze(f);
  };

  ak.studentsTRnd = function() {
   var state = {nu: 2, rnd: Math.random};
   var arg0  = arguments[0];
   var f, phi, chi2;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   phi = ak.normalRnd(state.rnd);
   chi2 = ak.chiSquaredRnd(state.nu, state.rnd);

   f = function() {return phi() / Math.sqrt(chi2()/state.nu)};
   f.nu = function(){return state.nu;};
   f.rnd = function(){return state.rnd;};
   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T] = function(state, nu, args) {
   var arg1 = args[1];
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1);

   state.nu = Number(nu);
   if(state.nu<=0 || !isFinite(state.nu) || state.nu!==ak.floor(state.nu)) throw new Error('invalid nu in ak.studentsT distribution');
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, eps) {
   state.eps = Number(eps);
   if(isNaN(state.eps)) throw new Error('invalid convergence threshold in ak.studentsT distribution');
  };
 }

 ak.using(['Special/BetaFunction.js', 'Calculus/RombergIntegral.js', 'Invert/NewtonInverse.js', 'Distribution/NormalDistribution.js', 'Distribution/ChiSquaredDistribution.js'], define);
})();
