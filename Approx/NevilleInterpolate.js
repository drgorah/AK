//AK/Approx/NevilleInterpolate.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.NEVILLE_INTERPOLATE_T) return;
  ak.NEVILLE_INTERPOLATE_T = 'ak.nevilleInterpolate';

  function refine(xn, yn, xi, yi, x) {
   var n = xi.length;
   var i, t;

   for(i=0;i<n;++i) {
    t = yi[i];
    yi[i] = yn;
    yn = t;

    yn = (yn*(x-xn) + yi[i]*(xi[n-1-i]-x)) / (xi[n-1-i]-xn);
   }

   xi.push(xn);
   yi.push(yn);

   return yn;
  }

  function NevilleInterpolate(){}
  NevilleInterpolate.prototype = {TYPE: ak.NEVILLE_INTERPOLATE_T, valueOf: function(){return ak.NaN;}};

  ak.nevilleInterpolate = function(x) {
   var n  = new NevilleInterpolate();
   var xi = [];
   var yi = [];

   n.refine = function(xn, yn) {return refine(xn, yn, xi, yi, x);};
   return Object.freeze(n);
  };
 };

 ak.using('', define);
})();