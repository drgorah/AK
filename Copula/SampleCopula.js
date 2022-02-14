//AK/Copula/SampleCopula.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.sampleCopula) return;

  ak.sampleCopula = function(samples) {
   var marginals = ak.sampleMarginals(samples);
   var n = samples.length;
   var m = marginals.length;
   var f;

   samples = samples.slice(0);

   f = function(u) {
    var count = 0;
    var i, j;

    if(ak.type(u)!==ak.VECTOR_T || u.dims()!==m) throw new Error('invalid argument in ak.sampleCopula');
    u = u.toArray();

    for(j=0;j<m;++j) {
     if(!(u[j]>0)) return 0;
     i = ak.floor(u[j]*n);
     u[j] = i<n ? marginals[j].at(i) : marginals[j].at(n-1);
    }

    for(i=0;i<n;++i) {
     for(j=0;j<m && samples[i].at(j)<=u[j];++j);
     if(j===m) ++count;
    }
    return count/n;
   };
   f.samples = function() {return samples.slice(0);};

   return Object.freeze(f);
  };

  ak.sampleCopulaRnd = function(samples, rnd) {
   var marginals, n, m, i, f;

   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid rnd in ak.sampleCopulaRnd');

   marginals = ak.sampleMarginals(samples).slice(0);
   samples = samples.slice(0);
   n = samples.length;
   m = marginals.length;
   for(i=0;i<m;++i) marginals[i] = marginals[i].toArray();

   f = function() {
    var u = samples[ak.floor(rnd()*n)].toArray();
    var j;

    for(j=0;j<m;++j) u[j] = ak._unsafeUpperBound(marginals[j], u[j], ak.numberCompare, 0, n) / n;
    return ak.vector(u);
   };
   f.samples = function() {return samples.slice(0);};
   f.rnd = function() {return rnd;};

   return Object.freeze(f);
  };
 }

 ak.using(['Copula/SampleMarginals.js', 'Algorithm/UpperBound.js'], define);
})();
