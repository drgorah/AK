//AK/Approx/LinearInterpolate.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.linearInterpolate) return;

  function prepareNodes(nodes) {
   var n = nodes.length;
   var i, t;

   if(n<2) throw new Error('too few nodes in ak.linearInterpolate');

   for(i=0;i<n;++i) {
    if(!isFinite(nodes[i].x)) throw new Error('invalid node in ak.linearInterpolate');
   }

   nodes.sort(function(l, r){return l.x-r.x;});

   t = ak.type(nodes[0].y);
   for(i=1;i<n;++i) {
    if(nodes[i].x===nodes[i-1].x) throw new Error('duplicate node in ak.linearInterpolate');
    if(ak.type(nodes[i].y)!==t) throw new Error('node type mismatch in ak.linearInterpolate');
    nodes[i-1].dx = nodes[i].x-nodes[i-1].x;
   }
   return t;
  }

  function interpolatePair(t) {
   var add, mul;

   if(t===ak.NUMBER_T) {
    return function(x, nodes, lb) {
     var n0 = nodes[lb];
     var n1 = nodes[lb+1];
     return ((x-n0.x)/n0.dx)*n1.y + ((n1.x-x)/n0.dx)*n0.y;
    };
   }

   try{add=ak.add[t][t]; mul=ak.mul[ak.NUMBER_T][t];} catch(e){}

   if(ak.nativeType(add)!==ak.FUNCTION_T || ak.nativeType(mul)!==ak.FUNCTION_T) {
    throw new Error('non-arithmetic node type in ak.linearInterpolate');
   }

   return function(x, nodes, lb) {
    var n0 = nodes[lb];
    var n1 = nodes[lb+1];
    return add(mul((x-n0.x)/n0.dx, n1.y), mul((n1.x-x)/n0.dx, n0.y));
   };
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

   for(i=0;i<n;++i) copy[i] = {x:nodes[i].x, y:nodes[i].y};
   return copy;
  }

  ak.linearInterpolate = function() {
   var state = {nodes:[], lb:0};
   var arg0  = arguments[0];
   var interPair, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);
   interPair = interpolatePair(prepareNodes(state.nodes));

   if(state.nodes.length===2) {
    f = function(x) {return interPair(Number(x), state.nodes, 0);};
   }
   else if(state.nodes.length===3) {
    f = function(x) {x=Number(x); return interPair(x, state.nodes, x<state.nodes[1].x ? 0 : 1);};
   }
   else if(canJump(state)) {
    f = function(x) {return interPair(jumpLB(x, state), state.nodes, state.lb);};
   }
   else {
    f = function(x) {return interPair(findLB(x, state), state.nodes, state.lb);};
   }
   f.nodes = function() {return copyNodes(state.nodes);};
   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, nodes, args) {
   var arg1 = args[1];
   constructors[ak.ARRAY_T][ak.nativeType(arg1)](state, nodes, arg1);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T] = function(state, x, y) {
   var n = x.length;
   var i;
   if(y.length!==n) throw new Error('node size mismatch in ak.linearInterpolate');
   state.nodes.length = n;
   for(i=0;i<n;++i) state.nodes[i] = {x:Number(x[i]), y:y[i]};
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T] = function(state, x, f) {
   var n = x.length;
   var i, xi;
   state.nodes.length = n;
   for(i=0;i<n;++i) {
    xi = Number(x[i]);
    state.nodes[i] = {x:xi, y:f(xi)};
   }
  };

  constructors[ak.ARRAY_T][ak.UNDEFINED_T] = function(state, nodes) {
   var n = nodes.length;
   var i, x, y;
   state.nodes.length = n;
   for(i=0;i<n;++i) {
    x = nodes[i].x; if(ak.nativeType(x)===ak.FUNCTION_T) x = x();
    y = nodes[i].y; if(ak.nativeType(y)===ak.FUNCTION_T) y = y();
    state.nodes[i] = {x:Number(x), y:y};
   }
  };
 }

 ak.using('Algorithm/LowerBound.js', define);
})();