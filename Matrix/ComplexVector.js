//AK/Matrix/ComplexVector.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.COMPLEX_VECTOR_T) return;
  ak.COMPLEX_VECTOR_T = 'ak.complexVector';

  function ComplexVector(){}
  ComplexVector.prototype = {TYPE: ak.COMPLEX_VECTOR_T, valueOf: function(){return ak.NaN;}};

  ak.complexVector = function() {
   var v     = new ComplexVector();
   var state = [];
   var arg0  = arguments[0];

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   v.dims = function()  {return state.length;};
   v.at   = function(i) {return state[Number(i)];};

   v.re = function() {return ak.vector(state.map(function(x){return x.re();}));};
   v.im = function() {return ak.vector(state.map(function(x){return x.im();}));};

   v.toArray  = function() {return state.slice(0);};
   v.toString = function() {return '['+state.toString()+']';};

   v.toExponential = function(d) {return '['+state.map(function(x){return x.toExponential(d);})+']';};
   v.toFixed       = function(d) {return '['+state.map(function(x){return x.toFixed(d);})+']';};
   v.toPrecision   = function(d) {return '['+state.map(function(x){return x.toPrecision(d);})+']';};

   return Object.freeze(v);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, arr, args) {
   var arg1 = args[1];

   state.length = arr.length;
   constructors[ak.ARRAY_T][ak.nativeType(arg1)](state, arr, arg1);
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T] = function(state, re, im) {
   var n = state.length;
   var i;

   if(im.length!==n) throw new Error('real and imaginary size mismatch in ak.complexVector');

   for(i=0;i<n;++i) state[i] = ak.complex(Number(re[i]), Number(im[i]));
  };

  constructors[ak.ARRAY_T][ak.UNDEFINED_T] = function(state, arr) {
   var n = state.length;
   var i;

   for(i=0;i<n;++i) state[i] = ak.complex(arr[i]);
  };

  constructors[ak.NUMBER_T] = function(state, n, args) {
   var arg1 = args[1];

   state.length = n;
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1, args);
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, func) {
   var n = state.length;
   var i;

   for(i=0;i<n;++i) state[i] = ak.complex(func(i));
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, arg1, args) {
   var arg2 = args[2];

   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg2)](state, arg1, arg2);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, re, im) {
   var n = state.length;
   var c = ak.complex(re, im);
   var i;

   for(i=0;i<n;++i) state[i] = c;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state, val) {
   var n = state.length;
   var i;

   val = ak.complex(val);
   for(i=0;i<n;++i) state[i] = val;
  };

  constructors[ak.NUMBER_T][ak.OBJECT_T] = function(state, obj) {
   var n = state.length;
   var i;

   obj = ak.complex(obj);
   for(i=0;i<n;++i) state[i] = obj;
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
   var n = state.length;
   var c = ak.complex(0);
   var i;

   for(i=0;i<n;++i) state[i] = c;
  };

  constructors[ak.OBJECT_T] = function(state, obj, args) {
   var arg1 = args[1];
   var n = obj.dims;
   var i;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);

   state.length = n;
   constructors[ak.OBJECT_T][ak.nativeType(arg1)](state, obj, arg1);
  };

  constructors[ak.OBJECT_T][ak.OBJECT_T] = function(state, re, im) {
   var n = state.length;
   var ni = im.dims;
   var i;

   ni = (ak.nativeType(ni)===ak.FUNCTION_T) ? Number(ni()) : Number(ni);
   if(ni!==n) throw new Error('real and imaginary size mismatch in ak.complexVector');

   for(i=0;i<n;++i) state[i] = ak.complex(Number(re.at(i)), Number(im.at(i)));
  };

  constructors[ak.OBJECT_T][ak.UNDEFINED_T] = function(state, obj) {
   var n = state.length;
   var i;

   for(i=0;i<n;++i) state[i] = ak.complex(obj.at(i));
  };

  function abs(z) {
   var s = 0;
   var n = z.dims();
   var i;

   for(i=0;i<n;++i) s += Math.pow(ak.abs(z.at(i)), 2);
   return Math.sqrt(s);
  }

  function conj(z) {
   return ak.complexVector(z.toArray().map(ak.conj));
  }

  function conjV(v) {
   return v;
  }

  function neg(z) {
   return ak.complexVector(z.toArray().map(ak.neg));
  }

  function add(z0, z1) {
   var n, i;

   z0 = z0.toArray();
   n = z0.length;
   if(z1.dims()!==n) throw new Error('dimensions mismatch in ak.complexVector add');

   for(i=0;i<n;++i) z0[i] = ak.add(z0[i], z1.at(i));
   return ak.complexVector(z0);
  }

  function dist(z0, z1) {
   var s = 0;
   var n = z0.dims();
   var i;

   if(z1.dims()!==n) throw new Error('dimensions mismatch in ak.complexVector dist');

   for(i=0;i<n;++i) s += Math.pow(ak.dist(z0.at(i), z1.at(i)), 2);
   return Math.sqrt(s);
  }

  function div(z, x) {
   var n, i;

   x = ak.inv(x);
   z = z.toArray();
   n = z.length;
   for(i=0;i<n;++i) z[i] = ak.mul(z[i], x);
   return ak.complexVector(z);
  }

  function divM(z, m) {
   m = ak.rightInv(m);
   return ak.complexVector(ak.mul(m, z.re()), ak.mul(m, z.im()));
  }

  function divD(z, d, e) {
   return ak.complexVector(ak.stableDiv(z.re(), d, e), ak.stableDiv(z.im(), d, e));
  }

  function eq(z0, z1) {
   var n = z0.dims();
   var i;

   if(z1.dims()!==n) return false;

   for(i=0;i<n && ak.eq(z0.at(i), z1.at(i));++i);
   return i===n;
  }

  function mul(z0, z1) {
   var s = ak.complex(0);
   var n = z0.dims();
   var i;

   if(z1.dims()!==n) throw new Error('dimensions mismatch in ak.complexVector mul');

   for(i=0;i<n;++i) s = ak.add(s, ak.mul(z0.at(i), z1.at(i)));
   return s;
  }

  function mulRZ(x, z) {
   var n, i;

   z = z.toArray();
   n = z.length;
   for(i=0;i<n;++i) z[i] = ak.mul(x, z[i]);
   return ak.complexVector(z);
  }

  function mulZR(z, x) {
   return mulRZ(x, z);
  }

  function mulMZ(m, z) {
   return ak.complexVector(ak.mul(m, z.re()), ak.mul(m, z.im()));
  }

  function mulZM(z, m) {
   return ak.complexVector(ak.mul(z.re(), m), ak.mul(z.im(), m));
  }

  function ne(z0, z1) {
   return !eq(z0, z1);
  }

  function sub(z0, z1) {
   var n, i;

   z0 = z0.toArray();
   n = z0.length;
   if(z1.dims()!==n) throw new Error('dimensions mismatch in ak.complexVector add');

   for(i=0;i<n;++i) z0[i] = ak.sub(z0[i], z1.at(i));
   return ak.complexVector(z0);
  }

  var JACOBI_DECOMPOSITION_T = 'ak.jacobiDecomposition';

  if(!ak.stableDiv) ak.stableDiv = function(x0, x1, e) {return ak.stableDiv[ak.type(x0)][ak.type(x1)](x0, x1, e)};

  ak.overload(ak.abs,  ak.COMPLEX_VECTOR_T, abs);
  ak.overload(ak.conj, ak.COMPLEX_VECTOR_T, conj);
  ak.overload(ak.conj, ak.VECTOR_T,         conjV);
  ak.overload(ak.neg,  ak.COMPLEX_VECTOR_T, neg);

  ak.overload(ak.add,       [ak.COMPLEX_VECTOR_T,      ak.COMPLEX_VECTOR_T],    add);
  ak.overload(ak.add,       [ak.VECTOR_T,              ak.COMPLEX_VECTOR_T],    add);
  ak.overload(ak.add,       [ak.COMPLEX_VECTOR_T,      ak.VECTOR_T],            add);
  ak.overload(ak.dist,      [ak.COMPLEX_VECTOR_T,      ak.COMPLEX_VECTOR_T],    dist);
  ak.overload(ak.dist,      [ak.VECTOR_T,              ak.COMPLEX_VECTOR_T],    dist);
  ak.overload(ak.dist,      [ak.COMPLEX_VECTOR_T,      ak.VECTOR_T],            dist);
  ak.overload(ak.div,       [ak.COMPLEX_VECTOR_T,      ak.COMPLEX_T],           div);
  ak.overload(ak.div,       [ak.COMPLEX_VECTOR_T,      ak.NUMBER_T],            div);
  ak.overload(ak.div,       [ak.VECTOR_T,              ak.COMPLEX_T],           div);
  ak.overload(ak.div,       [ak.COMPLEX_VECTOR_T,      ak.MATRIX_T],            divM);
  ak.overload(ak.div,       [ak.COMPLEX_VECTOR_T,      JACOBI_DECOMPOSITION_T], divD);
  ak.overload(ak.eq,        [ak.COMPLEX_VECTOR_T,      ak.COMPLEX_VECTOR_T],    eq);
  ak.overload(ak.eq,        [ak.VECTOR_T,              ak.COMPLEX_VECTOR_T],    eq);
  ak.overload(ak.eq,        [ak.COMPLEX_VECTOR_T,      ak.VECTOR_T],            eq);
  ak.overload(ak.mul,       [ak.COMPLEX_VECTOR_T,      ak.COMPLEX_VECTOR_T],    mul);
  ak.overload(ak.mul,       [ak.VECTOR_T,              ak.COMPLEX_VECTOR_T],    mul);
  ak.overload(ak.mul,       [ak.COMPLEX_VECTOR_T,      ak.VECTOR_T],            mul);
  ak.overload(ak.mul,       [ak.COMPLEX_T,             ak.COMPLEX_VECTOR_T],    mulRZ);
  ak.overload(ak.mul,       [ak.COMPLEX_VECTOR_T,      ak.COMPLEX_T],           mulZR);
  ak.overload(ak.mul,       [ak.NUMBER_T,              ak.COMPLEX_VECTOR_T],    mulRZ);
  ak.overload(ak.mul,       [ak.COMPLEX_VECTOR_T,      ak.NUMBER_T],            mulZR);
  ak.overload(ak.mul,       [ak.COMPLEX_T,             ak.VECTOR_T],            mulRZ);
  ak.overload(ak.mul,       [ak.VECTOR_T,              ak.COMPLEX_T],           mulZR);
  ak.overload(ak.mul,       [ak.MATRIX_T,              ak.COMPLEX_VECTOR_T],    mulMZ);
  ak.overload(ak.mul,       [ak.COMPLEX_VECTOR_T,      ak.MATRIX_T],            mulZM);
  ak.overload(ak.ne,        [ak.COMPLEX_VECTOR_T,      ak.COMPLEX_VECTOR_T],    ne);
  ak.overload(ak.ne,        [ak.VECTOR_T,              ak.COMPLEX_VECTOR_T],    ne);
  ak.overload(ak.ne,        [ak.COMPLEX_VECTOR_T,      ak.VECTOR_T],            ne);
  ak.overload(ak.sub,       [ak.COMPLEX_VECTOR_T,      ak.COMPLEX_VECTOR_T],    sub);
  ak.overload(ak.sub,       [ak.VECTOR_T,              ak.COMPLEX_VECTOR_T],    sub);
  ak.overload(ak.sub,       [ak.COMPLEX_VECTOR_T,      ak.VECTOR_T],            sub);
  ak.overload(ak.stableDiv, [ak.COMPLEX_VECTOR_T,      JACOBI_DECOMPOSITION_T], divD);
 }

 ak.using(['Complex/Complex.js', 'Matrix/Matrix.js'], define);
})();
