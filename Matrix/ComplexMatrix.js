//AK/Matrix/ComplexMatrix.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.COMPLEX_MATRIX_T) return;
  ak.COMPLEX_MATRIX_T = 'ak.complexMatrix';

  function ComplexMatrix(){}
  ComplexMatrix.prototype = {TYPE: ak.COMPLEX_MATRIX_T, valueOf: function(){return ak.NaN;}};

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

  ak.complexMatrix = function() {
   var m     = new ComplexMatrix();
   var state = {rows: 0, cols: 0, elems: []};
   var arg0  = arguments[0];

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   m.rows = function() {return state.rows;};
   m.cols = function() {return state.cols;};

   m.at = function(r, c) {return state.elems[Number(r)*state.cols+Number(c)];};

   m.re = function(){return ak.matrix(state.rows, state.cols, state.elems.map(function(x){return x.re();}));};
   m.im = function(){return ak.matrix(state.rows, state.cols, state.elems.map(function(x){return x.im();}));};

   m.toArray  = function() {return toArray(state.rows, state.cols, state.elems);};
   m.toString = function() {return toString(state.rows, state.cols, state.elems);};

   m.toExponential = function(d) {return toString(state.rows, state.cols, state.elems, function(x){return x.toExponential(d);});};
   m.toFixed       = function(d) {return toString(state.rows, state.cols, state.elems, function(x){return x.toFixed(d);});};
   m.toPrecision   = function(d) {return toString(state.rows, state.cols, state.elems, function(x){return x.toPrecision(d);});};

   return Object.freeze(m);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, arr, args) {
   var arg1 = args[1];

   state.rows = arr.length;
   state.cols = state.rows ? arr[0].length : 0;
   state.elems = new Array(state.rows*state.cols);

   constructors[ak.ARRAY_T][ak.nativeType(arg1)](state, arr, arg1);
  };

  constructors[ak.ARRAY_T][ak.UNDEFINED_T] = function(state, arr) {
   var off = 0;
   var r, row, c;

   for(r=0;r<state.rows;++r) {
    row = arr[r];
    for(c=0;c<state.cols;++c) state.elems[off++] = ak.complex(row[c]);
   }
  };

  constructors[ak.ARRAY_T][ak.ARRAY_T] = function(state, re, im) {
   var off = 0;
   var r, rer, imr, c;

   if(im.length!==state.rows || state.rows>0 && im[0].length!==state.cols) throw new Error('dimensions mismatch in ak.complexMatrix');

   for(r=0;r<state.rows;++r) {
    rer = re[r];
    imr = im[r];
    for(c=0;c<state.cols;++c) state.elems[off++] = ak.complex(Number(rer[c]), Number(imr[c]));
   }
  };

  constructors[ak.NUMBER_T] = function(state, rows, args) {
   var arg1 = args[1];

   state.rows = rows;
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1, args);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, cols, args) {
   var arg2 = args[2];

   state.cols = cols;
   state.elems = new Array(state.rows*state.cols);
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg2)](state, arg2, args);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.ARRAY_T] = function(state, vals, args) {
   var arg3 = args[3];
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.ARRAY_T][ak.nativeType(arg3)](state, vals, arg3);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.ARRAY_T][ak.ARRAY_T] = function(state, re, im) {
   var n = state.rows*state.cols;
   var i;

   for(i=0;i<n;++i) state.elems[i] = ak.complex(Number(re[i]), Number(im[i]));
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.ARRAY_T][ak.UNDEFINED_T] = function(state, vals) {
   var n = state.rows*state.cols;
   var i;

   for(i=0;i<n;++i) state.elems[i] = ak.complex(vals[i]);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, f) {
   var off = 0;
   var r, c;

   for(r=0;r<state.rows;++r) {
    for(c=0;c<state.cols;++c) {
     state.elems[off++] = ak.complex(f(r, c));
    }
   }
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, val, args) {
   var arg3 = args[3];
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg3)](state, val, arg3);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, re, im) {
   var n = state.rows*state.cols;
   var c = ak.complex(re, im);
   var i;

   for(i=0;i<n;++i) state.elems[i] = c;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state, val) {
   var n = state.rows*state.cols;
   var i;

   val = ak.complex(val);
   for(i=0;i<n;++i) state.elems[i] = val;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.OBJECT_T] = function(state, obj) {
   var n = state.rows*state.cols;
   var i;

   obj = ak.complex(obj);
   for(i=0;i<n;++i) state.elems[i] = obj;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
   var n = state.rows*state.cols;
   var c = ak.complex(0);
   var i;

   for(i=0;i<n;++i) state.elems[i] = c;
  };

  constructors[ak.OBJECT_T] = function(state, obj, args) {
   var arg1 = args[1];
   constructors[ak.OBJECT_T][ak.nativeType(arg1)](state, obj, arg1);
  }

  constructors[ak.OBJECT_T][ak.OBJECT_T] = function(state, re, im) {
   var rrows = re.rows;
   var rcols = re.cols;
   var irows = im.rows;
   var icols = im.cols;
   var off = 0;
   var elems, r, c;

   rrows = (ak.nativeType(rrows)===ak.FUNCTION_T) ? Number(rrows()) : Number(rrows);
   rcols = (ak.nativeType(rcols)===ak.FUNCTION_T) ? Number(rcols()) : Number(rcols);

   irows = (ak.nativeType(irows)===ak.FUNCTION_T) ? Number(irows()) : Number(irows);
   icols = (ak.nativeType(icols)===ak.FUNCTION_T) ? Number(icols()) : Number(icols);

   if(irows!==rrows || icols!==rcols) throw new Error('dimensions mismatch in ak.complexMatrix');

   elems = new Array(rrows*rcols);

   for(r=0;r<rrows;++r) {
    for(c=0;c<rcols;++c) {
     elems[off++] = ak.complex(Number(re.at(r, c)), Number(im.at(r, c)));
    }
   }

   state.rows  = rrows;
   state.cols  = rcols;
   state.elems = elems;
  };

  constructors[ak.OBJECT_T][ak.UNDEFINED_T] = function(state, obj) {
   var rows = obj.rows;
   var cols = obj.cols;
   var off = 0;
   var elems, r, c;

   rows = (ak.nativeType(rows)===ak.FUNCTION_T) ? Number(rows()) : Number(rows);
   cols = (ak.nativeType(cols)===ak.FUNCTION_T) ? Number(cols()) : Number(cols);

   elems = new Array(rows*cols);

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     elems[off++] = ak.complex(obj.at(r, c));
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
   var zero = ak.complex(0);
   var one = ak.complex(1);
   var r, c;

   for(r=0;r<n;++r) {
    for(c=0;c<r;++c)   elems[off++] = zero;
    elems[off++] = one;
    for(c=r+1;c<n;++c) elems[off++] = zero;
   }

   state.rows  = n;
   state.cols  = n;
   state.elems = elems;
  };

  constructors[ak.STRING_T]['DIAGONAL'] = function(state, args) {
   var a = new Array(args.length-1);
   var off = 0;
   var zero = ak.complex(0);
   var i, v, r, c, n, elems;

   for(i=1;i<args.length;++i) a[i-1] = args[i];
   v = ak.complexVector.apply(null, a);
   n = v.dims();
   elems = new Array(n*n);

   for(r=0;r<n;++r) {
    for(c=0;c<r;++c)   elems[off++] = zero;
    elems[off++] = v.at(r);
    for(c=r+1;c<n;++c) elems[off++] = zero;
   }

   state.rows  = n;
   state.cols  = n;
   state.elems = elems;
  };

  function abs(w) {
   var s = 0;
   var rows = w.rows();
   var cols = w.cols();
   var r, c, x;

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     s += Math.pow(ak.abs(w.at(r, c)), 2);
    }
   }
   return Math.sqrt(s);
  }

  function adjoint(w) {
   var rows = w.rows();
   var cols = w.cols();
   var a = new Array(rows*cols);
   var off = 0;
   var r, c;

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     a[off++] = ak.conj(w.at(c, r));
    }
   }
   return ak.complexMatrix(cols, rows, a);
  }

  function conj(w) {
   var rows = w.rows();
   var cols = w.cols();
   var a = new Array(rows*cols);
   var off = 0;
   var r, c;

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     a[off++] = ak.conj(w.at(r, c));
    }
   }
   return ak.complexMatrix(rows, cols, a);
  }

  function conjM(m) {
   return m;
  }

  function det(w) {
   var n = w.rows();
   var a = w.toArray();
   var d = ak.complex(1);
   var r, r1, r2, c, row1, row2, x, abs1, abs2;

   if(w.cols()!==n) throw new Error('non-square matrix in ak.complexMatrix det');

   for(r1=0;r1<n;++r1) {
    row1 = a[r1];
    abs1 = ak.abs(row1[r1]);

    for(r2=r1+1;r2<n;++r2) {
     row2 = a[r2];
     abs2 = ak.abs(row2[r1]);

     if(abs2>abs1) {
      d = ak.neg(d);
      a[r2] = row1; row1 = row2;
      abs1  = abs2;
     }
    }

    if(abs1===0) return ak.complex(0);

    x = row1[r1];
    d = ak.mul(d, x);

    for(c=r1+1;c<n;++c) row1[c] = ak.div(row1[c], x);

    for(r2=r1+1;r2<n;++r2) {
     row2 = a[r2];
     x = row2[r1];

     for(c=r1+1;c<n;++c) row2[c] = ak.sub(row2[c], ak.mul(x, row1[c]));
    }
   }
   return d;
  }

  function exp(w) {
   var eps = ak.EPSILON;
   var n   = w.rows();
   var wi  = ak.complexMatrix('identity', n);
   var s   = wi;
   var i   = 1;

   if(w.cols()!==n) throw new Error('non-square matrix in ak.complexMatrix exp');

   do {
    wi = divWC(mul(wi, w), i++);
    s  = add(s, wi);
   }
   while(abs(wi)>(1+abs(s))*eps);
   return s;
  }

  function inv(w) {
   var n = w.rows();
   var a = w.toArray();
   var i = ak.complexMatrix('identity', n).toArray();
   var r1, r2, c, arow1, irow1, abs1, arow2, irow2, abs2, z;

   if(w.cols()!==n) throw new Error('non-square matrix in ak.complexMatrix inv');

   for(r1=0;r1<n;++r1) {
    arow1 = a[r1];
    irow1 = i[r1];
    abs1  = ak.abs(arow1[r1]);

    for(r2=r1+1;r2<n;++r2) {
     arow2 = a[r2];
     abs2  = ak.abs(arow2[r1]);

     if(abs2>abs1) {
      irow2 = i[r2];

      a[r2] = arow1; arow1 = arow2; a[r1] = arow1;
      i[r2] = irow1; irow1 = irow2; i[r1] = irow1;
      abs1  = abs2;
     }
    }

    if(abs1===0) throw new Error('singular matrix in ak.complexMatrix inv');
    z = arow1[r1];

    for(c=r1+1;c<n;++c) arow1[c] = ak.div(arow1[c], z);
    for(c=0;   c<n;++c) irow1[c] = ak.div(irow1[c], z);

    for(r2=0;r2<n;++r2) {
     if(r2!==r1) {
      arow2 = a[r2];
      irow2 = i[r2];
      z = arow2[r1];

      for(c=r1+1;c<n;++c) arow2[c] = ak.sub(arow2[c], ak.mul(z, arow1[c]));
      for(c=0;   c<n;++c) irow2[c] = ak.sub(irow2[c], ak.mul(z, irow1[c]));
     }
    }
   }
   return ak.complexMatrix(i);
  }

  function leftInv(w) {
   var t;

   if(w.rows()===w.cols()) return inv(w);
   if(w.rows()<w.cols())   throw new Error('fewer rows than columns in ak.complexMatrix leftInv');

   t = transpose(w);
   return mul(inv(mul(t, w)), t);
  }

  function neg(w) {
   var rows = w.rows();
   var cols = w.cols();
   var a = new Array(rows*cols);
   var off = 0;
   var r, c;

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     a[off++] = ak.neg(w.at(r, c));
    }
   }
   return ak.complexMatrix(rows, cols, a);
  }

  function rightInv(w) {
   var t;

   if(w.rows()===w.cols()) return inv(w);
   if(w.cols()<w.rows())   throw new Error('fewer columns than rows in ak.complexMatrix rightInv');

   t = transpose(w);
   return mul(t, inv(mul(w, t)));
  }

  function tr(w) {
   var n = w.rows();
   var s = ak.complex(0);
   var i;

   if(w.cols()!==n) throw new Error('non-square matrix in ak.complexMatrix tr');

   for(i=0;i<n;++i) s = ak.add(s, w.at(i, i));
   return s;
  }

  function transpose(w) {
   return ak.complexMatrix(w.cols(), w.rows(), function(r, c){return w.at(c, r);});
  }

  function add(w0, w1) {
   var rows = w0.rows();
   var cols = w0.cols();
   var a = w0.toArray();
   var r, c, row;

   if(w1.rows()!==rows || w1.cols()!==cols) throw new Error('dimensions mismatch in ak.complexMatrix add');

   for(r=0;r<rows;++r) {
    row = a[r];
    for(c=0;c<cols;++c) {
     row[c] = ak.add(row[c], w1.at(r, c));
    }
   }
   return ak.complexMatrix(a);
  }

  function dist(w0, w1) {
   var rows = w0.rows();
   var cols = w0.cols();
   var s = 0;
   var r, c;

   if(w1.rows()!==rows || w1.cols()!==cols) throw new Error('dimensions mismatch in ak.complexMatrix dist');

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     s += Math.pow(ak.dist(w0.at(r, c), w1.at(r, c)), 2);
    }
   }
   return Math.sqrt(s);
  }

  function div(w0, w1) {
   return ak.mul(rightInv(w1), w0);
  }

  function divWC(w, s) {
   var rows = w.rows();
   var cols = w.cols();
   var a = w.toArray();
   var r, c, row;

   for(r=0;r<rows;++r) {
    row = a[r];
    for(c=0;c<cols;++c) row[c] = ak.div(row[c], s);
   }
   return ak.complexMatrix(a);
  }

  function eq(w0, w1) {
   var rows = w0.rows();
   var cols = w0.cols();
   var r, c;

   if(w1.rows()!==rows || w1.cols()!==cols) return false;

   for(r=0;r<rows;++r) {
    for(c=0;c<cols;++c) {
     if(!ak.eq(w0.at(r, c), w1.at(r, c))) return false;
    }
   }
   return true;
  }

  function mul(w0, w1) {
   var r0 = w0.rows();
   var c0 = w0.cols();
   var r1 = w1.rows();
   var c1 = w1.cols();
   var a = new Array(r0*c1);
   var off = 0;
   var i, j, k, s;

   if(c0!==r1) throw new Error('dimensions mismatch in ak.complexMatrix mul');

   for(i=0;i<r0;++i) {
    for(j=0;j<c1;++j) {
     s = ak.complex(0);
     for(k=0;k<c0;++k) s = ak.add(s, ak.mul(w0.at(i, k), w1.at(k, j)));
     a[off++] = s;
    }
   }
   return ak.complexMatrix(r0, c1, a);
  }

  function mulCW(s, w) {
   var rows = w.rows();
   var cols = w.cols();
   var a = w.toArray();
   var r, c, row;

   for(r=0;r<rows;++r) {
    row = a[r];
    for(c=0;c<cols;++c) row[c] = ak.mul(s, row[c]);
   }
   return ak.complexMatrix(a);
  }

  function mulWC(w, s) {
   return mulCW(s, w);
  }

  function mulWZ(w, z) {
   var rows = w.rows();
   var cols = w.cols();
   var dims = z.dims();
   var a = new Array(rows);
   var r, c, s;

   if(dims!==cols) throw new Error('dimensions mismatch in ak.complexMatrix mul');

   for(r=0;r<rows;++r) {
    s = 0;
    for(c=0;c<cols;++c) s = ak.add(s, ak.mul(w.at(r, c), z.at(c)));
    a[r] = s;
   }
   return ak.complexVector(a);
  }

  function mulZW(z, w) {
   var rows = w.rows();
   var cols = w.cols();
   var dims = z.dims();
   var a = new Array(cols);
   var r, c, s;

   if(dims!==rows) throw new Error('dimensions mismatch in ak.complexMatrix mul');

   for(c=0;c<cols;++c) {
    s = 0;
    for(r=0;r<rows;++r) s = ak.add(s, ak.mul(z.at(r), w.at(r, c)));
    a[c] = s;
   }
   return ak.complexVector(a);
  }

  function ne(w0, w1) {
   return !eq(w0, w1);
  }

  function powWR(w, r) {
   var n = w.rows();
   var p = ak.complexMatrix('identity', n);
   var i;

   if(w.cols()!==n)    throw new Error('non-square matrix in ak.complexMatrix pow');
   if(r!==ak.floor(r)) throw new Error('non-integer exponent in ak.complexMatrix pow');

   if(r<0) {
    r = -r;
    w = inv(w);
   }

   while(r>0) {
    if(r%2===1) p = mul(p, w);
    w = mul(w, w);
    r = ak.floor(r/2);
   }
   return p;
  }

  function powCW(s, w) {
   return exp(mulCW(ak.log(s), w));
  }

  function sub(w0, w1) {
   var rows = w0.rows();
   var cols = w0.cols();
   var a = w0.toArray();
   var r, c, row;

   if(w1.rows()!==rows || w1.cols()!==cols) throw new Error('dimensions mismatch in ak.complexMatrix sub');

   for(r=0;r<rows;++r) {
    row = a[r];
    for(c=0;c<cols;++c) {
     row[c] = ak.sub(row[c], w1.at(r, c));
    }
   }
   return ak.complexMatrix(a);
  }

  function outerMul(z0, z1) {
   var rows = z0.dims();
   var cols = z1.dims();
   var off = 0;
   var a = new Array(rows*cols);
   var r, c, x;

   z1 = z1.toArray();

   for(r=0;r<rows;++r) {
    x = z0.at(r);
    for(c=0;c<cols;++c) {
     a[off++] = ak.mul(x, z1[c]);
    }
   }
   return ak.complexMatrix(rows, cols, a);
  }

  function divCD(c, d, e) {
   var i = ak.stableInv(d, e);
   return ak.complexMatrix(ak.mul(c.re(), i), ak.mul(c.im(), i));
  }

  function divD(w, d, e) {
   return ak.complexMatrix(ak.stableDiv(w.re(), d, e), ak.stableDiv(w.im(), d, e));
  }

  var JACOBI_DECOMPOSITION_T = 'ak.jacobiDecomposition';

  if(!ak.adjoint) ak.adjoint = function(x) {return ak.adjoint[ak.type(x)](x)};

  ak.overload(ak.abs,       ak.COMPLEX_MATRIX_T, abs);
  ak.overload(ak.adjoint,   ak.COMPLEX_MATRIX_T, adjoint);
  ak.overload(ak.adjoint,   ak.MATRIX_T,         ak.transpose[ak.MATRIX_T]);
  ak.overload(ak.conj,      ak.COMPLEX_MATRIX_T, conj);
  ak.overload(ak.conj,      ak.MATRIX_T,         conjM);
  ak.overload(ak.det,       ak.COMPLEX_MATRIX_T, det);
  ak.overload(ak.exp,       ak.COMPLEX_MATRIX_T, exp);
  ak.overload(ak.inv,       ak.COMPLEX_MATRIX_T, inv);
  ak.overload(ak.leftInv,   ak.COMPLEX_MATRIX_T, leftInv);
  ak.overload(ak.neg,       ak.COMPLEX_MATRIX_T, neg);
  ak.overload(ak.rightInv,  ak.COMPLEX_MATRIX_T, rightInv);
  ak.overload(ak.tr,        ak.COMPLEX_MATRIX_T, tr);
  ak.overload(ak.transpose, ak.COMPLEX_MATRIX_T, transpose);

  ak.overload(ak.add,  [ak.COMPLEX_MATRIX_T, ak.COMPLEX_MATRIX_T], add);
  ak.overload(ak.add,  [ak.COMPLEX_MATRIX_T, ak.MATRIX_T],         add);
  ak.overload(ak.add,  [ak.MATRIX_T,         ak.COMPLEX_MATRIX_T], add);
  ak.overload(ak.dist, [ak.COMPLEX_MATRIX_T, ak.COMPLEX_MATRIX_T], dist);
  ak.overload(ak.dist, [ak.COMPLEX_MATRIX_T, ak.MATRIX_T],         dist);
  ak.overload(ak.dist, [ak.MATRIX_T,         ak.COMPLEX_MATRIX_T], dist);
  ak.overload(ak.div,  [ak.COMPLEX_MATRIX_T, ak.COMPLEX_MATRIX_T], div);
  ak.overload(ak.div,  [ak.COMPLEX_MATRIX_T, ak.MATRIX_T],         div);
  ak.overload(ak.div,  [ak.MATRIX_T,         ak.COMPLEX_MATRIX_T], div);
  ak.overload(ak.div,  [ak.COMPLEX_VECTOR_T, ak.COMPLEX_MATRIX_T], div);
  ak.overload(ak.div,  [ak.VECTOR_T,         ak.COMPLEX_MATRIX_T], div);
  ak.overload(ak.div,  [ak.COMPLEX_T,        ak.COMPLEX_MATRIX_T], div);
  ak.overload(ak.div,  [ak.COMPLEX_T,        ak.MATRIX_T],         div);
  ak.overload(ak.div,  [ak.NUMBER_T,         ak.COMPLEX_MATRIX_T], div);
  ak.overload(ak.div,  [ak.COMPLEX_MATRIX_T, ak.COMPLEX_T],        divWC);
  ak.overload(ak.div,  [ak.MATRIX_T,         ak.COMPLEX_T],        divWC);
  ak.overload(ak.div,  [ak.COMPLEX_MATRIX_T, ak.NUMBER_T],         divWC);
  ak.overload(ak.eq,   [ak.COMPLEX_MATRIX_T, ak.COMPLEX_MATRIX_T], eq);
  ak.overload(ak.eq,   [ak.COMPLEX_MATRIX_T, ak.MATRIX_T],         eq);
  ak.overload(ak.eq,   [ak.MATRIX_T,         ak.COMPLEX_MATRIX_T], eq);
  ak.overload(ak.mul,  [ak.COMPLEX_MATRIX_T, ak.COMPLEX_MATRIX_T], mul);
  ak.overload(ak.mul,  [ak.MATRIX_T,         ak.COMPLEX_MATRIX_T], mul);
  ak.overload(ak.mul,  [ak.COMPLEX_MATRIX_T, ak.MATRIX_T],         mul);
  ak.overload(ak.mul,  [ak.COMPLEX_T,        ak.COMPLEX_MATRIX_T], mulCW);
  ak.overload(ak.mul,  [ak.COMPLEX_MATRIX_T, ak.COMPLEX_T],        mulWC);
  ak.overload(ak.mul,  [ak.COMPLEX_T,        ak.MATRIX_T],         mulCW);
  ak.overload(ak.mul,  [ak.MATRIX_T,         ak.COMPLEX_T],        mulWC);
  ak.overload(ak.mul,  [ak.NUMBER_T,         ak.COMPLEX_MATRIX_T], mulCW);
  ak.overload(ak.mul,  [ak.COMPLEX_MATRIX_T, ak.NUMBER_T],         mulWC);
  ak.overload(ak.mul,  [ak.COMPLEX_MATRIX_T, ak.COMPLEX_VECTOR_T], mulWZ);
  ak.overload(ak.mul,  [ak.COMPLEX_VECTOR_T, ak.COMPLEX_MATRIX_T], mulZW);
  ak.overload(ak.mul,  [ak.COMPLEX_MATRIX_T, ak.VECTOR_T],         mulWZ);
  ak.overload(ak.mul,  [ak.VECTOR_T,         ak.COMPLEX_MATRIX_T], mulZW);
  ak.overload(ak.ne,   [ak.COMPLEX_MATRIX_T, ak.COMPLEX_MATRIX_T], ne);
  ak.overload(ak.ne,   [ak.COMPLEX_MATRIX_T, ak.MATRIX_T],         ne);
  ak.overload(ak.ne,   [ak.MATRIX_T,         ak.COMPLEX_MATRIX_T], ne);
  ak.overload(ak.pow,  [ak.COMPLEX_MATRIX_T, ak.NUMBER_T],         powWR);
  ak.overload(ak.pow,  [ak.COMPLEX_T,        ak.COMPLEX_MATRIX_T], powCW);
  ak.overload(ak.pow,  [ak.NUMBER_T,         ak.COMPLEX_MATRIX_T], powCW);
  ak.overload(ak.pow,  [ak.COMPLEX_T,        ak.MATRIX_T],         powCW);
  ak.overload(ak.sub,  [ak.COMPLEX_MATRIX_T, ak.COMPLEX_MATRIX_T], sub);
  ak.overload(ak.sub,  [ak.COMPLEX_MATRIX_T, ak.MATRIX_T],         sub);
  ak.overload(ak.sub,  [ak.MATRIX_T,         ak.COMPLEX_MATRIX_T], sub);

  ak.overload(ak.outerMul, [ak.COMPLEX_VECTOR_T, ak.COMPLEX_VECTOR_T], outerMul);
  ak.overload(ak.outerMul, [ak.VECTOR_T,         ak.COMPLEX_VECTOR_T], outerMul);
  ak.overload(ak.outerMul, [ak.COMPLEX_VECTOR_T, ak.VECTOR_T],         outerMul);

  ak.overload(ak.div,       [ak.COMPLEX_T,        JACOBI_DECOMPOSITION_T], divCD);
  ak.overload(ak.stableDiv, [ak.COMPLEX_T,        JACOBI_DECOMPOSITION_T], divCD);
  ak.overload(ak.div,       [ak.COMPLEX_MATRIX_T, JACOBI_DECOMPOSITION_T], divD);
  ak.overload(ak.stableDiv, [ak.COMPLEX_MATRIX_T, JACOBI_DECOMPOSITION_T], divD);
 }

 ak.using('Matrix/ComplexVector.js', define);
})();
