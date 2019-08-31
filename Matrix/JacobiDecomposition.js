//AK/Matrix/JacobiDecomposition.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.JACOBI_DECOMPOSITION_T) return;
  ak.JACOBI_DECOMPOSITION_T = 'ak.jacobiDecomposition';

  function JacobiDecomposition(){}
  JacobiDecomposition.prototype = {TYPE: ak.JACOBI_DECOMPOSITION_T, valueOf: function(){return ak.NaN;}};

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
   var ml = new Array(n);
   var v  = new Array(n);
   var p  = new Array(n);
   var all = 0;
   var off = 0;
   var r, c, vr, mlr, max, pr, x, abs;

   for(r=0;r<n;++r) {
    vr  = new Array(n);
    mlr = new Array(r+1);
    max = 0;
    pr  = 0;

    for(c=0;c<r;++c) {
     x = 0.5*(m.at(r, c)+m.at(c, r));
     abs = Math.abs(x);

     vr[c]  = 0;
     mlr[c] = x;

     all += 2*x*x;
     off += 2*x*x;

     if(!(abs<max)) {
      pr = c;
      max = abs;
     }
    }

    x = m.at(r, r);

    vr[r]  = 1;
    mlr[r] = x;

    all += x*x;

    for(c=r+1;c<n;++c) vr[c] = 0;

    v[r]  = vr;
    ml[r] = mlr;
    p[r]  = pr;
   }
   return {v:v, m:ml, p:p, all:all, off:off};
  }

  function pivotRow(m, p, n) {
   var pr  = 1;
   var max = Math.abs(m[pr][p[pr]]);
   var r, abs;

   for(r=2;r<n;++r) {
    abs = Math.abs(m[r][p[r]]);

    if(abs>=max) {
     max = abs;
     pr = r;
    }
   }
   return pr;
  }

  function pivotCol(m, r) {
   var mr = m[r];
   var pc = 0;
   var max = Math.abs(mr[pc]);
   var c, abs;

   for(c=1;c<r;++c) {
    abs = Math.abs(mr[c]);
    if(abs>=max) {
     max = abs;
     pc = c;
    }
   }
   return pc;
  }

  function rotateState(s, n) {
   var v = s.v;
   var m = s.m;
   var p = s.p;
   var l = pivotRow(m, p, n);
   var k = p[l];
   var mk = m[k];
   var ml = m[l];
   var mkk = mk[k];
   var mll = ml[l];
   var mkl = ml[k];
   var tan = (mll>=mkk) ? 2*mkl / ((mll-mkk) + Math.sqrt(Math.pow(mll-mkk, 2)+4*mkl*mkl))
                        : 2*mkl / ((mll-mkk) - Math.sqrt(Math.pow(mll-mkk, 2)+4*mkl*mkl));
   var cos = 1/Math.sqrt(tan*tan+1);
   var sin = cos*tan;
   var i, mi, mik, mil, vi, vik, vil;

   for(i=0;i<k;++i) {
    mik = mk[i];
    mil = ml[i];
    mk[i] = mik*cos - mil*sin;
    ml[i] = mik*sin + mil*cos;
   }

   mik = mk[k];
   mk[k] = mkk*cos*cos + mll*sin*sin - 2*mkl*cos*sin;
   ml[k] = 0;

   for(i=k+1;i<l;++i) {
    mi = m[i];
    mik = mi[k];
    mil = ml[i];
    mi[k] = mik*cos - mil*sin;
    ml[i] = mik*sin + mil*cos;
   }

   mil = ml[l];
   ml[l] = mkk*sin*sin + mll*cos*cos + 2*mkl*cos*sin;

   for(i=l+1;i<n;++i) {
    mi = m[i];
    mik = mi[k];
    mil = mi[l];
    mi[k] = mik*cos - mil*sin;
    mi[l] = mik*sin + mil*cos;
   }

   for(i=0;i<n;++i) {
    vi = v[i];
    vik = vi[k];
    vil = vi[l];
    vi[k] = vik*cos - vil*sin;
    vi[l] = vik*sin + vil*cos;
   }

   p[k] = pivotCol(m, k);
   p[l] = pivotCol(m, l);

   s.off -= 2*mkl*mkl;
  }

  function updateOff(s, n) {
   var off = 0;
   var m = s.m;
   var r, c, mr, x;

   for(r=1;r<n;++r) {
    mr = m[r];

    for(c=0;c<r;++c) {
     x = mr[c];
     off += x*x;
    }
   }
   s.off = 2*off;
  }

  function fromMatrix(m, e) {
   var n = m.rows();
   var s = initialState(m, n);
   var l = new Array(n);
   var e2 = e*e;
   var i = 0;

   while(s.off > e2*s.all) {
    rotateState(s, n);

    if(++i===n) {
     i = 0;
     updateOff(s, n);
    }
   }
   for(i=0;i<n;++i) l[i] = s.m[i][i];

   return {v:ak.matrix(s.v), l:ak.vector(l)};
  }

  ak.jacobiDecomposition = function() {
   var jd    = new JacobiDecomposition();
   var state = {v:undefined, l:undefined};
   var arg0  = arguments[0];

   constructors[ak.type(arg0)](state, arg0, arguments);

   jd.v = function() {return state.v;};
   jd.lambda = function() {return state.l;};

   jd.toMatrix = function() {return toMatrix(state.v.toArray(), state.l.toArray());};
   jd.toString = function() {return '{v:'+state.v.toString()+',lambda:'+state.l.toString()+'}';};

   jd.toExponential = function(d) {return '{v:'+state.v.toExponential(d)+',lambda:'+state.l.toExponential(d)+'}';};
   jd.toFixed       = function(d) {return '{v:'+state.v.toFixed(d)+',lambda:'+state.l.toFixed(d)+'}';};
   jd.toPrecision   = function(d) {return '{v:'+state.v.toPrecision(d)+',lambda:'+state.l.toPrecision(d)+'}';};

   return Object.freeze(jd);
  };

  var constructors = {};

  constructors[ak.MATRIX_T] = function(state, arg0, args) {
   var arg1 = args[1];
   constructors[ak.MATRIX_T][ak.type(arg1)](state, arg0, arg1);
  };

  constructors[ak.MATRIX_T][ak.NUMBER_T] = function(state, m, e) {
   var n = m.rows();
   var s;

   if(m.cols()!==n) throw new Error('non-square matrix in ak.jacobiDecomposition');

   s = (n>1) ? fromMatrix(m, e) : {v:ak.matrix('identity', n), l:ak.vector(n, m.at(0, 0))};

   state.v = s.v;
   state.l = s.l;
  };

  constructors[ak.MATRIX_T][ak.UNDEFINED_T] = function(state, m) {
   var n = m.rows();
   var s;

   if(m.cols()!==n) throw new Error('non-square matrix in ak.jacobiDecomposition');

   s = (n>1) ? fromMatrix(m, ak.EPSILON) : {v:ak.matrix('identity', n), l:ak.vector(n, m.at(0, 0))};

   state.v = s.v;
   state.l = s.l;
  };

  constructors[ak.MATRIX_T][ak.VECTOR_T] = function(state, v, l) {
   if(v.rows()!==v.cols()) throw new Error('invalid v in ak.jacobiDecomposition');
   if(l.dims()!==v.rows()) throw new Error('invalid lambda in ak.jacobiDecomposition');

   state.v = ak.matrix(v);
   state.l = ak.vector(l);
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var v = obj.v;
   var l = obj.lambda;

   if(ak.nativeType(v)===ak.FUNCTION_T) v = v();
   if(ak.nativeType(l)===ak.FUNCTION_T) l = l();

   if(ak.type(v)!==ak.MATRIX_T || v.rows()!==v.cols()) throw new Error('invalid v in ak.jacobiDecomposition');
   if(ak.type(l)!==ak.VECTOR_T || l.dims()!==v.rows()) throw new Error('invalid lambda in ak.jacobiDecomposition');

   state.v = ak.matrix(v);
   state.l = ak.vector(l);
  };

  constructors[ak.JACOBI_DECOMPOSITION_T] = constructors[ak.OBJECT_T];

  function cutoff(a, e) {
    var n = a.length;
    var x = 0;
    var i;

    for(i=0;i<n;++i) x = Math.max(Math.abs(a[i]), x);
    return x*e;
  }

  function fD (f, d)    {return toMatrix(d.v().toArray(), d.lambda().toArray().map(f));}
  function fDR(f, d, r) {return toMatrix(d.v().toArray(), d.lambda().toArray().map(function(x){return f(x, r);}));}
  function fRD(f, r, d) {return toMatrix(d.v().toArray(), d.lambda().toArray().map(function(x){return f(r, x);}));}

  function stableInv(d, e) {
   var l = d.lambda().toArray();
   var n = l.length;
   var c, k;

   if(ak.nativeType(e)===ak.UNDEFINED_T)   e = 0;
   else if(ak.nativeType(e)!==ak.NUMBER_T) throw new Error('invalid threshold in ak.jacobiDecomposition stableInv');

   c = cutoff(l, Math.abs(e));
   for(k=0;k<n;++k) l[k] = (Math.abs(l[k])<=c) ? 0 : 1/l[k];
   return toMatrix(d.v().toArray(), l);
  }

  function divMD(m, d, e) {
   var v = d.v();
   var l = d.lambda().toArray();
   var n = l.length;
   var c = m.cols();
   var a = new Array(n*c);
   var i, j, k, s;

   if(m.rows()!==n) throw new Error('dimensions mismatch in ak.jacobiDecomposition div');

   if(ak.nativeType(e)===ak.UNDEFINED_T) {
    for(k=0;k<n;++k) l[k] = 1/l[k];
   }
   else {
    if(ak.nativeType(e)!==ak.NUMBER_T) throw new Error('invalid threshold in ak.jacobiDecomposition stableDiv');

    s = cutoff(l, Math.abs(e));
    for(k=0;k<n;++k) l[k] = (Math.abs(l[k])<=s) ? 0 : 1/l[k];
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
    if(ak.nativeType(e)!==ak.NUMBER_T) throw new Error('invalid threshold in ak.jacobiDecomposition stableDiv');

    c = cutoff(l, Math.abs(e));
    for(k=0;k<n;++k) l[k] = (Math.abs(l[k])<=c) ? 0 : r/l[k];
   }
   return toMatrix(d.v().toArray(), l);
  }

  function divVD(x, d, e) {
   var v = d.v();
   var l = d.lambda().toArray();
   var n = l.length;
   var a = new Array(n);
   var j, k, s;

   if(x.dims()!==n) throw new Error('dimensions mismatch in ak.jacobiDecomposition div');

   if(ak.nativeType(e)===ak.UNDEFINED_T) {
    for(k=0;k<n;++k) l[k] = 1/l[k];
   }
   else {
    if(ak.nativeType(e)!==ak.NUMBER_T) throw new Error('invalid threshold in ak.jacobiDecomposition stableDiv');

    s = cutoff(l, Math.abs(e));
    for(k=0;k<n;++k) l[k] = (Math.abs(l[k])<=s) ? 0 : 1/l[k];
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

  ak.overload(ak.abs,       ak.JACOBI_DECOMPOSITION_T, function(d){return ak.abs(d.lambda());});
  ak.overload(ak.acos,      ak.JACOBI_DECOMPOSITION_T, function(d){return fD(Math.acos, d);});
  ak.overload(ak.asin,      ak.JACOBI_DECOMPOSITION_T, function(d){return fD(Math.asin, d);});
  ak.overload(ak.atan,      ak.JACOBI_DECOMPOSITION_T, function(d){return fD(Math.atan, d);});
  ak.overload(ak.cos,       ak.JACOBI_DECOMPOSITION_T, function(d){return fD(Math.cos, d);});
  ak.overload(ak.cosh,      ak.JACOBI_DECOMPOSITION_T, function(d){return fD(ak.cosh, d);});
  ak.overload(ak.det,       ak.JACOBI_DECOMPOSITION_T, function(d){return d.lambda().toArray().reduce(function(x0,x1){return x0*x1;}, 1);});
  ak.overload(ak.exp,       ak.JACOBI_DECOMPOSITION_T, function(d){return fD(Math.exp, d);});
  ak.overload(ak.inv,       ak.JACOBI_DECOMPOSITION_T, function(d){return fD(function(x){return 1/x;}, d);});
  ak.overload(ak.log,       ak.JACOBI_DECOMPOSITION_T, function(d){return fD(Math.log, d);});
  ak.overload(ak.neg,       ak.JACOBI_DECOMPOSITION_T, function(d){return fD(function(x){return -x;}, d);});
  ak.overload(ak.stableInv, ak.JACOBI_DECOMPOSITION_T, stableInv);
  ak.overload(ak.sin,       ak.JACOBI_DECOMPOSITION_T, function(d){return fD(Math.sin, d);});
  ak.overload(ak.sinh,      ak.JACOBI_DECOMPOSITION_T, function(d){return fD(ak.sinh, d);});
  ak.overload(ak.sqrt,      ak.JACOBI_DECOMPOSITION_T, function(d){return fD(Math.sqrt, d);});
  ak.overload(ak.tan,       ak.JACOBI_DECOMPOSITION_T, function(d){return fD(Math.tan, d);});
  ak.overload(ak.tanh,      ak.JACOBI_DECOMPOSITION_T, function(d){return fD(ak.tanh, d);});
  ak.overload(ak.tr,        ak.JACOBI_DECOMPOSITION_T, function(d){return d.lambda().toArray().reduce(function(x0,x1){return x0+x1;}, 0);});

  ak.overload(ak.div,       [ak.MATRIX_T, ak.JACOBI_DECOMPOSITION_T], divMD);
  ak.overload(ak.div,       [ak.JACOBI_DECOMPOSITION_T, ak.NUMBER_T], function(d, r){return fDR(function(x, r){return x/r;}, d, r);});
  ak.overload(ak.div,       [ak.NUMBER_T, ak.JACOBI_DECOMPOSITION_T], divRD);
  ak.overload(ak.div,       [ak.VECTOR_T, ak.JACOBI_DECOMPOSITION_T], divVD);
  ak.overload(ak.pow,       [ak.JACOBI_DECOMPOSITION_T, ak.NUMBER_T], function(d, r){return fDR(Math.pow, d, r);});
  ak.overload(ak.pow,       [ak.NUMBER_T, ak.JACOBI_DECOMPOSITION_T], function(r, d){return fRD(Math.pow, r, d);});
  ak.overload(ak.stableDiv, [ak.MATRIX_T, ak.JACOBI_DECOMPOSITION_T], divMD);
  ak.overload(ak.stableDiv, [ak.JACOBI_DECOMPOSITION_T, ak.NUMBER_T], function(d, r){return fDR(function(x, r){return x/r;}, d, r);});
  ak.overload(ak.stableDiv, [ak.NUMBER_T, ak.JACOBI_DECOMPOSITION_T], divRD);
  ak.overload(ak.stableDiv, [ak.VECTOR_T, ak.JACOBI_DECOMPOSITION_T], divVD);
 }

 ak.using('Matrix/Matrix.js', define);
})();
