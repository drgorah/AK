//AK/UI/Bar.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

"use strict";

(function() {
 function define() {
  if(ak.ui.bar) return;

  ak.ui.bar = function(out, options) {
   var b = ak.ui.chart(out, options);
   var state = [];
   var chart_clear = b.clear;

   b.clear    = function() {chart_clear(); state.length=0;};
   b.recreate = function() {return ak.ui.bar(out, options);};
   b.plot     = function(bars, options) {plot(b, state, bars, options);};

   return b;
  }
 }

 function plot(b, state, bars, options) {
  var bounds = b.bounds();
  var w   = b.toXY([b.lineWidth(), b.lineWidth()]);
  var dx  = w[0]/2;
  var dy  = (bounds[1][1]-w[1])/2;
  var x0  = bounds[0][0]+dx;
  var x1  = bounds[1][0]-dx;
  var n   = ak.round(x1-x0);
  var m   = state.length;
  var d   = (x1-x0)/n;
  var cr0 = b.toCR([x0, 0]);
  var cr1 = cr0.slice(0);
  var o   = cr0[1];
  var i, j, s, y;

  state.push([]);
  cr1[0] -= 1;

  for(i=0;i<n;++i) {
   x0 += d;
   y = bars[i];

   cr0[0] = cr1[0]+1;
   cr0[1] = o;
   cr1 = b.toCR([x0, y>0 ? y-dy : y+dy]);

   state[m].push(cr1[1]);

   for(j=0;j<m;++j) {
    s = state[j][i];
    if((cr1[1]>o && s>o && cr1[1]>s && cr0[1]<s) || (cr1[1]<o && s<o && cr1[1]<s && cr0[1]>s)) cr0[1] = s;
   }
   b.fillRect(cr0, cr1, options);
   b.rect(cr0, cr1, options)
  }
 }

 ak.using('UI/Chart.js', define);
})();
