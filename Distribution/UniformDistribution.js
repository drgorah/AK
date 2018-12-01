//AK/Distribution/UniformDistribution.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.uniformCDF) return;

  function cdf(a, b, x) {
   var c = (x-a)/(b-a);
   if(c<0)      c = 0;
   else if(c>1) c = 1;
   return c;
  }

  ak.uniformCDF = function() {
   var state = {a: 0, b: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){return cdf(state.a, state.b, x);};
   f.a = function(){return state.a;};
   f.b = function(){return state.b;};

   return Object.freeze(f);
  };

  ak.uniformPDF = function() {
   var state = {a: 0, b: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){return x>=state.a && x<=state.b ? 1/(state.b-state.a) : 0;};
   f.a = function(){return state.a;};
   f.b = function(){return state.b;};
   return Object.freeze(f);
  };

  function invCDF(a, b, c) {
   var x = a + c*(b-a);
   if(x<a)      x = a;
   else if(x>b) x = b;
   return x;
  }

  ak.uniformInvCDF = function() {
   var state = {a: 0, b: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(c){return invCDF(state.a, state.b, c);};
   f.a = function(){return state.a;};
   f.b = function(){return state.b;};

   return Object.freeze(f);
  };

  var cf_eps = Math.sqrt(ak.EPSILON);

  function cf(a, b, t) {
   var ta = t*a;
   var tb = t*b;
   var di = tb-ta;

   if(!isFinite(di)) return isNaN(t) ? ak.complex(ak.NaN, ak.NaN) : ak.complex(0);
   return Math.abs(di)>cf_eps ? ak.complex((Math.sin(tb)-Math.sin(ta))/di, (Math.cos(ta)-Math.cos(tb))/di)
                              : ak.complex((Math.cos(tb)+Math.cos(ta))/2,  (Math.sin(tb)+Math.sin(ta))/2);
  }

  ak.uniformCF = function() {
   var state = {a: 0, b: 1};
   var arg0  = arguments[0];
   var a, b, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t){return cf(state.a, state.b, t);};
   f.a = function(){return state.a;};
   f.b = function(){return state.b;};

   return Object.freeze(f);
  };

  ak.uniformRnd = function() {
   var state = {a: 0, b: 1, rnd: Math.random};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(){return state.a + state.rnd()*(state.b-state.a);};
   f.a = function(){return state.a;};
   f.b = function(){return state.b;};
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

   if(!isFinite(state.a) || !isFinite(state.b) || state.a===state.b) throw new Error('invalid bounds in ak.uniform distribution');
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state, x) {
   state.a = Math.min(x, 0);
   state.b = Math.max(x, 0);
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, x, rnd) {
   state.a = Math.min(x, 0);
   state.b = Math.max(x, 0);
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, x0, x1, args) {
   var arg2 = args[2];

   state.a = Math.min(x0, x1);
   state.b = Math.max(x0, x1);

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
