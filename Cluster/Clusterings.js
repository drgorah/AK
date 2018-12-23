//AK/Cluster/Clusterings.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.clusterings) return;

  ak.CLUSTERINGS_T = 'ak.clusterings';

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

  function Clustering(){}
  Clustering.prototype = {TYPE: ak.CLUSTERING_T, valueOf: function(){return ak.NaN;}};

  function Clusterings(){}
  Clusterings.prototype = {TYPE: ak.CLUSTERINGS_T, valueOf: function(){return ak.NaN;}};

  ak.clusterings = function() {
   var c = new Clusterings();
   var state = [];
   var arg0 = arguments[0];
   var i;

   constructors[ak.CLUSTERINGS_T][ak.nativeType(arg0)](state, arg0, arguments);

   c.size = function() {return state.length;};
   c.at = function(i) {return state[i];};
   c.toArray = function() {return state.slice(0);};

   return Object.freeze(c);
  };

  function firstData(arr) {
   var n = arr.length;
   var i = 0;
   var data;

   while(i<n && ak.nativeType(data=arr[i].data)===ak.UNDEFINED_T) ++i;
   return i<n ? clusterData(data) : data;
  }

  function matchesArray(d1, d0) {
   var n0 = d0.size();
   var i = 0;

   if(d1.length!==n0) return false;
   while(i<n0 && ak.eq(d1[i], d0.at(i))) ++i;
   return i===n0;
  }

  function matchesObject(d1, d0) {
   var n0 = d0.size();
   var n1 = d1.size;
   var i = 0;

   n1 = ak.nativeType(n1)===ak.FUNCTION_T ? Number(n1()) : Number(n1);
   if(n1!==n0) return false;
   while(i<n0 && ak.eq(d1.at(i), d0.at(i))) ++i;
   return i===n0;
  }

  function matchesData(d1, d0) {
   var t1 = ak.nativeType(d1);
   var t0 = ak.nativeType(d0);

   switch(t1) {
    case ak.UNDEFINED_T: return true;
    case ak.ARRAY_T:     return t0!==ak.UNDEFINED_T && matchesArray(d1, d0);
    case ak.OBJECT_T:    return t0!==ak.UNDEFINED_T && matchesObject(d1, d0);
    default:             throw new Error('invalid data in ak.clusterings');
   }
  }

  function clustering(c, d) {
   var result;

   if(ak.nativeType(c)===ak.ARRAY_T) {
    c = ak.clustering(c);
   }
   else {
    if(!matchesData(c.data, d)) throw new Error('mismatched data in ak.clusterings');
    if(ak.nativeType(d)!==ak.UNDEFINED_T && d.size()!==c.memberships.size()) throw new Error('data/memberships size mismatch in ak.clusterings');
    c = ak.clustering(c.memberships.toArray());
   }

   result = new Clustering();
   result.memberships = c.memberships;
   result.clusters = c.clusters;
   result.data = d;
   return Object.freeze(result);
  }

  function clusterings(state, arr, data) {
   var n = arr.length;
   var i;

   state.length = n;
   if(n>0) state[0] = clustering(arr[0], data);
   for(i=1;i<n;++i) {
    state[i] = clustering(arr[i], data);
    if(state[i].memberships.size()!==state[0].memberships.size()) throw new Error('inconsistent memberships in ak.clusterings');
   }
  }

  constructors[ak.CLUSTERINGS_T] = {};

  constructors[ak.CLUSTERINGS_T][ak.ARRAY_T] = function(state, arr, args) {
   var arg1 = args[1];
   constructors[ak.CLUSTERINGS_T][ak.ARRAY_T][ak.nativeType(arg1)](state, arr, arg1);
  };

  constructors[ak.CLUSTERINGS_T][ak.ARRAY_T][ak.OBJECT_T] = function(state, arr, data) {
   clusterings(state, arr, clusterData(data));
  };

  constructors[ak.CLUSTERINGS_T][ak.ARRAY_T][ak.ARRAY_T] = function(state, arr, data) {
   clusterings(state, arr, clusterData(data));
  };

  constructors[ak.CLUSTERINGS_T][ak.ARRAY_T][ak.UNDEFINED_T] = function(state, arr) {
   clusterings(state, arr, firstData(arr));
  };

  constructors[ak.CLUSTERINGS_T][ak.OBJECT_T] = function(state, obj, args) {
   var arg1 = args[1];
   var n = obj.size;
   var arr, i;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);
   arr = new Array(n);
   for(i=0;i<n;++i) arr[i] = obj.at(i);
   constructors[ak.CLUSTERINGS_T][ak.ARRAY_T][ak.nativeType(arg1)](state, arr, arg1);
  };
 };

 ak.using('Cluster/Clustering.js', define);
})();