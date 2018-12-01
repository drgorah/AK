//AK/Cluster/KMeansClustering.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.kMeansClustering) return;

  function minDist(x, k) {
   var n = k.length;
   var dc = ak.dist(x, k[0]);
   var i, di;

   for(i=1;i<n;++i) {
    di = ak.dist(x, k[i]);
    if(!(di>dc)) dc = di;
   }
   return dc;
  }

  function nearest(x, k) {
   var n = k.length;
   var c = 0;
   var dc = ak.dist(x, k[0]);
   var i, di, c;

   for(i=1;i<n;++i) {
    di = ak.dist(x, k[i]);
    if(!(di>dc)) {
     c = i;
     dc = di;
    }
   }
   return c;
  }

  function initialMeans(data, ids, k, rnd) {
   var n = ids.length;
   var m = [];
   var dist, r, s, i, j;

   if(n===0 || k===0) return m;

   dist = new Array(n);

   r = rnd();
   if(!(r>=0) || r>=1) throw new Error('invalid random number generator in ak.kMeansClustering');
   m.push(data[ids[ak.floor(r*n)]]);

   for(i=1;i<k;++i) {
    s = 0;
    for(j=0;j<n;++j) {
     dist[j] = minDist(data[ids[j]], m);
     s += dist[j];
    }
    if(s===0) return m;

    r = rnd();
    if(!(r>=0) || r>=1) throw new Error('invalid random number generator in ak.kMeansClustering');
    s *= r;

    for(j=0;j<n && s>=dist[j];++j) s -= dist[j];
    if(j===n) while(dist[--j]===0);
    m.push(data[ids[j]]);
   }
   return m;
  }

  function kMeans(data, ids, k) {
   var nd = data.length;
   var ni = ids.length;
   var nk = k.length
   var md = new Array(nd);
   var ck = new Array(nk);
   var i, id, diff, mi, j;

   for(i=0;i<nd;++i) md[i] = nk;
   if(nk===0) return md;

   do {
    diff = false;
    for(i=0;i<ni;++i) {
     id = ids[i];
     mi = nearest(data[id], k);
     if(mi!==md[id]) {
      diff = true;
      md[id] = mi;
     }
    }

    if(diff) {
     for(i=0;i<nk;++i) ck[i] = 0;

     for(i=0;i<ni;++i) {
      id = ids[i];
      j = md[id];
      k[j] = ck[j]!==0 ? ak.add(k[j], data[id]) : data[id];
      ++ck[j];
     }

     for(j=0;j<nk;++j) k[j] = ak.div(k[j], ck[j]);
    }
   }
   while(diff);

   return md;
  }

  ak.kMeansClustering = function(data, k, rnd) {
   var ids = [];
   var i, j;

   if(ak.nativeType(data)!==ak.ARRAY_T) throw new Error('invalid data in ak.kMeansClustering');
   for(i=0;i<data.length;++i) {
    for(j=0;j<i;++j) ak.dist(data[i], data[j]);
    if(isFinite(ak.abs(data[i]))) ids.push(i);
   }

   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.kMeansClustering');

   if(ak.nativeType(k)===ak.NUMBER_T) {
    if(k!==ak.floor(k) || k<0) throw new Error('invalid initial means in ak.kMeansClustering');
    k = initialMeans(data, ids, k, rnd);
   }
   else if(ak.nativeType(k)!==ak.ARRAY_T) {
    throw new Error('invalid initial means in ak.kMeansClustering');
   }
   else {
    k = k.slice(0);

    i = 0;
    while(i<k.length) {
     for(j=0;j<data.length;++j) ak.dist(k[i], data[j]);
     if(isFinite(ak.abs(k[i]))) {
      ++i;
     }
     else {
      k[i] = k[k.length-1];
      k.pop();
     }
    }
   }

   return ak.clustering(kMeans(data, ids, k), data);
  };
 };

 ak.using('Cluster/Clustering.js', define);
})();