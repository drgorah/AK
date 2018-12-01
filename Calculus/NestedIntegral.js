//AK/Calculus/NestedIntegral.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {

  if(ak.nestedIntegral) return;

  function uniIntegral(integrator, f, threshold, steps, x0, x1) {
   var integral = integrator(f, threshold, steps);
   if(ak.nativeType(integral)!==ak.FUNCTION_T) throw new Error('invalid integrator in ak.nestedIntegral');
   return integral(x0, x1);
  }

  function nested(integrator, f, threshold, steps, x0, x1, x, n) {
   var g, integral;

   if(n===0) {
    return function(xn) {
     x[0] = xn;
     return f(ak.vector(x));
    };
   }

   g = nested(integrator, f, threshold, steps, x0, x1, x, n-1);
   integral = integrator(g, threshold, steps);
   x0 = x0[n-1];
   x1 = x1[n-1];

   return function(xn) {
    x[n] = xn;
    return integral(x0, x1);
   };
  }

  function multiIntegral(integrator, f, threshold, steps, x0, x1) {
   var n = x0.dims();
   var x, g, integral;

   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.nestedIntegral');
   if(n===0) throw new Error('invalid lower bound in ak.nestedIntegral');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 18 : ak.floor(Math.abs(steps));
   if(isNaN(steps)) throw new Error('non-numeric steps passed to ak.nestedIntegral');
   steps = ak.ceil(steps/n);

   if(ak.nativeType(x1)===ak.UNDEFINED_T) {
    x1 = x0;
    x0 = ak.vector(n, 0);
   }
   else if(ak.type(x1)!==ak.VECTOR_T || x1.dims()!==n) {
    throw new Error('invalid upper bound in ak.nestedIntegral');
   }

   x0 = x0.toArray();
   x1 = x1.toArray();
   x = new Array(n);

   g = nested(integrator, f, threshold, steps, x0, x1, x, n-1);
   integral = integrator(g, threshold, steps);
   if(ak.nativeType(integral)!==ak.FUNCTION_T) throw new Error('invalid integrator in ak.nestedIntegral');
   return integral(x0[n-1], x1[n-1]);
  }

  function nestedIntegral(integrator, f, threshold, steps) {
   return function(x0, x1) {
    return ak.type(x0)===ak.VECTOR_T ? multiIntegral(integrator, f, threshold, steps, x0, x1) : uniIntegral(integrator, f, threshold, steps, x0, x1);
   };
  }

  ak.nestedIntegral = function(integrator) {
   if(ak.nativeType(integrator)!==ak.FUNCTION_T) throw new Error('invalid integrator in ak.nestedIntegral');

   return function(f, threshold, steps) {
    return nestedIntegral(integrator, f, threshold, steps);
   };
  };
 }

 ak.using('Matrix/Vector.js', define);
})();