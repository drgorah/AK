//AK/UI/Contour.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

"use strict";

(function() {
 function define() {
  if(ak.ui.contour) return;

  ak.ui.contour = function(out, options) {
   var c = ak.ui.chart(out, options);
   var init  = {bounds: [[0,0,0],[1,1,1]], palette: ak.ui.palette(256, [ak.ui.level(0,'black'), ak.ui.level(1.0,'white')])};
   var state = {bounds: [[0,0,0],[1,1,1]], palette: []};
   var chart_reset  = c.reset;
   var chart_bounds = c.bounds;

   c.reset    = function() {chart_reset(); reset(c, state, init);};
   c.recreate = function() {return ak.ui.contour(out, options);};

   c.bounds  = function(bnds) {return bounds (c, state, chart_bounds, bnds);};
   c.palette = function(pal)  {return palette(c, state, pal);};

   c.plot = function(xyz, options) {plot(c, state, xyz, options);};

   if(options) {
    bounds (c, init, options.bounds);
    palette(c, init, options.palette);
   }

   reset(c, state, init);

   return c;
  }

  function reset(c, state, init) {
   var n = init.palette.length;
   var i;

   state.bounds[0][0] = init.bounds[0][0];
   state.bounds[0][1] = init.bounds[0][1];
   state.bounds[0][2] = init.bounds[0][2];
   state.bounds[1][0] = init.bounds[1][0];
   state.bounds[1][1] = init.bounds[1][1];
   state.bounds[1][2] = init.bounds[1][2];

   state.palette = init.palette.slice(0);
  }

  function bounds(c, state, chart_bounds, bnds) {
   var b0, b1, b00, b01, b02, b10, b11, b12;

   if(bnds) {
    b0 = bnds[0];
    b1 = bnds[1];

    if(b0 && b1) {
     b00 = b0[0];
     b01 = b0[1];
     b02 = b0[2];
     b10 = b1[0];
     b11 = b1[1];
     b12 = b1[2];
    }

    if(isFinite(b00) && isFinite(b01) && isFinite(b02) && isFinite(b10) && isFinite(b11) && isFinite(b12)) {
     state.bounds[0][0] = Math.min(b00, b10);
     state.bounds[0][1] = Math.min(b01, b11);
     state.bounds[0][2] = Math.min(b02, b12);
     state.bounds[1][0] = Math.max(b00, b10);
     state.bounds[1][1] = Math.max(b01, b11);
     state.bounds[1][2] = Math.max(b02, b12);
     chart_bounds(bnds);
    }
   }
   return [state.bounds[0].slice(0), state.bounds[1].slice(0)];
  }

  function palette(c, state, pal) {
   if(ak.nativeType(pal)===ak.ARRAY_T) {
    state.palette = pal.slice(0);
    c.clear();
   }
   return state.palette.slice(0);
  }

  function plot(c, state, xyz, options) {
   var cr = c.toCR(xyz);
   var n  = state.palette.length;
   var d  = ak.round((n-1) * (xyz[2]-state.bounds[0][2]) / (state.bounds[1][2]-state.bounds[0][2]));

   if(d<0)  d = 0;
   if(d>=n) d = n-1;

   if(!options) options = {};
   if(!options.fillStyle) options.fillStyle = state.palette[d];

   c.set(cr, options);
  }
 }

 ak.using('UI/Chart.js', define);
})();
