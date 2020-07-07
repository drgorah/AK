//AK/Optimise/ConjugateMinimum.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.conjugateMinimum) return;

  function minimum(f, df, x, wolfe, threshold, steps) {
   var fx, dfx, adx, adfx, eps, h, y, dx, adx, adfx, eps, stop;

   if(ak.type(x)!==ak.VECTOR_T || x.dims()===0) throw new Error('invalid starting point in ak.conjugateMinimum');

   fx = f(x);
   dfx = df(x);
   adfx = ak.abs(dfx);
   eps = threshold*(1+ak.abs(x));
   if(isNaN(fx) || !(adfx>eps)) return !isNaN(fx) && !isNaN(adfx) ? x : ak.vector(x.dims(), ak.NaN);

   h = ak.matrix('identity', x.dims());!!

   do {
    y = wolfe(x, ak.mul(h, dfx), fx, dfx);!!
    dx = ak.sub(y.x, x);
    x = y.x;
    fx = y.fx;

    adx = ak.abs(dx);
    adfx = ak.abs(y.dfx);
    eps = threshold*(1+ak.abs(x));
    stop = isNaN(fx) || !(adx>eps && adfx>eps);
    if(!stop) {
     if(--steps===0) throw new Error('failure to converge in ak.conjugateMinimum');
     h = update(h, dx, ak.sub(y.dfx, dfx));!!
     dfx = y.dfx;
    }
   }
   while(!stop);

   return !isNaN(fx) && !isNaN(adx) && !isNaN(adfx) ? x : ak.vector(x.dims(), ak.NaN);
  }

  ak.conjugateMinimum = function(f, df, c1, c2, threshold, steps) {
   var wolfe;

   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.conjugateMinimum');
   if(ak.nativeType(df)!==ak.FUNCTION_T) throw new Error('invalid derivative in ak.conjugateMinimum');

   c1 = ak.nativeType(c1)===ak.UNDEFINED_T ? 1.0e-4 : Number(c1);
   if(!(c1>0 && c1<1)) throw new Error('invalid armijo constant in ak.conjugateMinimum');

   c2 = ak.nativeType(c2)===ak.UNDEFINED_T ? 0.1 : Number(c2);
   if(!(c2>c1 && c2<1)) throw new Error('invalid curvature constant in ak.conjugateMinimum');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 0.75) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('invalid convergence threshold in ak.conjugateMinimum');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 1000 : ak.floor(steps);
   if(!(steps>0)) throw new Error('invalid steps in ak.conjugateMinimum');

   wolfe = ak.wolfeLineSearch(f, df, c1, c2, steps);
   return function(x) {return minimum(f, df, x, wolfe, threshold, steps);};
  };
 }

 ak.using(['Optimise/WolfeLineSearch.js'], define);
})();