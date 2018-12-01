//AK/Distribution/NormalDistribution.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.normalPDF) return;

  var RT2PI = Math.sqrt(2*ak.PI);

  function pdf(m, s, x) {
   var y = (x-m)/s;
   return Math.exp(-y*y/2) / (RT2PI*s);
  }

  ak.normalPDF = function() {
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
   var ts = t*s;
   var r  = Math.exp(-ts*ts/2);
   var mt = m*t;
   return r===0 ? ak.complex(0) : ak.complex(r*Math.cos(mt), r*Math.sin(mt));
  }

  ak.normalCF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(t){return cf(state.mu, state.sigma, t);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  var SPLIT = 7.07106781186547;

  var N0 = 220.206867912376;
  var N1 = 221.213596169931;
  var N2 = 112.079291497871;
  var N3 = 33.912866078383;
  var N4 = 6.37396220353165;
  var N5 = 0.700383064443688;
  var N6 = 3.52624965998911e-02;
  var M0 = 440.413735824752;
  var M1 = 793.826512519948;
  var M2 = 637.333633378831;
  var M3 = 296.564248779674;
  var M4 = 86.7807322029461;
  var M5 = 16.064177579207;
  var M6 = 1.75566716318264;
  var M7 = 8.83883476483184e-02;

  function cdf(m, s, x) {
   var z = Math.abs(x-m)/s;
   var c = 0;
   var e, n, d, f;

   if(isNaN(z)) return ak.NaN;

   if(z<=37) {
    e = Math.exp(-z*z/2);
    if(z<SPLIT) {
     n = (((((N6*z + N5)*z + N4)*z + N3)*z + N2)*z + N1)*z + N0;
     d = ((((((M7*z + M6)*z + M5)*z + M4)*z + M3)*z + M2)*z + M1)*z + M0;
     c = e*n/d;
    }
    else {
     f = z + 1/(z + 2/(z + 3/(z + 4/(z + 13/20))));
     c = e/(RT2PI*f);
    }
   }
   return x<=m ? c : 1-c;
  }

  ak.normalCDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(x){return cdf(state.mu, state.sigma, x);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  var SPLIT1 = 0.425e0;
  var SPLIT2 = 5.0e0;
  var CONST1 = 0.180625E0;
  var CONST2 = 1.6e0;

  var A0 = 3.3871328727963666080e0;
  var A1 = 1.3314166789178437745e+2;
  var A2 = 1.9715909503065514427e+3;
  var A3 = 1.3731693765509461125e+4;
  var A4 = 4.5921953931549871457e+4;
  var A5 = 6.7265770927008700853e+4;
  var A6 = 3.3430575583588128105e+4;
  var A7 = 2.5090809287301226727e+3;
  var B1 = 4.2313330701600911252e+1;
  var B2 = 6.8718700749205790830e+2;
  var B3 = 5.3941960214247511077e+3;
  var B4 = 2.1213794301586595867e+4;
  var B5 = 3.9307895800092710610e+4;
  var B6 = 2.8729085735721942674e+4;
  var B7 = 5.2264952788528545610e+3;

  var C0 = 1.42343711074968357734e0;
  var C1 = 4.63033784615654529590e0;
  var C2 = 5.76949722146069140550e0;
  var C3 = 3.64784832476320460504e0;
  var C4 = 1.27045825245236838258e0;
  var C5 = 2.41780725177450611770e-1;
  var C6 = 2.27238449892691845833e-2;
  var C7 = 7.74545014278341407640e-4;
  var D1 = 2.05319162663775882187e0;
  var D2 = 1.67638483018380384940e0;
  var D3 = 6.89767334985100004550e-1;
  var D4 = 1.48103976427480074590e-1;
  var D5 = 1.51986665636164571966e-2;
  var D6 = 5.47593808499534494600e-4;
  var D7 = 1.05075007164441684324e-9;

  var E0 = 6.65790464350110377720e0;
  var E1 = 5.46378491116411436990e0;
  var E2 = 1.78482653991729133580e0;
  var E3 = 2.96560571828504891230e-1;
  var E4 = 2.65321895265761230930e-2;
  var E5 = 1.24266094738807843860e-3;
  var E6 = 2.71155556874348757815e-5;
  var E7 = 2.01033439929228813265e-7;
  var F1 = 5.99832206555887937690e-1;
  var F2 = 1.36929880922735805310e-1;
  var F3 = 1.48753612908506148525e-2;
  var F4 = 7.86869131145613259100e-4;
  var F5 = 1.84631831751005468180e-5;
  var F6 = 1.42151175831644588870e-7;
  var F7 = 2.04426310338993978564e-15;

  function invCDF(m, s, c) {
   var q = c-0.5;
   var r, n, d, z;

   if(isNaN(q)) return ak.NaN;
   if(c<=0) return -ak.INFINITY;
   if(c>=1) return  ak.INFINITY;

   if(Math.abs(q) <= SPLIT1) {
    r = CONST1 - q*q;
    n = ((((((A7*r+A6)*r+A5)*r+A4)*r+A3)*r+A2)*r+A1)*r+A0;
    d = ((((((B7*r+B6)*r+B5)*r+B4)*r+B3)*r+B2)*r+B1)*r+1;
    z = q*n/d;
   }
   else {
    r = q<0 ? c : 1-c;
    r = Math.sqrt(-Math.log(r));

    if(r <= SPLIT2) {
     r -= CONST2;
     n = ((((((C7*r+C6)*r+C5)*r+C4)*r+C3)*r+C2)*r+C1)*r+C0;
     d = ((((((D7*r+D6)*r+D5)*r+D4)*r+D3)*r+D2)*r+D1)*r+1;
    }
    else {
     r -= SPLIT2;
     n = ((((((E7*r+E6)*r+E5)*r+E4)*r+E3)*r+E2)*r+E1)*r+E0;
     d = ((((((F7*r+F6)*r+F5)*r+F4)*r+F3)*r+F2)*r+F1)*r+1;
    }
    z = (q<0) ? -n/d : n/d;
   }
   return m + z*s;
  }

  ak.normalInvCDF = function() {
   var state = {mu: 0, sigma: 1};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(c){return invCDF(state.mu, state.sigma, c);};
   f.mu = function(){return state.mu;};
   f.sigma = function(){return state.sigma;};
   return Object.freeze(f);
  };

  function rnd(m, s, r, b) {
   var u0, u1, r2, c;

   if(b.full) {
    b.full = false;
    return b.z;
   }

   do {
    u0 = 2*r() - 1;
    u1 = 2*r() - 1;
    r2 = u0*u0 + u1*u1;
   }
   while(r2===0 || r2>=1);

   c = s*Math.sqrt(-2*Math.log(r2)/r2);
   b.full = true;
   b.z = m + u0*c;
   return m + u1*c;
  }

  ak.normalRnd = function() {
   var state = {mu: 0, sigma: 1, rnd: Math.random, buffer: {full: false, z: 0}};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   f = function(){return rnd(state.mu, state.sigma, state.rnd, state.buffer);};
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

   if(!isFinite(state.mu)) throw new Error('invalid mu in ak.normal distribution');
   if(state.sigma<=0 || !isFinite(state.sigma)) throw new Error('invalid sigma in ak.normal distribution');
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
