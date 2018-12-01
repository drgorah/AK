//AK/UI/AKUI.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

"use strict";

var ak;
if(!ak)    ak    = {};
if(!ak.ui) ak.ui = {};

(function() {
 function define() {
  if(ak.ui.output) return;

  var newFunction = (function() {
   function F(args) {return Function.apply(null, args);}
   F.prototype = Function.prototype;
   return function(names, src) {return new F(names.concat(src));};
  })();

  function deepCopy(data) {
   var copy = data;
   var i, n;

   if(ak.nativeType(data)===ak.ARRAY_T) {
    n = data.length;
    copy = new Array(n);
    for(i=0;i<n;++i) copy[i] = deepCopy(data[i]);
   }
   return copy;
  }

  ak.ui.output = function(name, out) {
   return {name: name, out: out};
  };

  ak.ui.datum = function(name, datum) {
   return {name: name, datum: datum};
  };

  ak.ui.program = function(src, out, data) {
   var names = [];
   var args  = [];
   var n, m, i;

   if(ak.nativeType(out) !==ak.ARRAY_T) out = [out];
   if(ak.nativeType(data)!==ak.UNDEFINED_T && ak.nativeType(data)!==ak.ARRAY_T) data = [data];

   n = out.length;
   for(i=0;i<n;++i) {
    names[i] = out[i].name;
    args[i]  = out[i].out.recreate();
   }

   if(ak.nativeType(data)===ak.ARRAY_T) {
    m = data.length;
    for(i=0;i<m;++i) {
     names[n+i] = data[i].name;
     args[n+i]  = deepCopy(data[i].datum);
    }
   }

   try {
    for(i=0;i<n;++i) args[i].clear();
    return newFunction(names, src).apply(null, args);
   }
   catch(e) {
    for(i=0;i<n;++i) args[i].error(e);
   }
  };

  ak.ui.level = function(offset, color) {
   return {offset: offset, color: color};
  };

  ak.ui.palette = function(n, levels) {
   var palette = [];
   var canvas = document.createElement('canvas');
   var m = levels.length;
   var ctx, grad, i, j, data;

   palette.length = n;

   if(n===2) {
    palette[0] = levels[0].color;
    palette[1] = levels[m-1].color;
   }
   else {
    canvas.height = 1;
    canvas.width  = n;

    ctx  = canvas.getContext('2d');

    grad = ctx.createLinearGradient(1, 0, n-1, 0);
    for(i=0;i<m;++i) grad.addColorStop(levels[i].offset, levels[i].color);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, n, 1);

    data = ctx.getImageData(0, 0, n, 1).data;
    for(i=0,j=0;i<n;++i,j+=4) palette[i] = 'rgba(' + data[j] + ',' + data[j+1] + ',' + data[j+2] + ',' + data[j+3]/255 + ')';
   }

   return palette;
  };
 }

 ak.using('', define);
})();
