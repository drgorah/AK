//AK/Approx/MonoCubicSplineInterpolate.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.monoCubicSplineInterpolate) return;

  function toMono(ub, f) {
   var nodes = f.nodes();
   var changed = false;
   var n = nodes.length;
   var x0 = nodes[0].x;
   var y0 = nodes[0].y;
   var g0 = nodes[0].g;
   var i, x1, y1, g1, g, ubg;

   for(i=1;i<n;++i) {
    x1 = nodes[i].x;
    y1 = nodes[i].y;
    g1 = nodes[i].g;
    g = (y1-y0)/(x1-x0);
    ubg = ub*g;

    if(g0!==0) {
     if(g0*g<=0) {changed=true; nodes[i-1].g = 0;}
     else if(Math.abs(g0)>Math.abs(ubg)) {changed=true; nodes[i-1].g = ubg;}
    }

    if(g1!==0) {
     if(g1*g<=0) {changed=true; nodes[i].g = g1 = 0;}
     else if(Math.abs(g1)>Math.abs(ubg)) {changed=true; nodes[i].g = g1 = ubg;}
    }

    x0 = x1;
    y0 = y1;
    g0 = g1;
   }

   return changed ? ak.cubicSplineInterpolate(nodes) : f;
  }

  ak.monoCubicSplineInterpolate = function() {
   var args = arguments;
   var arg0 = args[0];
   var p = 0.89;
   var f;

   if(ak.nativeType(arg0)===ak.NUMBER_T) {
    p = Number(arg0);
    if(!(p>=0 && p<=1)) throw new Error('invalid gradient preservation in ak.monoCubicSplineInterpolate');
    args = Array.prototype.slice.call(args, 1);
   }

   try {f = ak.cubicSplineInterpolate.apply(null, args);}
   catch(e) {throw new Error(e.message.replace('ak.cubic', 'ak.monoCubic'));}
   return toMono(3*p, f);
  };
 }

 ak.using('Approx/CubicSplineInterpolate.js', define);
})();