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

  function jacobi(q, e) {
   var q00 = q[0][0];
   var q01 = q[0][1]+q[1][0];
   var q11 = q[1][1];
   var t0, c0, s0, c0c0, s0s0, c0s0, qcs, d0, d1;

   if(Math.abs(q01)>2*e*(1+Math.abs(q00)+Math.abs(q11))) {
    t0 = (q11>=q00) ? q01 / ((q11-q00) + ak.hypot(q11-q00, q01))
                    : q01 / ((q11-q00) - ak.hypot(q11-q00, q01));
    c0 = 1/ak.hypot(t0, 1);
    s0 = c0*t0;
    c0c0 = c0*c0;
    s0s0 = s0*s0;
    c0s0 = c0*s0;
    qcs = q01*c0s0;

    d0 = q00*c0c0 + q11*s0s0 - qcs;
    d1 = q00*s0s0 + q11*c0c0 + qcs;
   }
   else {
    c0 = 1;   s0 = 0;
    d0 = q00; d1 = q11;
   }

   q[0][0] =  c0; q[0][1] = s0;
   q[1][0] = -s0; q[1][1] = c0;

   return {v:ak.matrix(q), l:ak.vector([d0, d1])};
  }

  function initialState(m, n) {
   var r, c, mr;

   m = m.toArray();
   for(r=0;r<n;++r) {
    mr = m[r];
    for(c=0;c<r;++c) mr[c] = m[c][r] = 0.5*(mr[c]+m[c][r]);
   }
   return {q: m, d0: new Array(n), d1: new Array(n-1)};
  }

  function householder(q, d0, d1, n) {
   var c, s, r, d, p, rr, cc, z, qc, qrr, q0;
  
   for(c=0;c<n-2;++c) {
    z = 0;
    qc = q[c];
    for(r=c+1;r<n;++r) z += Math.abs(qc[r]);
  
    if(z>0) {
     s = 0;
     for(r=c+1;r<n;++r) {
      qc[r] = q[r][c] /= z;
      s += qc[r]*qc[r];
     }
     s = Math.sqrt(s);
     if(qc[c+1]>0) s = -s;
     d = Math.sqrt(2*s*(s-qc[c+1]));
     qc[c+1] -= s;
     for(cc=c+1;cc<n;++cc) qc[cc] /= d;
  
     p = 0;
     for(cc=c+1;cc<n;++cc) p += q[cc][c]*qc[cc];
     q[c+1][c] -= 2*qc[c+1]*p;
  
     for(cc=c+1;cc<n;++cc) {
      p = 0;
      for(rr=c+1;rr<n;++rr) p += qc[rr]*q[rr][cc];
      for(rr=c+1;rr<n;++rr) q[rr][cc] -= 2*qc[rr]*p;
     }
  
     for(rr=c+1;rr<n;++rr) {
      qrr = q[rr];
      p = 0;
      for(cc=c+1;cc<n;++cc) p += qrr[cc]*qc[cc];
      for(cc=c+1;cc<n;++cc) qrr[cc] -= 2*qc[cc]*p;
     }
    }
    else {
     z += 1;
    }
  
    d0[c] = qc[c];
    d1[c] = q[c+1][c]*z;
   }
  
   d0[n-2] = q[n-2][n-2];
   d0[n-1] = q[n-1][n-1];
   d1[n-2] = q[n-1][n-2];
  
   for(cc=0;cc<n-1;++cc) q[n-1][cc] = 0;
   q[n-1][n-1] = 1;
  
   for(c=n-3;c>=0;--c) {
    for(cc=0;cc<n;++cc) q[c+1][cc] = 0;
    q[c+1][c+1] = 1;
  
    for(cc=c+1;cc<n;++cc) q[cc][c+1] -= 2*q[c][cc]*q[c][c+1];
  
    for(rr=c+2;rr<n;++rr) {
     p = 0;
     for(cc=c+1;cc<n;++cc) p += q[cc][rr]*q[c][cc];
     for(cc=c+1;cc<n;++cc) q[cc][rr] -= 2*q[c][cc]*p;
    }
   }
   q0 = q[0];
   for(cc=1;cc<n;++cc) q0[cc] = 0;
   q0[0] = 1;
  }

  function givens(q, d0, d1, o, n, e, steps) {
   var step = 0;
   var nn, c, r, r0, r1, qr, qr0, qr1, d01, d02, d12, d, x, z, h;
   var s0, c0, s0s0, c0c0, c0s0;
   var m00, m10, m11, m21, m22, m23, mcs;
  
   while(o<n-2 && Math.abs(d1[o])<=e*(1+Math.abs(d0[o])+Math.abs(d0[o+1]))) ++o;
   c = o;
  
   for(nn=o+1;nn<n-1 && Math.abs(d1[nn])>e*(1+Math.abs(d0[nn])+Math.abs(d0[nn+1]));++nn);
   ++nn;
  
   while(c!==o || Math.abs(d1[nn-2])>e*(1+Math.abs(d0[nn-2])+Math.abs(d0[nn-1]))) {
    if(step++===steps) throw new Error('failure to converge in ak.spectralDecomposition');
  
    if(c===o) {
     d01 = d0[nn-1]; d02 = d0[nn-2]; d12 = d1[nn-2];
     d = (d02-d01)/2;
     x = d>0 ? d0[c] - d01 + d12*d12/(d + ak.hypot(d, d12))
             : d0[c] - d01 + d12*d12/(d - ak.hypot(d, d12));
     z = d1[c];
    }
    else {
     x = d1[c-1];
    }
  
    h = ak.hypot(x, z);
    s0 = -z/h; s0s0 = s0*s0;
    c0 =  x/h; c0c0 = c0*c0;
    c0s0 = c0*s0;
  
    if(c===o) {
     m00 = d0[c]; m10 = d1[c]; m11 = d0[c+1]; 
     mcs = 2*m10*c0s0;
  
     d0[c]   = m00*c0c0 + m11*s0s0 - mcs;
     d0[c+1] = m00*s0s0 + m11*c0c0 + mcs;
     d1[c]   = (m00-m11)*c0s0 + m10*(c0c0-s0s0);
  
     if(c<nn-2) {
      m21 = d1[c+1];
      d1[c+1] = m21*c0;
      z = -m21*s0;
     }
    }
    else {
     m10 = d1[c-1]; m11 = d0[c];
     m21 = d1[c];   m22 = d0[c+1];
     mcs = 2*m21*c0s0;
  
     d0[c]   = m11*c0c0 + m22*s0s0 - mcs;
     d0[c+1] = m11*s0s0 + m22*c0c0 + mcs;
     d1[c-1] = m10*c0 - z*s0;
     d1[c]   = (m11-m22)*c0s0 + m21*(c0c0-s0s0);
  
     if(c<nn-2) {
      m23 = d1[c+1];
      d1[c+1] = m23*c0;
      z = -m23*s0;
     }
    }
  
    for(r=0;r<n;++r) {
     qr = q[r]; qr0 = qr[c]; qr1 = qr[c+1];
     qr[c]   = qr0*c0 - qr1*s0;
     qr[c+1] = qr0*s0 + qr1*c0;
    }
  
    if(++c===nn-1) c = o;
   }
  
   if(isNaN(d1[nn-2])) d0[nn-1] = d0[nn-2] = ak.NaN;
   if(isNaN(d0[nn-1]) || isNaN(d0[nn-2])) return ak.NaN;
   return o;
  }

  function fromMatrix(m, n, e, steps) {
   var s, o;

   if(n<2) return {v:ak.matrix('identity', n), l:ak.vector(n, m.at(0, 0))};
   if(n<3) return jacobi(m.toArray(), e);

   s = initialState(m, n);
   o = 0;
   householder(s.q, s.d0, s.d1, n);
   while(o<n-2) o = givens(s.q, s.d0, s.d1, o, n, e, steps);
   return {v: ak.matrix(s.q), l: ak.vector(s.d0)};
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

  constructors[ak.MATRIX_T] = function(state, m, args) {
   var arg1 = args[1];
   if(m.cols()!==m.rows()) throw new Error('non-square matrix in ak.spectralDecomposition');
   constructors[ak.MATRIX_T][ak.type(arg1)](state, m, arg1, args);
  };

  constructors[ak.MATRIX_T][ak.NUMBER_T] = function(state, m, e, args) {
   var arg2 = args[2];
   e = Math.abs(e);
   if(isNaN(e)) throw new Error('non-numeric threshold in ak.spectralDecomposition');
   constructors[ak.MATRIX_T][ak.NUMBER_T][ak.type(arg2)](state, m, e, arg2);
  }

  constructors[ak.MATRIX_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, m, e, steps) {
   var s;

   steps = ak.floor(Math.abs(steps));
   if(isNaN(steps)) throw new Error('non-numeric steps in ak.spectralDecomposition');

   s = fromMatrix(m, m.rows(), e, steps);
   state.v = s.v;
   state.l = s.l;
  }

  constructors[ak.MATRIX_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state, m, e) {
   var s = fromMatrix(m, m.rows(), e, 30);
   state.v = s.v;
   state.l = s.l;
  };

  constructors[ak.MATRIX_T][ak.UNDEFINED_T] = function(state, m) {
   var s = fromMatrix(m, m.rows(), Math.pow(ak.EPSILON, 0.75), 30);
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
