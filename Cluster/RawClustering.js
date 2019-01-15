//AK/Cluster/RawClustering.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.rawClustering) return;

  ak.CLUSTERING_T = 'ak.clustering';
  ak.CLUSTER_DATA_T = 'ak.clusterData';
  ak.CLUSTER_MEMBERSHIPS_T = 'ak.clusterMemberships';
  ak.CLUSTER_T = 'ak.cluster';
  ak.CLUSTERS_T = 'ak.clusters';

  var constructors = {};
  
  function RawClusterData(){}
  RawClusterData.prototype = {TYPE: ak.CLUSTER_DATA_T, SUB: 'raw', valueOf: function(){return ak.NaN;}};

  function rawClusterData(arg) {
   var data = new RawClusterData();
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
  
  function RawClusterMemberships(){}
  RawClusterMemberships.prototype = {TYPE: ak.CLUSTER_MEMBERSHIPS_T, SUB: 'raw', valueOf: function(){return ak.NaN;}};

  function rawClusterMemberships(arg) {
   var m = new RawClusterMemberships();
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

  function RawCluster(){}
  RawCluster.prototype = {TYPE: ak.CLUSTER_T, SUB: 'raw', valueOf: function(){return ak.NaN;}};

  function rawCluster(arg) {
   var c = new RawCluster();
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

  function RawClusters(){}
  RawClusters.prototype = {TYPE: ak.CLUSTERS_T, SUB: 'raw', valueOf: function(){return ak.NaN;}};

  function rawClusters(arg) {
   var c = new RawClusters();
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
   for(i=0;i<n;++i) state[i] = rawCluster(arr[i]);
  };

  constructors[ak.CLUSTERS_T][ak.OBJECT_T] = function(state, obj) {
   var n = obj.size;
   var i;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);
   state.length = n;
   for(i=0;i<n;++i) state[i] = rawCluster(obj.at(i));
  };

  function RawClustering(){}
  RawClustering.prototype = {TYPE: ak.CLUSTERING_T, SUB: 'raw', valueOf: function(){return ak.NaN;}};

  ak.rawClustering = function() {
   var c = new RawClustering();
   var arg0 = arguments[0];

   constructors[ak.nativeType(arg0)](c, arg0, arguments);
   return Object.freeze(c);
  };

  function fromMemberships(state, m) {
   var n = m.length;
   var ids = {};
   var id = 0;
   var i, mi, c;

   for(i=0;i<n;++i) {
    mi = Number(m[i]);
    if(mi!==ak.floor(mi) || mi<0) throw new Error('invalid membership in ak.rawClustering');
    mi = '#'+mi.toFixed(0);
    if(isNaN(ids[mi])) ids[mi] = id++;
   }
   for(i=0;i<n;++i) m[i] = ids['#'+m[i].toFixed(0)];

   c = new Array(id);
   for(i=0;i<id;++i) c[i] = [];
   for(i=0;i<n;++i) c[m[i]].push(i);

   state.clusters = rawClusters(c);
   state.memberships = rawClusterMemberships(m);
  }

  function fromClusters(state, c) {
   var nc = c.length;
   var nm = 0;
   var i, j, m, n, ci, cij;

   for(i=0;i<nc;++i) {
    ci = c[i];
    if(ak.nativeType(ci)!==ak.ARRAY_T) throw new Error('invalid cluster in ak.rawClustering');
    nm += ci.length;
   }
   m = new Array(nm);

   for(i=0;i<nc;++i) {
    ci = c[i];
    n = ci.length;
    for(j=0;j<n;++j) {
     cij = Number(ci[j]);
     if(cij!==ak.floor(cij) || cij<0 || cij>=nm || !isNaN(m[cij])) throw new Error('invalid member in ak.rawClustering');
     m[cij] = i;
    }
   }

   state.clusters = rawClusters(c);
   state.memberships = rawClusterMemberships(m);
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
    state.data = rawClusterData(data);
    if(state.data.size()!==state.memberships.size()) throw new Error('data/memberships size mismatch in ak.rawClustering');
   }
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var c = obj.clusters;
   var m = obj.memberships;
   var d = obj.data;

   if(ak.nativeType(c)===ak.FUNCTION_T) c = c();
   if(ak.nativeType(m)===ak.FUNCTION_T) m = m();
   if(ak.nativeType(d)===ak.FUNCTION_T) d = d();

   if(ak.nativeType(c)!==ak.UNDEFINED_T) c = rawClusters(c);
   if(ak.nativeType(m)!==ak.UNDEFINED_T) m = rawClusterMemberships(m);

   if((!c && !m) || (c && m && !validClustering(c, m))) throw new Error('invalid clustering object in ak.rawClustering');

   if(m) fromMemberships(state, m.toArray());
   else  fromClusters(state, c.toArray());

   if(ak.nativeType(d)!==ak.UNDEFINED_T) {
    state.data = rawClusterData(d);
    if(state.data.size()!==state.memberships.size()) throw new Error('data/memberships size mismatch in ak.rawClustering');
   }
  };
 };

 ak.using('', define);
})();