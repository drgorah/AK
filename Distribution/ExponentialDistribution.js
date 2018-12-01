//AK/Distribution/ExponentialDistribution.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.exponentialPDF) return;

  ak.exponentialPDF = function() {
   var state = {lambda: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){return x<0 ? 0 : state.lambda*Math.exp(-state.lambda*x);};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  function cf(l, t) {
   var tl = t/l;
   var tl2 = 1+tl*tl;

   if(!isFinite(tl2)) return isNaN(t) ? ak.complex(ak.NaN, ak.NaN) : ak.complex(0);
   return ak.complex(1/tl2, t/(tl2*l));
  }

  ak.exponentialCF = function() {
   var state = {lambda: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t){return cf(state.lambda, t);};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  ak.exponentialCDF = function() {
   var state = {lambda: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){return x<=0 ? 0 : 1 - Math.exp(-state.lambda*x);};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  function invCDF(l, c) {
   if(c<=0) return 0;
   if(c>=1) return ak.INFINITY;
   return -Math.log(1-c)/l;
  }

  ak.exponentialInvCDF = function() {
   var state = {lambda: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(c){return invCDF(state.lambda, c);};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  ak.exponentialRnd = function() {
   var state = {lambda: 1, rnd: Math.random};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(){return invCDF(state.lambda, state.rnd());};
   f.lambda = function(){return state.lambda;};
   f.rnd = function(){return state.rnd;};
   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.UNDEFINED_T] = function() {
  };

  constructors[ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T] = function(state, lambda, args) {
   var arg1 = args[1];
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1);

   state.lambda = Number(lambda);
   if(state.lambda<=0 || !isFinite(state.lambda)) throw new Error('invalid lambda in ak.exponential distribution');
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };
 }

 ak.using('Complex/Complex.js', define);
})();
