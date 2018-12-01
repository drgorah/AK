//AK/Complex/Complex.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.COMPLEX_T) return;
  ak.COMPLEX_T = 'ak.complex';

  function Complex(){}
  Complex.prototype = {TYPE: ak.COMPLEX_T, valueOf: function(){return ak.NaN;}};

  ak.complex = function() {
   var c     = new Complex();
   var arg0  = arguments[0];
   var state = {re: 0, im: 0};

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   c.re = function() {return state.re;};
   c.im = function() {return state.im;};

   c.toString = function() {return '('+state.re.toString()+','+state.im.toString()+'i)';};

   c.toExponential = function(d) {return '('+state.re.toExponential(d)+','+state.im.toExponential(d)+'i)';};
   c.toFixed       = function(d) {return '('+state.re.toFixed(d)+','+state.im.toFixed(d)+'i)';};
   c.toPrecision   = function(d) {return '('+state.re.toPrecision(d)+','+state.im.toPrecision(d)+'i)';};

   return Object.freeze(c);
  };

  var constructors = {};

  constructors[ak.NUMBER_T] = function(state, re, args) {
   var arg1 = args[1];

   state.re = Number(re);
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, im) {
   state.im = Number(im);
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   state.re = (ak.nativeType(obj.re)===ak.FUNCTION_T) ? Number(obj.re()) : Number(obj.re);
   state.im = (ak.nativeType(obj.im)===ak.FUNCTION_T) ? Number(obj.im()) : Number(obj.im);
  };

  ak.I = ak.complex(0, 1);

  function abs(c) {
   return Math.sqrt(Math.pow(c.re(), 2) + Math.pow(c.im(), 2));
  }

  function arg(c) {
   return Math.atan2(c.im(), c.re());
  }

  function argR(r) {
   return r>=0 ? 0 : ak.PI;
  }

  function conj(c) {
   return ak.complex(c.re(), -c.im());
  }

  function conjR(r) {
   return r;
  }

  function cos(c) {
   return ak.complex(Math.cos(c.re())*ak.cosh(c.im()), -Math.sin(c.re())*ak.sinh(c.im()));
  }

  function cosh(c) {
   return ak.complex(ak.cosh(c.re())*Math.cos(c.im()), ak.sinh(c.re())*Math.sin(c.im()));
  }

  function exp(c) {
   var e = Math.exp(c.re());
   return ak.complex(e*Math.cos(c.im()), e*Math.sin(c.im()));
  }

  function inv(c) {
   var r2 = Math.pow(c.re(), 2) + Math.pow(c.im(), 2);
   return ak.complex(c.re()/r2, -c.im()/r2);
  }

  function log(c) {
   return ak.complex(Math.log(abs(c)), arg(c));
  }

  function logR(r) {
   return (r>=0) ? Math.log(r) : ak.complex(Math.log(-r), ak.PI);
  }

  function neg(c) {
   return ak.complex(-c.re(), -c.im());
  }

  function sin(c) {
   return ak.complex(Math.sin(c.re())*ak.cosh(c.im()), Math.cos(c.re())*ak.sinh(c.im()));
  }

  function sinh(c) {
   return ak.complex(ak.sinh(c.re())*Math.cos(c.im()), ak.cosh(c.re())*Math.sin(c.im()));
  }

  function sqrt(c) {
   var r = Math.sqrt(ak.abs(c));
   var a = arg(c) / 2;
   return ak.complex(r*Math.cos(a), r*Math.sin(a));
  }

  function sqrtR(r) {
   return (r>=0) ? Math.sqrt(r) : ak.complex(0, Math.sqrt(-r));
  }

  function tan(c) {
   var tx = Math.tan(c.re());
   var ty = ak.tanh(c.im());

   return div(ak.complex(tx, ty), ak.complex(1, -tx*ty));
  }

  function tanh(c) {
   var tx = ak.tanh(c.re());
   var ty = Math.tan(c.im());

   return div(ak.complex(tx, ty), ak.complex(1, tx*ty));
  }

  function add(c0, c1) {
   return ak.complex(c0.re()+c1.re(), c0.im()+c1.im());
  }

  function addCR(c, r) {
   return ak.complex(r+c.re(), c.im());
  }

  function addRC(r, c) {
   return ak.complex(r+c.re(), c.im());
  }

  function dist(c0, c1) {
   return Math.sqrt(Math.pow(c0.re()-c1.re(), 2) + Math.pow(c0.im()-c1.im(), 2));
  }

  function distCR(c, r) {
   return Math.sqrt(Math.pow(c.re()-r, 2) + Math.pow(c.im(), 2));
  }

  function distRC(r, c) {
   return Math.sqrt(Math.pow(c.re()-r, 2) + Math.pow(c.im(), 2));
  }

  function div(c0, c1) {
   var abs2   = Math.pow(c1.re(), 2) + Math.pow(c1.im(), 2);
   var inv_r1 =  c1.re()/abs2;
   var inv_i1 = -c1.im()/abs2;

   return ak.complex(c0.re()*inv_r1-c0.im()*inv_i1, c0.re()*inv_i1+c0.im()*inv_r1);
  }

  function divCR(c, r) {
   return ak.complex(c.re()/r, c.im()/r);
  }

  function divRC(r, c) {
   var abs2  = Math.pow(c.re(), 2) + Math.pow(c.im(), 2);
   var inv_r =  c.re()/abs2;
   var inv_i = -c.im()/abs2;

   return ak.complex(r*inv_r, r*inv_i);
  }

  function eq(c0, c1) {
   return c0.re()===c1.re() && c0.im()===c1.im();
  }

  function eqCR(c, r) {
   return c.re()===r && c.im()===0;
  }

  function eqRC(r, c) {
   return c.re()===r && c.im()===0;
  }

  function mul(c0, c1) {
   return ak.complex(c0.re()*c1.re()-c0.im()*c1.im(), c0.re()*c1.im()+c0.im()*c1.re());
  }

  function mulCR(c, r) {
   return ak.complex(r*c.re(), r*c.im());
  }

  function mulRC(r, c) {
   return ak.complex(r*c.re(), r*c.im());
  }

  function ne(c0, c1) {
   return c0.re()!==c1.re() || c0.im()!==c1.im();
  }

  function neCR(c, r) {
   return c.re()!==r || c.im()!==0;
  }

  function neRC(r, c) {
   return c.re()!==r || c.im()!==0;
  }

  function pow(c0, c1) {
   return exp(mul(log(c0), c1));
  }

  function powCR(c, r) {
   return exp(mulCR(log(c), r));
  }

  function powRC(r, c) {
   return exp(mulCR(c, Math.log(r)));
  }

  function powRR(r0, r1) {
   var p = Math.pow(r0, r1);
   return isNaN(p) ? powCR(ak.complex(r0), r1) : p;
  }

  function sub(c0, c1) {
   return ak.complex(c0.re()-c1.re(), c0.im()-c1.im());
  }

  function subCR(c, r) {
   return ak.complex(c.re()-r, c.im());
  }

  function subRC(r, c) {
   return ak.complex(r-c.re(), -c.im());
  }

  if(!ak.arg)  ak.arg  = function(x) {return ak.arg[ak.type(x)](x)};
  if(!ak.conj) ak.conj = function(x) {return ak.conj[ak.type(x)](x)};

  ak.overload(ak.abs,  ak.COMPLEX_T, abs);
  ak.overload(ak.arg,  ak.COMPLEX_T, arg);
  ak.overload(ak.arg,  ak.NUMBER_T,  argR);
  ak.overload(ak.conj, ak.COMPLEX_T, conj);
  ak.overload(ak.conj, ak.NUMBER_T,  conjR);
  ak.overload(ak.cos,  ak.COMPLEX_T, cos);
  ak.overload(ak.cosh, ak.COMPLEX_T, cosh);
  ak.overload(ak.exp,  ak.COMPLEX_T, exp);
  ak.overload(ak.inv,  ak.COMPLEX_T, inv);
  ak.overload(ak.log,  ak.COMPLEX_T, log);
  ak.overload(ak.log,  ak.NUMBER_T,  logR);
  ak.overload(ak.neg,  ak.COMPLEX_T, neg);
  ak.overload(ak.sin,  ak.COMPLEX_T, sin);
  ak.overload(ak.sinh, ak.COMPLEX_T, sinh);
  ak.overload(ak.sqrt, ak.COMPLEX_T, sqrt);
  ak.overload(ak.sqrt, ak.NUMBER_T,  sqrtR);
  ak.overload(ak.tan,  ak.COMPLEX_T, tan);
  ak.overload(ak.tanh, ak.COMPLEX_T, tanh);

  ak.overload(ak.add,  [ak.COMPLEX_T, ak.COMPLEX_T], add);
  ak.overload(ak.add,  [ak.COMPLEX_T, ak.NUMBER_T],  addCR);
  ak.overload(ak.add,  [ak.NUMBER_T,  ak.COMPLEX_T], addRC);
  ak.overload(ak.dist, [ak.COMPLEX_T, ak.COMPLEX_T], dist);
  ak.overload(ak.dist, [ak.COMPLEX_T, ak.NUMBER_T],  distCR);
  ak.overload(ak.dist, [ak.NUMBER_T,  ak.COMPLEX_T], distRC);
  ak.overload(ak.div,  [ak.COMPLEX_T, ak.COMPLEX_T], div);
  ak.overload(ak.div,  [ak.COMPLEX_T, ak.NUMBER_T],  divCR);
  ak.overload(ak.div,  [ak.NUMBER_T,  ak.COMPLEX_T], divRC);
  ak.overload(ak.eq,   [ak.COMPLEX_T, ak.COMPLEX_T], eq);
  ak.overload(ak.eq,   [ak.COMPLEX_T, ak.NUMBER_T],  eqCR);
  ak.overload(ak.eq,   [ak.NUMBER_T,  ak.COMPLEX_T], eqRC);
  ak.overload(ak.mul,  [ak.COMPLEX_T, ak.COMPLEX_T], mul);
  ak.overload(ak.mul,  [ak.COMPLEX_T, ak.NUMBER_T],  mulCR);
  ak.overload(ak.mul,  [ak.NUMBER_T,  ak.COMPLEX_T], mulRC);
  ak.overload(ak.ne,   [ak.COMPLEX_T, ak.COMPLEX_T], ne);
  ak.overload(ak.ne,   [ak.COMPLEX_T, ak.NUMBER_T],  neCR);
  ak.overload(ak.ne,   [ak.NUMBER_T,  ak.COMPLEX_T], neRC);
  ak.overload(ak.pow,  [ak.COMPLEX_T, ak.COMPLEX_T], pow);
  ak.overload(ak.pow,  [ak.COMPLEX_T, ak.NUMBER_T],  powCR);
  ak.overload(ak.pow,  [ak.NUMBER_T,  ak.COMPLEX_T], powRC);
  ak.overload(ak.pow,  [ak.NUMBER_T,  ak.NUMBER_T],  powRR);
  ak.overload(ak.sub,  [ak.COMPLEX_T, ak.COMPLEX_T], sub);
  ak.overload(ak.sub,  [ak.COMPLEX_T, ak.NUMBER_T],  subCR);
  ak.overload(ak.sub,  [ak.NUMBER_T,  ak.COMPLEX_T], subRC);
 }

 ak.using('', define);
})();