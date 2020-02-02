//AK/Distribution/GeometricDistribution.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.geometricPMF) return;

  function pmf(p, k) {
   if(k>=0 && k===ak.floor(k)) return Math.pow(1-p, k)*p;
   return isNaN(k) ? ak.NaN : 0;
  }

  ak.geometricPMF = function() {
   var state = {p: 0.5};
   var arg0  = arguments[0];
   var f, ll;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(k){return pmf(state.p, k);};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  function cf(p, t) {
   var ct = Math.cos(t);
   var st = Math.sin(t);
   var re = 1-(1-p)*ct;
   var im = (1-p)*st;
   var d  = re*re+im*im;
   return ak.complex(p*re/d, p*im/d);
  }

  ak.geometricCF = function() {
   var state = {p: 0.5};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t){return cf(state.p, t);};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  ak.geometricCDF = function() {
   var state = {p: 0.5};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(k){return k<0 ? 0 : 1-Math.pow(1-state.p, ak.floor(k)+1);};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  function invCDF(p, ln1p, c) {
   var k;
   if(isNaN(c)) return ak.NaN;
   if(c>=1)     return ak.INFINITY;
   if(c<=0)     return 0;

   k = ak.floor(Math.log(1-c)/ln1p - 1);
   while(1-Math.pow(1-p, k+1)<c) ++k;
   return k;
  }

  ak.geometricInvCDF = function() {
   var state = {p: 0.5};
   var arg0  = arguments[0];
   var ln1p, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   ln1p = Math.log(1-state.p);

   f = function(c){return invCDF(state.p, ln1p, c);};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  ak.geometricRnd = function() {
   var state = {p: 0.5, rnd: Math.random};
   var arg0  = arguments[0];
   var ln1p, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   ln1p = Math.log(1-state.p);

   f = function(){return invCDF(state.p, ln1p, state.rnd());};

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
   if(state.p<0 || state.p>1 || !isFinite(state.p)) throw new Error('invalid p in ak.geometric distribution');
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };
 }

 ak.using('Complex/Complex.js', define);
})();
