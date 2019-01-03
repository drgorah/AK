//AK/Copula/GaussianCopula.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.gaussianCopula) return;

  function toRho(sigma) {
   var n = sigma.length;
   var r = new Array(n);
   var i, j;

   for(i=0;i<n;++i) {
    r[i] = new Array(n);
    r[i][i] = Math.sqrt(sigma[i][i]);
   }
   for(i=0;i<n;++i) {
    for(j=i+1;j<n;++j) r[i][j] = r[j][i] = sigma[i][j]/(r[i][i] * r[j][j]);
    r[i][i] = 1;
   }
   return r;
  }

  ak.gaussianCopula = function() {
   var cdf = ak.multiNormalCDF.apply(ak, arguments);
   var inv = ak.normalInvCDF();
   var mu = cdf.mu().toArray();
   var sigma = cdf.sigma().toArray();
   var rho = toRho(sigma);
   var n = mu.length;
   var i, f;

   for(i=0;i<n;++i) sigma[i] = Math.sqrt(sigma[i][i]);

   f = function(u) {
    if(ak.type(u)!==ak.VECTOR_T || u.dims()!==n) throw new Error('invalid argument in ak.gaussianCopula');

    u = u.toArray();
    for(i=0;i<n;++i) u[i] = mu[i] + sigma[i]*inv(u[i]);
    return cdf(ak.vector(u));
   };
   f.rho = function() {return ak.matrix(rho);};

   return Object.freeze(f);
  };

  ak.gaussianCopulaDensity = function() {
   var mpdf = ak.multiNormalPDF.apply(ak, arguments);
   var pdf = ak.normalPDF();
   var inv = ak.normalInvCDF();
   var mu = mpdf.mu().toArray();
   var sigma = mpdf.sigma().toArray();
   var rho = toRho(sigma);
   var sn = 1;
   var n = mu.length;
   var i, f;

   for(i=0;i<n;++i) {
    sigma[i] = Math.sqrt(sigma[i][i]);
    sn *= sigma[i];
   }

   f = function(u) {
    var den = 1;
    var z;

    if(ak.type(u)!==ak.VECTOR_T || u.dims()!==n) throw new Error('invalid argument in ak.gaussianCopulaDensity');

    u = u.toArray();
    for(i=0;i<n;++i) {
     z = inv(u[i]);
     den *= pdf(z);
     u[i] = mu[i] + sigma[i]*z;
    }
    return den===0 ? 0 : sn*mpdf(ak.vector(u))/den;
   };
   f.rho = function() {return ak.matrix(rho);};

   return Object.freeze(f);
  };

  ak.gaussianCopulaRnd = function() {
   var rnd = ak.multiNormalRnd.apply(ak, arguments);
   var cdf = ak.normalCDF();
   var mu = rnd.mu().toArray();
   var sigma = rnd.sigma().toArray();
   var rho = toRho(sigma);
   var n = mu.length;
   var i, f;

   for(i=0;i<n;++i) sigma[i] = 1/Math.sqrt(sigma[i][i]);

   f = function() {
    var z = rnd().toArray();
    for(i=0;i<n;++i) z[i] = cdf((z[i]-mu[i])*sigma[i]);
    return ak.vector(z);
   };
   f.rho = function() {return ak.matrix(rho);};
   f.rnd = rnd.rnd;

   return Object.freeze(f);
  };
 }

 ak.using('Distribution/MultiNormalDistribution.js', define);
})();
