//AK/Copula/SampleMarginals.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.sampleMarginals) return;

  ak.sampleMarginals = function(samples) {
   var n, dims, marginal, marginals, i, j, x;

   if(ak.nativeType(samples)!==ak.ARRAY_T) throw new Error('invalid samples in ak.sampleMarginals');
   n = samples.length;
   if(n===0) throw new Error('empty samples in ak.sampleMarginals');

   if(ak.type(samples[0])!==ak.VECTOR_T) throw new Error('invalid sample in ak.sampleMarginals');
   dims = samples[0].dims();
   if(dims===0) throw new Error('empty sample in ak.sampleMarginals');
   for(i=1;i<n;++i) {
    if(ak.type(samples[i])!==ak.VECTOR_T) throw new Error('invalid sample in ak.sampleMarginals');
    if(samples[i].dims()!==dims) throw new Error('sample dimension mismatch in ak.sampleMarginals'); 
   }

   marginal = new Array(n);
   marginals = new Array(dims);
   for(i=0;i<dims;++i) {
    for(j=0;j<n;++j) {
     x = samples[j].at(i);
     if(isNaN(x)) throw new Error('NaN sample element in ak.sampleMarginals');
     marginal[j]= x;
    }
    marginal.sort(ak.numberCompare);
    marginals[i] = ak.vector(marginal);
   }
   return Object.freeze(marginals);
  };
 }

 ak.using(['Matrix/Vector.js', 'Algorithm/Compare.js'], define);
})();