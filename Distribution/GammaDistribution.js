//AK/Distribution/GammaDistribution.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.gammaPDF) return;

  ak.gammaPDF = function() {
   var state = {k: 1, lambda: 1};
   var arg0  = arguments[0];
   var ck, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   if(state.k===1) {
    f = function(x){return x<0 ? 0 : state.lambda * Math.exp(-state.lambda*x);};
   }
   else {
    ck = state.k * Math.log(state.lambda) - ak.logGamma(state.k);
    f = function(x){return x<0 ? 0 : Math.exp((state.k-1)*Math.log(x) - state.lambda*x + ck);};
   }

   f.k = function(){return state.k;};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  function cf(k, l, t) {
   var tl = t/l;
   var den = Math.pow(1+tl*tl, k);

   if(!isFinite(den)) return isNaN(t) ? ak.complex(ak.NaN, ak.NaN) : ak.complex(0);
   return ak.pow(ak.complex(1, -tl), -k);
  }

  ak.gammaCF = function() {
   var state = {k: 1, lambda: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t){return cf(state.k, state.lambda, t);};
   f.k = function(){return state.k;};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  ak.gammaCDF = function() {
   var state = {k: 1, lambda: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){return x<=0 ? 0 : ak.gammaP(state.k, state.lambda*x);};
   f.k = function(){return state.k;};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  function invCDF(inv, cdf, b1, c) {
   var b0 = 0;

   if(c<=0) return 0;
   if(c>=1) return ak.INFINITY;
   if(isNaN(c)) return ak.NaN;

   while(cdf(b1)<c) {
    b0 = b1;
    b1 *= 2;
   }
   return isFinite(b1) ? inv(c, [b0, b1]) : b1;
  }

  ak.gammaInvCDF = function() {
   var state = {k: 1, lambda: 1, eps: Math.pow(ak.EPSILON, 0.75)};
   var arg0  = arguments[0];
   var pdf, cdf, fdf, inv, mean, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   pdf = ak.gammaPDF(state.k, state.lambda);
   cdf = ak.gammaCDF(state.k, state.lambda);
   fdf = function(x){return [cdf(x), pdf(x)];};
   inv = ak.newtonInverse(fdf, state.eps);
   mean = state.k/state.lambda;

   f = function(c){return invCDF(inv, cdf, mean, c);};
   f.k = function(){return state.k;};
   f.lambda = function(){return state.lambda;};
   return Object.freeze(f);
  };

  function kunduRnd(k, d, a, b, rnd) {
   var c = a+b;
   var o = 0;
   var u, v, x;

   //assert(k<=2);

   while(k>=1) {
    o -= Math.log(1-rnd());
    --k;
   }
   if(k===0) return o;

   while(1) {
    u = rnd();
    v = rnd();

    x = u<=a/c ? -2*Math.log(1-Math.pow(c*u, 1/k)/2) : -Math.log(c*(1-u)/(k*Math.pow(d, k-1)));
    if(x<=d && v<=Math.pow(x/(2*(1-Math.exp(-x/2))), k-1)*Math.exp(-x/2)) return o+x;
    if(x>d && v<=Math.pow(d/x, 1-k)) return o+x;
   }
  }

  function bestRnd(k, a, b, rnd) {
   var u, v, w, x, y, z;

   //assert(k>2);

   while(1) {
    u = rnd();
    v = rnd();
    w = u*(1-u);
    y = Math.sqrt(b/w)*(u-0.5);
    x = a+y;

    if(x>=0) {
     z = 64*w*w*w*v*v;
     if(z<=1-2*y*y/x || Math.log(z)<=2*(a*Math.log(x/a)-y)) return x;
    }
   }
  }

  ak.gammaRnd = function() {
   var state = {k: 1, lambda: 1, rnd: Math.random};
   var arg0  = arguments[0];
   var k, d, a, b, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   if(state.k<=2) {
    if(state.k!==1 && state.k!==2) {
     k = state.k>1 ? state.k-1 : state.k;
     d = 1.0334 - 0.0766 * Math.exp(2.2942*k);
     a = Math.pow(2-2*Math.exp(-d/2), k);
     b = k * Math.pow(d, k-1) * Math.exp(-d);
    }

    f = function(){return kunduRnd(state.k, d, a, b, state.rnd)/state.lambda;};
   }
   else {
    a = state.k-1;
    b = 3*state.k-0.75;

    f = function(){return bestRnd(state.k, a, b, state.rnd)/state.lambda;};
   }

   f.k = function(){return state.k;};
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

  constructors[ak.NUMBER_T] = function(state, k, args) {
   var arg1 = args[1];
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1, args);

   state.k = Number(k);
   if(state.k<=0 || !isFinite(state.k)) throw new Error('invalid k in ak.gamma distribution');
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, lambda, args) {
   var arg2 = args[2];
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg2)](state, arg2);

   state.lambda = Number(lambda);
   if(state.lambda<=0 || !isFinite(state.lambda)) throw new Error('invalid lambda in ak.gamma distribution');
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, eps) {
   state.eps = Number(eps);
   if(isNaN(state.eps)) throw new Error('invalid convergence threshold in ak.gamma distribution');
  };
 }

 ak.using(['Special/GammaFunction.js', 'Invert/NewtonInverse.js'], define);
})();
