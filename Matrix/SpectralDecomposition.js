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

  function initialState(a, n) {
   var r, c, ar;

   a = a.toArray();
   for(r=0;r<n;++r) {
    ar = a[r];
    for(c=0;c<r;++c) ar[c] = 0.5*(ar[c]+a[c][r]);
   }
   return {a: a, d: new Array(n), e: new Array(n)};
  }

  function tred2(a, d, e, n) {
   var i, j, k, ai, aj, aij, f, g, di, s, ej;
  
   for(i=n-1;i>1;--i) {
    ai = a[i];

    s = 0;
    for(k=0;k<i;++k) s += Math.abs(ai[k]);

    if(s===0) {
     d[i] = 0;
     e[i] = ai[i-1];
    }
    else {
     di = 0;
     for(k=0;k<i;++k) {
      ai[k] /= s;
      di += ai[k]*ai[k];
     }
     f = ai[i-1];
     g = f>=0 ? -Math.sqrt(di) : Math.sqrt(di);
     e[i] = s*g;
     di -= f*g;
     d[i] = di;
     ai[i-1] = f-g;
     f = 0;
     for(j=0;j<i;++j) {
      aj = a[j];
      aj[i] = ai[j]/di;
      g = 0;
      for(k=0;k<=j;++k)  g += aj[k]*ai[k];
      for(k=j+1;k<i;++k) g += a[k][j]*ai[k];
      e[j] = g/di;
      f += e[j]*ai[j];
     }
     for(j=0;j<i;++j) {
      aj = a[j];
      aij = ai[j];
      e[j] -= 0.5*aij*f/di;
      ej = e[j];
      for(k=0;k<=j;k++) aj[k] -= aij*e[k]+ej*ai[k];
     }
    }
   }
  
   ai = a[0]; aj = a[1];

   d[0] = ai[0]; d[1] = aj[1];
   e[0] = 0;     e[1] = aj[0];

   ai[0] = aj[1] = 1;
   ai[1] = aj[0] = 0;
  
   for(i=2;i<n;++i) {
    ai = a[i];
    if(d[i]!==0) {
     for(j=0;j<i;++j) {
      g = 0;
      for(k=0;k<i;++k) g += ai[k]*a[k][j];
      for(k=0;k<i;++k) a[k][j] -= g*a[k][i];
     }
    }
    d[i] = ai[i];
    ai[i] = 1;
    for(j=0;j<i;++j) a[j][i] = ai[j] = 0;
   }
  }

  function tqli(a, d, e, n, eps) {
   var i, k, l, m, it;
   var g, r, s, c, p, sei1, cei1, ak, aki0, aki1;
  
   for(l=0;l<n-1;++l) {
    it = 0;

    do {
     m = l;
     while(m<n-1 && Math.abs(e[m+1])>=eps*(Math.abs(d[m])+Math.abs(d[m+1]))) ++m;

     if(m!==l) {
      if(++it===32) throw new Error('convergence failure in ak.spectralDecomposition');

      g = (d[l+1]-d[l])/(2*e[l+1]);
      g = g>=0 ? d[m]-d[l]+e[l+1]/(g+Math.hypot(g, 1))
               : d[m]-d[l]+e[l+1]/(g-Math.hypot(g, 1));
      s = c = 1;
      p = 0;
      for(i=m-1;i>=l;--i) {
       sei1 = s*e[i+1];
       cei1 = c*e[i+1];
       e[i+2] = Math.hypot(sei1, g);

       if(e[i+2]===0) {
        d[i+1] -= p;
        e[m+1] = 0;
       }
       else {
        s = sei1/e[i+2];
        c = g/e[i+2];
        g = d[i+1]-p;
        r = (d[i]-g)*s+2*c*cei1;
        p = s*r
        d[i+1] = g+p;
        g = c*r-cei1;
        for(k=0;k<n;++k) {
         ak = a[k];
         aki0 = ak[i];
         aki1 = ak[i+1];
         ak[i]   = c*aki0-s*aki1;
         ak[i+1] = s*aki0+c*aki1;
        }
       }
      }
      if(r!==0 || i<l-2) {
       d[l] -= p;
       e[l+1] = g;
       e[m+1] = 0;
      }
     }
    } while(m!==l);
   }
  }

  function fromMatrix(m, e) {
   var n = m.rows();
   var s = initialState(m, n);
   tred2(s.a, s.d, s.e, n);
   tqli(s.a, s.d, s.e, n, e);
   return {v: ak.matrix(s.a), l: ak.vector(s.d)};
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
