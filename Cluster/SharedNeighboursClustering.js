//AK/Cluster/SharedNeighboursClustering.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.sharedNeighboursClustering) return;

  function mutual(neighbours, i, j) {
   return neighbours[i].indexOf(j)>=0 && neighbours[j].indexOf(i)>=0;
  }

  function shared(neighbours, i, j) {
   var ni = neighbours[i];
   var nj = neighbours[j];
   var n = ni.length;
   var t = 0;
   var i;

   for(i=0;i<n;++i) if(nj.indexOf(ni[i])>=0) ++t;
   return t;
  }

  function replace(memberships, j, i) {
   var k;
   for(k=0;k<=j;++k) if(memberships[k]===j) memberships[k] = i;
  }

  ak.sharedNeighboursClustering = function(data, k, t, f) {
   var n, neighbours, memberships, i, j;

   if(ak.nativeType(data)!==ak.ARRAY_T) throw new Error('invalid data in ak.sharedNeighbourClustering');
   n = data.length;

   if(ak.nativeType(k)!==ak.NUMBER_T || ak.floor(k)!==k || k<0 || k>n) throw new Error('invalid neighbourhood size in ak.sharedNeighbourClustering');
   if(ak.nativeType(t)!==ak.NUMBER_T || ak.floor(t)!==t || t<0 || t>k) throw new Error('invalid threshold in ak.sharedNeighbourClustering');

   neighbours = ak.nearestNeighbours(data, data, k, f);
   memberships = new Array(n);

   for(i=0;i<n;++i) {
    memberships[i] = i;
    for(j=0;j<i;++j) {
     if(mutual(neighbours, i, j) && shared(neighbours, i, j)>=t) replace(memberships, j, i);
    }
   }

   return ak.clustering(memberships, data);
  };
 };

 ak.using(['Cluster/NearestNeighbours.js', 'Cluster/Clustering.js'], define);
})();