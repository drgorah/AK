//AK/Cluster/RawClusterings.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.rawClusterings) return;

  ak.CLUSTERINGS_T = 'ak.clusterings';

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

  function RawClustering(){}
  RawClustering.prototype = {TYPE: ak.CLUSTERING_T, SUB: 'raw', valueOf: function(){return ak.NaN;}};

  function RawClusterings(){}
  RawClusterings.prototype = {TYPE: ak.CLUSTERINGS_T, SUB: 'raw', valueOf: function(){return ak.NaN;}};

  ak.rawClusterings = function() {
   var c = new RawClusterings();
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
   while(i<n && ak.nativeType(data)===ak.UNDEFINED_T) data = arr[i++].data;
   return data;
  }

  function matchesData(d1, d0) {
   var n, i;

   if(ak.nativeType(d1)===ak.UNDEFINED_T) return true;
   if(ak.nativeType(d0)===ak.UNDEFINED_T) return false;
   
   n = d0.size();
   if(d1.size()!==n) return false;
   for(i=0;i<n && ak.eq(d1.at(i), d0.at(i));++i);
   return i===n;
  }

  function rawClustering(c, d) {
   var result;

   if(ak.nativeType(c)===ak.ARRAY_T) {
    c = ak.rawClustering(c);
   }
   else {
    if(!matchesData(c.data, d)) throw new Error('mismatched data in ak.rawClusterings');
    if(ak.nativeType(d)!==ak.UNDEFINED_T && d.size()!==c.memberships.size()) throw new Error('data/memberships size mismatch in ak.rawClusterings');
    c = ak.rawClustering(c.memberships.toArray());
   }

   result = new RawClustering();
   result.memberships = c.memberships;
   result.clusters = c.clusters;
   result.data = d;
   return Object.freeze(result);
  }

  function rawClusterings(state, arr, data) {
   var n = arr.length;
   var i;

   state.length = n;
   if(n>0) state[0] = rawClustering(arr[0], data);
   for(i=1;i<n;++i) {
    state[i] = rawClustering(arr[i], data);
    if(state[i].memberships.size()!==state[0].memberships.size()) throw new Error('inconsistent memberships in ak.clusterings');
   }
  }

  constructors[ak.CLUSTERINGS_T] = {};

  constructors[ak.CLUSTERINGS_T][ak.ARRAY_T] = function(state, arr, args) {
   var arg1 = args[1];
   constructors[ak.CLUSTERINGS_T][ak.ARRAY_T][ak.nativeType(arg1)](state, arr, arg1);
  };

  constructors[ak.CLUSTERINGS_T][ak.ARRAY_T][ak.OBJECT_T] = function(state, arr, data) {
   rawClusterings(state, arr, rawClusterData(data));
  };

  constructors[ak.CLUSTERINGS_T][ak.ARRAY_T][ak.ARRAY_T] = function(state, arr, data) {
   rawClusterings(state, arr, rawClusterData(data));
  };

  constructors[ak.CLUSTERINGS_T][ak.ARRAY_T][ak.UNDEFINED_T] = function(state, arr) {
   rawClusterings(state, arr, firstData(arr));
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

 ak.using('Cluster/RawClustering.js', define);
})();