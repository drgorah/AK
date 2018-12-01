//AK/Calculus/SimpsonIntegral.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {

  if(ak.simpsonIntegral) return;

  function refine(f, x0, x2, x4, x6, f0, f2, f4, f6, s06, eps, stepper) {
   var x1, x3, x5, h38, f1, f3, f5, s03, s36, e03, e36;

   if(stepper()===0) throw new Error('failure to converge in ak.simpsonIntegral');

   x1  = (x0+x2)/2;
   x3  = (x2+x4)/2;
   x5  = (x4+x6)/2;
   h38 = 3*(x1-x0)/8;

   f1  = f(x1);
   f3  = f(x3);
   f5  = f(x5);
   s03 = h38*(f0+3*f1+3*f2+f3);
   s36 = h38*(f3+3*f4+3*f5+f6);

   if(ak.diff(s03+s36, s06)>=eps) {
    e03 = Math.abs(s03)<1 ? eps/2 : eps;
    e36 = Math.abs(s36)<1 ? eps/2 : eps;

    s03 = refine(f, x0, x1, x2, x3, f0, f1, f2, f3, s03, e03, stepper);
    s36 = refine(f, x3, x4, x5, x6, f3, f4, f5, f6, s36, e36, stepper);
   }
   return s03+s36;
  }

  function simpsonIntegral(f, x0, x6, eps, steps) {
   var x1, x2, x3, x4, x5, h38, f0, f1, f2, f3, f4, f5, f6, s03, s36, stepper;

   if(ak.nativeType(x6)===ak.UNDEFINED_T) {
    x6 = x0;
    x0 = 0;
   }

   if(!isFinite(x0) || !isFinite(x6)) throw new Error('invalid range of integration in ak.simpsonIntegral');

   x1 = (5*x0+x6)/6;
   x2 = (2*x0+x6)/3;
   x3 = (x0+x6)/2;
   x4 = (x0+2*x6)/3;
   x5 = (x0+5*x6)/6;
   h38 = 3*(x1-x0)/8;

   f0 = f(x0);
   f1 = f(x1);
   f2 = f(x2);
   f3 = f(x3);
   f4 = f(x4);
   f5 = f(x5);
   f6 = f(x6);

   s03 = h38*(f0+3*f1+3*f2+f3);
   s36 = h38*(f3+3*f4+3*f5+f6);
   stepper = function(){return steps--;};
   return refine(f, x0, x1, x2, x3, f0, f1, f2, f3, s03, eps, stepper)
        + refine(f, x3, x4, x5, x6, f3, f4, f5, f6, s36, eps, stepper);
  }

  ak.simpsonIntegral = function(f, threshold, steps) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.simpsonIntegral');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 0.75) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('non-numeric threshold passed to ak.simpsonIntegral');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 18 : ak.floor(Math.abs(steps));
   if(isNaN(steps)) throw new Error('non-numeric steps passed to ak.simpsonIntegral');
   steps = Math.pow(2, steps);

   return function(x0, x1) {
    return simpsonIntegral(f, x0, x1, threshold, steps);
   };
  };
 }

 ak.using('', define);
})();