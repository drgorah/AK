//AK/Distribution/ChiSquaredDistribution.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.chiSquaredPDF) return;

  ak.chiSquaredPDF = function(k) {
   var f, pdf;

   if(k!==ak.floor(k) || k<1) throw new Error('invalid degrees of freedom in ak.chiSquaredPDF');
   pdf = ak.gammaPDF(k/2, 0.5);

   f = function(x){return pdf(x);};
   f.k = function(){return k;};
   return Object.freeze(f);
  };

  ak.chiSquaredCF = function(k) {
   var f, cf;

   if(k!==ak.floor(k) || k<1) throw new Error('invalid degrees of freedom in ak.chiSquaredCF');
   cf = ak.gammaCF(k/2, 0.5);

   f = function(t){return cf(t);};
   f.k = function(){return k;};
   return Object.freeze(f);
  };

  ak.chiSquaredCDF = function(k) {
   var f, cdf;

   if(k!==ak.floor(k) || k<1) throw new Error('invalid degrees of freedom in ak.chiSquaredCDF');
   cdf = ak.gammaCDF(k/2, 0.5);

   f = function(x){return cdf(x);};
   f.k = function(){return k;};
   return Object.freeze(f);
  };

  ak.chiSquaredInvCDF = function(k, eps) {
   var f, inv;

   if(k!==ak.floor(k) || k<1) throw new Error('invalid degrees of freedom in ak.chiSquaredInvCDF');
   inv = ak.gammaInvCDF(k/2, 0.5, eps);

   f = function(c){return inv(c);};
   f.k = function(){return k;};
   return Object.freeze(f);
  };

  ak.chiSquaredRnd = function(k, rnd) {
   var f;

   if(k!==ak.floor(k) || k<1) throw new Error('invalid degrees of freedom in ak.chiSquaredRnd');
   rnd = ak.gammaRnd(k/2, 0.5, rnd);

   f = function(){return rnd();};
   f.k = function(){return k;};
   f.rnd = function(){return rnd.rnd();};
   return Object.freeze(f);
  };
 }

 ak.using('Distribution/GammaDistribution.js', define);
})();
