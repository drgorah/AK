//AK/Optimise/PolytopeMinimum.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.polytopeMinimum) return;

  function meanElem(p) {
   var n = p.length;
   var mean = ak.div(p[0], n);
   var i;

   for(i=1;i<n;++i) mean = ak.add(mean, ak.div(p[i], n));
   return mean;
  }

  function minElem(fp) {
   var n = fp.length;
   var m = 0;
   var i;

   for(i=1;i<n;++i) if(fp[i]<fp[m]) m = i;
   return m;
  }

  function maxElem(fp) {
   var n = fp.length;
   var m = 0;
   var i;

   for(i=1;i<n;++i) if(fp[i]>=fp[m]) m = i;
   return m;
  }

  function minimum(f, p, eps, steps) {
   var step = 0;
   var n = p.length;
   var fp = new Array(n);
   var mean, i, min, max, m, d, y, z, fy, fz;

   if(n<2) throw new Error('invalid polytope in ak.polytopeMinimum');

   mean = meanElem(p);
   if(ak.type(mean)!==ak.VECTOR_T || mean.dims()===0) throw new Error('invalid polytope in ak.polytopeMinimum');
   for(i=0;i<mean.dims() && isFinite(mean.at(i));++i);
   if(i<mean.dims()) throw new Error('invalid polytope in ak.polytopeMinimum');

   for(i=0;i<n;++i) if(isNaN(fp[i] = f(p[i]))) fp[i] = ak.INFINITY;
   min = minElem(fp);
   max = maxElem(fp);

   while(step++<steps && !(ak.diff(fp[min],fp[max])<=eps) && ak.diff(p[min],p[max])>eps) {
    m = ak.mul(ak.sub(mean, ak.div(p[max], n)), n/(n-1));
    d = ak.sub(m, p[max]);
    y = ak.add(m, d);
    fy = f(y);

    if(fy<fp[min]) {
     z = ak.add(y, d);
     fz = f(z);

     if(fz<fy) {
      y  = z;
      fy = fz;
     }
    }
    else if(!(fy<fp[max])) {
     y = ak.div(ak.add(p[max], m), 2);
     fy = f(y);
    }

    if(fy<fp[max]) {
     mean = ak.add(mean, ak.div(ak.sub(y, p[max]), n));

     p[max]  = y;
     fp[max] = fy;

     if(fy<fp[min]) min = max;
     max = maxElem(fp);
    }
    else {
     for(i=0;i<n;++i) {
      if(i!==min) {
       p[i] = ak.div(ak.add(p[i], p[min]), 2);
       if(isNaN(fp[i] = f(p[i]))) fp[i] = ak.INFINITY;
      }
     }
     mean = meanElem(p);
     min = minElem(fp);
     max = maxElem(fp);
    }
   }
   return !isNaN(f(p[min])) ? p[min] : ak.vector(x.dims(), ak.NaN);
  }

  ak.polytopeMinimum = function(f, threshold, steps) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.polytopeMinimum');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 0.75) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('invalid convergence threshold in ak.polytopeMinimum');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? ak.INFINITY : ak.floor(Math.abs(steps));
   if(isNaN(steps)) throw new Error('invalid number of steps in ak.polytopeMinimum');

   return function(x, r) {return minimum(f, ak.nativeType(x)===ak.ARRAY_T ? x : ak.simplex(x, r), threshold, steps);};
  };
 };

 ak.using(['Matrix/Vector.js', 'Geometry/Simplex.js'], define);
})();