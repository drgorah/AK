//AK/Distribution/MultiUniformDistribution.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.multiUniformCDF) return;

  function cdf(a, b, x) {
   var n = a.length;
   var c = 1;
   var i, ci;

   if(ak.type(x)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiUniformCDF');
   if(x.dims()!==n) throw new Error('dimension mismatch in ak.multiUniformCDF');
   x = x.toArray();

   for(i=0;i<n;++i) {
    ci = (x[i]-a[i])/(b[i]-a[i]);
    if(ci<0)      ci = 0;
    else if(ci>1) ci = 1;
    c *= ci;
   }
   return c;
  }

  ak.multiUniformCDF = function() {
   var state = {a: [0], b: [1]};
   var arg0  = arguments[0];
   var f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   f = function(x){return cdf(state.a, state.b, x);};
   f.a = function(){return ak.vector(state.a);};
   f.b = function(){return ak.vector(state.b);};

   return Object.freeze(f);
  };

  function compCDF(a, b, x) {
   var n = a.length;
   var c = 1;
   var i, ci;

   if(ak.type(x)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiUniformCompCDF');
   if(x.dims()!==n) throw new Error('dimension mismatch in ak.multiUniformCompCDF');
   x = x.toArray();

   for(i=0;i<n;++i) {
    ci = (b[i]-x[i])/(b[i]-a[i]);
    if(ci<0)      ci = 0;
    else if(ci>1) ci = 1;
    c *= ci;
   }
   return c;
  }

  ak.multiUniformCompCDF = function() {
   var state = {a: [0], b: [1]};
   var arg0  = arguments[0];
   var f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   f = function(x){return compCDF(state.a, state.b, x);};
   f.a = function(){return ak.vector(state.a);};
   f.b = function(){return ak.vector(state.b);};

   return Object.freeze(f);
  };

  function pdf(a, b, p, x) {
   var n = a.length;
   var i;

   if(ak.type(x)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiUniformPDF');
   if(x.dims()!==n) throw new Error('dimension mismatch in ak.multiUniformPDF');
   x = x.toArray();

   for(i=0;i<n && x[i]>=a[i] && x[i]<=b[i];++i);
   return i<n ? 0 : p;
  }

  ak.multiUniformPDF = function() {
   var state = {a: [0], b: [1], p: 1};
   var arg0  = arguments[0];
   var i, n, f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   n = state.a.length;
   for(i=0;i<n;++i) state.p /= state.b[i] - state.a[i];

   f = function(x){return pdf(state.a, state.b, state.p, x);};
   f.a = function(){return ak.vector(state.a);};
   f.b = function(){return ak.vector(state.b);};
   return Object.freeze(f);
  };

  function map(a, b, c) {
   var n = a.length;
   var x, i;

   if(ak.type(c)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiUniformMap');
   if(c.dims()!==n) throw new Error('dimension mismatch in ak.multiUniformMap');
   c = c.toArray();

   x = new Array(n);
   for(i=0;i<n;++i) {
    if(c[i]<=0)      x[i] = a[i];
    else if(c[i]>=1) x[i] = b[i];
    else             x[i] = a[i] + c[i]*(b[i]-a[i]);
   }
   return ak.vector(x);
  }

  ak.multiUniformMap = function() {
   var state = {a: [0], b: [1]};
   var arg0  = arguments[0];
   var f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   f = function(c){return map(state.a, state.b, c);};
   f.a = function(){return ak.vector(state.a);};
   f.b = function(){return ak.vector(state.b);};

   return Object.freeze(f);
  };

  var cf_eps = Math.sqrt(ak.EPSILON);

  function cf(a, b, t) {
   var n = a.length;
   var zr = 1;
   var zi = 0;
   var i, ta, tb, di, re, im, tr, ti;

   if(ak.type(t)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiUniformCF');
   if(t.dims()!==n) throw new Error('dimension mismatch in ak.multiUniformCF');
   t = t.toArray();

   for(i=0;i<n;++i) {
    ta = t[i]*a[i];
    tb = t[i]*b[i];
    di = tb-ta;

    if(!isFinite(di)) return isNaN(t[i]) ? ak.complex(ak.NaN, ak.NaN) : ak.complex(0);

    if(Math.abs(di)>cf_eps) {
     re = (Math.sin(tb)-Math.sin(ta))/di;
     im = (Math.cos(ta)-Math.cos(tb))/di;
    }
    else {
     re = (Math.cos(tb)+Math.cos(ta))/2;
     im = (Math.sin(tb)+Math.sin(ta))/2;
    }
    tr = zr;
    ti = zi;

    zr = tr*re - ti*im;
    zi = tr*im + ti*re;
   }
   return ak.complex(zr, zi);
  }

  ak.multiUniformCF = function() {
   var state = {a: [0], b: [1]};
   var arg0  = arguments[0];
   var a, b, f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   f = function(t){return cf(state.a, state.b, t);};
   f.a = function(){return ak.vector(state.a);};
   f.b = function(){return ak.vector(state.b);};

   return Object.freeze(f);
  };

  function rnd(a, b, rnd) {
   var n = a.length;
   var x = new Array(n);
   var i;

   for(i=0;i<n;++i) x[i] = a[i] + rnd()*(b[i]-a[i]);
   return ak.vector(x);
  }

  ak.multiUniformRnd = function() {
   var state = {a: [0], b: [1], rnd: Math.random};
   var arg0  = arguments[0];
   var f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   f = function(){return rnd(state.a, state.b, state.rnd);};
   f.a = function(){return ak.vector(state.a);};
   f.b = function(){return ak.vector(state.b);};
   f.rnd = function(){return state.rnd;};

   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.UNDEFINED_T] = function() {
  };

  constructors[ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T] = function(state, n, args) {
   var arg1 = args[1];

   if(n!==ak.floor(n)) throw new Error('invalid dimension in ak.multiUniform distribution');
   state.a.length = n;
   state.b.length = n;

   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, n, arg1, args);
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state, n) {
   while(n--) {
    state.a[n] = 0;
    state.b[n] = 1;
   }
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, n, rnd) {
   while(n--) {
    state.a[n] = 0;
    state.b[n] = 1;
   }
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, n, x, args) {
   var arg2 = args[2];
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg2)](state, n, x, arg2, args);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state, n, x) {
   var a = Math.min(x, 0);
   var b = Math.max(x, 0);

   if(!isFinite(x) || x===0) throw new Error('invalid bounds in ak.uniform distribution');

   while(n--) {
    state.a[n] = a;
    state.b[n] = b;
   }
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, n, x, rnd) {
   var a = Math.min(x, 0);
   var b = Math.max(x, 0);

   if(!isFinite(x) || x===0) throw new Error('invalid bounds in ak.uniform distribution');

   while(n--) {
    state.a[n] = a;
    state.b[n] = b;
   }
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, n, x0, x1, args) {
   var arg3 = args[3];
   var a = Math.min(x0, x1);
   var b = Math.max(x0, x1);

   if(!isFinite(a) || !isFinite(b) || a===b) throw new Error('invalid bounds in ak.uniform distribution');

   while(n--) {
    state.a[n] = a;
    state.b[n] = b;
   }
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg3)](state, arg3);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.VECTOR_T] = function(state, x0, args) {
   var arg1 = args[1];
   constructors[ak.VECTOR_T][ak.type(arg1)](state, x0, arg1, args);
  };

  constructors[ak.VECTOR_T][ak.UNDEFINED_T] = function(state, x) {
   var n = x.dims();

   state.a.length = n;
   state.b.length = n;
   x = x.toArray();

   while(n--) {
    if(!isFinite(x[n]) || x[n]===0) throw new Error('invalid bounds in ak.uniform distribution');
    state.a[n] = Math.min(x[n], 0);
    state.b[n] = Math.max(x[n], 0);
   }
  };

  constructors[ak.VECTOR_T][ak.FUNCTION_T] = function(state, x, rnd) {
   var n = x.dims();

   state.a.length = n;
   state.b.length = n;
   x = x.toArray();

   while(n--) {
    if(!isFinite(x[n]) || x[n]===0) throw new Error('invalid bounds in ak.uniform distribution');
    state.a[n] = Math.min(x[n], 0);
    state.b[n] = Math.max(x[n], 0);
   }
   state.rnd = rnd;
  };

  constructors[ak.VECTOR_T][ak.VECTOR_T] = function(state, x0, x1, args) {
   var arg2 = args[2];
   var n = x0.dims();

   if(x1.dims()!==n) throw new Error('dimension mismatch in ak.multiUniform distribution');

   state.a.length = n;
   state.b.length = n;
   x0 = x0.toArray();
   x1 = x1.toArray();

   while(n--) {
    if(!isFinite(x0[n]) || !isFinite(x1[n]) || x0[n]===x1[n]) throw new Error('invalid bounds in ak.uniform distribution');
    state.a[n] = Math.min(x0[n], x1[n]);
    state.b[n] = Math.max(x0[n], x1[n]);
   }
   constructors[ak.VECTOR_T][ak.VECTOR_T][ak.nativeType(arg2)](state, arg2);
  };

  constructors[ak.VECTOR_T][ak.VECTOR_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.VECTOR_T][ak.VECTOR_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };
 }

 ak.using(['Matrix/Vector.js', 'Complex/Complex.js'], define);
})();
