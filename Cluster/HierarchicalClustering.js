//AK/Cluster/HierarchicalClustering.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.hierarchicalClustering) return;

  function cacheCompare(q0, q1) {return ak.floatCompare(q0.d, q1.d);}

  function cacheElement(c, i, f) {
   var ci = c.at(i);
   var qi = [];
   var n = c.size();
   var j, cj;

   for(j=i+1;j<n;j++) {cj = c.at(j); qi.push({c:cj, d:f(ci, cj)});}
   return {c:ci, q:ak.minHeap(qi, cacheCompare)};
  }

  function initCache(c, f) {
   var n = c.size();
   var cache = new Array(n);
   var i;

   for(i=0;i<n;++i) cache[i] = cacheElement(c, i, f);
   return cache;
  }

  function cacheMappings(cache, mappings, c0, c1) {
   var n = mappings.length;
   var i, k0, k1;

   for(i=0;i<n;++i) {
    k0 = c0.clusters.at(mappings[i][0]).at(0);
    k1 = c0.clusters.at(mappings[i][1]).at(0);
    cache[k0].c = c1.clusters.at(c1.memberships.at(k0));
    cache[k0].q = undefined;
    cache[k1].c = undefined;
    cache[k1].q = undefined;
   }
  }

  function cacheDistances(cache, f) {
   var n = cache.length;
   var i, j, ci, cj, qi;

   for(i=n-1;i>=0;--i) {
    ci = cache[i];
    if(ak.nativeType(ci.c)!==ak.UNDEFINED_T && ak.nativeType(ci.q)===ak.UNDEFINED_T) {
     qi = [];
     for(j=0;j<i;++j) {
      cj = cache[j];
      if(ak.nativeType(cj.q)!==ak.UNDEFINED_T) cj.q.add({c:ci.c, d:f(ci.c, cj.c)});
     }
     for(j=i+1;j<n;++j) {
      cj = cache[j];
      if(ak.nativeType(cj.q)!==ak.UNDEFINED_T) qi.push({c:cj.c, d:f(ci.c, cj.c)});
     }
     ci.q = ak.minHeap(qi, cacheCompare);
    }
   }
  }

  function updateCache(cache, mappings, c0, c1, f) {
   cacheMappings(cache, mappings, c0, c1);
   cacheDistances(cache, f);
  }

  var nullElement = {c:undefined, d:ak.INFINITY};

  function firstElement(q, cache) {
   while(q.size()>0 && q.min().c!==cache[q.min().c.at(0)].c) q.shift();
   return q.size()>0 ? q.min() : nullElement;
  }

  function minDist(cache) {
   var min = ak.INFINITY;
   var n = cache.length;
   var i, qi;

   for(i=0;i<n;++i) {
    qi = cache[i].q;
    if(ak.nativeType(qi)!==ak.UNDEFINED_T) {
     min = Math.min(min, firstElement(qi, cache).d);
    }
   }
   return min;
  }

  function minMappings(min, cache, memberships) {
   var mappings = [];
   var n = cache.length;
   var i, qi, qi0, ci0, ci1;

   for(i=0;i<n;++i) {
    qi = cache[i].q;
    if(ak.nativeType(qi)!==ak.UNDEFINED_T && qi.size()>0) {
     ci0 = memberships[cache[i].c.at(0)];
     qi0 = qi.min();
     while(qi0.d===min) {
      ci1 = memberships[qi0.c.at(0)];
      mappings.push([ci0, ci1]);
      qi.shift();
      qi0 = firstElement(qi, cache);
     }
    }
   }
   return mappings;
  }

  function compressMappings(mappings) {
   var n = mappings.length;
   var i, j;

   for(i=0;i<n-1;++i) for(j=i+1;j<n;++j) {
    if(mappings[j][0]===mappings[i][1]) mappings[j][0] = mappings[i][0];
    if(mappings[j][1]===mappings[i][1]) mappings[j][1] = mappings[i][0];
   }
  }

  function mergeMappings(cache, memberships) {
   var dist = minDist(cache);
   var mappings = dist<ak.INFINITY ? minMappings(dist, cache, memberships) : [];
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
   return ak.clustering(memberships);
  }

  ak.hierarchicalClustering = function(data, f) {
   var clusters = [];
   var t = ak.nativeType(data);
   var n, memberships, i, c0, c1, cache, mappings;

   if(t===ak.NUMBER_T) {
    n = data;
    if(n<0 || n!==ak.floor(n) || !isFinite(n)) throw new Error('invalid number of data in ak.hierarchicalClustering');
   }
   else if(t===ak.ARRAY_T) {
    n = data.length;
   }
   else throw new Error('invalid data in ak.hierarchicalClustering');

   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid cluster distance function in ak.hierarchicalClustering');

   memberships = new Array(n);
   for(i=0;i<n;++i) memberships[i] = i;
   c0 = ak.clustering(memberships);
   clusters.push(c0);
   cache = initCache(c0.clusters, f);

   while(c0.clusters.size()>2) {
    memberships = c0.memberships.toArray();
    mappings = mergeMappings(cache, memberships);
    c1 = mergeClusters(mappings, memberships);
    clusters.push(c1);
    if(c1.clusters.size()>2) updateCache(cache, mappings, c0, c1, f);
    c0 = c1;
   }
   if(c0.clusters.size()===2) {
    for(i=0;i<n;++i) memberships[i] = 0;
    clusters.push(memberships);
   }
   return t===ak.NUMBER_T ? ak.clusterings(clusters) : ak.clusterings(clusters, data);
  };
 };

 ak.using(['Algorithm/Compare.js', 'Cluster/Clusterings.js' ,'Container/MinHeap.js'], define);
})();