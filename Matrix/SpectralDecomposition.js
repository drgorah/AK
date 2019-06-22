//AK/Matrix/SpectralDecomposition.js

//Copyright Richard Harris 2019.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.SPECTRAL_DECOMPOSITION_T) return;
  ak.SPECTRAL_DECOMPOSITION_T = 'ak.spectralDecomposition';

  function SpectralDecomposition(){}
  SpectralDecomposition.prototype = {TYPE: ak.SPECTRAL_DECOMPOSITION_T, valueOf: function(){return ak.NaN;}};

  function toMatrix(v, l) {
   var n = v.length;
   var m = new Array(n);
   var i, j, k, vi, vj, s;

   for(i=0;i<n;++i) m[i] = new Array(n);

   for(i=0;i<n;++i) {
    vi = v[i];

    for(j=i;j<n;++j) {
     vj = v[j];

     s = 0;
     for(k=0;k<n;++k) s += vi[k]*l[k]*vj[k];
     m[i][j] = m[j][i] = s;
    }
   }
   return ak.matrix(m);
  }

  function initialState(m, n) {
   var r, c, mr;

   m = m.toArray();

   for(r=0;r<n;++r) {
    mr = m[r];
    for(c=0;c<r;++c) {
     mr[c] = m[c][r] = 0.5*(mr[c]+m[c][r]);
    }
   }
   return m;
  }

  function householder(m, n) {
   var v = new Array(n);
   var t = new Array(n);
   var a = new Array(n);
   var b = new Array(n-1);
   var r, c, s, d, i, j, k;
   var mr, mr1, br, ar1, mi, ti, vi;
   var ai, aj, tij, mij, vij;

   for(i=0;i<n;++i) t[i] = new Array(n);

   for(r=0;r<n-2;++r) {
    mr = m[r];
    s = 0;
    for(c=r+1;c<n;++c) s += mr[c]*mr[c];
    s = Math.sqrt(s);
    mr1 = mr[r+1];
    if(mr1>0)  s = -s;
    d = Math.sqrt(2*s*(s-mr1));
    a[r] = mr[r];
    a[r+1] = ar1 = (mr1-s)/d;
    for(c=r+2;c<n;++c) a[c] = mr[c]/d;

    br = mr1 * (1-2*ar1*ar1);
    for(c=r+2;c<n;++c) br -= 2*a[c]*ar1*mr[c];
    b[r] = br;

    for(i=r+1;i<n;++i) {
     mi = m[i]; ti = t[i];
      for(j=r+1;j<n;++j) {
      tij = mi[j]; aj = a[j];
      for(k=r+1;k<n;++k) tij -= 2*a[k]*aj*mi[k];
      ti[j] = tij;
     }
    }

    for(i=r+1;i<n;++i) {
     mi = m[i]; ti = t[i]; ai = a[i];
     for(j=r+1;j<n;++j) {
      mij = ti[j];
      for(k=r+1;k<n;++k) mij -= 2*ai*a[k]*t[k][j];
      mi[j] = mij;
     }
    }

    if(r===0) {
     for(i=0;i<n;++i) v[i] = new Array(n);
     vi = v[0];
     vi[0] = 1;
     for(j=1;j<n;++j) vi[j] = v[j][0] = 0;

     for(i=1;i<n;++i) {
      vi = v[i];
      vi[i] = 1-2*a[i]*a[i];
      for(j=i+1;j<n;++j) vi[j] = v[j][i] = -2*a[i]*a[j];
     }
    }
    else {
     for(i=0;i<n;++i) {
      ti = t[i]; vi = v[i];
      for(j=r+1;j<n;++j) ti[j] = vi[j];
      for(j=r+1;j<n;++j) {
       aj = a[j]; vij = vi[j];
       for(k=r+1;k<n;++k) vij -= 2*a[k]*aj*ti[k];
       vi[j] = vij;
      }
     }
    }
   }
   a[r] = m[r][r];
   a[r+1] = m[r+1][r+1];
   b[r] = m[r][r+1];
   return {v: v, a: a, b: b};
  }

  function givens(v, a, b, n, e) {
   var u = n;
   var r, c, r0, r1, r2, d, s, x, z, h
   var s0, c0, s0s0, s0c0, c0c0;

   while(--u>0) {
    while(Math.abs(b[u-1])>e*(1+Math.abs(a[u-1])+Math.abs(a[u]))) {
     r0 = a[u-1];
     r1 = b[u-1];
     r2 = a[u];
     d = (r0-r2)/2;
     s = d > 0 ? r2 - r1*r1/(d + Math.sqrt(d*d+r1*r1))
               : r2 - r1*r1/(d - Math.sqrt(d*d+r1*r1));
     x = a[0] - s;
     z = b[0];

     for(c=0;c<u;++c) {
      h = Math.hypot(x, z);
      s0 = -z/h;
      c0 =  x/h;
      s0s0 = s0*s0;
      s0c0 = s0*c0;
      c0c0 = c0*c0;

      if(c>0) b[c-1] = c0*b[c-1]-s0*z;

      r0 = a[c];
      r1 = b[c];
      r2 = a[c+1];
      a[c] = c0c0*r0-2*s0c0*r1+s0s0*r2;
      b[c] = s0c0*r0+(c0c0-s0s0)*r1-s0c0*r2;
      a[c+1] = s0s0*r0+2*s0c0*r1+c0c0*r2;

      if(c<u-1) {
       x = b[c];
       z = -s0*b[c+1];
       b[c+1] *= c0;
      }

      for(r=0;r<n;++r) {
       r0 = v[r][c];
       r1 = v[r][c+1];
       v[r][c] = c0*r0-s0*r1;
       v[r][c+1] = s0*r0+c0*r1;
      }
     }
    }
   }
   return {v: ak.matrix(v), l: ak.vector(a)};
  }

  function fromMatrix(m, e) {
   var n = m.rows();
   var s = householder(initialState(m, n), n);
   return givens(s.v, s.a, s.b, n, e);
  }

  ak.spectralDecomposition = function() {
   var sd    = new SpectralDecomposition();
   var state = {v:undefined, l:undefined};
   var arg0  = arguments[0];

   constructors[ak.type(arg0)](state, arg0, arguments);

   sd.v = function() {return state.v;};
   sd.lambda = function() {return state.l;};

   sd.toMatrix = function() {return toMatrix(state.v.toArray(), state.l.toArray());};
   sd.toString = function() {return '{v:'+state.v.toString()+',lambda:'+state.l.toString()+'}';};

   sd.toExponential = function(d) {return '{v:'+state.v.toExponential(d)+',lambda:'+state.l.toExponential(d)+'}';};
   sd.toFixed       = function(d) {return '{v:'+state.v.toFixed(d)+',lambda:'+state.l.toFixed(d)+'}';};
   sd.toPrecision   = function(d) {return '{v:'+state.v.toPrecision(d)+',lambda:'+state.l.toPrecision(d)+'}';};

   return Object.freeze(sd);
  };

  var constructors = {};

  constructors[ak.MATRIX_T] = function(state, arg0, args) {
   var arg1 = args[1];
   constructors[ak.MATRIX_T][ak.type(arg1)](state, arg0, arg1);
  };

  constructors[ak.MATRIX_T][ak.NUMBER_T] = function(state, m, e) {
   var n = m.rows();
   var s;

   if(m.cols()!==n) throw new Error('non-square matrix in ak.spectralDecomposition');

   s = (n>1) ? fromMatrix(m, Math.abs(e)) : {v:ak.matrix('identity', n), l:ak.vector(n, m.at(0, 0))};

   state.v = s.v;
   state.l = s.l;
  };

  constructors[ak.MATRIX_T][ak.UNDEFINED_T] = function(state, m) {
   var n = m.rows();
   var s;

   if(m.cols()!==n) throw new Error('non-square matrix in ak.spectralDecomposition');

   s = (n>1) ? fromMatrix(m, ak.EPSILON) : {v:ak.matrix('identity', n), l:ak.vector(n, m.at(0, 0))};

   state.v = s.v;
   state.l = s.l;
  };

  constructors[ak.MATRIX_T][ak.VECTOR_T] = function(state, v, l) {
   if(v.rows()!==v.cols()) throw new Error('invalid v in ak.spectralDecomposition');
   if(l.dims()!==v.rows()) throw new Error('invalid lambda in ak.spectralDecomposition');

   state.v = ak.matrix(v);
   state.l = ak.vector(l);
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var v = obj.v;
   var l = obj.lambda;

   if(ak.nativeType(v)===ak.FUNCTION_T) v = v();
   if(ak.nativeType(l)===ak.FUNCTION_T) l = l();

   if(ak.type(v)!==ak.MATRIX_T || v.rows()!==v.cols()) throw new Error('invalid v in ak.spectralDecomposition');
   if(ak.type(l)!==ak.VECTOR_T || l.dims()!==v.rows()) throw new Error('invalid lambda in ak.spectralDecomposition');

   state.v = ak.matrix(v);
   state.l = ak.vector(l);
  };

  constructors[ak.SPECTRAL_DECOMPOSITION_T] = constructors[ak.OBJECT_T];

  function cutoff(a, e) {
    var n = a.length;
    var x = 0;
    var i;

    for(i=0;i<n;++i) x = Math.max(Math.abs(a[i]), x);
    return x*Math.abs(e);
  }

  function fD (f, d)    {return toMatrix(d.v().toArray(), d.lambda().toArray().map(f));}
  function fDR(f, d, r) {return toMatrix(d.v().toArray(), d.lambda().toArray().map(function(x){return f(x, r);}));}
  function fRD(f, r, d) {return toMatrix(d.v().toArray(), d.lambda().toArray().map(function(x){return f(r, x);}));}

  function stableInv(d, e) {
   var l = d.lambda().toArray();
   var n = l.length;
   var c, k;

   if(ak.nativeType(e)===ak.UNDEFINED_T) e = 0;
   else if(isNaN(e)) throw new Error('invalid threshold in ak.spectralDecomposition stableInv');

   c = cutoff(l, e);
   for(k=0;k<n;++k) l[k] = (Math.abs(l[k])<c) ? 0 : 1/l[k];
   return toMatrix(d.v().toArray(), l);
  }

  function divMD(m, d, e) {
   var v = d.v();
   var l = d.lambda().toArray();
   var n = l.length;
   var c = m.cols();
   var a = new Array(n*c);
   var i, j, k, s;

   if(m.rows()!==n) throw new Error('dimensions mismatch in ak.spectralDecomposition div');

   if(ak.nativeType(e)===ak.UNDEFINED_T) {
    for(k=0;k<n;++k) l[k] = 1/l[k];
   }
   else {
    if(isNaN(e)) throw new Error('invalid threshold in ak.spectralDecomposition stableDiv');

    s = cutoff(l, e);
    for(k=0;k<n;++k) l[k] = (Math.abs(l[k])<s) ? 0 : 1/l[k];
   }

   for(i=0;i<c;++i) {
    for(j=0;j<n;++j) {
     s = 0;
     for(k=0;k<n;++k) s += v.at(k, j) * m.at(k, i);
     a[j*c+i] = s*l[j];
    }
   }
   return ak.mul(v, ak.matrix(n, c, a));
  }

  function divRD(r, d, e) {
   var l = d.lambda().toArray();
   var n = l.length;
   var c, k;

   if(ak.nativeType(e)===ak.UNDEFINED_T) {
    for(k=0;k<n;++k) l[k] = r/l[k];
   }
   else {
    if(isNaN(e)) throw new Error('invalid threshold in ak.spectralDecomposition stableDiv');

    c = cutoff(l, e);
    for(k=0;k<n;++k) l[k] = (Math.abs(l[k])<c) ? 0 : r/l[k];
   }
   return toMatrix(d.v().toArray(), l);
  }

  function divVD(x, d, e) {
   var v = d.v();
   var l = d.lambda().toArray();
   var n = l.length;
   var a = new Array(n);
   var j, k, s;

   if(x.dims()!==n) throw new Error('dimensions mismatch in ak.spectralDecomposition div');

   if(ak.nativeType(e)===ak.UNDEFINED_T) {
    for(k=0;k<n;++k) l[k] = 1/l[k];
   }
   else {
    if(isNaN(e)) throw new Error('invalid threshold in ak.spectralDecomposition stableDiv');

    s = cutoff(l, e);
    for(k=0;k<n;++k) l[k] = (Math.abs(l[k])<s) ? 0 : 1/l[k];
   }

   for(j=0;j<n;++j) {
    s = 0;
    for(k=0;k<n;++k) s += v.at(k, j) * x.at(k);
    a[j] = s*l[j];
   }
   return ak.mul(v, ak.vector(a));
  }

  if(!ak.stableInv) ak.stableInv = function(x, e) {return ak.stableInv[ak.type(x)](x, e)};
  if(!ak.stableDiv) ak.stableDiv = function(x0, x1, e) {return ak.stableDiv[ak.type(x0)][ak.type(x1)](x0, x1, e)};

  ak.overload(ak.abs,       ak.SPECTRAL_DECOMPOSITION_T, function(d){return ak.abs(d.lambda());});
  ak.overload(ak.acos,      ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(Math.acos, d);});
  ak.overload(ak.asin,      ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(Math.asin, d);});
  ak.overload(ak.atan,      ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(Math.atan, d);});
  ak.overload(ak.cos,       ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(Math.cos, d);});
  ak.overload(ak.cosh,      ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(ak.cosh, d);});
  ak.overload(ak.det,       ak.SPECTRAL_DECOMPOSITION_T, function(d){return d.lambda().toArray().reduce(function(x0,x1){return x0*x1;}, 1);});
  ak.overload(ak.exp,       ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(Math.exp, d);});
  ak.overload(ak.inv,       ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(function(x){return 1/x;}, d);});
  ak.overload(ak.log,       ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(Math.log, d);});
  ak.overload(ak.neg,       ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(function(x){return -x;}, d);});
  ak.overload(ak.stableInv, ak.SPECTRAL_DECOMPOSITION_T, stableInv);
  ak.overload(ak.sin,       ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(Math.sin, d);});
  ak.overload(ak.sinh,      ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(ak.sinh, d);});
  ak.overload(ak.sqrt,      ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(Math.sqrt, d);});
  ak.overload(ak.tan,       ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(Math.tan, d);});
  ak.overload(ak.tanh,      ak.SPECTRAL_DECOMPOSITION_T, function(d){return fD(ak.tanh, d);});
  ak.overload(ak.tr,        ak.SPECTRAL_DECOMPOSITION_T, function(d){return d.lambda().toArray().reduce(function(x0,x1){return x0+x1;}, 0);});

  ak.overload(ak.div,       [ak.MATRIX_T, ak.SPECTRAL_DECOMPOSITION_T], divMD);
  ak.overload(ak.div,       [ak.SPECTRAL_DECOMPOSITION_T, ak.NUMBER_T], function(d, r){return fDR(function(x, r){return x/r;}, d, r);});
  ak.overload(ak.div,       [ak.NUMBER_T, ak.SPECTRAL_DECOMPOSITION_T], divRD);
  ak.overload(ak.div,       [ak.VECTOR_T, ak.SPECTRAL_DECOMPOSITION_T], divVD);
  ak.overload(ak.pow,       [ak.SPECTRAL_DECOMPOSITION_T, ak.NUMBER_T], function(d, r){return fDR(Math.pow, d, r);});
  ak.overload(ak.pow,       [ak.NUMBER_T, ak.SPECTRAL_DECOMPOSITION_T], function(r, d){return fRD(Math.pow, r, d);});
  ak.overload(ak.stableDiv, [ak.MATRIX_T, ak.SPECTRAL_DECOMPOSITION_T], divMD);
  ak.overload(ak.stableDiv, [ak.SPECTRAL_DECOMPOSITION_T, ak.NUMBER_T], function(d, r){return fDR(function(x, r){return x/r;}, d, r);});
  ak.overload(ak.stableDiv, [ak.NUMBER_T, ak.SPECTRAL_DECOMPOSITION_T], divRD);
  ak.overload(ak.stableDiv, [ak.VECTOR_T, ak.SPECTRAL_DECOMPOSITION_T], divVD);
 }

 ak.using('Matrix/Matrix.js', define);
})();
