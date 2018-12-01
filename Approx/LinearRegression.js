//AK/Approx/LinearRegression.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.linearRegression) return;

  function makeWeights(state) {
   var rows = state.nodes.length;
   var cols = state.regressors.length;
   var y = new Array(rows);
   var a = new Array(rows*cols);
   var i = 0;
   var r, c, x;

   for(r=0;r<rows;++r) {
    x = state.nodes[r].x;
    y[r] = state.nodes[r].y;
    for(c=0;c<cols;++c) a[i++] = state.regressors[c](x);
   }

   y = ak.vector(y);
   a = ak.matrix(rows, cols, a);
   state.weights = ak.mul(ak.leftInv(a), y).toArray();
  }

  function copyNodes(nodes) {
   var n = nodes.length;
   var copy = new Array(n);
   var i;

   for(i=0;i<n;++i) copy[i] = {x:nodes[i].x, y:nodes[i].y};
   return copy;
  }

  ak.linearRegression = function() {
   var state = {nodes:[], regressors:[], weights:[]};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);
   makeWeights(state);

   f = function(x) {
    var n = state.regressors.length;
    var y = 0;
    while(n-->0) y += state.weights[n]*state.regressors[n](x);
    return y;
   };
   f.nodes = function() {return copyNodes(state.nodes);};
   f.regressors = function() {return state.regressors.slice(0);};
   f.weights = function() {return state.weights.slice(0);};
   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, arg0, args) {
   var arg1 = args[1];
   constructors[ak.ARRAY_T][ak.nativeType(arg1)](state, arg0, arg1, args);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T] = function(state, arg0, arg1, args) {
   var arg2 = args[2];
   constructors[ak.ARRAY_T][ak.ARRAY_T][ak.nativeType(arg2)](state, arg0, arg1, arg2);
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T] = function(state, arg0, arg1, args) {
   var arg2 = args[2];
   constructors[ak.ARRAY_T][ak.FUNCTION_T][ak.nativeType(arg2)](state, arg0, arg1, arg2);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T][ak.ARRAY_T] = function(state, x, y, f) {
   var n = x.length;
   var i, yi;

   if(y.length!==n || f.length>n) throw new Error('size mismatch in ak.linearRegression');

   state.nodes.length = n;
   for(i=0;i<n;++i) {
    yi = Number(y[i]);
    if(!isFinite(yi)) throw new Error('invalid node value in ak.linearRegression');
    state.nodes[i] = {x:x[i], y:yi};
   }

   n = f.length;
   for(i=0;i<n;++i) {
    if(ak.nativeType(f[i])!==ak.FUNCTION_T) throw new Error('invalid regressor in ak.linearRegression');
   }
   state.regressors = f.slice(0);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T][ak.UNDEFINED_T] = function(state, nodes, f) {
   var n = nodes.length;
   var i, x, y;

   if(f.length>n) throw new Error('size mismatch in ak.linearRegression');

   state.nodes.length = n;

   for(i=0;i<n;++i) {
    x = nodes[i].x; if(ak.nativeType(x)===ak.FUNCTION_T) x = x();
    y = nodes[i].y; if(ak.nativeType(y)===ak.FUNCTION_T) y = y();
    y = Number(y);
    if(!isFinite(y)) throw new Error('invalid node value in ak.linearRegression');
    state.nodes[i] = {x:x, y:y};
   }

   n = f.length;
   for(i=0;i<n;++i) {
    if(ak.nativeType(f[i])!==ak.FUNCTION_T) throw new Error('invalid regressor in ak.linearRegression');
   }
   state.regressors = f.slice(0);
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T][ak.ARRAY_T] = function(state, x, y, f) {
   var n = x.length;
   var i, xi, yi;

   if(f.length>n) throw new Error('size mismatch in ak.linearRegression');

   state.nodes.length = n;
   for(i=0;i<n;++i) {
    xi = x[i];
    yi = Number(y(xi));
    if(!isFinite(yi)) throw new Error('invalid node value in ak.linearRegression');
    state.nodes[i] = {x:xi, y:yi};
   }

   n = f.length;
   for(i=0;i<n;++i) {
    if(ak.nativeType(f[i])!==ak.FUNCTION_T) throw new Error('invalid regressor in ak.linearRegression');
   }
   state.regressors = f.slice(0);
  };

  function makeMultiRegressors(n, f) {
   if(n===-1) {
    f[0] = function(x) {return 1;};
   }
   else {
    f[n+1] = function(x) {return x.at(n);};
    makeMultiRegressors(n-1, f);
   }
  }

  ak.linearRegressors = function(n) {
   var f = [];
   switch(ak.nativeType(n)) {
    case ak.NUMBER_T:
     if(n!==ak.floor(n) || n<0) throw new Error('invalid argument in ak.linearRegressors');
     f.length = n+1;
     makeMultiRegressors(n-1, f);
     break;

    case ak.UNDEFINED_T:
     f.length = 2;
     f[1] = function(x) {return x;};
     f[0] = function(x) {return 1;};
     break;

    default:
     throw new Error('invalid argument in ak.linearRegressors');
   }
   return f;
  };
 }

 ak.using('Matrix/Matrix.js', define);
})();