//AK/Distribution/NegativeBinomialDistribution.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.negativeBinomialPMF) return;

  function pmf(r, p, lnp, rlnq, lnr, k) {
   if(k>=0 && k===ak.floor(k)) return Math.exp(k*lnp + rlnq + ak.logGamma(k+r) - lnr - ak.logGamma(k+1));
   return isNaN(k) ? ak.NaN : 0;
  }

  ak.negativeBinomialPMF = function() {
   var state = {r: 1, p: 0.5};
   var arg0  = arguments[0];
   var lnp, rlnq, lnr, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   lnp = Math.log(state.p);
   rlnq = state.r*Math.log(1-state.p);
   lnr = ak.logGamma(state.r);

   f = function(k){return pmf(state.r, state.p, lnp, rlnq, lnr, k);};
   f.r = function(){return state.r;};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  function cf(r, p, t) {
   var pcost = p*Math.cos(t);
   var d = 1+p*p-2*pcost;
   var z = ak.complex((1-p)*(1-pcost)/d, (1-p)*p*Math.sin(t)/d);
   return ak.pow(z, r);
  }

  ak.negativeBinomialCF = function() {
   var state = {r: 1, p: 0.5};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t){return cf(state.r, state.p, t);};
   f.r = function(){return state.r;};
   f.p = function(){return state.p;};
   return Object.freeze(f);
  };

  function cdf(r, p, k) {
   if(k>=0) return ak.betaP(r, ak.floor(k)+1, 1-p);
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

  function invCDF(r, q, k1, p0, p1, c) {
   var k0 = 0;
   var m;

   if(isNaN(c)) return ak.NaN;
   if(c>=1)     return ak.INFINITY;
   if(c<=p0)    return 0;

   while(p1<c) {
    k0 = k1;
    k1 *= 2;
    p1 = ak.betaP(r, k1+1, q);
   }
   m = ak.floor(k0/2 + k1/2);

   while(m!==k0 && m!==k1) {
    if(ak.betaP(r, m+1, q)<c) k0 = m;
    else                      k1 = m;
    m = ak.floor(k0/2 + k1/2);
   }
   return ak.betaP(r, k0+1, q)<c ? k1 : k0;
  }

  ak.negativeBinomialInvCDF = function() {
   var state = {r: 1, p: 0.5};
   var arg0  = arguments[0];
   var q, k1, p0, p1, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   q = 1-state.p;
   k1 = ak.ceil(state.r*state.p/q);
   p0 = ak.betaP(state.r, 1, q);
   p1 = ak.betaP(state.r, k1+1, q);

   f = function(c){return invCDF(state.r, q, k1, p0, p1, c);};
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
   var grnd, q, k1, p0, p1, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   if(state.r<=4 && state.r===ak.floor(state.r)) {
    grnd = ak.geometricRnd(1-state.p, state.rnd);
    f = function(){return directRnd(state.r, grnd);};
   }
   else if(state.r*state.p<=8*(1-state.p)) {
    q = 1-state.p;
    k1 = ak.ceil(state.r*state.p/q);
    p0 = ak.betaP(state.r, 1, q);
    p1 = ak.betaP(state.r, k1+1, q);
    f = function(c){return invCDF(state.r, q, k1, p0, p1, state.rnd());};
   }
   else
   {
    grnd = ak.gammaRnd(state.r, (1-state.p)/state.p, state.rnd);
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
   if(!(state.p>0 && state.p<1)) throw new Error('invalid p in ak.negativeBinomial distribution');
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };
 }

 ak.using(['Special/BetaFunction.js', 'Distribution/GeometricDistribution.js', 'Distribution/GammaDistribution.js', 'Distribution/PoissonDistribution.js'], define);
})();
