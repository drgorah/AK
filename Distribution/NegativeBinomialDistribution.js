//AK/Distribution/NegativeBinomialDistribution.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.negativeBinomialPMF) return;

  function pmf(r, lnq, rlnp, rfac, k) {
   if(k>=0 && k===ak.floor(k)) return Math.exp(k*lnq + rlnp + ak.logGamma(k+r) - ak.logGamma(k+1) - rfac);
   return isNaN(k) ? ak.NaN : 0;
  }

  ak.negativeBinomialPMF = function() {
   var state = {r: 1, p: 0.5};
   var arg0  = arguments[0];
   var lnq, rlnp, rfac, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   lnq = Math.log(1-state.p);
   rlnp = state.r*Math.log(state.p);
   rfac = ak.logGamma(state.r);

   f = function(k){return pmf(state.r, lnq, rlnp, rfac, k);};
   f.r = function(){return state.r;};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  function cf(r, p, q, t) {
   var qcost = q*Math.cos(t);
   var d = 1+q*q-2*qcost;
   var z = ak.complex(p*(1-qcost)/d, p*q*Math.sin(t)/d);
   return ak.pow(z, r);
  }

  ak.negativeBinomialCF = function() {
   var state = {r: 1, p: 0.5};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t){return cf(state.r, state.p, 1-state.p, t);};
   f.r = function(){return state.r;};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  function cdf(r, p, k) {
   if(k>=0) return ak.betaP(r, ak.floor(k)+1, p);
   return isNaN(k) ? ak.NaN : 0;
  }

  ak.negativeBinomialCDF = function() {
   var state = {r: 1, p: 0.5};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(k){return cdf(state.r, state.p, k);};
   f.r = function(){return state.r;};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  function invCDF(r, p, k1, p0, p1, c) {
   var k0 = 0;
   var m;

   if(isNaN(c)) return ak.NaN;
   if(c>=1)     return ak.INFINITY;
   if(c<=p0)    return 0;

   while(p1<c) {
    k0 = k1;
    k1 *= 2;
    p1 = ak.betaP(r, k1+1, p);
   }
   m = ak.floor(k0/2 + k1/2);

   while(m!==k0 && m!==k1) {
    if(ak.betaP(r, m+1, p)<c) k0 = m;
    else                      k1 = m;
    m = ak.floor(k0/2 + k1/2);
   }
   return ak.betaP(r, k0+1, p)<c ? k1 : k0;
  }

  ak.negativeBinomialInvCDF = function() {
   var state = {r: 1, p: 0.5};
   var arg0  = arguments[0];
   var k1, p0, p1, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   k1 = ak.ceil(state.r*(1-state.p)/state.p);
   p0 = ak.betaP(state.r, 1, state.p);
   p1 = ak.betaP(state.r, k1+1, state.p);

   f = function(c){return invCDF(state.r, state.p, k1, p0, p1, c);};
   f.r = function(){return state.r;};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  function directRnd(r, grnd) {
   var k = 0;
   var i;

   for(i=0;i<r;++i) k += grnd();
   return k;
  }

  ak.negativeBinomialRnd = function() {
   var state = {r: 1, p: 0.5, rnd: Math.random};
   var arg0  = arguments[0];
   var grnd, k1, p0, p1, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   if(state.r<=4 && state.r===ak.floor(state.r)) {
    grnd = ak.geometricRnd(state.p, state.rnd);
    f = function(){return directRnd(state.r, grnd);};
   }
   else if(state.r*(1-state.p)<=8*state.p) {
    k1 = ak.ceil(state.r*(1-state.p)/state.p);
    p0 = ak.betaP(state.r, 1, state.p);
    p1 = ak.betaP(state.r, k1+1, state.p);
    f = function(c){return invCDF(state.r, state.p, k1, p0, p1, state.rnd());};
   }
   else
   {
    grnd = ak.gammaRnd(state.r, state.p/(1-state.p), state.rnd);
    f = function(){return ak.poissonRnd(grnd())();};
   }
   f.r = function(){return state.r;};
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

  constructors[ak.NUMBER_T] = function(state, r, args) {
   var arg1 = args[1];
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1, args);

   state.r = Number(r);
   if(state.r<=0 || !isFinite(state.r)) throw new Error('invalid r in ak.negativeBinomial distribution');
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, p, args) {
   var arg2 = args[2];
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg2)](state, arg2, args);

   state.p = Number(p);
   if(!(p>0 && p<1)) throw new Error('invalid p in ak.negativeBinomial distribution');
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };
 }

 ak.using(['Special/BetaFunction.js', 'Distribution/GeometricDistribution.js', 'Distribution/GammaDistribution.js', 'Distribution/PoissonDistribution.js'], define);
})();
