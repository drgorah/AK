//AK/Distribution/LogNormalDistribution.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.logNormalPDF) return;

  ak.logNormalPDF = function(mu, sigma) {
   var pdf = ak.normalPDF(mu, sigma);
   var f = function(x){return x<=0 ? 0 : pdf(Math.log(x))/x;};
   f.mu = pdf.mu;
   f.sigma = pdf.sigma;
   return Object.freeze(f);
  };

  ak.logNormalCDF = function(mu, sigma) {
   var cdf = ak.normalCDF(mu, sigma);
   var f = function(x){return x<=0 ? 0 : cdf(Math.log(x));};
   f.mu = cdf.mu;
   f.sigma = cdf.sigma;
   return Object.freeze(f);
  };

  ak.logNormalInvCDF = function(mu, sigma) {
   var inv = ak.normalInvCDF(mu, sigma);
   var f = function(c){return Math.exp(inv(c));};
   f.mu = inv.mu;
   f.sigma = inv.sigma;
   return Object.freeze(f);
  };

  ak.logNormalRnd = function(mu, sigma, rnd) {
   var n = ak.normalRnd(mu, sigma, rnd);
   var f = function(){return Math.exp(n());};
   f.mu = n.mu;
   f.sigma = n.sigma;
   return Object.freeze(f);
  };

  function bounds1(s2, eps) {
   var z = Math.sqrt(-2*s2*Math.log(eps));
   return [-z, z];
  }

  function envMax(s2, t, eps) {
   var ts2 = t*s2;

   var f = function(z) {
    var e = ts2*Math.exp(z);
    return [-z-e, -1-e];
   };

   var m = -ts2/(1+ts2);
   var lo = f(m)[0]<0;
   var l = lo ? -ts2 : m;
   var u = lo ? m : 0;

   return (l!==u) ? ak.newtonInverse(f, eps)(0, [l, u]) : 0;
  }

  function bounds2(s2, t, eps) {
   var ts2 = t*s2;
  
   var f = function(z) {
    var e = ts2*Math.exp(z);
    return [-0.5*z*z-e, -z-e];
   };
   var inv = ak.newtonInverse(f, eps);

   var x = envMax(s2, t, eps);
   var e = f(x)[0] + s2*Math.log(eps);
   var l1 = -1;
   var l2 =  0;
   var u1 =  0;
   var u2 =  1;

   while(f(x+l1)[0]>e) {l2 = l1; l1 *= 2;}
   while(f(x+u2)[0]>e) {u1 = u2; u2 *= 2;}

   return [inv(e, [x+l1, x+l2]), inv(e, [x+u1, x+u2])];
  }

  function cf1(s, t, b, eps, n) {
   var s2 = s*s;
   var c = 1/(Math.sqrt(2*ak.PI)*s);

   var fr = function(z){return Math.cos(t*Math.exp(z)) * Math.exp(-0.5*z*z/s2);};
   var fi = function(z){return Math.sin(t*Math.exp(z)) * Math.exp(-0.5*z*z/s2);};

   var r = c*ak.rombergIntegral(fr, eps, n)(b[0], b[1]);
   var i = c*ak.rombergIntegral(fi, eps, n)(b[0], b[1]);

   return ak.complex(r, i);
  }

  function cf2(s, t, b, eps, n) {
   var s2  = s*s;
   var hps2 = 0.5*ak.PI/s2;
   var abs_t = Math.abs(t);
   var c = Math.exp(0.25*ak.PI*hps2)/(Math.sqrt(2*ak.PI)*s);

   var fr = function(z){return  Math.cos(z*hps2) * Math.exp(-0.5*z*z/s2 - abs_t*Math.exp(z));};
   var fi = function(z){return -Math.sin(z*hps2) * Math.exp(-0.5*z*z/s2 - abs_t*Math.exp(z));};

   var r = c*ak.rombergIntegral(fr, eps, n)(b[0], b[1]);
   var i = c*ak.rombergIntegral(fi, eps, n)(b[0], b[1]);

   return ak.complex(r, t>0 ? i : -i);
  }

  function cf(s, t, eps, n) {
   var s2 = s*s;
   var abs_t = Math.abs(t);
   var b1, b2, w1, w2;

   if(!isFinite(t)) return ak.complex(1/t, 1/t);
   if(t===0 || s2<ak.MIN_NORMAL) return ak.complex(Math.cos(t), Math.sin(t));

   b1 = bounds1(s2, eps);
   w1 = abs_t*(Math.exp(b1[1])-Math.exp(b1[0]));
   if(w1<2*ak.PI) return cf1(s, t, b1, eps);

   b2 = bounds2(s2, abs_t, eps);
   w2 = 0.5*ak.PI*(b2[1]-b2[0])/s2;
   return w1<w2 ? cf1(s, t, b1, eps, n) : cf2(s, t, b2, eps, n);
  }

  ak.logNormalCF = function() {
   var state = {mu: 0, sigma: 1, eps: Math.pow(ak.EPSILON, 0.75), n: 18};
   var arg0  = arguments[0];
   var f, em;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);
   em = Math.exp(state.mu);

   f = function(t){return cf(state.sigma, t*em, state.eps, state.n);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.UNDEFINED_T] = function() {
  };

  constructors[ak.NUMBER_T] = function(state, x, args) {
   var arg1 = args[1];
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, x, arg1, args);

   if(!isFinite(state.mu)) throw new Error('invalid mu in ak.logNormalCF');
   if(state.sigma<=0 || !isFinite(state.sigma)) throw new Error('invalid sigma in ak.logNormalCF');
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state, x) {
   state.sigma = Number(x);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, x0, x1, args) {
   var arg2 = args[2];
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg2)](state, arg2, args);

   state.mu = Number(x0);
   state.sigma = Number(x1);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, eps, args) {
   var arg3 = args[3];

   state.eps = Math.abs(eps);
   if(isNaN(state.eps)) throw new Error('invalid error threshold in ak.logNormalCF');

   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg3)](state, arg3);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, n) {
   state.n = ak.floor(Math.abs(n));
   if(isNaN(state.n)) throw new Error('invalid integration steps passed to ak.logNormalCF');
  };
 }

 ak.using(['Distribution/NormalDistribution.js','Invert/NewtonInverse.js','Calculus/RombergIntegral.js'], define);
})();
