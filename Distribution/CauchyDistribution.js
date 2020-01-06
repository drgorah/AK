//AK/Distribution/CauchyDistribution.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.cauchyPDF) return;

  function pdf(m, s, x) {
   x = (x-m)/s;
   return 1/(ak.PI*s*(1+x*x));
  }

  ak.cauchyPDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){return pdf(state.mu, state.sigma, x);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  function cf(m, s, t) {
   var r  = Math.exp(-s*Math.abs(t));
   var mt = m*t;
   return r===0 ? ak.complex(0) : ak.complex(r*Math.cos(mt), r*Math.sin(mt));
  }

  ak.cauchyCF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t){return cf(state.mu, state.sigma, t);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  function cdf(m, s, x) {
   x = (x-m)/s;
   return Math.atan(x)/ak.PI + 0.5;
  }

  ak.cauchyCDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){return cdf(state.mu, state.sigma, x);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  function invCDF(m, s, c) {
   return m + s*Math.tan(c*ak.PI - ak.PI/2);
  }

  ak.cauchyInvCDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(c){return invCDF(state.mu, state.sigma, c);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  function rnd(m, s, rnd) {
   return m + s*Math.tan(rnd()*ak.PI - ak.PI/2);
  }

  ak.cauchyRnd = function() {
   var state = {mu: 0, sigma: 1, rnd: Math.random};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(){return rnd(state.mu, state.sigma, state.rnd);};
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

   if(!isFinite(state.mu)) throw new Error('invalid mu in ak.cauchy distribution');
   if(state.sigma<=0 || !isFinite(state.sigma)) throw new Error('invalid sigma in ak.cauchy distribution');
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

 ak.using('Complex/Complex.js', define);
})();
