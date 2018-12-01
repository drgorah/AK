//AK/Distribution/CopulaDistribution.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.copulaCDF) return;

  ak.copulaCDF = function(copula, cdfs) {
   var f, n, i;

   if(ak.nativeType(copula)!==ak.FUNCTION_T) throw new Error('invalid copula in ak.copulaCDF');
   if(ak.nativeType(cdfs)!==ak.ARRAY_T) throw new Error('invalid marginal CDFs in ak.copulaCDF');

   n = cdfs.length;

   for(i=0;i<n;++i) {
    if(ak.nativeType(cdfs[i])!==ak.FUNCTION_T) throw new Error('invalid marginal CDF in ak.copulaCDF');
   }

   f = function(x) {
    if(ak.type(x)!==ak.VECTOR_T || x.dims()!==n) throw new Error('invalid argument in ak.copulaCDF');

    x = x.toArray();
    for(i=0;i<n;++i) x[i] = cdfs[i](x[i]);
    return copula(ak.vector(x));
   };
   f.copula = function(){return copula;};
   f.marginalCDFs = function(){return cdfs.slice(0);};

   return Object.freeze(f);
  };

  ak.copulaPDF = function(density, cdfs, pdfs) {
   var f, n, i;

   if(ak.nativeType(density)!==ak.FUNCTION_T) throw new Error('invalid copula in ak.copulaPDF');
   if(ak.nativeType(cdfs)!==ak.ARRAY_T) throw new Error('invalid marginal CDFs in ak.copulaPDF');
   if(ak.nativeType(pdfs)!==ak.ARRAY_T || pdfs.length!==cdfs.length) throw new Error('invalid marginal PDFs in ak.copulaPDF');

   n = cdfs.length;

   for(i=0;i<n;++i) {
    if(ak.nativeType(cdfs[i])!==ak.FUNCTION_T) throw new Error('invalid marginal CDF in ak.copulaPDF');
    if(ak.nativeType(pdfs[i])!==ak.FUNCTION_T) throw new Error('invalid marginal PDF in ak.copulaPDF');
   }

   f = function(x) {
    var px = 1;

    if(ak.type(x)!==ak.VECTOR_T || x.dims()!==n) throw new Error('invalid argument in ak.copulaPDF');

    x = x.toArray();
    for(i=0;i<n;++i) {
     px *= pdfs[i](x[i]);
     x[i] = cdfs[i](x[i]);
    }
    return px===0 ? 0 : px * density(ak.vector(x));
   };
   f.copulaDensity = function(){return density;};
   f.marginalCDFs = function(){return cdfs.slice(0);};
   f.marginalPDFs = function(){return pdfs.slice(0);};

   return Object.freeze(f);
  };

  ak.copulaRnd = function(copulaRnd, invs) {
   var f, n, i;

   if(ak.nativeType(copulaRnd)!==ak.FUNCTION_T) throw new Error('invalid copula random variable in ak.copulaRnd');
   if(ak.nativeType(invs)!==ak.ARRAY_T) throw new Error('invalid marginal inverse CDFs in ak.copulaRnd');

   n = invs.length;

   for(i=0;i<n;++i) {
    if(ak.nativeType(invs[i])!==ak.FUNCTION_T) throw new Error('invalid marginal inverse CDF in ak.copulaRnd');
   }

   f = function() {
    var x = copulaRnd();
    if(ak.type(x)!==ak.VECTOR_T || x.dims()!==n) throw new Error('invalid copula random variable in ak.copulaRnd');

    x = x.toArray();
    for(i=0;i<n;++i) x[i] = invs[i](x[i]);
    return ak.vector(x);
   };
   f.copulaRnd = function(){return copulaRnd;};
   f.marginalInvCDFs = function(){return invs.slice(0);};

   return Object.freeze(f);
  };
 }
 ak.using('Matrix/Vector.js', define);
})();

