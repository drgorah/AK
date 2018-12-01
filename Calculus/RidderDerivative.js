//AK/Calculus/RidderDerivative.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {
  if(ak.ridderDerivative) return;

  function ridderRefine(i, f, x, dx) {
   var xa = x + dx;
   var xb = x - dx;
   var df = (f(xa)-f(xb))/(xa-xb);

   i.refine(xb-xa, df);
   return i.refine(xa-xb, df);
  }

  function ridderApply(f, x, d) {
   var c1 = 7/5;
   var c2 = c1*c1;
   var i  = ak.nevilleInterpolate(0);
   var dx = d * (Math.abs(x) + 1);

   var y0 = ridderRefine(i, f, x, dx);
   var y1 = ridderRefine(i, f, x, dx/=c1);
   var y  = y1;

   var e1 = Math.abs(y0-y1);
   var e2 = e1;

   while(e2<2*e1)
   {
    y0 = y1;
    y1 = ridderRefine(i, f, x, dx/=c2);

    e2 = Math.abs(y0-y1);

    if(e2<e1)
    {
      e1 = e2;
      y = y1;
    }
   }
   return {
    val: y,
    err: e1
   };
  }

  ak.ridderDerivative = function(f, d) {
   var r;

   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('non-function passed to ak.ridderDerivative');
   if(ak.nativeType(d)===ak.UNDEFINED_T) d = 0.1;
   if(ak.nativeType(d)!==ak.NUMBER_T) throw new Error('non-numeric distance passed to ak.ridderDerivative');
   if(!(d>0)) throw new Error('non-positive distance passed to ak.ridderDerivative');

   r = function(x) {return ridderApply(f, x, d).val;};
   r.apply = function(x) {return ridderApply(f, x, d);};
   return Object.freeze(r);
  };
 }

 ak.using('Approx/NevilleInterpolate.js', define);
})();