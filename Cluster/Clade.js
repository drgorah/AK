//AK/Cluster/Clade.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.CLADE_T) return;

  ak.CLADE_T = 'ak.clade';
  ak.CLADES_T = 'ak.clades';

  function Clade(){}
  Clade.prototype = {TYPE: ak.CLADE_T, valueOf: function(){return ak.NaN;}};

  function Clades(){}
  Clades.prototype = {TYPE: ak.CLADES_T, valueOf: function(){return ak.NaN;}};

  ak.clade = function(clusterings) {
   var n, clustering, clusters, cluster;

   if(ak.type(clusterings)!==ak.CLUSTERINGS_T) throw new Error('invalid argument in ak.clade');

   n = clusterings.size();
   if(!(n>0)) throw new Error('empty clusterings in ak.clade');

   clustering = clusterings.at(n-1);
   clusters = clustering.clusters;
   if(clusters.size()!==1) throw new Error('non-hierarchical clusterings in ak.clade');
   cluster = clusters.at(0);
   return clade(clusterings, n-1, cluster, clustering.data, new Array(cluster.size()));
  };

  function clade(clusterings, level, cluster, data, check, parent) {
   var c = new Clade();
   var clades, n, ni, nj, i, j, k;

   c.cluster = cluster;
   c.data = data;
   c.parent = parent;

   if(level>0) {
    clades = children(clusterings, level-1, cluster, data, check, c);

    n = check.length;
    for(i=0;i<n;++i) check[i] = false;

    ni = cluster.size();
    for(i=0;i<ni;++i) {
     k = cluster.at(i);
     if(k<0 || k>=n) throw new Error('invalid cluster in ak.clade');
     check[k] = true;
    }

    ni = clades.size();
    for(i=0;i<ni;++i) {
     cluster = clades.at(i).cluster;
     nj = cluster.size();
     for(j=0;j<nj;++j) {
      k = cluster.at(j);
      if(k<0 || k>=n) throw new Error('invalid cluster in ak.clade');
      if(!check[k]) throw new Error('non-hierarchical clusterings in ak.clade');
      check[k] = false;
     }
    }

    c.children = clades;
    c.toArray  = clades.toArray;
    c.toString = function() {return toStringArray(c, []).join('');};
   }
   else {
    c.toArray  = cluster.toArray;
    c.toString = cluster.toString;
   }

   return Object.freeze(c);
  }

  function children(clusterings, level, cluster, data, check, parent) {
   var c = new Clades();
   var a = [];
   var clustering = clusterings.at(level);
   var memberships = clustering.memberships;
   var clusters = clustering.clusters;
   var n = cluster.size();
   var i;

   for(i=0;i<n;++i) a.push(memberships.at(cluster.at(i)));
   a.sort(ak.numberCompare);
   n = ak.unique(a, ak.numberEqual)
   a = a.slice(0, n);
   for(i=0;i<n;++i) a[i] = clade(clusterings, level, clusters.at(a[i]), data, check, parent);

   c.size = function() {return n;};
   c.at = function(i) {return a[i];};

   c.toArray = function() {
    var arr = new Array(n);
    var i;
    for(i=0;i<n;++i) arr[i] = a[i].toArray();
    return arr;
   };

   c.toString = function() {
    var arr = [];
    var i;
    arr.push('{');
    for(i=0;i<n;++i) {
     toStringArray(a[i], arr);
     if(i!==n-1) arr.push(',');
    }
    arr.push('}');
    return arr.join('');
   };

   return Object.freeze(c);
  }

  function toStringArray(clade, arr) {
   var children = clade.children;
   var n, i;
   if(ak.type(children)===ak.UNDEFINED_T) {
    arr.push(clade.cluster.toString());
   }
   else {
    n = children.size();
    arr.push('{');
    for(i=0;i<n;++i) {
     toStringArray(children.at(i), arr);
     if(i!==n-1) arr.push(',');
    }
    arr.push('}');
   }
   return arr;
  }
 };

 ak.using(['Cluster/Clusterings.js', 'Algorithm/Unique.js', 'Algorithm/Compare.js'], define);
})();