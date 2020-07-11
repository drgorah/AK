//AK/Distribution/MixtureDistribution.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.mixturePDF) return;

  function pdf(pdfs, weights, sum, x) {
   var n = pdfs.length;
   var p = 0;
   var i;

   for(i=0;i<n;++i) p += weights[i] * pdfs[i](x);
   return Math.max(p/sum, 0);
  }

  ak.mixturePDF = function(pdfs, weights) {
   var state = constructor(pdfs, weights);
   var f = function(x) {return pdf(state.dists, state.weights, state.sum, x);};
   f.pdfs = function() {return state.dists.slice(0);};
   f.weights = function() {return state.weights.slice(0);};
   return Object.freeze(f);
  };

  function pmf(pmfs, weights, sum, k) {
   var n = pmfs.length;
   var p = 0;
   var i;

   if(k!==ak.floor(k)) return isNaN(k) ? ak.NaN : 0;
   for(i=0;i<n;++i) p += weights[i] * pmfs[i](k);
   return Math.max(p/sum, 0);
  }

  ak.mixturePMF = function(pmfs, weights) {
   var state = constructor(pmfs, weights);
   var f = function(k) {return pmf(state.dists, state.weights, state.sum, k);};
   f.pmfs = function() {return state.dists.slice(0);};
   f.weights = function() {return state.weights.slice(0);};
   return Object.freeze(f);
  };

  function cf(cfs, weights, sum, t) {
   var n = cfs.length;
   var z = ak.complex(0);
   var i;

   for(i=0;i<n;++i) z = ak.add(z, ak.mul(weights[i], cfs[i](t)));
   return ak.div(z, sum);
  }

  ak.mixtureCF = function(cfs, weights) {
   var state = constructor(cfs, weights);
   var f = function(x) {return cf(state.dists, state.weights, state.sum, x);};
   f.cfs = function() {return state.dists.slice(0);};
   f.weights = function() {return state.weights.slice(0);};
   return Object.freeze(f);
  };

  function cdf(cdfs, weights, sum, x) {
   var n = cdfs.length;
   var c = 0;
   var i;

   for(i=0;i<n;++i) c += weights[i] * cdfs[i](x);
   return Math.min(Math.max(c/sum, 0), 1);
  }

  ak.mixtureCDF = function(cdfs, weights) {
   var state = constructor(cdfs, weights);
   var f = function(x) {return cdf(state.dists, state.weights, state.sum, x);};
   f.cdfs = function() {return state.dists.slice(0);};
   f.weights = function() {return state.weights.slice(0);};
   return Object.freeze(f);
  };

  function compCDF(compCDFs, weights, sum, x) {
   var n = compCDFs.length;
   var c = 0;
   var i;

   for(i=0;i<n;++i) c += weights[i] * compCDFs[i](x);
   return Math.min(Math.max(c/sum, 0), 1);
  }

  ak.mixtureCompCDF = function(compCDFs, weights) {
   var state = constructor(compCDFs, weights);
   var f = function(x) {return compCDF(state.dists, state.weights, state.sum, x);};
   f.compCDFs = function() {return state.dists.slice(0);};
   f.weights = function() {return state.weights.slice(0);};
   return Object.freeze(f);
  };

  ak.mixtureInvCDF = function(cdfs, weights, threshold) {
   var cdf = ak.mixtureCDF(cdfs, weights);
   var f = ak.secantInverse(cdf, threshold);
   f.cdfs = cdf.cdfs;
   f.weights = cdf.weights;
   return Object.freeze(f);
  };

  function map(maps, weights, sum, u, v) {
   var n = maps.length-1;
   var i = 0;

   u *= sum;
   while(u>=weights[i] && i<n) u -= weights[i++];
   return maps[i](v);
  }

  ak.mixtureMap = function(maps, weights) {
   var state = constructor(maps, weights);
   var f = function(u, v) {return map(state.dists, state.weights, state.sum, u, v);};
   f.maps = function() {return state.dists.slice(0);};
   f.weights = function() {return state.weights.slice(0);};
   return Object.freeze(f);
  };

  function draw(rnds, weights, sum, rnd) {
   var n = rnds.length-1;
   var u = rnd()*sum;
   var i = 0;

   while(u>=weights[i] && i<n) u -= weights[i++];
   return rnds[i]();
  }

  ak.mixtureRnd = function(rnds, weights, rnd) {
   var state = constructor(rnds, weights);
   var t = ak.nativeType(rnd);
   var f;

   if(t===ak.UNDEFINED_T) rnd = Math.random;
   else if(t!==ak.FUNCTION_T) throw new Error('invalid rnd in ak.mixtureRnd');

   f = function(x) {return draw(state.dists, state.weights, state.sum, rnd);};
   f.rnds = function() {return state.dists.slice(0);};
   f.weights = function() {return state.weights.slice(0);};
   f.rnd = function() {return rnd;};
   return Object.freeze(f);
  };

  function constructor(dists, weights) {
   var sum = 0;
   var n, i;
   if(ak.nativeType(dists)!==ak.ARRAY_T) throw new Error('invalid distributions in ak.mixture distribution');
   if(ak.nativeType(weights)!==ak.ARRAY_T) throw new Error('invalid weights in ak.mixture distribution');

   n = dists.length;
   if(n===0) throw new Error('no distributions in ak.mixture distribution');
   if(weights.length!==n) throw new Error('size mismatch ak.mixture distribution');

   for(i=0;i<n;++i) {
    if(ak.nativeType(dists[i])!==ak.FUNCTION_T) throw new Error('invalid distribution in ak.mixture distribution');
    if(!(weights[i]>0)) throw new Error('invalid weight in ak.mixture distribution');
    sum += weights[i];
   }
   if(!isFinite(sum)) throw new Error('non-finite weights in ak.mixture distribution');
   return {
    dists: dists.slice(0),
    weights: weights.slice(0),
    sum: sum
   };
  }
 }

 ak.using(['Complex/Complex.js', 'Invert/SecantInverse.js'], define);
})();
