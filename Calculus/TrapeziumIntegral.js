//AK/Calculus/TrapeziumIntegral.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {

  if(ak.trapeziumIntegral) return;

  function trapeziumIntegral(f, h, x0, x1) {
   var n, i, s;

   if(ak.nativeType(x1)===ak.UNDEFINED_T) {
    x1 = x0;
    x0 = 0;
   }

   if(!isFinite(x0) || !isFinite(x1)) throw new Error('invalid range of integration in ak.trapeziumIntegral');

   n = ak.ceil(Math.abs(x1-x0)/h);
   if(n>ak.INT_MAX) throw new Error('too many steps in ak.trapeziumIntegral');
   if(n===0) n = 1;

   h = (x1-x0)/n;

   s = 0.5*(f(x0) + f(x1));
   for(i=1;i<n;++i) s += f(x0 + i*h);
   return s*h;
  }

  ak.trapeziumIntegral = function(f, h) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.trapeziumIntegral');
   h = Math.abs(h);
   if(isNaN(h) || h===0) throw new Error('invalid trapezium width in ak.trapeziumIntegral');

   return function(x0, x1) {
    return trapeziumIntegral(f, h, x0, x1);
   };
  };
 }

 ak.using('', define);
})();