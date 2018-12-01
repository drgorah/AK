//AK/UI/Vector.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

"use strict";

(function() {
 function define() {
  if(ak.ui.vector) return;

  var POINT_SIZE = 2;

  ak.ui.pointer = function(origin, direction) {
   return {origin:origin, direction:direction};
  }

  ak.ui.vector = function(out, options) {
   var v = ak.ui.chart(out, options);
   var init  = {pointSize: POINT_SIZE};
   var state = {pointSize: POINT_SIZE};
   var chart_reset = v.reset;

   v.reset     = function() {chart_reset(); state.pointSize=init.pointSize;};
   v.recreate  = function() {return ak.ui.vector(out, options);};
   v.pointSize = function(size) {return size>=0 ? state.pointSize=size : state.pointSize;};
   v.plot      = function(pointers, options) {plot(v, state, pointers, options);};

   if(options && options.pointSize>=0) init.pointSize = options.pointSize;
   state.pointSize = init.pointSize;

   return v;
  }
 }

 function plot(v, state, pointers, options) {
  var n = pointers.length;
  var size = options && options.pointSize>=0 ? options.pointSize : state.pointSize;
  var i, p;

  for(i=0;i<n;++i) {
   p = pointers[i];
   v.fillCircle(v.toCR(p.origin), size, options);
   v.line(v.toCR(p.origin), v.toCR([p.origin[0]+p.direction[0], p.origin[1]+p.direction[1]]), options);
  }
 }

 ak.using('UI/Chart.js', define);
})();
