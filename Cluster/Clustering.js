//AK/Cluster/Clustering.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.clustering) return;

  ak.CLUSTERING_T = 'ak.clustering';
  ak.CLUSTER_DATA_T = 'ak.clusterData';
  ak.CLUSTER_MEMBERSHIPS_T = 'ak.clusterMemberships';
  ak.CLUSTER_T = 'ak.cluster';
  ak.CLUSTERS_T = 'ak.clusters';

  var constructors = {};
  
  function ClusterData(){}
  ClusterData.prototype = {TYPE: ak.CLUSTER_DATA_T, valueOf: function(){return ak.NaN;}};

  function clusterData(arg) {
   var data = new ClusterData();
   var state = [];

   constructors[ak.CLUSTER_DATA_T][ak.nativeType(arg)](state, arg);

   data.size = function()  {return state.length;};
   data.at   = function(i) {return state[i];};

   data.toArray  = function() {return state.slice(0);};
   data.toString = function() {return '{'+state.toString()+'}';};

   data.toExponential = function(d) {return '{'+state.map(function(x){return x.toExponential(d);})+'}';};
   data.toFixed       = function(d) {return '{'+state.map(function(x){return x.toFixed(d);})+'}';};
   data.toPrecision   = function(d) {return '{'+state.map(function(x){return x.toPrecision(d);})+'}';};

   return Object.freeze(data);
  }

  constructors[ak.CLUSTER_DATA_T] = {};

  constructors[ak.CLUSTER_DATA_T][ak.ARRAY_T] = function(state, arr) {
   var n = arr.length;
   var i;

   state.length = n;
   for(i=0;i<n;++i) state[i] = arr[i];
  };

  constructors[ak.CLUSTER_DATA_T][ak.OBJECT_T] = function(state, obj) {
   var n = obj.size;
   var i;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);
   state.length = n;
   for(i=0;i<n;++i) state[i] = obj.at(i);
  };
  
  function ClusterMemberships(){}
  ClusterMemberships.prototype = {TYPE: ak.CLUSTER_MEMBERSHIPS_T, valueOf: function(){return ak.NaN;}};

  function clusterMemberships(arg) {
   var m = new ClusterMemberships();
   var state = [];

   constructors[ak.CLUSTER_MEMBERSHIPS_T][ak.nativeType(arg)](state, arg);

   m.size = function()  {return state.length;};
   m.at   = function(i) {return state[i];};

   m.toArray  = function() {return state.slice(0);};
   m.toString = function() {return '{'+state.map(function(x){return x.toFixed(0);})+'}';};

   return Object.freeze(m);
  }

  constructors[ak.CLUSTER_MEMBERSHIPS_T] = {};

  constructors[ak.CLUSTER_MEMBERSHIPS_T][ak.ARRAY_T] = function(state, arr) {
   var n = arr.length;
   var i;

   state.length = n;
   for(i=0;i<n;++i) state[i] = Number(arr[i]);
  };

  constructors[ak.CLUSTER_MEMBERSHIPS_T][ak.OBJECT_T] = function(state, obj) {
   var n = obj.size;
   var i;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);
   state.length = n;
   for(i=0;i<n;++i) state[i] = Number(obj.at(i));
  };

  function Cluster(){}
  Cluster.prototype = {TYPE: ak.CLUSTER_T, valueOf: function(){return ak.NaN;}};

  function cluster(arg) {
   var c = new Cluster();
   var state = [];

   constructors[ak.CLUSTER_T][ak.nativeType(arg)](state, arg);

   c.size = function()  {return state.length;};
   c.at   = function(i) {return state[i];};

   c.toArray  = function() {return state.slice(0);};
   c.toString = function() {return '{'+state.map(function(x){return x.toFixed(0);})+'}';};

   return Object.freeze(c);
  }

  constructors[ak.CLUSTER_T] = {};

  constructors[ak.CLUSTER_T][ak.ARRAY_T] = function(state, arr) {
   var n = arr.length;
   var i;

   state.length = n;
   for(i=0;i<n;++i) state[i] = Number(arr[i]);
  };

  constructors[ak.CLUSTER_T][ak.OBJECT_T] = function(state, obj) {
   var n = obj.size;
   var i;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);
   state.length = n;
   for(i=0;i<n;++i) state[i] = Number(obj.at(i));
  };

  function Clusters(){}
  Clusters.prototype = {TYPE: ak.CLUSTERS_T, valueOf: function(){return ak.NaN;}};

  function clusters(arg) {
   var c = new Clusters();
   var state = [];

   constructors[ak.CLUSTERS_T][ak.nativeType(arg)](state, arg);

   c.size = function()  {return state.length;};
   c.at   = function(i) {return state[i];};

   c.toArray  = function() {return state.map(function(x){return x.toArray();});};
   c.toString = function() {return '{'+state.map(function(x){return x.toString();})+'}';};

   return Object.freeze(c);
  }

  constructors[ak.CLUSTERS_T] = {};

  constructors[ak.CLUSTERS_T][ak.ARRAY_T] = function(state, arr) {
   var n = arr.length;
   var i;

   state.length = n;
   for(i=0;i<n;++i) state[i] = cluster(arr[i]);
  };

  constructors[ak.CLUSTERS_T][ak.OBJECT_T] = function(state, obj) {
   var n = obj.size;
   var i;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);
   state.length = n;
   for(i=0;i<n;++i) state[i] = cluster(obj.at(i));
  };

  function Clustering(){}
  Clustering.prototype = {TYPE: ak.CLUSTERING_T, valueOf: function(){return ak.NaN;}};

  ak.clustering = function() {
   var c = new Clustering();
   var arg0 = arguments[0];

   constructors[ak.nativeType(arg0)](c, arg0, arguments);
   return Object.freeze(c);
  };

  function fromMemberships(state, m) {
   var n = m.length;
   var ids = {};
   var id = 0;
   var i, mi, c, count, inv;

   for(i=0;i<n;++i) {
    mi = Number(m[i]);
    if(mi!==ak.floor(mi) || mi<0) throw new Error('invalid membership in ak.clustering');
    mi = '#'+mi.toFixed(0);
    if(isNaN(ids[mi])) ids[mi] = id++;
   }
   for(i=0;i<n;++i) m[i] = ids['#'+m[i].toFixed(0)];

   count = new Array(id);
   for(i=0;i<id;++i) count[i] = [i, 0];
   for(i=0;i<n;++i) count[m[i]][1] += 1;
   count.sort(function(a,b){return a[1]!==b[1] ? b[1]-a[1] : a[0]-b[0];});

   inv = new Array(id);
   for(i=0;i<id;++i) inv[count[i][0]] = i;
   for(i=0;i<n;++i) m[i] = inv[m[i]];

   c = new Array(id);
   for(i=0;i<id;++i) c[i] = [];
   for(i=0;i<n;++i) c[m[i]].push(i);

   state.clusters = clusters(c);
   state.memberships = clusterMemberships(m);
  }

  function fromClusters(state, c) {
   var nc = c.length;
   var nm = 0;
   var i, j, m, n, ci, cij;

   for(i=0;i<nc;++i) {
    ci = c[i];
    if(ak.nativeType(ci)!==ak.ARRAY_T) throw new Error('invalid cluster in ak.clustering');
    nm += ci.length;
    c[i] = ci.concat(Math.min.apply(null, ci));
   }
   m = new Array(nm);

   c.sort(function(a,b){return a.length!==b.length ? b.length-a.length : a[a.length-1]-b[b.length-1];});

   for(i=0;i<nc;++i) {
    ci = c[i];
    ci.pop();
    ci.sort();
    n = ci.length;
    for(j=0;j<n;++j) {
     cij = Number(ci[j]);
     if(cij!==ak.floor(cij) || cij<0 || cij>=nm || !isNaN(m[cij])) throw new Error('invalid member in ak.clustering');
     m[cij] = i;
    }
   }

   state.clusters = clusters(c);
   state.memberships = clusterMemberships(m);
  }

  function validClustering(c, m) {
   var nc = c.size();
   var nm = m.size();
   var assigned = new Array(nm);
   var i, j, mi, ci, cin, cij;

   for(i=0;i<nm;++i) {
    mi = m.at(i);
    if(mi!==ak.floor(mi) || mi<0 || mi>=nc) return false;
    assigned[i] = false;
   }

   for(i=0;i<nc;++i) {
    ci = c.at(i);
    cin = ci.size();
    for(j=0;j<cin;++j) {
     cij = ci.at(j);
     if(cij!==ak.floor(cij) || cij<0 || cij>=nm || m.at(cij)!==i || assigned[cij]) return false;
     assigned[cij] = true;
    }
   }

   return true;
  }

  constructors[ak.ARRAY_T] = function(state, arr, args) {
   var data = args[1];

   arr = arr.slice(0)
   if(ak.nativeType(arr[0])!==ak.ARRAY_T) fromMemberships(state, arr);
   else fromClusters(state, arr);

   if(ak.nativeType(data)!==ak.UNDEFINED_T) {
    state.data = clusterData(data);
    if(state.data.size()!==state.memberships.size()) throw new Error('data/memberships size mismatch in ak.clustering');
   }
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var c = obj.clusters;
   var m = obj.memberships;
   var d = obj.data;

   if(ak.nativeType(c)===ak.FUNCTION_T) c = c();
   if(ak.nativeType(m)===ak.FUNCTION_T) m = m();
   if(ak.nativeType(d)===ak.FUNCTION_T) d = d();

   if(ak.nativeType(c)!==ak.UNDEFINED_T) c = clusters(c);
   if(ak.nativeType(m)!==ak.UNDEFINED_T) m = clusterMemberships(m);

   if((!c && !m) || (c && m && !validClustering(c, m))) throw new Error('invalid clustering object in ak.clustering');

   if(m) fromMemberships(state, m.toArray());
   else  fromClusters(state, c.toArray());

   if(ak.nativeType(d)!==ak.UNDEFINED_T) {
    state.data = clusterData(d);
    if(state.data.size()!==state.memberships.size()) throw new Error('data/memberships size mismatch in ak.clustering');
   }
  };
 };

 ak.using('', define);
})();