//AK/Optimise/BiasedSampler.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.biasedSampler) return;

  function utility(y, dx, w, d, samples, distances) {
   var n = samples.length;
   var ny = 0;
   var nd = 0;
   var i, py, pd;

   for(i=0;i<n;++i) {
    if(samples[i].y>y) ++ny;
    if(distances[i]<dx) ++nd;
   }
   py = ny/n;
   pd = nd/n;

   return Math.pow((1-w)*py + w*pd, d);
  }

  function uniSample(lb, ub, halton) {
   return lb+(ub-lb)*halton();
  }

  function uniDistances(samples) {
   var n = samples.length;
   var distances = new Array(n);
   var i, dl, dr;

   dr = Math.abs(samples[0].x - samples[1].x);
   distances[0] = dr;
   for(i=1;i<n-1;++i) {
    dl = dr;
    dr = Math.abs(samples[i].x - samples[i+1].x);
    distances[i] = Math.min(dl, dr);
   }
   dl = dr;
   distances[n-1] = dl;
   return distances;
  }

  function uniAdd(f, x, dx, samples, distances) {
   var n = samples.length;
   var y = f(x);
   var i;

   if(isNaN(y)) y = ak.INFINITY;

   i = ak._unsafeLowerBound(samples, x, function(x0, x1) {return x0.x-x1;}, 0, n);
   samples.splice(i, 0, {x:x, y:y});
   distances.splice(i, 0, dx);

   if(i>0) {
    distances[i-1] = Math.min(distances[i-1], Math.abs(samples[i-1].x - x));
   }
   if(i<n) {
    distances[i+1] = Math.min(distances[i+1], Math.abs(samples[i+1].x - x));
   }
  }

  function uniSamples(f, lb, ub, k, w, d, steps, rnd) {
   var samples = [];
   var i, j, halton, x, y, neighbours, distances, dx;

   if(!isFinite(lb) || ak.nativeType(ub)!==ak.NUMBER_T || !isFinite(ub)) throw new Error('invalid bound in ak.biasedSampler');

   halton = ak.haltonRnd(2, rnd);

   for(i=0;i<=k;++i) {
    x = uniSample(lb, ub, halton);
    y = f(x);
    if(isNaN(y)) y = ak.INFINITY;
    samples.push({x:x, y:y});
   }
   samples.sort(function(x0, x1){return x0.x-x1.x;});
   neighbours = new Array(k);
   distances = uniDistances(samples);

   for(i=k+1;i<steps;++i) {
    x = uniSample(lb, ub, halton);
    y = ak._unsafeUniMedianSmooth(x, samples, neighbours);
    dx = ak.INFINITY;
    for(j=0;j<k;++j) dx = Math.min(dx, Math.abs(neighbours[j].x - x));
    if(rnd()<utility(y, dx, w, d, samples, distances)) uniAdd(f, x, dx, samples, distances);
   }
   return samples;
  }

  function multiSample(lb, ub, halton) {
   var n = lb.length;
   var x = halton();
   var j;
   for(j=0;j<n;++j) x[j] = lb[j]+(ub[j]-lb[j])*x[j];
   return ak.vector(x);
  }

  function multiDistances(samples) {
   var n = samples.length;
   var distances = new Array(n);
   var i, j, d;

   for(i=0;i<n;++i) {
    d = ak.INFINITY;
    for(j=0;j<n;++j) if(j!==i) d = Math.min(d, ak.dist(samples[i].x, samples[j].x));
    distances[i] = d;
   }
   return distances;
  }

  function multiAdd(f, x, dx, samples, distances) {
   var n = samples.length;
   var y = f(x);
   var i;

   if(isNaN(y)) y = ak.INFINITY;

   for(i=0;i<n;++i) {
    distances[i] = Math.min(distances[i], ak.dist(samples[i].x, x));
   }
   samples.push({x:x, y:y});
   distances.push(dx);
  }

  function multiSamples(f, lb, ub, k, w, d, steps, rnd) {
   var samples = [];
   var n = lb.dims();
   var bases, i, j, halton, x, y, distances, neighbours, dx;

   if(n===0 || ak.type(ub)!==ak.VECTOR_T || ub.dims()!==n) throw new Error('invalid bound in ak.biasedSampler');

   lb = lb.toArray();
   ub = ub.toArray();
   bases = new Array(n);
   for(i=0;i<n;++i) {
    if(!isFinite(lb[i]) || !isFinite(ub[i])) throw new Error('invalid bound in ak.biasedSampler');
    bases[i] = ak.primeSequence(i);
   }
   halton = ak.haltonRnd(bases, rnd);

   for(i=0;i<=k;++i) {
    x = multiSample(lb, ub, halton);
    y = f(x);
    if(isNaN(y)) y = ak.INFINITY;
    samples.push({x:x, y:y});
   }
   distances = multiDistances(samples);

   neighbours = new Array(k);
   for(i=k+1;i<steps;++i) {
    x = multiSample(lb, ub, halton);
    y = ak._unsafeMultiMedianSmooth(x, samples, neighbours);
    dx = ak.INFINITY;
    for(j=0;j<k;++j) dx = Math.min(dx, ak.dist(neighbours[j].x, x));
    if(rnd()<utility(y, dx, w, d, samples, distances)) multiAdd(f, x, dx, samples, distances);
   }
   return samples;
  }

  ak.biasedSampler = function(f, steps, rnd) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.biasedSampler');
   if(ak.nativeType(steps)!==ak.NUMBER_T || steps<=0 || steps!==ak.floor(steps)) throw new Error('invalid number of steps in ak.biasedSampler');

   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.biasedSampler');

   return function(lb, ub, k, w, d) {
    var samples;
    if(ak.nativeType(k)!==ak.NUMBER_T || k<1 || k!==ak.floor(k)) throw new Error('invalid neighbourhood in ak.biasedSampler');
    if(ak.nativeType(w)!==ak.NUMBER_T || !(w>=0 && w<=1)) throw new Error('invalid exploration weight in ak.biasedSampler');

    if(ak.nativeType(d)===ak.UNDEFINED_T) d = 1.0;
    else if(ak.nativeType(d)!==ak.NUMBER_T || !(d>0.0)) throw new Error('invalid discrimination factor in ak.biasedSampler');

    if(ak.nativeType(lb)===ak.NUMBER_T) samples = uniSamples(f, lb, ub, k, w, d, steps, rnd);
    else if(ak.type(lb)===ak.VECTOR_T)  samples = multiSamples(f, lb, ub, k, w, d, steps, rnd);
    else throw new Error('invalid bound in ak.biasedSampler');

    return samples;
   };
  };
 }

 ak.using(['Approx/MedianSmooth.js', 'Matrix/Vector.js', 'Sequence/PrimeSequence.js', 'Random/HaltonRnd.js', 'Optimise/Cluster.js', 'Algorithm/LowerBound.js'], define);
})();