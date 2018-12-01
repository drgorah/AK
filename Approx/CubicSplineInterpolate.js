//AK/Approx/CubicSplineInterpolate.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.cubicSplineInterpolate) return;

  function prepareNodes(nodes) {
   var n = nodes.length;
   var i;

   if(n<2) throw new Error('too few nodes in ak.cubicSplineInterpolate');

   for(i=0;i<n;++i) {
    if(!isFinite(nodes[i].x) || !isFinite(nodes[i].y)) throw new Error('invalid node in ak.cubicSplineInterpolate');
   }

   nodes.sort(function(l, r){return l.x-r.x;});

   for(i=1;i<n;++i) {
    if(nodes[i].x===nodes[i-1].x) throw new Error('duplicate node in ak.cubicSplineInterpolate');
    nodes[i-1].dx = nodes[i].x-nodes[i-1].x;
    nodes[i-1].dy = nodes[i].y-nodes[i-1].y;
   }
  }

  function calcDerivs(state) {
   var n = state.nodes.length;
   var i, d0, d1;

   if(ak.nativeType(state.nodes[0].g)===ak.UNDEFINED_T) {
    state.nodes[0].g = (state.nodes[1].y-state.nodes[0].y)/(state.nodes[1].x-state.nodes[0].x);
   }

   for(i=1;i<n-1;++i) {
    if(ak.nativeType(state.nodes[i].g)===ak.UNDEFINED_T) {
      d0 = (state.nodes[i].y-state.nodes[i-1].y)/(state.nodes[i].x-state.nodes[i-1].x);
      d1 = (state.nodes[i+1].y-state.nodes[i].y)/(state.nodes[i+1].x-state.nodes[i].x);
      state.nodes[i].g = 0.5*d0+0.5*d1;
    }
   }

   if(ak.nativeType(state.nodes[n-1].g)===ak.UNDEFINED_T) {
    state.nodes[n-1].g = (state.nodes[n-1].y-state.nodes[n-2].y)/(state.nodes[n-1].x-state.nodes[n-2].x);
   }

   for(i=0;i<n;++i) {
    state.nodes[i].g = Number(state.nodes[i].g);
    if(!isFinite(state.nodes[i].g)) throw new Error('invalid node in ak.cubicSplineInterpolate');
   }
  }

  function interpolatePair(x, nodes, lb) {
   var n0 = nodes[lb];
   var n1 = nodes[lb+1];
   var x0 = x-n0.x;
   var x1 = n1.x-x;
   var t0 = x0/n0.dx;
   var t1 = x1/n0.dx;
   return n1.y*t0 + n0.y*t1 - t0*t1*(x0*n1.g - x1*n0.g + n0.dy*(t1-t0));
  }

  function jumpLBFwd(x, state) {
   var n = state.nodes.length;
   var i = Math.min(ak.floor(n*((x-state.x0)/state.dx)), n-2);

   if(x<state.nodes[i].x) {if(i>0) --i;}
   else if(x>state.nodes[i+1].x) {if(i<n-2) ++i;}
   state.lb = i;
  }

  function jumpLBRev(x, state) {
   var n = state.nodes.length;
   var i = Math.max(ak.floor(n*((x-state.x0)/state.dx)), 0);

   if(x<state.nodes[i].x) {if(i>0) --i;}
   else if(x>state.nodes[i+1].x) {if(i<n-2) ++i;}
   state.lb = i;
  }

  function jumpLB(x, state) {
   x = Number(x);
   if(x>state.nodes[state.lb+1].x) {
    if(state.lb<state.nodes.length-2) jumpLBFwd(x, state);
   }
   else if(x<state.nodes[state.lb].x) {
    if(state.lb>0) jumpLBRev(x, state);
   }
   return x;
  }

  function canJump(state) {
   var n = state.nodes.length;
   var x0 = state.nodes[0].x;
   var dx = state.nodes[n-1].x-x0;
   var i, j;

   for(i=1;i<n-1;++i) {
    j = ak.floor(n*((state.nodes[i].x-x0)/dx));
    if(j<i-1 || j>i) return false;
   }
   state.x0 = x0;
   state.dx = dx;
   return true;
  }

  function compare(l, r) {
   return l.x-r;
  }

  function findLBFwd(x, state) {
   if(++state.lb<state.nodes.length-2 && x>state.nodes[state.lb+1].x) {
    state.lb = ak._unsafeLowerBound(state.nodes, x, compare, state.lb+2, state.nodes.length-1)-1;
   }
  }

  function findLBRev(x, state) {
   if(--state.lb>0 && x<state.nodes[state.lb].x) {
    state.lb = ak._unsafeLowerBound(state.nodes, x, compare, 1, state.lb)-1;
   }
  }

  function findLB(x, state) {
   x = Number(x);
   if(x>state.nodes[state.lb+1].x) {
    if(state.lb<state.nodes.length-2) findLBFwd(x, state);
   }
   else if(x<state.nodes[state.lb].x) {
    if(state.lb>0) findLBRev(x, state);
   }
   return x;
  }

  function copyNodes(nodes) {
   var n = nodes.length;
   var copy = new Array(n);
   var i;

   for(i=0;i<n;++i) copy[i] = {x:nodes[i].x, y:nodes[i].y, g:nodes[i].g};
   return copy;
  }

  ak.cubicSplineInterpolate = function() {
   var state = {nodes:[], lb:0};
   var arg0  = arguments[0];
   var f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);
   prepareNodes(state.nodes);
   calcDerivs(state);

   if(state.nodes.length===2) {
    f = function(x) {return interpolatePair(Number(x), state.nodes, 0);};
   }
   else if(state.nodes.length===3) {
    f = function(x) {x=Number(x); return interpolatePair(x, state.nodes, x<state.nodes[1].x ? 0 : 1);};
   }
   else if(canJump(state)) {
    f = function(x) {return interpolatePair(jumpLB(x, state), state.nodes, state.lb);};
   }
   else {
    f = function(x) {return interpolatePair(findLB(x, state), state.nodes, state.lb);};
   }
   f.nodes = function() {return copyNodes(state.nodes);};
   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, nodes, args) {
   var arg1 = args[1];
   constructors[ak.ARRAY_T][ak.nativeType(arg1)](state, nodes, arg1, args);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T] = function(state, x, y, args) {
   var arg2 = args[2];
   var n = x.length;
   var i;
   if(y.length!==n) throw new Error('node size mismatch in ak.cubicSplineInterpolate');
   state.nodes.length = n;
   for(i=0;i<n;++i) state.nodes[i] = {x:Number(x[i]), y:Number(y[i])};
   constructors[ak.ARRAY_T][ak.ARRAY_T][ak.nativeType(arg2)](state, n, arg2);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T][ak.ARRAY_T] = function(state, n, g) {
   var i;
   if(g.length!==n) throw new Error('node size mismatch in ak.cubicSplineInterpolate');
   for(i=0;i<n;++i) state.nodes[i].g = g[i];
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T] = function(state, x, f, args) {
   var arg2 = args[2];
   var n = x.length;
   var i, xi;
   state.nodes.length = n;
   for(i=0;i<n;++i) {
    xi = Number(x[i]);
    state.nodes[i] = {x:xi, y:Number(f(xi))};
   }
   constructors[ak.ARRAY_T][ak.FUNCTION_T][ak.nativeType(arg2)](state, n, arg2);
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T][ak.FUNCTION_T] = function(state, n, df) {
   var i;
   for(i=0;i<n;++i) state.nodes[i].g = df(state.nodes[i].x);
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.ARRAY_T][ak.UNDEFINED_T] = function(state, nodes) {
   var n = nodes.length;
   var i, x, y, g;
   state.nodes.length = n;
   for(i=0;i<n;++i) {
    x = nodes[i].x; if(ak.nativeType(x)===ak.FUNCTION_T) x = x();
    y = nodes[i].y; if(ak.nativeType(y)===ak.FUNCTION_T) y = y();
    g = nodes[i].g; if(ak.nativeType(g)===ak.FUNCTION_T) g = g();
    state.nodes[i] = {x:Number(x), y:Number(y), g:g};
   }
  };
 }

 ak.using('Algorithm/LowerBound.js', define);
})();