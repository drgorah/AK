//AK/Distribution/SlashDistribution.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.slashPDF) return;

  var RT2PI = Math.sqrt(2*ak.PI);
  var EPS   = Math.pow(24*ak.EPSILON, 0.25);

  function pdf(m, s, x) {
   x = (x-m)/s;
   return Math.abs(x)<EPS ? (0.5-0.125*x*x)/(RT2PI*s) : (1-Math.exp(-0.5*x*x))/(RT2PI*s*x*x);
  }

  ak.slashPDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){return pdf(state.mu, state.sigma, x);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  function cf(m, s, phi, t) {
   var tm = t*m;
   var ts = t*s;
   var c0 = Math.cos(tm);
   var s0 = Math.sin(tm);
   var c  = Math.exp(-0.5*ts*ts) + RT2PI*(ts*phi(ts) - Math.max(ts,0));
   var r = c*c0;
   var i = c*s0;
   return ak.complex(r, i);
  }

  ak.slashCF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var phi, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   phi = ak.normalCDF();

   f = function(t){return cf(state.mu, state.sigma, phi, t);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  function cdf(m, s, x, cx) {
   x = (x-m)/s;
   return Math.abs(x)<EPS ? cx - 0.5*x*(1-0.25*x*x)/RT2PI : cx - (1-Math.exp(-0.5*x*x))/(RT2PI*x);
  }

  ak.slashCDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var c, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   c = ak.normalCDF(state.mu, state.sigma);

   f = function(x){return cdf(state.mu, state.sigma, x, c(x));};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  ak.slashInvCDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var c, i, fx, dfx, fdf, inv, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   c = ak.normalCDF(state.mu, state.sigma);
   i = ak.normalInvCDF(state.mu, state.sigma);

   fx  = function(x){return cdf(state.mu, state.sigma, x, c(x));};
   dfx = function(x){return pdf(state.mu, state.sigma, x);};

   fdf = function(c){return [fx(c), dfx(c)];};
   inv = ak.newtonInverse(fdf, state.eps);

   f = function(c){return inv(c, i(c));};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  ak.slashRnd = function() {
   var state = {mu: 0, sigma: 1, rnd: Math.random};
   var arg0  = arguments[0];
   var n, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   n = ak.normalRnd(state.sigma, state.rnd);

   f = function(){return state.mu + n()/(1-state.rnd());};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   f.rnd = function(){return state.rnd;};
   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.UNDEFINED_T] = function() {
  };

  constructors[ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T] = function(state, x, args) {
   var arg1 = args[1];
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, x, arg1, args);

   if(!isFinite(state.mu)) throw new Error('invalid mu in ak.slash distribution');
   if(state.sigma<=0 || !isFinite(state.sigma)) throw new Error('invalid sigma in ak.slash distribution');
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state, x) {
   state.sigma = Number(x);
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, x, rnd) {
   state.sigma = Number(x);
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, x0, x1, args) {
   var arg2 = args[2];

   state.mu = Number(x0);
   state.sigma = Number(x1);

   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg2)](state, arg2);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, eps) {
   state.eps = eps;
  };
 }

 ak.using(['Complex/Complex.js', 'Distribution/NormalDistribution.js', 'Invert/NewtonInverse.js'], define);
})();
