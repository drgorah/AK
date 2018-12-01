//AK/Image/Eigenfaces.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.EIGENFACES_T) return;
  ak.EIGENFACES_T = 'ak.eigenfaces';

  function encode(face, m, f) {
   var rows = m.rows();
   var cols = m.cols();
   var n = f.length;
   var code = new Array(n);
   var i, eface, s, r, c;
   
   if(ak.type(face)!==ak.MATRIX_T) face = ak.imageDataToMatrix(face);
   face = ak.sub(face, m);

   for(i=0;i<n;++i) {
    eface = f[i];

    s = 0;
    for(r=0;r<rows;++r) for(c=0;c<cols;++c) s += face.at(r, c) * eface.at(r, c);
    code[i] = s;
   }
   return ak.vector(code);
  }

  function decode(code, m, f) {
   var n = f.length;
   var i;

   if(ak.type(code)!==ak.VECTOR_T || code.dims()!==n) throw new Error('invalid code in ak.eigenfaces.decode');

   for(i=0;i<n;++i) m = ak.add(m, ak.mul(f[i], code.at(i)));
   return m;
  }

  function sampleMean(faces) {
   var n = faces.length;
   var m = faces[0];
   var i;

   for(i=1;i<n;++i) m = ak.add(m, faces[i]);
   return ak.div(m, n);
  }

  function sampleMatrix(faces, mean) {
   var rows = mean.rows();
   var cols = mean.cols();
   var n = faces.length;
   var s = new Array(n*rows*cols);
   var off = 0;
   var i, face, r, c;

   for(i=0;i<n;++i) {
    face = faces[i];
    for(r=0;r<rows;++r) for(c=0;c<cols;++c) s[off++] = face.at(r, c)-mean.at(r, c);
   }
   return ak.matrix(n, rows*cols, s);
  }

  function componentRank(eigenvalues) {
   var l = eigenvalues.toArray();
   var n = l.length;
   var r = new Array(n);
   var i;

   for(i=0;i<n;++i) r[i] = i;
   r.sort(function(a,b){return l[b]-l[a];});
   return r;
  }

  function Eigenfaces(){}
  Eigenfaces.prototype = {TYPE: ak.EIGENFACES_T, valueOf: function(){return ak.NaN;}};

  ak.eigenfaces = function() {
   var ef    = new Eigenfaces();
   var state = {m:undefined, f:[], w:[]};
   var arg0  = arguments[0];

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   ef.mean   = function()  {return state.m;};
   ef.faces  = function()  {return state.f.length;};
   ef.face   = function(i) {return state.f[Number(i)];};
   ef.weight = function(i) {return state.w[Number(i)];};

   ef.encode = function(face) {return encode(face, state.m, state.f);};
   ef.decode = function(code) {return decode(code, state.m, state.f);};

   return Object.freeze(ef);
  };

  var constructors = {};

  constructors[ak.NUMBER_T] = function(state, n, args) {
   var arg1 = args[1];

   state.f.length = n;
   state.w.length = n;
   if(state.f.length<2) throw new Error('too few eigenfaces in ak.eigenfaces');
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1, args);
  };

  constructors[ak.NUMBER_T][ak.ARRAY_T] = function(state, faces, args) {
   var arg2 = args[2];

   if(faces.length<state.f.length) throw new Error('too few faces in ak.eigenfaces');
   constructors[ak.NUMBER_T][ak.ARRAY_T][ak.nativeType(arg2)](state, faces, arg2);
  };

  constructors[ak.NUMBER_T][ak.ARRAY_T][ak.UNDEFINED_T] = function(state, faces) {
   constructors[ak.NUMBER_T][ak.ARRAY_T][ak.NUMBER_T](state, faces, ak.EPSILON);
  };

  constructors[ak.NUMBER_T][ak.ARRAY_T][ak.NUMBER_T] = function(state, faces, eps) {
   var i, m, s, t, e, r, rows, cols;

   faces = faces.slice(0);
   for(i=0;i<faces.length;++i) if(ak.type(faces[i])!==ak.MATRIX_T) faces[i] = ak.imageDataToMatrix(faces[i]);

   m = sampleMean(faces);
   s = sampleMatrix(faces, m);
   t = ak.transpose(s);
 
   e = ak.jacobiDecomposition(ak.mul(s, t), eps);
   s = ak.transpose(ak.mul(t, e.v())).toArray();
   r = componentRank(e.lambda());

   rows = m.rows();
   cols = m.cols();

   state.m = m;
   for(i=0;i<state.f.length;++i) {
    m = ak.matrix(rows, cols, s[r[i]]);
    state.f[i] = ak.div(m, ak.abs(m));
    state.w[i] = Math.sqrt(Math.max(e.lambda().at(r[i]), 0));
   }
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var m = obj.mean;
   var n = obj.faces;
   var i;

   if(ak.nativeType(m)===ak.FUNCTION_T) m = m();
   state.m = ak.matrix(m);

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);
   state.f.length = n;
   state.w.length = n;
   if(state.f.length<2) throw new Error('too few eigenfaces in ak.eigenfaces');

   for(i=0;i<n;++i) {
    state.f[i] = ak.matrix(obj.face(i));
    state.w[i] = Number(obj.weight(i));
   }
  };
 }

 ak.using(['Image/ImageDataMatrix.js', 'Matrix/JacobiDecomposition.js'], define);
})();
