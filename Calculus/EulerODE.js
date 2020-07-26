//AK/Calculus/EulerODE.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {
  if(ak.eulerODE) return;

  function numberEulerODE(f, n, x0, x1, y0) {
   var dx = (x1-x0)/n;
   var i;

   for(i=0;i<n;++i) {
    y0 += dx * f(x0, y0);
    x0 += dx;
   }
   return y0;
  }

  function generalEulerODE(f, n, x0, x1, y0) {
   var dx = (x1-x0)/n;
   var i;

   for(i=0;i<n;++i) {
    y0 = ak.add(y0, ak.mul(dx, f(x0, y0)));
    x0 += dx;
   }
   return y0;
  }

  ak.eulerODE = function(f, dx) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.eulerODE');
   dx = Math.abs(dx);
   if(isNaN(dx) || dx===0) throw new Error('invalid step length in ak.eulerODE');

   return function(x0, x1, y0) {
    var n;
    if(ak.nativeType(x0)!==ak.NUMBER_T || !isFinite(x0) || ak.nativeType(x1)!==ak.NUMBER_T || !isFinite(x1)) throw new Error('invalid interval in ak.eulerODE');
    n = ak.ceil(Math.abs(x1-x0)/dx);
    if(n>ak.INT_MAX) throw new Error('too many steps in ak.eulerODE');
    if(n===0) n = 1;
    return ak.nativeType(y0)===ak.NUMBER_T ? numberEulerODE(f, n, x0, x1, y0) : generalEulerODE(f, n, x0, x1, y0);
   };
  };
 }

 ak.using('', define);
})();