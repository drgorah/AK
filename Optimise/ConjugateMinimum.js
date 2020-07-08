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
   var n, fx, dfx, adx, adfx, eps, h, y, dx, adx, adfx, eps, r0, r1, v, d, b, stop;

   if(ak.type(x)!==ak.VECTOR_T || x.dims()===0) throw new Error('invalid starting point in ak.conjugateMinimum');

   n = x.dims();
   fx = f(x);
   dfx = df(x);
   adfx = ak.abs(dfx);
   eps = threshold*(1+ak.abs(x));
   if(isNaN(fx) || !(adfx>eps)) return !isNaN(fx) && !isNaN(adfx) ? x : ak.vector(n, ak.NaN);

   r0 = ak.neg(dfx);
   v = r0;
   d = x.dims();

   do {
    y = wolfe(x, v, fx, dfx);
    dx = ak.sub(y.x, x);
    x = y.x;
    fx = y.fx;

    adx = ak.abs(dx);
    adfx = ak.abs(y.dfx);
    eps = threshold*(1+ak.abs(y.x));
    stop = isNaN(fx) || !(adx>eps && adfx>eps);
    if(!stop) {
     if(--steps===0) throw new Error('failure to converge in ak.conjugateMinimum');
     r1 = ak.neg(y.dfx);
     d = (d+1)%n;
     b = d!==0 ? Math.max(0, (ak.mul(r1, r1)-ak.mul(r1, r0))/ak.mul(r0, r0)) : 0;
     v = b!==0 ? ak.add(r1, ak.mul(b, v)) : r1;
     dfx = y.dfx;
     r0 = r1;
     if(b===0) d = 0;
    }
   }
   while(!stop);

   return !isNaN(fx) && !isNaN(adx) && !isNaN(adfx) ? x : ak.vector(n, ak.NaN);
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

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 10000 : ak.floor(steps);
   if(!(steps>0)) throw new Error('invalid steps in ak.conjugateMinimum');

   wolfe = ak.wolfeLineSearch(f, df, c1, c2, steps);
   return function(x) {return minimum(f, df, x, wolfe, threshold, steps);};
  };
 }

 ak.using(['Optimise/WolfeLineSearch.js'], define);
})();