//AK/Cluster/SlinkClustering.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.slinkClustering) return;

  function initCache(dist) {
   var n = dist.length;
   var cache = new Array(n);
   var i, j, ci, d;

   for(i=0;i<n;++i) cache[i] = {c:[], d:ak.INFINITY};
   for(i=0;i<n-1;++i) {
    ci = cache[i];
    for(j=i+1;j<n;++j) {
     d = dist[i][j];
     if(d<ci.d) {ci.c = [j]; ci.d = d;}
     else if(d===ci.d) ci.c.push(j);
    }
   }
   return cache;
  }

  function updateDistances(dist, mappings) {
   var n = dist.length;
   var m = mappings.length;
   var i, j, mi, di0, di1;

   for(i=0;i<m;++i) {
    mi = mappings[i];
    di0 = dist[mi[0]];
    di1 = dist[mi[1]];
    for(j=0;j<n;++j) di0[j] = Math.min(di0[j], di1[j]);
   }
  }

  function cacheDistances(cache, mappings, memberships, dist) {
   var n = cache.length;
   var m = mappings.length;
   var i, j, mi, mi0, mi1, di0, di1, ci0, ci1, mj, di0j;

   for(i=0;i<m;++i) {
    mi = mappings[i];
    mi0 = mi[0]; di0 = dist[mi0]; ci0 = cache[mi0];
    mi1 = mi[1]; di1 = dist[mi1]; ci1 = cache[mi1];

    ci0.c.length = 0; ci0.d = ak.INFINITY;
    ci1.c.length = 0; ci1.d = ak.INFINITY;

    for(j=mi0+1;j<n;++j) {
     mj = memberships[j];
     if(mj>mi0) {
      di0j = di0[j];
      if(di0j<ci0.d) {ci0.c = [mj]; ci0.d = di0j;}
      else if(di0j===ci0.d && ci0.c.indexOf(mj)<0) ci0.c.push(mj);
     }
    }
   }
  }

  function cacheMappings(cache, mappings, memberships) {
   var n = cache.length;
   var m = mappings.length;
   var i, j, mi, mi0, mi1, cj, k;

   for(i=0;i<m;++i) {
    mi = mappings[i];
    mi0 = mi[0];
    mi1 = mi[1];

    for(j=0;j<mi0;++j) {
     cj = cache[j].c;
     k = cj.indexOf(mi1);
     if(k>=0) {
      if(cj.indexOf(mi0)<0) cj[k] = mi0;
      else {cj[k] = cj[cj.length-1]; cj.pop();}
     }
    }
   }
  }

  function updateCache(cache, mappings, memberships, dist) {
   cacheDistances(cache, mappings, memberships, dist);
   cacheMappings(cache, mappings, memberships);
  }

  function minDist(cache) {
   var n = cache.length;
   var min = ak.NaN;
   var i, d;

   for(i=0;i<n-1;++i) {
    d = cache[i].d;
    if(isNaN(min) || d<min) min = d;
   }
   return min;
  }

  function minMappings(min, cache, memberships) {
   var n = cache.length;
   var mappings = [];
   var i, mi, ci, ni, j;

   for(i=0;i<n-1;++i) {
    if(cache[i].d===min) {
     mi = memberships[i];
     ci = cache[i].c;
     ni = ci.length;
     for(j=0;j<ni;++j) mappings.push([mi, ci[j]]);
    }
   }
   return mappings;
  }

  function compressMappings(mappings) {
   var n = mappings.length;
   var i, j, mi, mj;

   for(i=0;i<n-1;++i) {
    mi = mappings[i];
    for(j=i+1;j<n;++j) {
     mj = mappings[j];
     if(mj[0]===mi[1])  mj[0] = mi[0];
     if(mj[1]===mi[1]) {mj[1] = mj[0]; mj[0] = mi[0];}
    }
   }
  }

  function mergeMappings(cache, memberships) {
   var dist = minDist(cache);
   var mappings = isNaN(dist) ? [] : minMappings(dist, cache, memberships);
   if(mappings.length>1) compressMappings(mappings);
   return mappings;
  }

  function mergeClusters(mappings, memberships) {
   var n = memberships.length;
   var m = mappings.length;
   var i, j;

   if(m===0) {
    for(i=0;i<n;++i) memberships[i] = 0;
   }
   else {
    for(i=0;i<m;++i) {
     for(j=0;j<n;++j) {
      if(memberships[j]===mappings[i][1]) memberships[j] = mappings[i][0];
     }
    }
   }
   return ak.rawClustering(memberships);
  }

  ak.slinkClustering = function(data, dist) {
   var clusters = [];
   var t = ak.type(data);
   var n, memberships, i, c, cache, mappings;

   if(t===ak.MATRIX_T) {
    dist = data;
    n = dist.rows();
    if(dist.cols()!==n) throw new Error('invalid distance matrix in ak.slinkClustering');
   }
   else if(t===ak.ARRAY_T) {
    n = data.length;
    if(ak.type(dist)!==ak.MATRIX_T) dist = ak.distanceMatrix(data, data, dist);
    else if(dist.rows()!==n || dist.cols()!==n) throw new Error('invalid distance matrix in ak.slinkClustering');
   }
   else throw new Error('invalid data in ak.slinkClustering');

   dist = dist.toArray();
   memberships = new Array(n);
   for(i=0;i<n;++i) memberships[i] = i;
   c = ak.rawClustering(memberships);
   clusters.push(c);
   cache = initCache(dist);

   while(c.clusters.size()>2) {
    mappings = mergeMappings(cache, memberships);
    c = mergeClusters(mappings, memberships);
    clusters.push(c);
    if(c.clusters.size()>2) {
     updateDistances(dist, mappings);
     updateCache(cache, mappings, memberships, dist);
    }
   }
   if(c.clusters.size()===2) {
    for(i=0;i<n;++i) memberships[i] = 0;
    clusters.push(memberships);
   }
   return t===ak.MATRIX_T ? ak.rawClusterings(clusters) : ak.rawClusterings(clusters, data);
  };
 };

 ak.using(['Algorithm/Compare.js', 'Cluster/Clusterings.js' ,'Cluster/DistanceMatrix.js'], define);
})();