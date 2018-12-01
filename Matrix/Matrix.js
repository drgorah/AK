//AK/Matrix/Matrix.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.MATRIX_T) return;
  ak.MATRIX_T = 'ak.matrix';

  function Matrix(){}
  Matrix.prototype = {TYPE: ak.MATRIX_T, valueOf: function(){return ak.NaN;}};

  function toArray(rows, cols, elems) {
   var a = new Array(rows);
   var off = 0;
   var r, row, c;

   for(r=0;r<rows;++r) {
    row = new Array(cols);
    for(c=0;c<cols;++c) row[c] = elems[off++];
    a[r] = row;
   }
   return a;
  }

  function toString(rows, cols, elems, f) {
   var s = [];
   var off = 0;
   var r, c;

   s.push('[');

   for(r=0;r<rows;++r) {
    s.push('[');

    for(c=0;c<cols;++c) {
     s.push(f ? f(elems[off++]) : elems[off++]);
     s.push(',');
    }

    s.pop();
    s.push(']');
    s.push(',');
   }

   s.pop();
   s.push(']');

   return s.join('');
  }

  ak.matrix = function() {
   var m     = new Matrix();
   var state = {rows: 0, cols: 0, elems: []};
   var arg0  = arguments[0];

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   m.rows = function() {return state.rows;};
   m.cols = function() {return state.cols;};

   m.at = function(r, c) {return state.elems[Number(r)*state.cols+Number(c)];};

   m.toArray  = function() {return toArray(state.rows, state.cols, state.elems);};
   m.toString = function() {return toString(state.rows, state.cols, state.elems);};

   m.toExponential = function(d) {return toString(state.rows, state.cols, state.elems, function(x){return x.toExponential(d);});};
   m.toFixed       = function(d) {return toString(state.rows, state.cols, state.elems, function(x){return x.toFixed(d);});};
   m.toPrecision   = function(d) {return toString(state.rows, state.cols, state.elems, function(x){return x.toPrecision(d);});};

   return Object.freeze(m);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, arr) {
   var rows = arr.length;
   var cols = rows ? arr[0].length : 0;
   var elems = new Array(rows*cols);
   var off = 0;
   var r, row, c;

   for(r=0;r<rows;++r) {
    row = arr[r];
    for(c=0;c<cols;++c) elems[off++] = Number(row[c]);
   }

   state.rows  = rows;
   state.cols  = cols;
   state.elems = elems;
  };

  constructors[ak.NUMBER_T] = function(state, rows, args) {
   var arg1 = args[1];

   state.rows = rows;
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1, args);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, cols, args) {
   var arg2 = args[2];

   state.cols = cols;
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg2)](state, arg2);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.ARRAY_T] = function(state, vals) {
   var n = state.rows*state.cols;
   var elems = new Array(n);
   var i;

   for(i=0;i<n;++i) elems[i] = Number(vals[i]);
   state.elems = elems;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, f) {
   var rows = state.rows;
   var cols = state.cols;
   var elems = new Array(rows*cols);
   var off = 0;
   var r, c;

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     elems[off++] = Number(f(r, c));
    }
   }
   state.elems = elems;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, val) {
   var n = state.rows*state.cols;
   var elems = new Array(n);
   var i;

   val = Number(val);
   for(i=0;i<n;++i) elems[i] = val;
   state.elems = elems;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
   var n = state.rows*state.cols;
   var elems = new Array(n);
   var i;

   for(i=0;i<n;++i) elems[i] = 0;
   state.elems = elems;
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var rows = obj.rows;
   var cols = obj.cols;
   var off = 0;
   var elems, r, c;

   rows = (ak.nativeType(rows)===ak.FUNCTION_T) ? Number(rows()) : Number(rows);
   cols = (ak.nativeType(cols)===ak.FUNCTION_T) ? Number(cols()) : Number(cols);

   elems = new Array(rows*cols);

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     elems[off++] = Number(obj.at(r, c));
    }
   }

   state.rows  = rows;
   state.cols  = cols;
   state.elems = elems;
  };

  constructors[ak.STRING_T] = function(state, type, args) {
   constructors[ak.STRING_T][type.toUpperCase()](state, args);
  };

  constructors[ak.STRING_T]['IDENTITY'] = function(state, args) {
   var arg1 = args[1];
   constructors[ak.STRING_T]['IDENTITY'][ak.nativeType(arg1)](state, arg1);
  };

  constructors[ak.STRING_T]['IDENTITY'][ak.NUMBER_T] = function(state, n) {
   var elems = new Array(n*n);
   var off = 0;
   var r, c;

   for(r=0;r<n;++r) {
    for(c=0;c<r;++c)   elems[off++] = 0;
    elems[off++] = 1;
    for(c=r+1;c<n;++c) elems[off++] = 0;
   }

   state.rows  = n;
   state.cols  = n;
   state.elems = elems;
  };

  constructors[ak.STRING_T]['DIAGONAL'] = function(state, args) {
   var a = new Array(args.length-1);
   var off = 0;
   var i, v, r, c, n, elems;

   for(i=1;i<args.length;++i) a[i-1] = args[i];
   v = ak.vector.apply(null, a);
   n = v.dims();
   elems = new Array(n*n);

   for(r=0;r<n;++r) {
    for(c=0;c<r;++c)   elems[off++] = 0;
    elems[off++] = v.at(r);
    for(c=r+1;c<n;++c) elems[off++] = 0;
   }

   state.rows  = n;
   state.cols  = n;
   state.elems = elems;
  };

  function abs(m) {
   var s = 0;
   var rows = m.rows();
   var cols = m.cols();
   var r, c, x;

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     x = m.at(r, c);
     s += x*x;
    }
   }
   return Math.sqrt(s);
  }

  function det(m) {
   var n = m.rows();
   var a = m.toArray();
   var d = 1;
   var r, r1, r2, c, row1, row2, x, abs1, abs2;

   if(m.cols()!==n) throw new Error('non-square matrix in ak.matrix det');

   for(r1=0;r1<n;++r1) {
    row1 = a[r1];
    abs1 = Math.abs(row1[r1]);

    for(r2=r1+1;r2<n;++r2) {
     row2 = a[r2];
     abs2 = Math.abs(row2[r1]);

     if(abs2>abs1) {
      d = -d;
      a[r2] = row1; row1 = row2;
      abs1  = abs2;
     }
    }

    if(abs1===0) return 0;

    x = row1[r1];
    d *= x;

    for(c=r1+1;c<n;++c) row1[c] /= x;

    for(r2=r1+1;r2<n;++r2) {
     row2 = a[r2];
     x = row2[r1];

     for(c=r1+1;c<n;++c) row2[c] -= x*row1[c];
    }
   }
   return d;
  }

  function exp(m) {
   var eps = ak.EPSILON;
   var n   = m.rows();
   var mi  = ak.matrix('identity', n);
   var s   = mi;
   var i   = 1;

   if(m.cols()!==n) throw new Error('non-square matrix in ak.matrix exp');

   do {
    mi = divMR(mul(mi, m), i++);
    s  = add(s, mi);
   }
   while(abs(mi)>(1+abs(s))*eps);
   return s;
  }

  function inv(m) {
   var n = m.rows();
   var a = m.toArray();
   var i = ak.matrix('identity', n).toArray();
   var r1, r2, c, arow1, irow1, abs1, arow2, irow2, abs2, x;

   if(m.cols()!==n) throw new Error('non-square matrix in ak.matrix inv');

   for(r1=0;r1<n;++r1) {
    arow1 = a[r1];
    irow1 = i[r1];
    abs1  = Math.abs(arow1[r1]);

    for(r2=r1+1;r2<n;++r2) {
     arow2 = a[r2];
     abs2  = Math.abs(arow2[r1]);

     if(abs2>abs1) {
      irow2 = i[r2];

      a[r2] = arow1; arow1 = arow2; a[r1] = arow1;
      i[r2] = irow1; irow1 = irow2; i[r1] = irow1;
      abs1  = abs2;
     }
    }

    if(abs1===0) throw new Error('singular matrix in ak.matrix inv');
    x = arow1[r1];

    for(c=r1+1;c<n;++c) arow1[c] /= x;
    for(c=0;   c<n;++c) irow1[c] /= x;

    for(r2=0;r2<n;++r2) {
     if(r2!==r1) {
      arow2 = a[r2];
      irow2 = i[r2];
      x = arow2[r1];

      for(c=r1+1;c<n;++c) arow2[c] -= x*arow1[c];
      for(c=0;   c<n;++c) irow2[c] -= x*irow1[c];
     }
    }
   }
   return ak.matrix(i);
  }

  function leftInv(m) {
   var t;

   if(m.rows()===m.cols()) return inv(m);
   if(m.rows()<m.cols())   throw new Error('fewer rows than columns in ak.matrix leftInv');

   t = transpose(m);
   return mul(inv(mul(t, m)), t);
  }

  function neg(m) {
   var rows = m.rows();
   var cols = m.cols();
   var a = new Array(rows*cols);
   var off = 0;
   var r, c;

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     a[off++] = -m.at(r, c);
    }
   }
   return ak.matrix(rows, cols, a);
  }

  function rightInv(m) {
   var t;

   if(m.rows()===m.cols()) return inv(m);
   if(m.cols()<m.rows())   throw new Error('fewer columns than rows in ak.matrix rightInv');

   t = transpose(m);
   return mul(t, inv(mul(m, t)));
  }

  function tr(m) {
   var n = m.rows();
   var s = 0;
   var i;

   if(m.cols()!==n) throw new Error('non-square matrix in ak.matrix tr');

   for(i=0;i<n;++i) s += m.at(i, i);
   return s;
  }

  function transpose(m) {
   return ak.matrix(m.cols(), m.rows(), function(r, c){return m.at(c, r);});
  }

  function add(m0, m1) {
   var rows = m0.rows();
   var cols = m0.cols();
   var a = m0.toArray();
   var r, c, row;

   if(m1.rows()!==rows || m1.cols()!==cols) throw new Error('dimensions mismatch in ak.matrix add');

   for(r=0;r<rows;++r) {
    row = a[r];
    for(c=0;c<cols;++c) {
     row[c] += m1.at(r, c);
    }
   }
   return ak.matrix(a);
  }

  function dist(m0, m1) {
   var rows = m0.rows();
   var cols = m0.cols();
   var s = 0;
   var r, c;

   if(m1.rows()!==rows || m1.cols()!==cols) throw new Error('dimensions mismatch in ak.matrix dist');

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     s += Math.pow(m0.at(r, c)-m1.at(r, c), 2);
    }
   }
   return Math.sqrt(s);
  }

  function div(m0, m1) {
   return mul(rightInv(m1), m0);
  }

  function divMR(m, s) {
   var rows = m.rows();
   var cols = m.cols();
   var a = m.toArray();
   var r, c, row;

   for(r=0;r<rows;++r) {
    row = a[r];
    for(c=0;c<cols;++c) row[c] /= s;
   }
   return ak.matrix(a);
  }

  function divRM(r, m) {
   return mulMR(rightInv(m), r);
  }

  function divVM(v, m) {
   return mulMV(rightInv(m), v);
  }

  function eq(m0, m1) {
   var rows = m0.rows();
   var cols = m0.cols();
   var r, c;

   if(m1.rows()!==rows || m1.cols()!==cols) return false;

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     if(m0.at(r, c)!==m1.at(r, c)) return false;
    }
   }
   return true;
  }

  function mul(m0, m1) {
   var r0 = m0.rows();
   var c0 = m0.cols();
   var r1 = m1.rows();
   var c1 = m1.cols();
   var a = new Array(r0*c1);
   var off = 0;
   var i, j, k, s;

   if(c0!==r1) throw new Error('dimensions mismatch in ak.matrix mul');

   for(i=0;i<r0;++i) {
    for(j=0;j<c1;++j) {
     s = 0;
     for(k=0;k<c0;++k) s += m0.at(i, k) * m1.at(k, j);
     a[off++] = s;
    }
   }
   return ak.matrix(r0, c1, a);
  }

  function mulMR(m, s) {
   var rows = m.rows();
   var cols = m.cols();
   var a = m.toArray();
   var r, c, row;

   for(r=0;r<rows;++r) {
    row = a[r];
    for(c=0;c<cols;++c) row[c] *= s;
   }
   return ak.matrix(a);
  }

  function mulRM(s, m) {
   var rows = m.rows();
   var cols = m.cols();
   var a = m.toArray();
   var r, c, row;

   for(r=0;r<rows;++r) {
    row = a[r];
    for(c=0;c<cols;++c) row[c] *= s;
   }
   return ak.matrix(a);
  }

  function mulMV(m, v) {
   var rows = m.rows();
   var cols = m.cols();
   var dims = v.dims();
   var a = new Array(rows);
   var r, c, s;

   if(dims!==cols) throw new Error('dimensions mismatch in ak.matrix mul');

   for(r=0;r<rows;++r) {
    s = 0;
    for(c=0;c<cols;++c) s += m.at(r, c) * v.at(c);
    a[r] = s;
   }
   return ak.vector(a);
  }

  function mulVM(v, m) {
   var rows = m.rows();
   var cols = m.cols();
   var dims = v.dims();
   var a = new Array(cols);
   var r, c, s;

   if(dims!==rows) throw new Error('dimensions mismatch in ak.matrix mul');

   for(c=0;c<cols;++c) {
    s = 0;
    for(r=0;r<rows;++r) s += v.at(r) * m.at(r, c);
    a[c] = s;
   }
   return ak.vector(a);
  }

  function ne(m0, m1) {
   var rows = m0.rows();
   var cols = m0.cols();
   var r, c;

   if(m1.rows()!==rows || m1.cols()!==cols) return true;

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     if(m0.at(r, c)!==m1.at(r, c)) return true;
    }
   }
   return false;
  }

  function powMR(m, r) {
   var n = m.rows();
   var p = ak.matrix('identity', n);
   var i;

   if(m.cols()!==n)    throw new Error('non-square matrix in ak.matrix pow');
   if(r!==ak.floor(r)) throw new Error('non-integer exponent in ak.matrix pow');

   if(r<0) {
    r = -r;
    m = inv(m);
   }

   while(r>0) {
    if(r%2===1) p = mul(p, m);
    m = mul(m, m);
    r = ak.floor(r/2);
   }
   return p;
  }

  function powRM(r, m) {
   return exp(mulRM(Math.log(r), m));
  }

  function sub(m0, m1) {
   var rows = m0.rows();
   var cols = m0.cols();
   var a  = m0.toArray();
   var r, c, row;

   if(m1.rows()!==rows || m1.cols()!==cols) throw new Error('dimensions mismatch in ak.matrix sub');

   for(r=0;r<rows;++r) {
    row = a[r];
    for(c=0;c<cols;++c) {
     row[c] -= m1.at(r, c);
    }
   }
   return ak.matrix(a);
  }

  function outerMul(v0, v1) {
   var rows = v0.dims();
   var cols = v1.dims();
   var off = 0;
   var a = new Array(rows*cols);
   var r, c, x;

   v1 = v1.toArray();

   for(r=0;r<rows;++r) {
    x = v0.at(r);
    for(c=0;c<cols;++c) {
     a[off++] = x * v1[c];
    }
   }
   return ak.matrix(rows, cols, a);
  }

  if(!ak.det) ak.det = function(x) {return ak.det[ak.type(x)](x)};
  if(!ak.tr) ak.tr = function(x) {return ak.tr[ak.type(x)](x)};
  if(!ak.transpose) ak.transpose = function(x) {return ak.transpose[ak.type(x)](x)};

  if(!ak.leftInv) ak.leftInv = function(x) {return ak.leftInv[ak.type(x)](x)};
  if(!ak.rightInv) ak.rightInv = function(x) {return ak.rightInv[ak.type(x)](x)};

  if(!ak.outerMul) ak.outerMul = function(x0, x1) {return ak.outerMul[ak.type(x0)][ak.type(x1)](x0, x1)};

  ak.overload(ak.abs, ak.MATRIX_T, abs);
  ak.overload(ak.det, ak.MATRIX_T, det);
  ak.overload(ak.exp, ak.MATRIX_T, exp);
  ak.overload(ak.inv, ak.MATRIX_T, inv);
  ak.overload(ak.leftInv, ak.MATRIX_T, leftInv);
  ak.overload(ak.neg, ak.MATRIX_T, neg);
  ak.overload(ak.rightInv, ak.MATRIX_T, rightInv);
  ak.overload(ak.tr, ak.MATRIX_T, tr);
  ak.overload(ak.transpose, ak.MATRIX_T, transpose);

  ak.overload(ak.add,  [ak.MATRIX_T, ak.MATRIX_T], add);
  ak.overload(ak.dist, [ak.MATRIX_T, ak.MATRIX_T], dist);
  ak.overload(ak.div,  [ak.MATRIX_T, ak.MATRIX_T], div);
  ak.overload(ak.div,  [ak.MATRIX_T, ak.NUMBER_T], divMR);
  ak.overload(ak.div,  [ak.NUMBER_T, ak.MATRIX_T], divRM);
  ak.overload(ak.div,  [ak.VECTOR_T, ak.MATRIX_T], divVM);
  ak.overload(ak.eq,   [ak.MATRIX_T, ak.MATRIX_T], eq);
  ak.overload(ak.mul,  [ak.MATRIX_T, ak.MATRIX_T], mul);
  ak.overload(ak.mul,  [ak.MATRIX_T, ak.NUMBER_T], mulMR);
  ak.overload(ak.mul,  [ak.NUMBER_T, ak.MATRIX_T], mulRM);
  ak.overload(ak.mul,  [ak.MATRIX_T, ak.VECTOR_T], mulMV);
  ak.overload(ak.mul,  [ak.VECTOR_T, ak.MATRIX_T], mulVM);
  ak.overload(ak.ne,   [ak.MATRIX_T, ak.MATRIX_T], ne);
  ak.overload(ak.pow,  [ak.MATRIX_T, ak.NUMBER_T], powMR);
  ak.overload(ak.pow,  [ak.NUMBER_T, ak.MATRIX_T], powRM);
  ak.overload(ak.sub,  [ak.MATRIX_T, ak.MATRIX_T], sub);

  ak.overload(ak.outerMul, [ak.VECTOR_T, ak.VECTOR_T], outerMul);
 }

 ak.using('Matrix/Vector.js', define);
})();
