//AK/Cluster/ClusterDistortion.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.clusterDistortion) return;

  function offsets(c, d) {
   var n = c.size();
   var offs = new Array(n);
   var m, i;

   m = d.at(c.at(0));
   if(ak.type(m)!==ak.VECTOR_T) throw new Error('invalid argument in ak.clusterDistortion');
   for(i=1;i<n;++i) m = ak.add(m, d.at(c.at(i)));
   m = ak.div(m, n);

   for(i=0;i<n;++i) offs[i] = ak.sub(d.at(c.at(i)), m);
   return offs;
  }

  ak.clusterDistortion = function(c) {
   var dist = 0;
   var clusters, data, nc, nd, i, j, d, offs, cov, offi, inv;

   if(ak.type(c)!==ak.CLUSTERING_T || ak.type(c.data)===ak.UNDEFINED_T) throw new Error('invalid argument in ak.clusterDistortion');

   clusters = c.clusters;
   data = c.data;
   nc = clusters.size();
   nd = data.size();

   if(nd>1) {
    d = data.at(0).dims();
    offs = [];
    cov = ak.matrix(d, d, 0);

    for(i=0;i<nc;++i) {
     offi = offsets(clusters.at(i), data);
     offs.push.apply(offs, offi);
     for(j=0;j<offi.length;++j) offi[j] = offi[j].toArray();
     offi = ak.matrix(offi);
     cov = ak.add(cov, ak.div(ak.mul(ak.transpose(offi), offi), offi.rows()));
    }
    cov = ak.div(cov, nc);
    inv = ak.inv(ak.jacobiDecomposition(cov));

    for(i=0;i<nd;++i) dist += ak.mul(offs[i], ak.mul(inv, offs[i]));
    dist /= nd*d;
   }
   return dist;
  };
 }

 ak.using(['Cluster/Clustering.js', 'Matrix/JacobiDecomposition.js'], define);
})();