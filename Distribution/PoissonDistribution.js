//AK/Distribution/PoissonDistribution.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.poissonPMF) return;

  function pmf(l, ll, k) {
   if(k>=0 && k===ak.floor(k)) return Math.exp(k*ll - l - ak.logGamma(k+1));
   return isNaN(k) ? ak.NaN : 0;
  }

  ak.poissonPMF = function() {
   var state = {lambda: 1};
   var arg0  = arguments[0];
   var f, ll;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   ll = Math.log(state.lambda);
   f = function(k){return pmf(state.lambda, ll, k);};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  ak.poissonCF = function() {
   var state = {lambda: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t){return ak.exp(ak.complex(state.lambda*(Math.cos(t)-1), state.lambda*Math.sin(t)));};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  ak.poissonCDF = function() {
   var state = {lambda: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(k){return k<0 ? 0 : ak.gammaQ(ak.floor(k+1), state.lambda);};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  function invCDF(l, b1, g0, g1, c) {
   var b0 = 0;
   var m;

   if(isNaN(c)) return ak.NaN;
   if(c>=1)     return ak.INFINITY;
   if(c<=g0)    return b0;

   while(g1<c) {
    b0 = b1;
    b1 *= 2;
    g1 = ak.gammaQ(b1+1,l);
   }
   m = ak.floor(b0/2 + b1/2);

   while(m!==b0 && m!==b1) {
    if(ak.gammaQ(m+1,l)<c) b0 = m;
    else                   b1 = m;
    m = ak.floor(b0/2 + b1/2);
   }
   return b1;
  }

  ak.poissonInvCDF = function() {
   var state = {lambda: 1};
   var arg0  = arguments[0];
   var b1, g0, g1, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   b1 = ak.ceil(state.lambda);
   g0 = ak.gammaQ(1, state.lambda);
   g1 = ak.gammaQ(b1+1, state.lambda);

   f = function(c){return invCDF(state.lambda, b1, g0, g1, c);};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  function expRnd(state, el) {
   var k = 0;

   if(state.exp===0) state.exp = state.rnd();

   while(state.exp>=el) {
    state.exp *= state.rnd();
    ++k;
   }
   state.exp /= el;

   return k;
  }

  function reject(l, ll, rl, k) {
   var pp = pmf(l, ll, k);
   var pc = (Math.atan((k+1-l)/rl)-Math.atan((k-l)/rl))/ak.PI;
   return pp/pc;
  }

  function maxReject(l, ll, rl, k0) {
   var k1 = k0+1;
   var c0 = reject(l, ll, rl, k0);
   var c1 = reject(l, ll, rl, k1);
   var c;

   if(c0>c1) {
    while(c0>c1) {
     --k1; c1 = c0;
     --k0; c0 = reject(l, ll, rl, k0);
    }
    c = c1;
   }
   else {
    while(c0<c1) {
     ++k0; c0 = c1;
     ++k1; c1 = reject(l, ll, rl, k1);
    }
    c = c0;
   }
   return c;
  }

  function rejectRnd(l, ll, rl, c, rnd) {
   var k;

   do k = ak.floor(l + rl*Math.tan((rnd()-0.5)*ak.PI));
   while(k<0 || c*rnd()>reject(l, ll, rl, k));

   return k;
  }

  ak.poissonRnd = function() {
   var state = {lambda: 1, rnd: Math.random};
   var arg0  = arguments[0];
   var b1, g0, g1, el, ll, rl, c, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   if(state.lambda<=2) {
    state.exp = 0;
    el = Math.exp(-state.lambda);

    f = function(){return expRnd(state, el);};
   }
   else if(state.lambda<=8) {
    b1 = ak.ceil(state.lambda);
    g0 = ak.gammaQ(1, state.lambda);
    g1 = ak.gammaQ(b1+1, state.lambda);

    f = function(){return invCDF(state.lambda, b1, g0, g1, state.rnd());};
   }
   else {
    ll = Math.log(state.lambda);
    rl = Math.sqrt(state.lambda);
    c  = maxReject(state.lambda, ll, rl, ak.floor(state.lambda-rl));
    c  = Math.max(c, maxReject(state.lambda, ll, rl, ak.floor(state.lambda+rl)));

    f = function(){return rejectRnd(state.lambda, ll, rl, c, state.rnd);};
   }

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
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1, args);

   state.lambda = Number(lambda);
   if(state.lambda<=0 || !isFinite(state.lambda)) throw new Error('invalid lambda in ak.poisson distribution');
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };
 }

 ak.using('Special/GammaFunction.js', define);
})();
