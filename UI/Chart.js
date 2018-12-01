//AK/UI/Chart.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

"use strict";

(function() {
 function define() {
  if(ak.ui.chart) return;

  var X0 = 0;
  var Y0 = 0;
  var X1 = 1;
  var Y1 = 1;
  var TICK_SIZE = 7;
  var PIXEL_SIZE = 1;
  var LINE_WIDTH = 1;
  var MIN_LINE_WIDTH = 1e-12;
  var STROKE_STYLE = 'black';
  var FILL_STYLE = 'black';

  ak.ui.chart = function(out, options) {
   var c = {};
   var init  = {bounds: [[X0,Y0],[X1,Y1]], tickSize: TICK_SIZE, pixelSize: PIXEL_SIZE, lineWidth: LINE_WIDTH, strokeStyle: STROKE_STYLE, fillStyle: FILL_STYLE};
   var state = {bounds: [[X0,Y0],[X1,Y1]], tickSize: TICK_SIZE, pixelSize: PIXEL_SIZE, lineWidth: LINE_WIDTH, strokeStyle: STROKE_STYLE, fillStyle: FILL_STYLE};

   c.elem     = function()    {return out;};
   c.active   = function()    {return out && out.getContext;};
   c.clear    = function()    {clear(out);};
   c.reset    = function()    {reset(c, state, init);};
   c.recreate = function()    {return ak.ui.chart(out, options);};
   c.error    = function(err) {error(c, state, err);};

   c.bounds = function(bnds) {return bounds(c, state, bnds);};
   c.rows   = function()     {return out.height;};
   c.cols   = function()     {return out.width;};
   c.toCR   = function(xy)   {return toCR(out, state, xy);};
   c.toXY   = function(cr)   {return toXY(out, state, cr);};

   c.tickSize    = function(size)  {return size>=0 ? state.tickSize=size  : state.tickSize;};
   c.pixelSize   = function(size)  {return size>=0 ? state.pixelSize=size : state.pixelSize;};
   c.lineWidth   = function(width) {return width>=0 ? state.lineWidth=Math.max(width, MIN_LINE_WIDTH) : state.lineWidth;};
   c.strokeStyle = function(style) {return strokeStyle(out, state, style);};
   c.fillStyle   = function(style) {return fillStyle(out, state, style);};

   c.set  = function(cr, options)       {set(out, state, cr, options);};
   c.line = function(cr0, cr1, options) {line(out, state, cr0, cr1, options);};
   c.path = function(crs, options)      {path(out, state, crs, options);};

   c.rect     = function(cr0, cr1, options) {rect(out, state, cr0, cr1, options);};
   c.fillRect = function(cr0, cr1, options) {fillRect(out, state, cr0, cr1, options);};

   c.circle     = function(cr, radius, options) {circle(out, state, cr, radius, options);};
   c.fillCircle = function(cr, radius, options) {fillCircle(out, state, cr, radius, options);};

   c.sector     = function(cr, radius, start, end, options) {sector(out, state, cr, radius, start, end, options);};
   c.fillSector = function(cr, radius, start, end, options) {fillSector(out, state, cr, radius, start, end, options);};

   c.poly     = function(crs, options) {poly(out, state, crs, options);};
   c.fillPoly = function(crs, options) {fillPoly(out, state, crs, options);};

   c.axes     = function(xys, ticks, options) {axes(c, xys, ticks, options);};

   if(options) {
    bounds(c, init, options.bounds);
    strokeStyle(out, init, options.strokeStyle);
    fillStyle(out, init, options.fillStyle);

    if(options.tickSize  >= 0) init.tickSize  = options.tickSize;
    if(options.pixelSize >= 0) init.pixelSize = options.pixelSize;
    if(options.lineWidth >= 0) init.lineWidth = Math.max(options.lineWidth, MIN_LINE_WIDTH);
   }

   reset(c, state, init);

   return c;
  };

  function clear(out) {
   out.getContext('2d').clearRect(0, 0, out.width, out.height);
  }

  function reset(c, state, init) {
   state.bounds[0][0] = init.bounds[0][0];
   state.bounds[0][1] = init.bounds[0][1];
   state.bounds[1][0] = init.bounds[1][0];
   state.bounds[1][1] = init.bounds[1][1];
   state.tickSize     = init.tickSize;
   state.pixelSize    = init.pixelSize;
   state.lineWidth    = init.lineWidth;
   state.strokeStyle  = init.strokeStyle;
   state.fillStyle    = init.fillStyle;

   c.clear();
  }

  function error(c, state, err) {
   var out = c.elem();
   var ctx = out.getContext('2d');

   c.clear();
   ctx.fillStyle = state.fillStyle;
   ctx.font = '1em "Courier New",Courier,monospace';
   ctx.textBaseline = 'top';
   ctx.fillText(err.name + ': ' + err.message, 0, 0, out.width);
  }

  function bounds(c, state, bnds) {
   var b0, b1, b00, b01, b10, b11;

   if(bnds) {
    b0 = bnds[0];
    b1 = bnds[1];

    if(b0 && b1) {
     b00 = b0[0];
     b01 = b0[1];
     b10 = b1[0];
     b11 = b1[1];
    }

    if(isFinite(b00) && isFinite(b01) && isFinite(b10) && isFinite(b11)) {
     state.bounds[0][0] = Math.min(b00, b10);
     state.bounds[0][1] = Math.min(b01, b11);
     state.bounds[1][0] = Math.max(b00, b10);
     state.bounds[1][1] = Math.max(b01, b11);
     c.clear();
    }
   }
   return [state.bounds[0].slice(0), state.bounds[1].slice(0)];
  }

  function toCR(out, state, xy) {
   var h = out.height;
   var w = out.width;

   var x0 = state.bounds[0][0];
   var y0 = state.bounds[0][1];
   var x1 = state.bounds[1][0];
   var y1 = state.bounds[1][1];

   var c = ak.round((w-1) * (xy[0]-x0) / (x1-x0));
   var r = ak.round((h-1) * (xy[1]-y1) / (y0-y1));

   return [c, r];
  }

  function toXY(out, state, cr) {
   var h = out.height;
   var w = out.width;

   var x0 = state.bounds[0][0];
   var y0 = state.bounds[0][1];
   var x1 = state.bounds[1][0];
   var y1 = state.bounds[1][1];

   var x = x0 + (x1-x0) * cr[0]/(w-1);
   var y = y1 + (y0-y1) * cr[1]/(h-1);

   return [x, y];
  }

  function strokeStyle(out, state, style) {
   var ctx;

   if(ak.nativeType(style)!==ak.UNDEFINED_T) {
    ctx = out.getContext('2d');
    ctx.strokeStyle = style;
    state.strokeStyle = ctx.strokeStyle;
   }
   return state.strokeStyle;
  }

  function fillStyle(out, state, style) {
   var ctx;

   if(ak.nativeType(style)!==ak.UNDEFINED_T) {
    ctx = out.getContext('2d');
    ctx.fillStyle = style;
    state.fillStyle = ctx.fillStyle;
   }
   return state.fillStyle;
  }

  function set(out, state, cr, options) {
   var ctx = out.getContext('2d');
   var c = cr[0];
   var r = cr[1];
   var style = options && options.fillStyle    ? options.fillStyle : state.fillStyle;
   var size  = options && options.pixelSize>=0 ? options.pixelSize : state.pixelSize;

   ctx.fillStyle = style;

   ctx.beginPath();
   ctx.fillRect(c, r, size, size);
   ctx.stroke();
  }

  function line(out, state, cr0, cr1, options) {
   var ctx = out.getContext('2d');
   var style = options && options.strokeStyle  ? options.strokeStyle : state.strokeStyle;
   var width = options && options.lineWidth>=0 ? options.lineWidth   : state.lineWidth;

   ctx.strokeStyle = style;
   ctx.lineWidth   = width;

   ctx.beginPath();
   ctx.moveTo(cr0[0], cr0[1]);
   ctx.lineTo(cr1[0], cr1[1]);
   ctx.stroke();
  }

  function path(out, state, crs, options) {
   var ctx = out.getContext('2d');
   var n  = crs.length;
   var style = options && options.strokeStyle  ? options.strokeStyle : state.strokeStyle;
   var width = options && options.lineWidth>=0 ? options.lineWidth   : state.lineWidth;
   var i, c0, r0, c1, r1, l;

   ctx.strokeStyle = style;
   ctx.lineWidth   = width;

   ctx.beginPath();
   for(i=0;i<n;++i) {
    c0 = c1;
    r0 = r1;
    c1 = crs[i][0];
    r1 = crs[i][1];

    l = isFinite(c0) && isFinite(r0) && isFinite(c1) && isFinite(r1);

    if(l) ctx.lineTo(c1, r1);
    else  ctx.moveTo(c1, r1);
   }
   ctx.stroke();
  }

  function rect(out, state, cr0, cr1, options) {
   var ctx = out.getContext('2d');
   var c0 = cr0[0];
   var c1 = cr1[0];
   var r0 = cr0[1];
   var r1 = cr1[1];
   var c  = Math.min(c0, c1);
   var r  = Math.min(r0, r1);
   var w  = Math.abs(c0-c1)+1;
   var h  = Math.abs(r0-r1)+1;
   var style = options && options.strokeStyle  ? options.strokeStyle : state.strokeStyle;
   var width = options && options.lineWidth>=0 ? options.lineWidth   : state.lineWidth;

   ctx.strokeStyle = style;
   ctx.lineWidth   = width;

   ctx.strokeRect(c, r, w, h);
  }

  function fillRect(out, state, cr0, cr1, options) {
   var ctx = out.getContext('2d');
   var c0 = cr0[0];
   var c1 = cr1[0];
   var r0 = cr0[1];
   var r1 = cr1[1];
   var c  = Math.min(c0, c1);
   var r  = Math.min(r0, r1);
   var w  = Math.abs(c0-c1)+1;
   var h  = Math.abs(r0-r1)+1;
   var style = options && options.fillStyle ? options.fillStyle : state.fillStyle;

   ctx.fillStyle = style;

   ctx.fillRect(c, r, w, h);
  }

  function circle(out, state, cr, radius, options) {
   var ctx = out.getContext('2d');
   var c = cr[0];
   var r = cr[1];
   var style = options && options.strokeStyle  ? options.strokeStyle : state.strokeStyle;
   var width = options && options.lineWidth>=0 ? options.lineWidth   : state.lineWidth;

   ctx.strokeStyle = style;
   ctx.lineWidth   = width;

   ctx.beginPath();
   ctx.moveTo(c+radius, r);
   ctx.arc(c, r, radius, 0, 2*ak.PI);
   ctx.closePath();
   ctx.stroke();
  }

  function fillCircle(out, state, cr, radius, options) {
   var ctx = out.getContext('2d');
   var c = cr[0];
   var r = cr[1];
   var style = options && options.fillStyle ? options.fillStyle : state.fillStyle;

   ctx.fillStyle = style;

   ctx.beginPath();
   ctx.moveTo(c+radius, r);
   ctx.arc(c, r, radius, 0, 2*ak.PI);
   ctx.closePath();
   ctx.fill();
  }

  function sector(out, state, cr, radius, start, end, options) {
   var ctx = out.getContext('2d');
   var c = cr[0];
   var r = cr[1];
   var style = options && options.strokeStyle  ? options.strokeStyle : state.strokeStyle;
   var width = options && options.lineWidth>=0 ? options.lineWidth   : state.lineWidth;

   ctx.strokeStyle = style;
   ctx.lineWidth   = width;

   ctx.beginPath();
   ctx.moveTo(c, r);
   ctx.arc(c, r, radius, start, end);
   ctx.closePath();
   ctx.stroke();
  }

  function fillSector(out, state, cr, radius, start, end, options) {
   var ctx = out.getContext('2d');
   var c = cr[0];
   var r = cr[1];
   var style = options && options.fillStyle ? options.fillStyle : state.fillStyle;

   ctx.fillStyle = style;

   ctx.beginPath();
   ctx.moveTo(c, r);
   ctx.arc(c, r, radius, start, end);
   ctx.closePath();
   ctx.fill();
  }

  function poly(out, state, crs, options) {
   var ctx = out.getContext('2d');
   var n = crs.length;
   var style = options && options.strokeStyle  ? options.strokeStyle : state.strokeStyle;
   var width = options && options.lineWidth>=0 ? options.lineWidth   : state.lineWidth;
   var i;

   for(i=0;i<n;++i) if(!isFinite(crs[i][0]) || !isFinite(crs[i][1])) return;

   ctx.strokeStyle = style;
   ctx.lineWidth   = width;

   ctx.beginPath();
   if(n) ctx.moveTo(crs[0][0], crs[0][1]);
   for(i=1;i<n;++i) ctx.lineTo(crs[i][0], crs[i][1]);
   ctx.closePath();
   ctx.stroke();
  }

  function fillPoly(out, state, crs, options) {
   var ctx = out.getContext('2d');
   var n = crs.length;
   var style = options && options.fillStyle ? options.fillStyle : state.fillStyle;
   var i;

   for(i=0;i<n;++i) if(!isFinite(crs[i][0]) || !isFinite(crs[i][1])) return;

   ctx.fillStyle = style;

   ctx.beginPath();
   if(n) ctx.moveTo(crs[0][0], crs[0][1]);
   for(i=1;i<n;++i) ctx.lineTo(crs[i][0], crs[i][1]);
   ctx.closePath();
   ctx.fill();
  }

  function axes(chart, xy0, ticks, options) {
   var cn   = chart.cols();
   var rn   = chart.rows();
   var cr0  = chart.toCR(xy0);
   var xn   = ticks[0].length;
   var yn   = ticks[1].length;
   var w    = options && options.lineWidth>0 ? options.lineWidth : chart.lineWidth();
   var size = options && options.tickSize>0  ? options.tickSize  : chart.tickSize();
   var path = [];
   var i, tick;

   if(cr0[0] <  w/2)    cr0[0] = w/2;
   if(cr0[0] >= cn-w/2) cr0[0] = cn-w/2;

   if(cr0[1] <  w/2)    cr0[1] = w/2;
   if(cr0[1] >= rn-w/2) cr0[1] = rn-w/2;

   path.push([0,  cr0[1]]);
   path.push([cn, cr0[1]]);
   path.push([]);
   path.push([cr0[0], 0 ]);
   path.push([cr0[0], rn]);
   path.push([]);

   for(i=0;i<xn;++i) {
    tick = chart.toCR([ticks[0][i], xy0[1]]);
    path.push([tick[0], cr0[1]-size/2]);
    path.push([tick[0], cr0[1]+size/2]);
    path.push([]);
   }

   for(i=0;i<yn;++i) {
    tick = chart.toCR([xy0[0], ticks[1][i]]);
    path.push([cr0[0]-size/2, tick[1]]);
    path.push([cr0[0]+size/2, tick[1]]);
    path.push([]);
   }

   chart.path(path, options);
  }
 }
 ak.using('UI/AKUI.js', define);
})();
