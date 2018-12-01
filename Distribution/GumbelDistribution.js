//AK/Distribution/GumbelDistribution.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.gumbelPDF) return;

  ak.gumbelPDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){var z = (x-state.mu)/state.sigma; return Math.exp(-z-Math.exp(-z))/state.sigma;};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  function cf(m, s, t) {
   var ts = t*s;

   if(!isFinite(ts)) return isNaN(t) ? ak.complex(ak.NaN, ak.NaN) : ak.complex(0);
   return ak.mul(ak.exp(ak.complex(0, t*m)), ak.gamma(ak.complex(1, -ts)));
  }

  ak.gumbelCF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t){return cf(state.mu, state.sigma, t);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  ak.gumbelCDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){return Math.exp(-Math.exp(-(x-state.mu)/state.sigma));};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  ak.gumbelInvCDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(c){return state.mu - state.sigma*Math.log(-Math.log(c));};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  ak.gumbelRnd = function() {
   var state = {mu: 0, sigma: 1, rnd: Math.random};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(){return state.mu - state.sigma*Math.log(-Math.log(state.rnd()));};
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

   if(!isFinite(state.mu)) throw new Error('invalid mu in ak.gumbel distribution');
   if(state.sigma<=0 || !isFinite(state.sigma)) throw new Error('invalid sigma in ak.gumbel distribution');
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
 }

 ak.using('Special/GammaFunction.js', define);
})();
