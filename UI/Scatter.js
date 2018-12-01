//AK/UI/Scatter.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

"use strict";

(function() {
 function define() {
  if(ak.ui.scatter) return;

  var CROSS_SIZE = 7;

  ak.ui.scatter = function(out, options) {
   var s = ak.ui.chart(out, options);
   var init  = {crossSize: CROSS_SIZE};
   var state = {crossSize: CROSS_SIZE};
   var chart_reset = s.reset;

   s.reset     = function() {chart_reset(); state.crossSize=init.crossSize;};
   s.recreate  = function() {return ak.ui.scatter(out, options);};
   s.crossSize = function(size) {return size>=0 ? state.crossSize=size : state.crossSize;};
   s.plot      = function(xys, options) {plot(s, state, xys, options);};

   if(options && options.crossSize>=0) init.crossSize = options.crossSize;
   state.crossSize = init.crossSize;

   return s;
  }
 }

 function plot(s, state, xys, options) {
  var n = xys.length;
  var size = options && options.crossSize>=0 ? options.crossSize : state.crossSize;
  var path = [];
  var i, cr;

  for(i=0;i<n;++i) {
   cr = s.toCR(xys[i]);
   path.push([cr[0]-size/2, cr[1]-size/2]);
   path.push([cr[0]+size/2, cr[1]+size/2]);
   path.push([]);
   path.push([cr[0]-size/2, cr[1]+size/2]);
   path.push([cr[0]+size/2, cr[1]-size/2]);
   path.push([]);
  }
  s.path(path, options);
 }

 ak.using('UI/Chart.js', define);
})();
