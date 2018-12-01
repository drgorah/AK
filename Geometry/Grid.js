//AK/Geometry/Grid.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.GRID_T) return;
  ak.GRID_T = 'ak.grid';

  function sortAxis(axis) {
   var n = axis.length;
   var i;

   if(n===0) throw new Error('empty axis in ak.grid');

   for(i=0;i<n;++i) {
    axis[i] = Number(axis[i]);
    if(isNaN(axis[i])) throw new Error('invalid axis value in ak.grid');
   }
   axis.sort(function(l,r){return l===r ? 0 : l-r;});
   for(i=1;i<n;++i) {
    if(axis[i]===axis[i-1]) throw new Error('duplicate axis value in ak.grid');
   }
  }

  function mapAxes(axes, index) {
   var n = axes.length;
   if(ak.nativeType(index)!==ak.ARRAY_T || index.length!==n) throw new Error('invalid index in ak.grid.map');
   index = index.slice(0);
   while(n-->0) index[n] = axes[n][index[n]];
   return ak.vector(index);
  }

  function toString(axes, f) {
   var s = [];
   var n = axes.length;
   var i, j, a, m;

   s.push('[');

   for(i=0;i<n;++i) {
    a = axes[i];
    m = a.length;

    s.push('[');

    for(j=0;j<m;++j) {
     s.push(f ? f(a[j]) : a[j]);
     s.push(',');
    }

    s.pop();
    s.push(']');
    s.push(',');
   }

   s.pop();
   s.push(']');

   return s.join('');
  }

  function Grid(){}
  Grid.prototype = {TYPE: ak.GRID_T, valueOf: function(){return ak.NaN;}};

  ak.grid = function() {
   var g = new Grid();
   var state = [];
   var arg0  = arguments[0];

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   g.dims = function() {return state.length;};
   g.length = function(i) {return state[i].length;};
   g.lengths = function() {return state.map(function(a){return a.length;});};
   g.axis = function(i) {return state[i].slice(0);};
   g.axes = function() {return state.map(function(a){return a.slice(0);});};
   g.at = function(i, j) {return state[i][j];};
   g.map = function(a) {return mapAxes(state, a);};

   g.toArray  = g.axes;
   g.toString = function() {return toString(state);};

   g.toExponential = function(d) {return toString(state, function(x){return x.toExponential(d);});};
   g.toFixed       = function(d) {return toString(state, function(x){return x.toFixed(d);});};
   g.toPrecision   = function(d) {return toString(state, function(x){return x.toPrecision(d);});};

   return Object.freeze(g);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, axes) {
   var n = axes.length;
   if(n===0) throw new Error('empty axes in ak.grid');

   state.length = n;
   while(n-->0) {
    if(ak.nativeType(axes[n])!==ak.ARRAY_T) throw new Error('invalid axis in ak.grid');
    state[n] = axes[n].slice(0);
    sortAxis(state[n]);
   }
  };

  constructors[ak.NUMBER_T] = function(state, n, args) {
   var axis = args[1];

   if(n<=0 || n!==ak.floor(n)) throw new Error('invalid dimension in ak.grid');
   if(ak.nativeType(axis)!==ak.ARRAY_T) throw new Error('invalid axis in ak.grid');
   axis = axis.slice(0);
   sortAxis(axis);

   state.length = n;
   while(n-->0) state[n] = axis;
  };

  constructors[ak.OBJECT_T] = function(state, grid) {
   var n = grid.dims;
   var m, axis;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);
   if(n<=0 || n!==ak.floor(n)) throw new Error('invalid dimension in ak.grid');

   state.length = n;
   while(n-->0) {
    m = Number(grid.length(n));
    if(m<=0 || m!==ak.floor(m)) throw new Error('invalid axis length in ak.grid');
    axis = new Array(m);
    while(m-->0) axis[m] = grid.at(n, m);
    sortAxis(axis);
    state[n] = axis;
   }
  };
 }

 ak.using('Matrix/Vector.js', define);
})();