//AK/Calculus/MonteCarloIntegral.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {
  if(ak.monteCarloIntegral) return;

  var DEFAULT_STEPS = Math.pow(2, 22);
  var DEFAULT_THRESHOLD = Math.pow(2, -9);

  function volume(x0, x1) {
   var n = x0.dims();
   var v = 1;
   var i;

   for(i=0;i<n;++i) v *= x1.at(i)-x0.at(i);
   return v;
  }

  function integral(f, threshold, steps, rnd, v) {
   var i = 0;
   var s1 = 0;
   var s2 = 0;
   var j, fx, s2i2, e1i1;

   if(!isFinite(v)) throw new Error('invalid bounds in ak.monteCarloIntegral');

   do {
    for(j=0;j<32;++j) {
     fx = f(rnd())*v;
     s1 += fx;
     s2 += fx*fx;
    }
    i += j;

    s2i2 = i*s2-s1*s1;
    e1i1 = threshold*(i+Math.abs(s1));
   }
   while(i<steps && s2i2>i*e1i1*e1i1);

   if(!(s2i2<=i*e1i1*e1i1)) throw new Error('failure to converge in ak.monteCarloIntegral');
   return s1/i;
  }

  function uniIntegral(f, x0, x1, threshold, steps, rnd) {
   if(ak.nativeType(x1)===ak.UNDEFINED_T) {
    x1 = x0;
    x0 = 0;
   }

   if(ak.nativeType(x0)!==ak.NUMBER_T) throw new Error('invalid lower bound in ak.monteCarloIntegral');
   if(ak.nativeType(x1)!==ak.NUMBER_T) throw new Error('invalid upper bound in ak.monteCarloIntegral');

   return integral(f, threshold, steps, ak.uniformRnd(x0, x1, rnd), x1-x0);
  }

  function multiIntegral(f, x0, x1, threshold, steps, rnd) {
   var n = x0.dims();

   if(n===0) throw new Error('invalid lower bound in ak.monteCarloIntegral');

   if(ak.nativeType(x1)===ak.UNDEFINED_T) {
    x1 = x0;
    x0 = ak.vector(n, 0);
   }
   else if(ak.type(x1)!==ak.VECTOR_T || x1.dims()!==n) {
    throw new Error('invalid upper bound in ak.monteCarloIntegral');
   }

   return integral(f, threshold, steps, ak.multiUniformRnd(x0, x1, rnd), volume(x0, x1));
  }

  ak.monteCarloIntegral = function(f, threshold, steps, rnd) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.monteCarloIntegral');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? DEFAULT_THRESHOLD : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('non-numeric threshold passed to ak.monteCarloIntegral');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? DEFAULT_STEPS : ak.floor(Math.abs(steps));
   if(!(steps>0)) throw new Error('invalid steps passed to ak.monteCarloIntegral');

   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid generator in ak.monteCarloIntegral');

   return function(x0, x1) {
    return ak.type(x0)===ak.VECTOR_T ? multiIntegral(f, x0, x1, threshold, steps, rnd) : uniIntegral(f, x0, x1, threshold, steps, rnd);
   };
  };
 }

 ak.using(['Distribution/UniformDistribution.js', 'Distribution/MultiUniformDistribution.js'], define);
})();