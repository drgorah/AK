//AK/Cluster/ClusterVariance.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.withinClusterVariance) return;

  function clusterSum2(c, d) {
   var s2 = 0;
   var n = c.size();
   var m, i;

   if(n) {
    m = d.at(c.at(0));
    for(i=1;i<n;++i) m = ak.add(m, d.at(c.at(i)));
    m = ak.div(m, n);

    for(i=0;i<n;++i) s2 += Math.pow(ak.dist(m, d.at(c.at(i))), 2);
   }
   return s2;
  }

  function totalSum2(d) {
   var s2 = 0;
   var n = d.size();
   var m, i;

   if(n) {
    m = d.at(0);
    for(i=1;i<n;++i) m = ak.add(m, d.at(i));
    m = ak.div(m, n);

    for(i=0;i<n;++i) s2 += Math.pow(ak.dist(m, d.at(i)), 2);
   }
   return s2;
  }

  ak.withinClusterVariance = function(c) {
   var clusters, data, n, s2, i;

   if(ak.type(c)!==ak.CLUSTERING_T || ak.type(c.data)===ak.UNDEFINED_T) throw new Error('invalid argument in ak.withinClusterVariance');

   clusters = c.clusters;
   data = c.data;
   n = clusters.size();

   s2 = 0;
   for(i=0;i<n;++i) s2 += clusters.at(i).size() * clusterSum2(clusters.at(i), data);
   return s2 / Math.pow(data.size(), 2);
  };

  ak.betweenClusterVariance = function(c) {
   var clusters, data, n, s2, i;

   if(ak.type(c)!==ak.CLUSTERING_T || ak.type(c.data)===ak.UNDEFINED_T) throw new Error('invalid argument in ak.withinClusterVariance');

   clusters = c.clusters;
   data = c.data;
   n = clusters.size();

   s2 = data.size() * totalSum2(data);
   for(i=0;i<n;++i) s2 -= clusters.at(i).size() * clusterSum2(clusters.at(i), data);
   return s2 / Math.pow(data.size(), 2);
  };
 };

 ak.using('Cluster/Clustering.js', define);
})();