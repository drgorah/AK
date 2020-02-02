//AK/Distribution/BernoulliDistribution.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.bernoulliPMF) return;

  ak.bernoulliPMF = function() {
   var state = {p: 0.5};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(k) {if(k===0) return 1-state.p; if(k===1) return state.p; return isNaN(k) ? ak.NaN : 0};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  ak.bernoulliCF = function() {
   var state = {p: 0.5};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t) {return ak.complex(1-state.p+state.p*Math.cos(t), state.p*Math.sin(t))};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  ak.bernoulliCDF = function() {
   var state = {p: 0.5};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(k) {if(k<0) return 0; if(k>=1) return 1; return isNaN(k) ? ak.NaN : 1-state.p;};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  ak.bernoulliInvCDF = function() {
   var state = {p: 0.5};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(c) {if(c<=1-state.p) return 0; return isNaN(c) ? ak.NaN : 1;};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  ak.bernoulliRnd = function() {
   var state = {p: 0.5, rnd: Math.random};
   var arg0  = arguments[0];
   var km, cm, prnd, ppmf, bpmf, lambda, l, u, c, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function() {return state.rnd()<=state.p ? 1 : 0;}
   f.p = function(){return state.p;};
   f.rnd = function(){return state.rnd;};
   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.UNDEFINED_T] = function() {
  };

  constructors[ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T] = function(state, p, args) {
   var arg1 = args[1];
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1, args);

   state.p = Number(p);
   if(state.p<0 || state.p>1 || !isFinite(state.p)) throw new Error('invalid p in ak.bernoulli distribution');
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };
 }

 ak.using('Complex/Complex.js', define);
})();
