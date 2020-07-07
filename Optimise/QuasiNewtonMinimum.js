//AK/Optimise/QuasiNewtonMinimum.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.quasiNewtonMinimum) return;

  function update(h, dx, y) {
   var n = dx.dims();
   var h1 = h.toArray();
   var dxy = ak.mul(dx, y);
   var yhy = 0;
   var i, j, k, yi, h1i, c, dxi, cdxi, dxj, hydx;

   for(i=0;i<n;++i) {
    yi = y.at(i);
    h1i = h1[i];
    for(j=0;j<n;++j) yhy += yi*h1i[j]*y.at(j);
   }
   c = (dxy+yhy)/(dxy*dxy);

   for(i=0;i<n;++i) {
    dxi = dx.at(i);
    cdxi = c*dxi;
    h1i = h1[i];

    for(j=0;j<i;++j) h1[j][i] = h1i[j] += cdxi*dx.at(j);
    h1i[i] += cdxi*dxi;

    for(j=0;j<n;++j) {
     dxj = dx.at(j);

     hydx = 0;
     for(k=0;k<n;++k) hydx += h.at(i,k)*y.at(k)*dxj;
     hydx /= dxy;

     h1i[j]   -= hydx;
     h1[j][i] -= hydx;
    }
   }
   return ak.matrix(h1);
  }

  function minimum(f, df, x, wolfe, threshold, steps) {
   var fx, dfx, adx, adfx, eps, h, y, dx, adx, adfx, eps, stop;

   if(ak.type(x)!==ak.VECTOR_T || x.dims()===0) throw new Error('invalid starting point in ak.quasiNewtonMinimum');

   fx = f(x);
   dfx = df(x);
   adfx = ak.abs(dfx);
   eps = threshold*(1+ak.abs(x));
   if(isNaN(fx) || !(adfx>eps)) return !isNaN(fx) && !isNaN(adfx) ? x : ak.vector(x.dims(), ak.NaN);

   h = ak.matrix('identity', x.dims());

   do {
    y = wolfe(x, ak.mul(h, dfx), fx, dfx);
    dx = ak.sub(y.x, x);
    x = y.x;
    fx = y.fx;

    adx = ak.abs(dx);
    adfx = ak.abs(y.dfx);
    eps = threshold*(1+ak.abs(x));
    stop = isNaN(fx) || !(adx>eps && adfx>eps);
    if(!stop) {
     if(--steps===0) throw new Error('failure to converge in ak.quasiNewtonMinimum');
     h = update(h, dx, ak.sub(y.dfx, dfx));
     dfx = y.dfx;
    }
   }
   while(!stop);

   return !isNaN(fx) && !isNaN(adx) && !isNaN(adfx) ? x : ak.vector(x.dims(), ak.NaN);
  }

  ak.quasiNewtonMinimum = function(f, df, c1, c2, threshold, steps) {
   var wolfe;

   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.quasiNewtonMinimum');
   if(ak.nativeType(df)!==ak.FUNCTION_T) throw new Error('invalid derivative in ak.quasiNewtonMinimum');

   c1 = ak.nativeType(c1)===ak.UNDEFINED_T ? 1.0e-4 : Number(c1);
   if(!(c1>0 && c1<1)) throw new Error('invalid armijo constant in ak.quasiNewtonMinimum');

   c2 = ak.nativeType(c2)===ak.UNDEFINED_T ? 0.9 : Number(c2);
   if(!(c2>c1 && c2<1)) throw new Error('invalid curvature constant in ak.quasiNewtonMinimum');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 0.75) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('invalid convergence threshold in ak.quasiNewtonMinimum');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 1000 : ak.floor(steps);
   if(!(steps>0)) throw new Error('invalid steps in ak.quasiNewtonMinimum');

   wolfe = ak.wolfeLineSearch(f, df, c1, c2, steps);
   return function(x) {return minimum(f, df, x, wolfe, threshold, steps);};
  };
 }

 ak.using(['Optimise/WolfeLineSearch.js', 'Matrix/Matrix.js'], define);
})();