//AK/Geometry/Simplex.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.simplex) return;

  ak.simplex = function(x, r) {
   var polytope = [];
   var r2 = 0;
   var n, o, p, i;

   if(ak.nativeType(x)===ak.NUMBER_T) x = ak.vector(x, 0);
   if(ak.type(x)!==ak.VECTOR_T || x.dims()===0) throw new Error('invalid location in ak.simplex');

   n = x.dims();
   for(i=0;i<n && isFinite(x.at(i));++i);
   if(i<n) throw new Error('invalid location in ak.simplex');

   r = ak.nativeType(r)===ak.UNDEFINED_T ? 1 : Math.abs(r);
   if(!isFinite(r)) throw new Error('invalid radius in ak.simplex');

   o = ak.vector(n, 0);
   polytope.push(o);
   o = o.toArray();
   
   for(i=0;i<n;++i) {
    o[i] = Math.sqrt(1-r2);
    polytope.push(ak.vector(o));
    o[i] /= i+2;
    r2 += o[i]*o[i];
   }
   o = ak.vector(o);
   r /= Math.sqrt(r2);
   for(i=0;i<=n;++i) polytope[i] = ak.add(x, ak.mul(r, ak.sub(polytope[i], o)));
   return polytope;
  };
 }

 ak.using('Matrix/Vector.js', define);
})();