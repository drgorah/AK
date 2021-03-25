//AK/Optimise/NoisyAnnealMinimum.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.noisyAnnealMinimum) return;

  function uniMinimum(f, x0, t, d, r, steps, rnd) {
   var step = 0;
   var x1, f0, f1;

   if(ak.nativeType(x0)!==ak.NUMBER_T || !isFinite(x0)) throw new Error('invalid argument in ak.noisyAnnealMinimum');
   if(ak.nativeType(d)!==ak.NUMBER_T || !isFinite(d))  throw new Error('invalid delta in ak.noisyAnnealMinimum');

   while(step++<steps) {
    x1 = x0 + d*(2*rnd()-1);
    if(isNaN(f0 = f(x0))) f0 = ak.INFINITY;
    if(isNaN(f1 = f(x1))) f1 = ak.INFINITY;

    if(f1<=f0 || rnd()<Math.exp((f0-f1)/t)) x0 = x1;
    t *= r;
   }
   return !isNaN(f(x0)) ? x0 : ak.NaN;
  }

  function multiMinimum(f, x0, t, d, r, steps, rnd) {
   var step = 0;
   var n, i, x1, a0, a1, f0, f1;

   if(ak.type(x0)!==ak.VECTOR_T || x0.dims()===0) throw new Error('invalid argument in ak.noisyAnnealMinimum');

   n = x0.dims();
   for(i=0;i<n && isFinite(x0.at(i));++i);
   if(i<n) throw new Error('invalid argument in ak.noisyAnnealMinimum');

   if(ak.nativeType(d)===ak.NUMBER_T) d = ak.vector(n, d);
   else if(ak.type(d)!==ak.VECTOR_T || d.dims()!==n) throw new Error('invalid delta in ak.noisyAnnealMinimum');

   for(i=0;i<n && isFinite(d.at(i));++i);
   if(i<n) throw new Error('invalid delta in ak.noisyAnnealMinimum');

   d = d.toArray();
   a0 = x0.toArray();
   a1 = new Array(n);

   while(step++<steps) {
    for(i=0;i<n;++i) a1[i] = a0[i] + d[i]*(2*rnd()-1);
    x1 = ak.vector(a1);

    if(isNaN(f0 = f(x0))) f0 = ak.INFINITY;
    if(isNaN(f1 = f(x1))) f1 = ak.INFINITY;

    if(f1<=f0 || rnd()<Math.exp((f0-f1)/t)) {
     x0 = x1;
     a0 = x0.toArray();
    }
    t *= r;
   }
   return !isNaN(f(x0)) ? x0 : ak.vector(n, ak.NaN);
  }

  function minimum(f, x, t, d, r, steps, rnd) {
   t = Math.abs(t);
   if(isNaN(t)) throw new Error('invalid temperature in ak.noisyAnnealMinimum');

   if(ak.nativeType(d)===ak.UNDEFINED_T) d = (1+ak.abs(x))/64;

   return ak.nativeType(x)===ak.NUMBER_T ? uniMinimum(f, x, t, d, r, steps, rnd) : multiMinimum(f, x, t, d, r, steps, rnd);
  }

  ak.noisyAnnealMinimum = function(f, r, steps, rnd) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.noisyAnnealMinimum');

   r = ak.nativeType(r)===ak.UNDEFINED_T ? 0.99 : Math.abs(r);
   if(!(r<=1)) throw new Error('invalid cooling rate in ak.noisyAnnealMinimum');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 1024 : ak.floor(Math.abs(steps));
   if(!isFinite(steps)) throw new Error('invalid number of steps in ak.noisyAnnealMinimum');

   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.noisyAnnealMinimum');

   return function(x, t, d) {return minimum(f, x, t, d, r, steps, rnd);};
  };
 }

 ak.using('Matrix/Vector.js', define);
})();