//AK/Matrix/Vector.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.VECTOR_T) return;
  ak.VECTOR_T = 'ak.vector';

  function Vector(){}
  Vector.prototype = {TYPE: ak.VECTOR_T, valueOf: function(){return ak.NaN;}};

  ak.vector = function() {
   var v     = new Vector();
   var state = [];
   var arg0  = arguments[0];

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   v.dims = function()  {return state.length;};
   v.at   = function(i) {return state[Number(i)];};

   v.toArray  = function() {return state.slice(0);};
   v.toString = function() {return '['+state.toString()+']';};

   v.toExponential = function(d) {return '['+state.map(function(x){return x.toExponential(d);})+']';};
   v.toFixed       = function(d) {return '['+state.map(function(x){return x.toFixed(d);})+']';};
   v.toPrecision   = function(d) {return '['+state.map(function(x){return x.toPrecision(d);})+']';};

   return Object.freeze(v);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, arr) {
   var n = arr.length;
   var i;

   state.length = n;
   for(i=0;i<n;++i) state[i] = Number(arr[i]);
  };

  constructors[ak.NUMBER_T] = function(state, n, args) {
   var arg1 = args[1];

   state.length = n;
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1);
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, func) {
   var n = state.length;
   var i;

   for(i=0;i<n;++i) state[i] = Number(func(i));
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, val) {
   var n = state.length;
   var i;

   val = Number(val);
   for(i=0;i<n;++i) state[i] = val;
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
   var n = state.length;
   var i;

   for(i=0;i<n;++i) state[i] = 0;
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var n = obj.dims;
   var i;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);
   state.length = n;

   for(i=0;i<n;++i) state[i] = Number(obj.at(i));
  };

  function abs(v) {
   var s = 0;
   var n = v.dims();
   var i, x;

   for(i=0;i<n;++i) {
    x = v.at(i);
    s += x*x;
   }
   return Math.sqrt(s);
  }

  function neg(v) {
   var n, i;

   v = v.toArray();
   n = v.length;
   for(i=0;i<n;++i) v[i] *= -1;
   return ak.vector(v);
  }

  function add(v0, v1) {
   var n, i;

   v0 = v0.toArray();
   n = v0.length;
   if(v1.dims()!==n) throw new Error('dimensions mismatch in ak.vector add');

   for(i=0;i<n;++i) v0[i] += v1.at(i);
   return ak.vector(v0);
  }

  function dist(v0, v1) {
   var s = 0;
   var n = v0.dims();
   var i, x;

   if(v1.dims()!==n) throw new Error('dimensions mismatch in ak.vector dist');

   for(i=0;i<n;++i) {
    x = v0.at(i) - v1.at(i);
    s += x*x;
   }
   return Math.sqrt(s);
  }

  function div(v, r) {
   var n, i;

   v = v.toArray();
   n = v.length;
   for(i=0;i<n;++i) v[i] /= r;
   return ak.vector(v);
  }

  function eq(v0, v1) {
   var n = v0.dims();
   var i;

   if(v1.dims()!==n) return false;
   for(i=0;i<n && v0.at(i)===v1.at(i);++i);
   return i===n;
  }

  function mul(v0, v1) {
   var s = 0;
   var n = v0.dims();
   var i;

   if(v1.dims()!==n) throw new Error('dimensions mismatch in ak.vector mul');

   for(i=0;i<n;++i) s += v0.at(i) * v1.at(i);
   return s;
  }

  function mulRV(r, v) {
   var n, i;

   v = v.toArray();
   n = v.length;
   for(i=0;i<n;++i) v[i] *= r;
   return ak.vector(v);
  }

  function mulVR(v, r) {
   var n, i;

   v = v.toArray();
   n = v.length;
   for(i=0;i<n;++i) v[i] *= r;
   return ak.vector(v);
  }

  function ne(v0, v1) {
   return !eq(v0, v1);
  }

  function sub(v0, v1) {
   var n, i;

   v0 = v0.toArray();
   n = v0.length;
   if(v1.dims()!==n) throw new Error('dimensions mismatch in ak.vector sub');

   for(i=0;i<n;++i) v0[i] -= v1.at(i);
   return ak.vector(v0);
  }

  ak.overload(ak.abs, ak.VECTOR_T, abs);
  ak.overload(ak.neg, ak.VECTOR_T, neg);

  ak.overload(ak.add,  [ak.VECTOR_T, ak.VECTOR_T], add);
  ak.overload(ak.dist, [ak.VECTOR_T, ak.VECTOR_T], dist);
  ak.overload(ak.div,  [ak.VECTOR_T, ak.NUMBER_T], div);
  ak.overload(ak.eq,   [ak.VECTOR_T, ak.VECTOR_T], eq);
  ak.overload(ak.mul,  [ak.NUMBER_T, ak.VECTOR_T], mulRV);
  ak.overload(ak.mul,  [ak.VECTOR_T, ak.NUMBER_T], mulVR);
  ak.overload(ak.mul,  [ak.VECTOR_T, ak.VECTOR_T], mul);
  ak.overload(ak.ne,   [ak.VECTOR_T, ak.VECTOR_T], ne);
  ak.overload(ak.sub,  [ak.VECTOR_T, ak.VECTOR_T], sub);
 }

 ak.using('', define);
})();
