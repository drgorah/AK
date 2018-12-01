//AK/Borel/BorelIntegral.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.borelIntegral) return;

  function changeVar(f) {
   return function(y) {
    var x = 1/y;
    var fx = f(x);
    return fx!==0 ? fx*x*x : 0;
   };
  }

  function integrate(i, g, h) {
   var l = i.lb();
   var u = i.ub();
   var lv = l.value();
   var uv = u.value();
   var lf, uf;

   if(l.open()) lv = ak.nextAfter(lv,  ak.INFINITY);
   if(u.open()) uv = ak.nextAfter(uv, -ak.INFINITY);

   if(lv===uv) return 0;

   lf = isFinite(lv);
   uf = isFinite(uv);
   if(lf && uf) return g(lv, uv);
   if(lf) return lv<1 ? g(lv, 1) + h(1/uv, 1) : h(1/uv, 1/lv);
   if(uf) return uv>-1 ? h(-1, 1/lv) + g(-1, uv) : h(1/uv, 1/lv);
   return h(-1, 1/lv) + g(-1, 1) + h(1/uv, 1);
  }

  ak.borelIntegral = function(s, f, integral, threshold, steps) {
   var m = 0;
   var g, h, n;

   if(ak.type(s)!==ak.BOREL_SET_T) throw new Error('invalid set in ak.borelIntegral');
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.borelIntegral');
   if(ak.nativeType(integral)===ak.UNDEFINED_T) integral = ak.rombergIntegral;
   else if(ak.nativeType(integral)!==ak.FUNCTION_T) throw new Error('invalid integral in ak.borelIntegral');

   g = integral(f, threshold, steps);
   h = integral(changeVar(f), threshold, steps);
   n = s.intervals();
   while(n-->0) m += integrate(s.at(n), g, h);
   return m;
  };
 }

 ak.using(['Borel/BorelSet.js', 'Calculus/RombergIntegral.js', 'Number/NextAfter.js'], define);
})();
