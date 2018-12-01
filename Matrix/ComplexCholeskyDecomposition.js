//AK/Matrix/ComplexCholeskyDecomposition.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.COMPLEX_CHOLESKY_DECOMPOSITION_T) return;
  ak.COMPLEX_CHOLESKY_DECOMPOSITION_T = 'ak.complexCholeskyDecomposition';

  function ComplexCholeskyDecomposition(){}
  ComplexCholeskyDecomposition.prototype = {TYPE: ak.COMPLEX_CHOLESKY_DECOMPOSITION_T, valueOf: function(){return ak.NaN;}};

  function toMatrix(l) {
   var n = l.rows();
   var m = new Array(n);
   var i, j, k, s;

   for(i=0;i<n;++i) m[i] = new Array(n);

   for(i=0;i<n;++i) {
    for(j=0;j<=i;++j) {
     s = 0;
     for(k=0;k<=j;++k) s = ak.add(s, ak.mul(l.at(i, k), ak.conj(l.at(j, k))));
     m[i][j] = s;
     m[j][i] = ak.conj(s);
    }
   }
   return ak.complexMatrix(m);
  }

  function fromMatrix(m) {
   var n = m.rows();
   var i, j, k, mj, mi, s, z;
   
   m = m.toArray();

   for(j=0;j<n;++j) {
    mj = m[j];
    s = mj[j].re();
    for(k=0;k<j;++k) s -= Math.pow(ak.abs(mj[k]), 2);
    if(!(s>0)) throw new Error('non-positive definite matrix in ak.complexCholeskyDecomposition');

    s = Math.sqrt(s);
    mj[j] = s;
    for(i=j+1;i<n;++i) {
     mi = m[i];
     z = ak.mul(0.5, ak.add(mi[j], ak.conj(mj[i])));
     for(k=0;k<j;++k) z = ak.sub(z, ak.mul(mi[k], ak.conj(mj[k])));
     mi[j] = ak.div(z, s);
     mj[i] = 0;
    }
   }
   return ak.complexMatrix(m);
  }

  function isLower(m) {
   var n = m.rows();
   var i, j;

   for(i=0;i<n;++i) {
    for(j=i+1;j<n;++j) {
     if(ak.ne(m.at(i, j), 0)) return false;
    }
   }
   return true;
  }

  function isUpper(m) {
   var n = m.rows();
   var i, j;

   for(i=0;i<n;++i) {
    for(j=0;j<i;++j) {
     if(ak.ne(m.at(i, j), 0)) return false;
    }
   }
   return true;
  }

  function fromLower(l) {
   var n = l.rows();
   var i, j, z;

   l = l.toArray();

   for(i=0;i<n;++i) {
    z = l[i][i];
    if(z.re()===0 || z.im()!==0) throw new Error('invalid l in ak.complexCholeskyDecomposition');
    if(z.re()<0) {
     for(j=i;j<n;++j) l[j][i] = ak.neg(l[j][i]);
    }    
   }
   return ak.complexMatrix(l);
  }

  ak.complexCholeskyDecomposition = function(arg) {
   var cd    = new ComplexCholeskyDecomposition();
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

  constructors[ak.COMPLEX_MATRIX_T] = function(state, m) {
   if(m.rows()!==m.cols()) throw new Error('non-square matrix in ak.complexCholeskyDecomposition');
   state.l = isLower(m) && !isUpper(m) ? fromLower(m) : fromMatrix(m);
  };

  constructors[ak.MATRIX_T] = function(state, m) {
   if(m.rows()!==m.cols()) throw new Error('non-square matrix in ak.complexCholeskyDecomposition');
   m = ak.complexMatrix(m);
   state.l = isLower(m) && !isUpper(m) ? fromLower(m) : fromMatrix(m);
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var l = obj.l;

   if(ak.nativeType(l)===ak.FUNCTION_T) l = l();
   if(ak.type(l)===ak.MATRIX_T) l = ak.complexMatrix(l);
   if((ak.type(l)!==ak.COMPLEX_MATRIX_T) || l.rows()!==l.cols() || !isLower(l)) throw new Error('invalid l in ak.complexCholeskyDecomposition');
   state.l = fromLower(l);
  };

  constructors[ak.CHOLESKY_DECOMPOSITION_T] = constructors[ak.OBJECT_T];
  constructors[ak.COMPLEX_CHOLESKY_DECOMPOSITION_T] = constructors[ak.OBJECT_T];

  function det(d) {
   var l = d.l();
   var n = l.rows();
   var x = 1;
   var i;

   for(i=0;i<n;++i) x *= l.at(i, i).re();
   return x*x;
  }

  function invArray(d) {
   var l = d.l();
   var n = l.rows();
   var m = new Array(n);
   var i, j, k, mi, mj, s;

   for(i=0;i<n;++i) {
    mi = new Array(n);
    mi[i] = 1 / l.at(i, i).re();

    for(j=i+1;j<n;++j) {
     s = 0;
     for(k=i;k<j;++k) s = ak.add(s, ak.mul(mi[k], l.at(j, k)));
     mi[j] = ak.div(ak.neg(s), l.at(j, j));
    }
    m[i] = mi;
   }
   
   for(i=0;i<n;++i) {
    mi = m[i];
    for(j=i;j<n;++j) {
     mj = m[j];

     s = 0;
     for(k=j;k<n;++k) s = ak.add(s, ak.mul(mi[k], ak.conj(mj[k])));
     mi[j] = ak.conj(s);
     mj[i] = s;
    }
   }

   return m;
  }

  function inv(d) {
   return ak.complexMatrix(invArray(d));
  }

  function divWD(w, d) {
   var l = d.l();
   var n = l.rows();
   var c = w.cols();
   var i, j, k, s;

   if(w.rows()!==n) throw new Error('dimensions mismatch in ak.complexCholeskyDecomposition div');
   w = w.toArray();

   for(j=0;j<c;++j) {
    for(i=0;i<n;++i) {
     s = 0;
     for(k=0;k<i;++k) s = ak.add(s, ak.mul(l.at(i, k), w[k][j]));
     w[i][j] = ak.div(ak.sub(w[i][j], s), l.at(i, i));
    }

    for(i=n-1;i>=0;--i) {
     s = 0;
     for(k=i+1;k<n;++k) s = ak.add(s, ak.mul(ak.conj(l.at(k, i)), w[k][j]));
     w[i][j] = ak.div(ak.sub(w[i][j], s), l.at(i, i).re());
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

   if(z.dims()!==n) throw new Error('dimensions mismatch in ak.complexCholeskyDecomposition div');
   z = z.toArray();

   for(i=0;i<n;++i) {
    s = 0;
    for(k=0;k<i;++k) s = ak.add(s, ak.mul(l.at(i, k), z[k]));
    z[i] = ak.div(ak.sub(z[i], s), l.at(i, i));
   }

   for(i=n-1;i>=0;--i) {
    s = 0;
    for(k=i+1;k<n;++k) s = ak.add(s, ak.mul(ak.conj(l.at(k, i)), z[k]));
    z[i] = ak.div(ak.sub(z[i], s), l.at(i, i).re());
   }

   return ak.complexVector(z);
  }

  ak.overload(ak.det, ak.COMPLEX_CHOLESKY_DECOMPOSITION_T, det);
  ak.overload(ak.inv, ak.COMPLEX_CHOLESKY_DECOMPOSITION_T, inv);

  ak.overload(ak.div, [ak.COMPLEX_MATRIX_T, ak.COMPLEX_CHOLESKY_DECOMPOSITION_T], divWD);
  ak.overload(ak.div, [ak.COMPLEX_T,        ak.COMPLEX_CHOLESKY_DECOMPOSITION_T], divCD);
  ak.overload(ak.div, [ak.COMPLEX_VECTOR_T, ak.COMPLEX_CHOLESKY_DECOMPOSITION_T], divZD);

  ak.overload(ak.div, [ak.MATRIX_T, ak.COMPLEX_CHOLESKY_DECOMPOSITION_T], divWD);
  ak.overload(ak.div, [ak.NUMBER_T, ak.COMPLEX_CHOLESKY_DECOMPOSITION_T], divCD);
  ak.overload(ak.div, [ak.VECTOR_T, ak.COMPLEX_CHOLESKY_DECOMPOSITION_T], divZD);
 }

 ak.using('Matrix/ComplexMatrix.js', define);
})();
