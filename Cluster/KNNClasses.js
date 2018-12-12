//AK/Cluster/KNNClasses.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.knnClasses) return;

  function classifyWeighted(neighbours, memberships, n, weights, sum) {
   var k = neighbours.length;
   var classes = new Array(n);
   var scale = 1/sum;
   var i;

   for(i=0;i<n;++i) classes[i] = 0;
   for(i=0;i<k;++i) classes[memberships.at(neighbours[i])] += weights[i]*scale;
   return classes;
  }

  function classifyUniform(neighbours, memberships, n) {
   var k = neighbours.length;
   var classes = new Array(n);
   var scale = 1/k;
   var i;

   for(i=0;i<n;++i) classes[i] = 0;
   for(i=0;i<k;++i) classes[memberships.at(neighbours[i])] += scale;
   return classes;
  }

  ak.knnClasses = function(candidates, arg1, arg2, arg3, arg4) {
   var t0 = ak.type(candidates);
   var sum = 0;
   var t1, data, clusters, memberships, weights, wi, neighbours, classes, i;

   if(t0!==ak.ARRAY_T && t0!==ak.CLUSTER_DATA_T) throw new Error('invalid candidates in ak.knnClasses');

   t1 = ak.type(arg1);
   if(t1===ak.ARRAY_T || t1===ak.CLUSTER_DATA_T) {
    data = arg1;
    if(ak.type(arg2)!==ak.CLUSTERING_T) throw new Error('invalid clustering in ak.knnClasses');
    clusters = arg2.clusters;
    memberships = arg2.memberships;
    arg2 = arg3; arg3 = arg4;
   }
   else if(t1===ak.CLUSTERING_T) {
    data = arg1.data;
    clusters = arg1.clusters;
    memberships = arg1.memberships;
   }
   else throw new Error('invalid clustering in ak.knnClasses');

   if(ak.nativeType(arg2)===ak.ARRAY_T) {
    weights = arg2;
    for(i=0;i<weights.length;++i) {
     wi = weights[i];
     if(ak.nativeType(wi)!==ak.NUMBER_T || wi<0 || !isFinite(wi)) throw new Error('invalid weight in ak.knnClasses');
     sum += wi;
    }
    if(!isFinite(sum)) throw new Error('non-finite weight in ak.knnClasses');
    arg2 = weights.length;
   }

   neighbours = ak.nearestNeighbours(candidates, data, arg2, arg3);
   classes = new Array(candidates.length);

   if(sum>0) {
    for(i=0;i<candidates.length;++i) classes[i] = classifyWeighted(neighbours[i], memberships, clusters.size(), weights, sum);
   }
   else {
    for(i=0;i<candidates.length;++i) classes[i] = classifyUniform(neighbours[i], memberships, clusters.size());
   }
   return classes;
  };
 }

 ak.using('Cluster/NearestNeighbours.js', define);
})();