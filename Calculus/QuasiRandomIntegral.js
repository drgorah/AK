//AK/Calculus/QuasiRandomIntegral.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {
  if(ak.quasiRandomIntegral) return;

  var DEFAULT_STEPS = Math.pow(2, 22);
  var DEFAULT_THRESHOLD = Math.pow(2, -15);
  var N = 16;

  function volume(x0, x1) {
   var n = x0.dims();
   var v = 1;
   var i;

   for(i=0;i<n;++i) v *= x1.at(i)-x0.at(i);
   return v;
  }

  function integral(f, threshold, steps, qrnd, prnd, map, v) {
   var i = 0;
   var o = new Array(N);
   var s = new Array(N);
   var j, k, u, s1, s2, fx, s2n2, e1n1;

   if(!isFinite(v)) throw new Error('invalid bounds in ak.quasiRandomIntegral');

   steps = ak.ceil(steps/N);

   for(k=0;k<N;++k) {
    o[k] = prnd();
    s[k] = 0;
   }

   do {
    for(j=0;j<32;++j) {
     u = qrnd();
     for(k=0;k<N;++k) s[k] += f(map(o[k], u))*v;
    }
    i += j;

    s1 = 0;
    s2 = 0;
    for(k=0;k<N;++k) {
     fx = s[k]/i;
     s1 += fx;
     s2 += fx*fx;
    }
    s2n2 = N*s2-s1*s1;
    e1n1 = threshold*(N+Math.abs(s1));
   }
   while(i<steps && s2n2>N*e1n1*e1n1);

   if(!(s2n2<=N*e1n1*e1n1)) throw new Error('failure to converge in ak.quasiRandomIntegral');
   return s1/N;
  }

  function uniMap(x0, x1) {
   return function(o, u) {
    return x0 + (x1-x0)*((o+u)%1);
   }
  }

  function uniIntegral(f, x0, x1, threshold, steps, qrnd, prnd) {
   if(ak.nativeType(x1)===ak.UNDEFINED_T) {
    x1 = x0;
    x0 = 0;
   }

   if(ak.nativeType(x0)!==ak.NUMBER_T) throw new Error('invalid lower bound in ak.quasiRandomIntegral');
   if(ak.nativeType(x1)!==ak.NUMBER_T) throw new Error('invalid upper bound in ak.quasiRandomIntegral');

   if(ak.nativeType(qrnd)===ak.UNDEFINED_T) qrnd = ak.haltonRnd(2);

   return integral(f, threshold, steps, qrnd, prnd, uniMap(x0, x1), x1-x0);
  }

  function arrayRnd(n, rnd) {
   return function() {
    var x = new Array(n);
    var i;

    for(i=0;i<n;++i) x[i] = rnd();
    return x;
   };
  }

  function multiMap(x0, x1) {
   var n = x0.dims();

   x0 = x0.toArray();
   x1 = x1.toArray();

   return function(o, u) {
    var x = new Array(n);
    var i;

    for(i=0;i<n;++i) x[i] = x0[i] + (x1[i]-x0[i])*((o[i]+u[i])%1);
    return ak.vector(x);
   }
  }

  function multiIntegral(f, x0, x1, threshold, steps, qrnd, prnd) {
   var n = x0.dims();
   var base, i;

   if(n===0) throw new Error('invalid lower bound in ak.quasiRandomIntegral');

   if(ak.nativeType(x1)===ak.UNDEFINED_T) {
    x1 = x0;
    x0 = ak.vector(n, 0);
   }
   else if(ak.type(x1)!==ak.VECTOR_T || x1.dims()!==n) {
    throw new Error('invalid upper bound in ak.quasiRandomIntegral');
   }

   if(ak.nativeType(qrnd)===ak.UNDEFINED_T) {
    base = new Array(n);
    for(i=0;i<n;++i) base[i] = ak.primeSequence(i);
    qrnd = ak.haltonRnd(base);
   }

   return integral(f, threshold, steps, qrnd, arrayRnd(n, prnd), multiMap(x0, x1), volume(x0, x1));
  }

  ak.quasiRandomIntegral = function(f, threshold, steps, qrnd, prnd) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.quasiRandomIntegral');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? DEFAULT_THRESHOLD : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('non-numeric threshold passed to ak.quasiRandomIntegral');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? DEFAULT_STEPS : ak.floor(Math.abs(steps));
   if(!(steps>0)) throw new Error('invalid steps passed to ak.quasiRandomIntegral');

   if(ak.nativeType(qrnd)!==ak.UNDEFINED_T && ak.nativeType(qrnd)!==ak.FUNCTION_T) throw new Error('invalid quasi random generator in ak.quasiRandomIntegral');

   if(ak.nativeType(prnd)===ak.UNDEFINED_T) prnd = Math.random;
   else if(ak.nativeType(prnd)!==ak.FUNCTION_T) throw new Error('invalid pseudo random generator in ak.quasiRandomIntegral');

   return function(x0, x1) {
    return ak.type(x0)===ak.VECTOR_T ? multiIntegral(f, x0, x1, threshold, steps, qrnd, prnd) : uniIntegral(f, x0, x1, threshold, steps, qrnd, prnd);
   };
  };
 }

 ak.using(['Random/HaltonRnd.js', 'Sequence/PrimeSequence.js', 'Matrix/Vector.js', 'Distribution/UniformDistribution.js'], define);
})();