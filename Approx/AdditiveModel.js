//AK/Approx/AdditiveModel.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.additiveModel) return;

  function copyNodes(nodes) {
   var n = nodes.length;
   var copy = new Array(n);
   var i;

   for(i=0;i<n;++i) copy[i] = {x:nodes[i].x, y:nodes[i].y};
   return copy;
  }

  function checkNodes(nodes) {
   var n = nodes.length;
   var node, xi, yi, dims, i, j;

   if(n===0) throw new Error('empty nodes in ak.additiveModel');
   node = nodes[0];
   xi = node.x;
   yi = node.y;
   dims = xi.dims();

   if(dims===0) throw new Error('empty node location in ak.additiveModel');
   for(j=0;j<dims;++j) if(!isFinite(xi.at(j))) throw new Error('invalid node location in ak.additiveModel');
   if(!isFinite(yi)) throw new Error('invalid node value in ak.additiveModel');

   for(i=1;i<n;++i) {
    node = nodes[i];
    xi = node.x;
    yi = node.y;
    if(xi.dims()!==dims) throw new Error('node location dimension mismatch in ak.additiveModel');
    for(j=0;j<dims;++j) if(!isFinite(xi.at(j))) throw new Error('invalid node location in ak.additiveModel');
    if(!isFinite(yi)) throw new Error('invalid node value in ak.additiveModel');
   }
   return dims;
  }

  function makeNodesX(nodes, dims) {
   var n = nodes.length;
   var nodesX = new Array(dims);
   var i, j, xi;

   xi = nodes[0].x;
   for(j=0;j<dims;++j) {
    nodesX[j] = new Array(n);
    nodesX[j][0] = xi.at(j);
   }

   for(i=1;i<n;++i) {
    xi = nodes[i].x;
    for(j=0;j<dims;++j) nodesX[j][i] = xi.at(j);
   }
   return nodesX;
  }

  function makeNodesY(nodes, mean) {
   var n = nodes.length;
   var nodesY = new Array(n);
   var i;

   for(i=0;i<n;++i) nodesY[i] = nodes[i].y - mean;
   return nodesY;
  }

  function normalisedSmoother(smoother, xj) {
   var n = xj.length;
   var off = 0;
   var i;

   for(i=0;i<n;++i) off += smoother(xj[i]);
   off /= n;
   if(!isFinite(off)) throw new Error('smoother value mean overflow in ak.additiveModel');

   return function(x) {
    return smoother(x) - off;
   };
  }

  function modelError(smoothers, nodesX, nodesY) {
   var dims = nodesX.length;
   var n = nodesY.length;
   var err = 0;
   var i, j, yi;

   for(i=0;i<n;++i) {
    yi = 0;
    for(j=0;j<dims;++j) yi += smoothers[j](nodesX[j][i]);
    err += Math.pow(yi-nodesY[i], 2);
   }
   return Math.sqrt(err/n);
  }

  function initSmoothers(smoothers, nodesX, nodesY, smoother, smootherArgs) {
   var resY = nodesY.slice(0);
   var dims = nodesX.length;
   var n = nodesY.length;
   var i, j, argsj, xj, fj;

   for(j=0;j<dims;++j) {
    xj = nodesX[j];
    argsj = smootherArgs.slice(0);
    argsj.unshift(xj, resY);
    fj = normalisedSmoother(smoother.apply(null, argsj), xj);
    for(i=0;i<n;++i) resY[i] -= fj(xj[i]);
    smoothers[j] = fj;
   }
   return modelError(smoothers, nodesX, nodesY);
  }

  function refineSmoothers(smoothers, nodesX, nodesY, smoother, smootherArgs) {
   var dims = nodesX.length;
   var n = nodesY.length;
   var i, j, k, resY, xj, xk, fk, argsj;

   for(j=0;j<dims;++j) {
    resY = nodesY.slice(0);

    for(k=0;k<dims;++k) if(k!==j) {
     xk = nodesX[k];
     fk = smoothers[k];
     for(i=0;i<n;++i) resY[i] -= fk(xk[i]);
    }

    argsj = smootherArgs.slice(0);
    argsj.unshift(nodesX[j], resY);
    smoothers[j] = normalisedSmoother(smoother.apply(null, argsj), nodesX[j]);
   }
   return modelError(smoothers, nodesX, nodesY);
  }

  function backfitSmoothers(nodesX, nodesY, smoother, smootherArgs, threshold) {
   var smoothers = new Array(nodesX.length);
   var err1 = initSmoothers(smoothers, nodesX, nodesY, smoother, smootherArgs);
   var err0;

   do {
    err0 = err1;
    err1 = refineSmoothers(smoothers, nodesX, nodesY, smoother, smootherArgs);
   }
   while(ak.diff(err1, err0)>threshold);

   return smoothers;
  }

  ak.additiveModel = function() {
   var state = {nodes: [], threshold: ak.UNDEFINED_T};
   var arg0  = arguments[0];
   var dims, n, i, mean, nodesX, nodesY, smoothers, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   if(ak.nativeType(state.smootherArgs)===ak.UNDEFINED_T)  state.smootherArgs = [];
   else if(ak.nativeType(state.smootherArgs)!==ak.ARRAY_T) state.smootherArgs = [state.smootherArgs];

   if(ak.nativeType(state.threshold)!==ak.UNDEFINED_T) {
    state.threshold = Math.abs(state.threshold);
    if(isNaN(state.threshold)) throw new Error('invalid convergence threshold in ak.additiveModel');
   }
   else state.threshold = 1e-7;

   dims = checkNodes(state.nodes);

   n = state.nodes.length;
   mean = 0;
   for(i=0;i<n;++i) mean += state.nodes[i].y;
   mean /= n;
   if(!isFinite(mean)) throw new Error('node value mean overflow in ak.additiveModel');

   nodesX = makeNodesX(state.nodes, dims);
   nodesY = makeNodesY(state.nodes, mean);

   smoothers = backfitSmoothers(nodesX, nodesY, state.smoother, state.smootherArgs, state.threshold);

   f = function(x) {
    var i, y;

    if(ak.type(x)!==ak.VECTOR_T || x.dims()!==dims) throw new Error('invalid argument in ak.additiveMode');

    y = mean;
    for(i=0;i<dims;++i) y += smoothers[i](x.at(i));
    return y;
   }
   f.nodes = function () {return copyNodes(state.nodes)};
   Object.freeze(f);
   return f;
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, arg0, args) {
   var arg1 = args[1];
   constructors[ak.ARRAY_T][ak.nativeType(arg1)](state, arg0, arg1, args);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T] = function(state, arg0, arg1, args) {
   var arg2 = args[2];
   constructors[ak.ARRAY_T][ak.ARRAY_T][ak.nativeType(arg2)](state, arg0, arg1, arg2, args[3], args[4]);
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T] = function(state, arg0, arg1, args) {
   var arg2 = args[2];
   if(ak.nativeType(arg2)===ak.FUNCTION_T) constructors[ak.ARRAY_T][ak.FUNCTION_T][ak.FUNCTION_T](state, arg0, arg1, arg2, args[3], args[4]);
   else                                    constructors[ak.ARRAY_T][ak.FUNCTION_T][ak.UNDEFINED_T](state, arg0, arg1, arg2, args[3]);
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T][ak.FUNCTION_T] = function(state, x, f, smoother, smootherArgs, threshold) {
   var n = x.length;
   var i, xi, yi;
   state.nodes.length = n;
   for(i=0;i<n;++i) {
    xi = x[i];  if(ak.type(xi)!==ak.VECTOR_T)       throw new Error('invalid node locations in ak.additiveModel');
    yi = f(xi); if(ak.nativeType(yi)!==ak.NUMBER_T) throw new Error('invalid node values in ak.additiveModel');
    state.nodes[i] = {x:xi, y:Number(yi)};
   }
   state.smoother = smoother;
   state.smootherArgs = smootherArgs;
   state.threshold = threshold;
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T][ak.FUNCTION_T] = function(state, x, y, smoother, smootherArgs, threshold) {
   var n = x.length;
   var i, xi, yi;

   if(y.length!==n) throw new Error('node locations and values size mismatch in ak.additiveModel');

   state.nodes.length = n;
   for(i=0;i<n;++i) {
    xi = x[i]; if(ak.type(xi)!==ak.VECTOR_T)       throw new Error('invalid node locations in ak.additiveModel');
    yi = y[i]; if(ak.nativeType(yi)!==ak.NUMBER_T) throw new Error('invalid node values in ak.additiveModel');
    state.nodes[i] = {x:xi, y:Number(yi)};
   }
   state.smoother = smoother;
   state.smootherArgs = smootherArgs;
   state.threshold = threshold;
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T][ak.UNDEFINED_T] = function(state, nodes, smoother, smootherArgs, threshold) {
   var n = nodes.length;
   var i, x, y;
   state.nodes.length = n;
   for(i=0;i<n;++i) {
    x = nodes[i].x; if(ak.nativeType(x)===ak.FUNCTION_T) x = x();
    y = nodes[i].y; if(ak.nativeType(y)===ak.FUNCTION_T) y = y();
    if(ak.type(x)!==ak.VECTOR_T)       throw new Error('invalid node locations in ak.additiveModel');
    if(ak.nativeType(y)!==ak.NUMBER_T) throw new Error('invalid node values in ak.additiveModel');
    state.nodes[i] = {x:x, y:Number(y)};
   }
   state.smoother = smoother;
   state.smootherArgs = smootherArgs;
   state.threshold = threshold;
  };
 }

 ak.using('Matrix/Vector.js', define);
})();