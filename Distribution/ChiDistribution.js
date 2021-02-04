//AK/Distribution/ChiDistribution.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.chiPDF) return;

  ak.chiPDF = function(k) {
   var f, pdf;

   if(k!==ak.floor(k) || k<1) throw new Error('invalid degrees of freedom in ak.chiPDF');
   pdf = ak.gammaPDF(k/2, 0.5);

   f = function(x){return x<=0 || x*x===ak.INFINITY ? 0 : 2*x * pdf(x*x);};
   f.k = function(){return k;};
   return Object.freeze(f);
  };

  function realIntegrand(pdf, t) {
   return function(x) {
    return Math.cos(t*x) * pdf(x);
   };
  }

  function imaginaryIntegrand(pdf, t) {
   return function(x) {
    return Math.sin(t*x) * pdf(x);
   };
  }

  function cf(k, t, threshold, steps) {
   var pdf = ak.chiPDF(k);
   var re = realIntegrand(pdf, t);
   var im = imaginaryIntegrand(pdf, t);
   var sr1 = 0;
   var si1 = 0;
   var lb, ub, sr0, si0;

   re = ak.rombergIntegral(re, threshold, steps);
   im = ak.rombergIntegral(im, threshold, steps);

   lb = 0;
   ub = k<=2 ? 1 : Math.sqrt(k-1);
   do {
    sr0 = sr1;
    sr1 = sr0 + re(lb, ub);
    lb = ub;
    ub *= 2;
   }
   while(!(ak.diff(sr0, sr1)<threshold) && isFinite(ub));

   lb = 0;
   ub = k<=2 ? 1 : Math.sqrt(k-1);
   do {
    si0 = si1;
    si1 = si0 + im(lb, ub);
    lb = ub;
    ub *= 2;
   }
   while(!(ak.diff(si0, si1)<threshold) && isFinite(ub));

   return ak.complex(sr1, si1);
  }

  ak.chiCF = function(k, threshold, steps) {
   var f;

   if(k!==ak.floor(k) || k<1) throw new Error('invalid degrees of freedom in ak.chiCF');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 1/3) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('non-numeric threshold passed to ak.chiCF');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 18 : ak.floor(Math.abs(steps));
   if(isNaN(steps)) throw new Error('non-numeric steps passed to ak.chiCF');

   f = function(t){return cf(k, t, threshold, steps);};
   f.k = function(){return k;};
   return Object.freeze(f);
  };

  ak.chiCDF = function(k) {
   var f, cdf;

   if(k!==ak.floor(k) || k<1) throw new Error('invalid degrees of freedom in ak.chiCDF');
   cdf = ak.gammaCDF(k/2, 0.5);

   f = function(x){return x<=0 ? 0 : cdf(x*x)};
   f.k = function(){return k;};
   return Object.freeze(f);
  };

  ak.chiInvCDF = function(k, eps) {
   var f, inv;

   if(k!==ak.floor(k) || k<1) throw new Error('invalid degrees of freedom in ak.chiInvCDF');
   inv = ak.gammaInvCDF(k/2, 0.5, eps);

   f = function(c){return Math.sqrt(inv(c));};
   f.k = function(){return k;};
   return Object.freeze(f);
  };

  ak.chiRnd = function(k, rnd) {
   var f;

   if(k!==ak.floor(k) || k<1) throw new Error('invalid degrees of freedom in ak.chiRnd');
   rnd = ak.gammaRnd(k/2, 0.5, rnd);

   f = function(){return Math.sqrt(rnd());};
   f.k = function(){return k;};
   f.rnd = function(){return rnd.rnd();};
   return Object.freeze(f);
  };
 }

 ak.using(['Distribution/GammaDistribution.js', 'Calculus/RombergIntegral.js'], define);
})();
