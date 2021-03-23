//AK/Approx/MedianSmooth.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.medianSmooth) return;

  function copyNodes(nodes) {
   var n = nodes.length;
   var copy = new Array(n);
   var i;

   for(i=0;i<n;++i) copy[i] = {x:nodes[i].x, y:nodes[i].y};
   return copy;
  }

  ak._unsafeMedianSmooth = function(x, nodes, neighbours) {
   var n = nodes.length;
   var k = neighbours.length;
   var compare_x = function(x0, x1){return ak.dist(x0.x, x)-ak.dist(x1.x, x);};
   var compare_y = function(x0, x1){return x0.y-x1.y;};
   var i = 0;
   var dk1, di, j;

   while(i<k) {neighbours[i] = nodes[i]; ++i;}
   neighbours.sort(compare_x);
   dk1 = ak.dist(neighbours[k-1].x, x);

   compare_x = function(xj, d){return ak.dist(xj.x, x)-d;};

   while(i<n) {
    di = ak.dist(nodes[i].x, x);
    if(di<dk1) {
     j = ak._unsafeLowerBound(neighbours, di, compare_x, 0, k);
     neighbours.splice(j, 0, nodes[i]);
     neighbours.pop();
     dk1 = ak.dist(neighbours[k-1].x, x);
    }
    ++i;
   }
   if(k%2===1) {
    ak.partialSort(neighbours, (k+1)/2, compare_y);
    return neighbours[(k-1)/2].y;
   }
   ak.partialSort(neighbours, k/2+1, compare_y);
   return 0.5*(neighbours[(k/2-1)].y + neighbours[(k/2)].y);
  };

  ak.medianSmooth = function() {
   var state = {nodes:[], k:undefined};
   var arg0 = arguments[0];
   var neighbours, f;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);
   neighbours = new Array(state.k);

   f = function(x) {
    return ak._unsafeMedianSmooth(x, state.nodes, neighbours);
   };
   f.nodes = function() {return copyNodes(state.nodes);};
   f.k = function() {return state.k;};
   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, arg0, args) {
   var arg1 = args[1];
   constructors[ak.ARRAY_T][ak.nativeType(arg1)](state, arg0, arg1, args);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T] = function(state, x, y, args) {
   var arg2 = args[2];
   constructors[ak.ARRAY_T][ak.ARRAY_T][ak.nativeType(arg2)](state, x, y, arg2, args);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T][ak.NUMBER_T] = function(state, x, y, k) {
   var n = x.length;
   var i, xi, yi;

   if(y.length!==n) throw new Error('size mismatch in ak.medianSmooth');

   if(k<1 || k!==ak.floor(k) || k>n) throw new Error('invalid window in ak.medianSmooth');
   state.k = k;

   state.nodes.length = n;
   for(i=0;i<n;++i) {
    xi = x[i];
    yi = Number(y[i]);
    if(!isFinite(yi)) throw new Error('invalid node value in ak.medianSmooth');
    state.nodes[i] = {x:xi, y:yi};
   }
  };

  constructors[ak.ARRAY_T][ak.NUMBER_T] = function(state, nodes, k) {
   var n = nodes.length;
   var i, x, y;

   if(k<1 || k!==ak.floor(k) || k>n) throw new Error('invalid window in ak.medianSmooth');
   state.k = k;

   state.nodes.length = n;

   for(i=0;i<n;++i) {
    x = nodes[i].x; if(ak.nativeType(x)===ak.FUNCTION_T) x = x();
    y = nodes[i].y; if(ak.nativeType(y)===ak.FUNCTION_T) y = y();
    y = Number(y);
    if(!isFinite(y)) throw new Error('invalid node value in ak.medianSmooth');
    state.nodes[i] = {x:x, y:y};
   }
  };
 }

 ak.using(['Algorithm/LowerBound.js','Algorithm/PartialSort.js'], define);
})();