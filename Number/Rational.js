//AK/Number/Rational.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.RATIONAL_T) return;
  ak.RATIONAL_T = 'ak.rational';

  ak.hcf = function(i, j) {
   var r;

   i = Math.abs(ak.trunc(i));
   j = Math.abs(ak.trunc(j));

   if(i<j) {r=i; i=j; j=r;}

   if(isNaN(i+j))   return ak.NaN;
   if(!isFinite(i)) return j;

   while(j>0) {
    r = i%j;
    i = j;
    j = (r+r<j) ? r : j-r;
   }
   return i;
  };

  function normalise(state) {
   var hcf;

   if(state.den<0) {
    state.num *= -1;
    state.den *= -1;
   }

   if(Math.abs(state.num)>ak.INT_MAX) state.num *= ak.INFINITY;
   if(state.den>ak.INT_MAX)           state.den  = ak.INFINITY;

   if(isNaN(state.num/state.den)) {
    state.num = ak.NaN;
    state.den = ak.NaN;
   }
   else if(state.den===0 || !isFinite(state.num)) {
    state.num /= state.den;
    state.den  = 1;
   }
   else if(state.num===0 || !isFinite(state.den)) {
    state.num *= 0;
    state.den  = 1;
   }
   else {
    hcf = ak.hcf(state.num, state.den);
    state.num /= hcf;
    state.den /= hcf;
   }
  }

  function Rational(){}
  Rational.prototype = {TYPE: ak.RATIONAL_T, valueOf: function(){return ak.NaN;}};

  ak.rational = function() {
   var r     = new Rational();
   var arg0  = arguments[0];
   var state = {num: 0, den: 1};

   constructors[ak.nativeType(arg0)](state, arg0, arguments);
   normalise(state);

   r.num = function() {return state.num;};
   r.den = function() {return state.den;};

   r.toNumber = function() {return state.num/state.den;};
   r.toString = function() {return state.num.toFixed(0) +'/'+ state.den.toFixed(0);};

   return Object.freeze(r);
  };

  var constructors = {};

  constructors[ak.NUMBER_T] = function(state, num, args) {
   var arg1 = args[1];
   state.num = ak.trunc(num);
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, den) {
   state.den = ak.trunc(den);
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   state.num = (ak.nativeType(obj.num)===ak.FUNCTION_T) ? ak.trunc(obj.num()) : ak.trunc(obj.num);
   state.den = (ak.nativeType(obj.den)===ak.FUNCTION_T) ? ak.trunc(obj.den()) : ak.trunc(obj.den);
  };

  function abs(r) {
   return ak.rational(Math.abs(r.num()), r.den());
  }

  function inv(r) {
   return ak.rational(r.den(), r.num());
  }

  function neg(r) {
   return ak.rational(-r.num(), r.den());
  }

  function add(r0, r1) {
   var n0 = r0.num()*r1.den();
   var n1 = r0.den()*r1.num();

   if(Math.abs(n0)>ak.INT_MAX) n0 *= ak.INFINITY;
   if(Math.abs(n1)>ak.INT_MAX) n1 *= ak.INFINITY;

   return ak.rational(n0+n1, r0.den()*r1.den());
  }

  function cmp(r0, r1) {
   var lhs, rhs;

   if(r0.num()===r1.num() && r0.den()===r1.den()) return 0;

   lhs = r0.num()*r1.den();
   rhs = r0.den()*r1.num();

   if(Math.abs(lhs)>ak.INT_MAX) lhs *= ak.INFINITY;
   if(Math.abs(rhs)>ak.INT_MAX) rhs *= ak.INFINITY;

   return lhs - rhs;
  }

  function div(r0, r1) {
   return ak.rational(r0.num()*r1.den(), r0.den()*r1.num());
  }

  function eq(r0, r1) {
   return r0.num()===r1.num() && r0.den()===r1.den();
  }

  function ge(r0, r1) {
   return cmp(r0, r1)>=0;
  }

  function gt(r0, r1) {
   return cmp(r0, r1)>0;
  }

  function le(r0, r1) {
   return cmp(r0, r1)<=0;
  }

  function lt(r0, r1) {
   return cmp(r0, r1)<0;
  }

  function mod(r0, r1) {
   var r = div(r0, r1);
   return ak.rational(r.num()%r.den(), r.den());
  }

  function mul(r0, r1) {
   return ak.rational(r0.num()*r1.num(), r0.den()*r1.den());
  }

  function ne(r0, r1) {
   return r0.num()!==r1.num() || r0.den()!==r1.den();
  }

  function sub(r0, r1) {
   var n0 = r0.num()*r1.den();
   var n1 = r0.den()*r1.num();

   if(Math.abs(n0)>ak.INT_MAX) n0 *= ak.INFINITY;
   if(Math.abs(n1)>ak.INT_MAX) n1 *= ak.INFINITY;

   return ak.rational(n0-n1, r0.den()*r1.den());
  }

  ak.overload(ak.abs,  ak.RATIONAL_T, abs);
  ak.overload(ak.inv,  ak.RATIONAL_T, inv);
  ak.overload(ak.neg,  ak.RATIONAL_T, neg);

  ak.overload(ak.add, [ak.RATIONAL_T, ak.RATIONAL_T], add);
  ak.overload(ak.cmp, [ak.RATIONAL_T, ak.RATIONAL_T], cmp);
  ak.overload(ak.div, [ak.RATIONAL_T, ak.RATIONAL_T], div);
  ak.overload(ak.eq,  [ak.RATIONAL_T, ak.RATIONAL_T], eq);
  ak.overload(ak.ge,  [ak.RATIONAL_T, ak.RATIONAL_T], ge);
  ak.overload(ak.gt,  [ak.RATIONAL_T, ak.RATIONAL_T], gt);
  ak.overload(ak.le,  [ak.RATIONAL_T, ak.RATIONAL_T], le);
  ak.overload(ak.lt,  [ak.RATIONAL_T, ak.RATIONAL_T], lt);
  ak.overload(ak.mod, [ak.RATIONAL_T, ak.RATIONAL_T], mod);
  ak.overload(ak.mul, [ak.RATIONAL_T, ak.RATIONAL_T], mul);
  ak.overload(ak.ne,  [ak.RATIONAL_T, ak.RATIONAL_T], ne);
  ak.overload(ak.sub, [ak.RATIONAL_T, ak.RATIONAL_T], sub);
 }

 ak.using('', define);
})();