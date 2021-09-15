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
   var n, dims, marginals, i, j, x;

   if(ak.nativeType(samples)!==ak.ARRAY_T) throw new Error('invalid samples in ak.sampleMarginals');

   n = samples.length;
   if(n===0) throw new Error('empty samples in ak.sampleMarginals');

   if(ak.type(samples[0])!==ak.VECTOR_T) throw new Error('invalid sample in ak.sampleMarginals');

   dims = samples[0].dims();
   if(dims===0) throw new Error('empty sample in ak.sampleMarginals');

   marginals = new Array(dims);
   for(j=0;j<dims;++j) {
    marginals[j] = new Array(n);
    x = samples[0].at(j);
    if(isNaN(x)) throw new Error('NaN sample element in ak.sampleMarginals');
    marginals[j][0] = x;
   }

   for(i=1;i<n;++i) {
    if(ak.type(samples[i])!==ak.VECTOR_T) throw new Error('invalid sample in ak.sampleMarginals'); 

    dims = samples[i].dims();
    if(dims===0) throw new Error('empty sample in ak.sampleMarginals');
    if(dims!==marginals.length) throw new Error('sample dimnension mismatch in ak.sampleMarginals'); 

    for(j=0;j<dims;++j) {
     x = samples[i].at(j);
     if(isNaN(x)) throw new Error('NaN sample element in ak.sampleMarginals');
     marginals[j][i] = x;
    }
   }
   for(j=0;j<dims;++j) marginals[j].sort(ak.numberCompare);

   return marginals;
  };
 }

 ak.using(['Matrix/Vector.js', 'Algorithm/Compare.js'], define);
})();