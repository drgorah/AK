//AK/Approx/NodeMarginals.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.nodeMarginals) return;

  function makeNodes(x, y) {
   var n, nodes, i;

   if(ak.nativeType(x)!==ak.ARRAY_T || ak.nativeType(x)!==ak.ARRAY_T) throw new Error('invalid nodes in ak.nodeMarginals');
   n = x.length;
   if(y.length!==n) throw new Error('location and value size mismatch in ak.nodeMarginals');

   nodes = new Array(n);
   for(i=0;i<n;++i) nodes[i] = {x: x[i], y: y[i]};
   return nodes;
  }

  ak.nodeMarginals = function() {
   var state = {nodes: []};
   var arg0  = arguments[0];
   var nodes, n, dims, marginals, i, j, x;

   constructors[ak.nativeType(arg0)](state, arg0, arguments);
   nodes = state.nodes;

???

   if(ak.nativeType(arg1)!==ak.UNDEFINED_T) {
    nodes = makeNodes(arg0, arg1);
   }
   else {
    nodes = arg0;
    if(ak.nativeType(nodes)!==ak.ARRAY_T) throw new Error('invalid nodes in ak.nodeMarginals');
   }

   n = nodes.length;
   if(n===0) throw new Error('empty nodes in ak.nodeMarginals');

   if(ak.type(nodes[0].x)!==ak.VECTOR_T)       throw new Error('invalid node location in ak.nodeMarginals');
   if(ak.nativeType(nodes[0].y)!==ak.NUMBER_T) throw new Error('invalid node value in ak.nodeMarginals');

   dims = nodes[0].x.dims();
   if(dims===0) throw new Error('empty node location in ak.nodeMarginals');

   marginals = new Array(dims);
   for(j=0;j<dims;++j) {
    marginals[j] = new Array(n);
    marginals[j][0] = {x: nodes[0].x.at(j), y: nodes[0].y};
   }

   for(i=1;i<n;++i) {
    if(ak.nativeType(nodes[i])!==ak.OBJECT_T)   throw new Error('invalid node in ak.nodeMarginals');
    if(ak.type(nodes[i].x)!==ak.VECTOR_T)       throw new Error('invalid node location in ak.nodeMarginals');
    if(ak.nativeType(nodes[i].y)!==ak.NUMBER_T) throw new Error('invalid node value in ak.nodeMarginals');

    dims = nodes[i].x.dims();
    if(dims===0) throw new Error('empty node location in ak.nodeMarginals');
    if(dims!==marginals.length) throw new Error('node location dimnension mismatch in ak.nodeMarginals'); 

    y = nodes[i].y;
    if(!isFinite(y)) throw new Error('non-finite node value element in ak.nodeMarginals');

    for(j=0;j<dims;++j) {
     x = nodes[i].x.at(j);
     if(!isFinite(x)) throw new Error('non-finite node location element in ak.nodeMarginals');
     marginals[j][i] = {x: x, y: y};
    }
   }
   for(j=0;j<dims;++j) marginals[j].sort(ak.numberCompare);

   return marginals;
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, nodes, args) {
   var arg1 = args[1];
   constructors[ak.ARRAY_T][ak.nativeType(arg1)](state, nodes, arg1);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T] = function(state, x, y) {
   var n = x.length;
   var i;
   if(y.length!==n) throw new Error('node size mismatch in ak.nodeMarginals');
   state.nodes.length = n;
   for(i=0;i<n;++i) state.nodes[i] = {x:x[i], y:y[i]};
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T] = function(state, x, f) {
   var n = x.length;
   var i, xi;
   state.nodes.length = n;
   for(i=0;i<n;++i) {
    xi = x[i];
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
    state.nodes[i] = {x:x, y:y};
   }
  };
 }

 ak.using(['Matrix/Vector.js', 'Algorithm/Compare.js'], define);
})();