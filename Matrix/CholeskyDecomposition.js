//AK/Matrix/CholeskyDecomposition.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.CHOLESKY_DECOMPOSITION_T) return;
  ak.CHOLESKY_DECOMPOSITION_T = 'ak.choleskyDecomposition';

  function CholeskyDecomposition(){}
  CholeskyDecomposition.prototype = {TYPE: ak.CHOLESKY_DECOMPOSITION_T, valueOf: function(){return ak.NaN;}};

  function toMatrix(l) {
   var n = l.rows();
   var m = new Array(n);
   var i, j, k, s;

   for(i=0;i<n;++i) m[i] = new Array(n);

   for(i=0;i<n;++i) {
    for(j=0;j<=i;++j) {
     s = 0;
     for(k=0;k<=j;++k) s += l.at(i, k)*l.at(j, k);
     m[i][j] = m[j][i] = s;
    }
   }
   return ak.matrix(m);
  }

  function fromMatrix(m) {
   var n = m.rows();
   var i, j, k, mj, mi, s, x;
   
   m = m.toArray();

   for(j=0;j<n;++j) {
    mj = m[j];
    s = mj[j];
    for(k=0;k<j;++k) s -= mj[k]*mj[k];
    if(!(s>0)) throw new Error('non-positive definite matrix in ak.choleskyDecomposition');

    s = Math.sqrt(s);
    mj[j] = s;
    for(i=j+1;i<n;++i) {
     mi = m[i];
     x = 0.5*(mi[j]+mj[i]);
     for(k=0;k<j;++k) x -= mi[k]*mj[k];
     mi[j] = x/s;
     mj[i] = 0;
    }
   }
   return ak.matrix(m);
  }

  function isLower(m) {
   var n = m.rows();
   var i, j;

   for(i=0;i<n;++i) {
    for(j=i+1;j<n;++j) {
     if(m.at(i, j)!==0) return false;
    }
   }
   return true;
  }

  function isUpper(m) {
   var n = m.rows();
   var i, j;

   for(i=0;i<n;++i) {
    for(j=0;j<i;++j) {
     if(m.at(i, j)!==0) return false;
    }
   }
   return true;
  }

  function fromLower(l) {
   var n = l.rows();
   var i, j, x;

   l = l.toArray();

   for(i=0;i<n;++i) {
    x = l[i][i];
    if(x===0) throw new Error('invalid l in ak.choleskyDecomposition');
    if(x<0) {
     for(j=i;j<n;++j) l[j][i] = -l[j][i];
    }    
   }
   return ak.matrix(l);
  }

  ak.choleskyDecomposition = function(arg) {
   var cd    = new CholeskyDecomposition();
   var state = {l:undefined};

   constructors[ak.type(arg)](state, arg);

   cd.l = function() {return state.l;};

   cd.toMatrix = function() {return toMatrix(state.l);};
   cd.toString = function() {return '{l:'+state.l.toString()+'}';};

   cd.toExponential = function(d) {return '{l:'+state.l.toExponential(d)+'}';};
   cd.toFixed       = function(d) {return '{l:'+state.l.toFixed(d)+'}';};
   cd.toPrecision   = function(d) {return '{l:'+state.l.toPrecision(d)+'}';};

   return Object.freeze(cd);
  };

  var constructors = {};

  constructors[ak.MATRIX_T] = function(state, m) {
   if(m.rows()!==m.cols()) throw new Error('non-square matrix in ak.choleskyDecomposition');
   state.l = isLower(m) && !isUpper(m) ? fromLower(m) : fromMatrix(m);
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var l = obj.l;

   if(ak.nativeType(l)===ak.FUNCTION_T) l = l();
   if(ak.type(l)!==ak.MATRIX_T || l.rows()!==l.cols() || !isLower(l)) throw new Error('invalid l in ak.choleskyDecomposition');
   state.l = fromLower(l);
  };

  constructors[ak.CHOLESKY_DECOMPOSITION_T] = constructors[ak.OBJECT_T];

  function det(d) {
   var l = d.l();
   var n = l.rows();
   var x = 1;
   var i;

   for(i=0;i<n;++i) x *= l.at(i, i);
   return x*x;
  }

  function invArray(d) {
   var l = d.l();
   var n = l.rows();
   var m = new Array(n);
   var i, j, k, mi, mj, s;

   for(i=0;i<n;++i) {
    mi = new Array(n);
    mi[i] = 1 / l.at(i, i);

    for(j=i+1;j<n;++j) {
     s = 0;
     for(k=i;k<j;++k) s += mi[k] * l.at(j, k);
     mi[j] = -s / l.at(j, j);
    }
    m[i] = mi;
   }
   
   for(i=0;i<n;++i) {
    mi = m[i];
    for(j=i;j<n;++j) {
     mj = m[j];

     s = 0;
     for(k=j;k<n;++k) s += mi[k] * mj[k];
     mi[j] = mj[i] = s;
    }
   }

   return m;
  }

  function inv(d) {
   return ak.matrix(invArray(d));
  }

  function divMD(m, d) {
   var l = d.l();
   var n = l.rows();
   var c = m.cols();
   var i, j, k, s;

   if(m.rows()!==n) throw new Error('dimensions mismatch in ak.choleskyDecomposition div');
   m = m.toArray();

   for(j=0;j<c;++j) {
    for(i=0;i<n;++i) {
     s = 0;
     for(k=0;k<i;++k) s += l.at(i, k) * m[k][j];
     m[i][j] = (m[i][j]-s) / l.at(i, i);
    }

    for(i=n-1;i>=0;--i) {
     s = 0;
     for(k=i+1;k<n;++k) s += l.at(k, i) * m[k][j];
     m[i][j] = (m[i][j]-s) / l.at(i, i);
    }
   }

   return ak.matrix(m);
  }

  function divRD(r, d) {
   var m = invArray(d);
   var n = m.length;
   var i, j, mi;

   for(i=0;i<n;++i) {
    mi = m[i];
    for(j=0;j<n;++j) mi[j] *= r;
   }
   return ak.matrix(m);
  }

  function divVD(v, d) {
   var l = d.l();
   var n = l.rows();
   var i, k, s;

   if(v.dims()!==n) throw new Error('dimensions mismatch in ak.choleskyDecomposition div');
   v = v.toArray();

   for(i=0;i<n;++i) {
    s = 0;
    for(k=0;k<i;++k) s += l.at(i, k) * v[k];
    v[i] = (v[i]-s) / l.at(i, i);
   }

   for(i=n-1;i>=0;--i) {
    s = 0;
    for(k=i+1;k<n;++k) s += l.at(k, i) * v[k];
    v[i] = (v[i]-s) / l.at(i, i);
   }

   return ak.vector(v);
  }

  function divWD(w, d) {
   var l = d.l();
   var n = l.rows();
   var c = w.cols();
   var i, j, k, s;

   if(w.rows()!==n) throw new Error('dimensions mismatch in ak.choleskyDecomposition div');
   w = w.toArray();

   for(j=0;j<c;++j) {
    for(i=0;i<n;++i) {
     s = 0;
     for(k=0;k<i;++k) s = ak.add(s, ak.mul(l.at(i, k), w[k][j]));
     w[i][j] = ak.div(ak.sub(w[i][j], s), l.at(i, i));
    }

    for(i=n-1;i>=0;--i) {
     s = 0;
     for(k=i+1;k<n;++k) s = ak.add(s, ak.mul(l.at(k, i), w[k][j]));
     w[i][j] = ak.div(ak.sub(w[i][j], s), l.at(i, i));
    }
   }

   return ak.complexMatrix(w);
  }

  function divCD(c, d) {
   var m = invArray(d);
   var n = m.length;
   var i, j, mi;

   for(i=0;i<n;++i) {
    mi = m[i];
    for(j=0;j<n;++j) mi[j] = ak.mul(c, mi[j]);
   }
   return ak.complexMatrix(m);
  }

  function divZD(z, d) {
   var l = d.l();
   var n = l.rows();
   var i, k, s;

   if(z.dims()!==n) throw new Error('dimensions mismatch in ak.choleskyDecomposition div');
   z = z.toArray();

   for(i=0;i<n;++i) {
    s = 0;
    for(k=0;k<i;++k) s = ak.add(s, ak.mul(l.at(i, k), z[k]));
    z[i] = ak.div(ak.sub(z[i], s), l.at(i, i));
   }

   for(i=n-1;i>=0;--i) {
    s = 0;
    for(k=i+1;k<n;++k) s = ak.add(s, ak.mul(l.at(k, i), z[k]));
    z[i] = ak.div(ak.sub(z[i], s), l.at(i, i));
   }

   return ak.complexVector(z);
  }

  var COMPLEX_T = 'ak.complex';
  var COMPLEX_VECTOR_T = 'ak.complexVector';
  var COMPLEX_MATRIX_T = 'ak.complexMatrix';

  ak.overload(ak.det, ak.CHOLESKY_DECOMPOSITION_T, det);
  ak.overload(ak.inv, ak.CHOLESKY_DECOMPOSITION_T, inv);

  ak.overload(ak.div, [ak.MATRIX_T, ak.CHOLESKY_DECOMPOSITION_T], divMD);
  ak.overload(ak.div, [ak.NUMBER_T, ak.CHOLESKY_DECOMPOSITION_T], divRD);
  ak.overload(ak.div, [ak.VECTOR_T, ak.CHOLESKY_DECOMPOSITION_T], divVD);

  ak.overload(ak.div, [COMPLEX_MATRIX_T, ak.CHOLESKY_DECOMPOSITION_T], divWD);
  ak.overload(ak.div, [COMPLEX_T,        ak.CHOLESKY_DECOMPOSITION_T], divCD);
  ak.overload(ak.div, [COMPLEX_VECTOR_T, ak.CHOLESKY_DECOMPOSITION_T], divZD);
 }

 ak.using('Matrix/Matrix.js', define);
})();
