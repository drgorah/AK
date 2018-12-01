//AK/Number/Expression.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.EXPRESSION_T) return;
  ak.EXPRESSION_T = 'ak.expression';

  function Expression(){}
  Expression.prototype = {TYPE: ak.EXPRESSION_T};

  ak.intExpr = function(x) {
   var e = new Expression();
   var state = ak.bignum(x);

   e.SUB    = 'num';
   e.approx = function()  {return state.toNumber();};
   e.exact  = function(i) {return intExact(state, i);};
   e.sign   = function()  {return state.at(0);};

   return Object.freeze(e);
  };

  function intExact(state, i) {
   var o, d, n, m;

   i = ak.trunc(i);
   if(!(i>=0 && i<ak.DEC_DIG*state.size())) return ak.NaN;

   o = i%ak.DEC_DIG;
   d = (i-o)/ak.DEC_DIG;
   n = Math.abs(state.at(state.size()-(d+1)));
   m = Math.pow(10, o);

   return n>=m ? ((n-n%m)/m)%10 : ak.NaN;
  }

  ak.approxExpr = function(x) {
   var e = new Expression();
   x = Number(x);

   e.SUB    = 'num';
   e.approx = function() {return x;};

   return Object.freeze(e);
  };

  ak.piExpr = function() {
   var e = new Expression();
   var state = {};

   e.SUB    = 'num';
   e.approx = function()  {return ak.PI;};
   e.exact  = function(i) {return piExact(state, i);};
   e.sign   = function()  {return 1;};

   return Object.freeze(e);
  };

  var zero = ak.bignum(0);  var one    = ak.bignum(1);
  var two  = ak.bignum(2);  var three  = ak.bignum(3);
  var four = ak.bignum(4);  var seven  = ak.bignum(7);
  var ten  = ak.bignum(10); var thirty = ak.bignum(30);

  function piExact(state, i) {
   var q2, q2r, d, rdt;

   i = ak.trunc(-i)+1;
   if(!(i>=1 && i<=ak.INT_MAX)) return ak.NaN;

   if(!(i>=state.i)) {
    state.i = 0;   state.d = 3;
    state.k = one; state.l = three;
    state.q = one; state.r = zero;  state.t = one;
   }

   while(i>state.i) {
    q2  = ak.add(state.q, state.q);
    q2r = ak.add(q2, state.r);
    d   = ak.div(ak.add(q2r, state.q), state.t);
    rdt = ak.sub(state.r, ak.mul(d, state.t));

    if(ak.lt(ak.add(ak.add(q2, q2), rdt), state.t)) {
     state.d = d.at(0);
     state.q = ak.mul(state.q, ten);
     state.r = ak.mul(rdt, ten);
     ++state.i;
    }
    else {
     state.q = ak.mul(state.q, state.k);
     state.r = ak.mul(q2r, state.l);
     state.t = ak.mul(state.t, state.l);
     state.k = ak.add(state.k, one);
     state.l = ak.add(state.l, two);
    }
   }
   return state.d;
  }

  ak.eExpr = function() {
   var e = new Expression();
   var state = {};

   e.SUB    = 'num';
   e.approx = function()  {return ak.E;};
   e.exact  = function(i) {return eExact(state, i);};
   e.sign   = function()  {return 1;};

   return Object.freeze(e);
  };

  function eExact(state, i) {
   var qr, d, rdt;

   i = ak.trunc(-i)+1;
   if(!(i>=1 && i<=ak.INT_MAX)) return ak.NaN;

   if(!(i>=state.i)) {
    state.i = 0;     state.d = 1;   state.k = three;
    state.q = one;   state.r = two; state.t = two;
   }

   while(i>state.i) {
    qr  = ak.add(state.q, state.r);
    d   = ak.div(qr, state.t);
    rdt = ak.sub(state.r, ak.mul(d, state.t));

    if(ak.lt(ak.add(ak.add(state.q, state.q), rdt), state.t)) {
     state.d = d.at(0);
     state.q = ak.mul(state.q, ten);
     state.r = ak.mul(rdt, ten);
     ++state.i;
    }
    else {
     state.r = ak.mul(state.k, qr);
     state.t = ak.mul(state.k, state.t);
     state.k = ak.add(state.k, one);
    }
   }
   return i>1 ? state.d : state.d+1;
  }

  var varID  = zero;
  var varDef = ak.intExpr(zero);

  ak.varExpr = function() {
   var e = new Expression();
   var state = {id: varID};
   varID = ak.add(varID, one);

   e.SUB    = 'var';
   e.id     = function() {return state.id;};
   e.value  = function() {return varValue(state, arguments);};

   e.approx = function()  {return state.val.approx();};;
   e.exact  = function(i) {return state.val.exact(i);};
   e.sign   = function()  {return state.val.sign()};

   e.value(varDef);

   return Object.freeze(e);
  };

  function varValue(state, args) {
   if(args.length>0) {
    if(ak.type(args[0])!==ak.EXPRESSION_T) throw new Error('non-expression value passed to ak.varExpr');
    state.val = args[0];
   }
   return state.val;
  }

  function abs(x) {
   var e = new Expression();
   e.SUB    = 'abs';
   e.arg    = function() {return x;};
   e.approx = function() {return Math.abs(x.approx());};
   return Object.freeze(e);
  }

  function acos(x) {
   var e = new Expression();
   e.SUB    = 'acos';
   e.arg    = function() {return x;};
   e.approx = function() {return Math.acos(x.approx());};
   return Object.freeze(e);
  }

  function asin(x) {
   var e = new Expression();
   e.SUB    = 'asin';
   e.arg    = function() {return x;};
   e.approx = function() {return Math.asin(x.approx());};
   return Object.freeze(e);
  }

  function atan(x) {
   var e = new Expression();
   e.SUB    = 'atan';
   e.arg    = function() {return x;};
   e.approx = function() {return Math.atan(x.approx());};
   return Object.freeze(e);
  }

  function cos(x) {
   var e = new Expression();
   e.SUB    = 'cos';
   e.arg    = function() {return x;};
   e.approx = function() {return Math.cos(x.approx());};
   return Object.freeze(e);
  }

  function cosh(x) {
   var e = new Expression();
   e.SUB    = 'cosh';
   e.arg    = function() {return x;};
   e.approx = function() {var e = Math.exp(x.approx()); return 0.5*(e+1/e);};
   return Object.freeze(e);
  }

  function exp(x) {
   var e = new Expression();
   e.SUB    = 'exp';
   e.arg    = function() {return x;};
   e.approx = function() {return Math.exp(x.approx());};
   return Object.freeze(e);
  }

  function inv(x) {
   var e = new Expression();
   e.SUB    = 'inv';
   e.arg    = function() {return x;};
   e.approx = function() {return 1/x.approx();};
   return Object.freeze(e);
  }

  function log(x) {
   var e = new Expression();
   e.SUB    = 'log';
   e.arg    = function() {return x;};
   e.approx = function() {return Math.log(x.approx());};
   return Object.freeze(e);
  }

  function neg(x) {
   var e = new Expression();
   e.SUB    = 'neg';
   e.arg    = function() {return x;};
   e.approx = function() {return -x.approx();};
   return Object.freeze(e);
  }

  function sin(x) {
   var e = new Expression();
   e.SUB    = 'sin';
   e.arg    = function() {return x;};
   e.approx = function() {return Math.sin(x.approx());};
   return Object.freeze(e);
  }

  function sinh(x) {
   var e = new Expression();
   e.SUB    = 'sinh';
   e.arg    = function() {return x;};
   e.approx = function() {var e = Math.exp(x.approx()); return 0.5*(e-1/e);};
   return Object.freeze(e);
  }

  function sqrt(x) {
   var e = new Expression();
   e.SUB    = 'sqrt';
   e.arg    = function() {return x;};
   e.approx = function() {return Math.sqrt(x.approx());};
   return Object.freeze(e);
  }

  function tan(x) {
   var e = new Expression();
   e.SUB    = 'tan';
   e.arg    = function() {return x;};
   e.approx = function() {return Math.tan(x.approx());};
   return Object.freeze(e);
  }

  function tanh(x) {
   var e = new Expression();
   e.SUB    = 'tanh';
   e.arg    = function() {return x;};
   e.approx = function() {var e2 = Math.exp(x.approx()*2); return (e2-1)/(e2+1);};
   return Object.freeze(e);
  }

  function add(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'add';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()+rhs.approx();};
   return Object.freeze(e);
  }

  function cmp(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'cmp';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {
    var la = lhs.approx();
    var ra = rhs.approx();
    var da = la-ra;
    return (isFinite(da) || la!==ra) ? da : 0;
   };
   return Object.freeze(e);
  }

  function dist(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'dist';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return Math.abs(lhs.approx()-rhs.approx());};
   return Object.freeze(e);
  }

  function div(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'div';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()/rhs.approx();};
   return Object.freeze(e);
  }

  function eq(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'eq';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()===rhs.approx();};
   return Object.freeze(e);
  }

  function ge(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'ge';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()>=rhs.approx();};
   return Object.freeze(e);
  }

  function gt(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'gt';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()>rhs.approx();};
   return Object.freeze(e);
  }

  function le(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'le';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()<=rhs.approx();};
   return Object.freeze(e);
  }

  function lt(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'lt';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()<rhs.approx();};
   return Object.freeze(e);
  }

  function mod(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'mod';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()%rhs.approx();};
   return Object.freeze(e);
  }

  function mul(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'mul';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()*rhs.approx();};
   return Object.freeze(e);
  }

  function ne(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'ne';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()!==rhs.approx();};
   return Object.freeze(e);
  }

  function pow(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'pow';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return Math.pow(lhs.approx(), rhs.approx());};
   return Object.freeze(e);
  }

  function sub(lhs, rhs) {
   var e = new Expression();
   e.SUB    = 'sub';
   e.lhs    = function() {return lhs;};
   e.rhs    = function() {return rhs;};
   e.approx = function() {return lhs.approx()-rhs.approx();};
   return Object.freeze(e);
  }

  ak.overload(ak.abs,  ak.EXPRESSION_T, abs);
  ak.overload(ak.acos, ak.EXPRESSION_T, acos);
  ak.overload(ak.asin, ak.EXPRESSION_T, asin);
  ak.overload(ak.atan, ak.EXPRESSION_T, atan);
  ak.overload(ak.cos,  ak.EXPRESSION_T, cos);
  ak.overload(ak.cosh, ak.EXPRESSION_T, cosh);
  ak.overload(ak.exp,  ak.EXPRESSION_T, exp);
  ak.overload(ak.inv,  ak.EXPRESSION_T, inv);
  ak.overload(ak.log,  ak.EXPRESSION_T, log);
  ak.overload(ak.neg,  ak.EXPRESSION_T, neg);
  ak.overload(ak.sin,  ak.EXPRESSION_T, sin);
  ak.overload(ak.sinh, ak.EXPRESSION_T, sinh);
  ak.overload(ak.sqrt, ak.EXPRESSION_T, sqrt);
  ak.overload(ak.tan,  ak.EXPRESSION_T, tan);
  ak.overload(ak.tanh, ak.EXPRESSION_T, tanh);

  ak.overload(ak.add,  [ak.EXPRESSION_T, ak.EXPRESSION_T], add);
  ak.overload(ak.cmp,  [ak.EXPRESSION_T, ak.EXPRESSION_T], cmp);
  ak.overload(ak.dist, [ak.EXPRESSION_T, ak.EXPRESSION_T], dist);
  ak.overload(ak.div,  [ak.EXPRESSION_T, ak.EXPRESSION_T], div);
  ak.overload(ak.eq,   [ak.EXPRESSION_T, ak.EXPRESSION_T], eq);
  ak.overload(ak.ge,   [ak.EXPRESSION_T, ak.EXPRESSION_T], ge);
  ak.overload(ak.gt,   [ak.EXPRESSION_T, ak.EXPRESSION_T], gt);
  ak.overload(ak.le,   [ak.EXPRESSION_T, ak.EXPRESSION_T], le);
  ak.overload(ak.lt,   [ak.EXPRESSION_T, ak.EXPRESSION_T], lt);
  ak.overload(ak.mod,  [ak.EXPRESSION_T, ak.EXPRESSION_T], mod);
  ak.overload(ak.mul,  [ak.EXPRESSION_T, ak.EXPRESSION_T], mul);
  ak.overload(ak.ne,   [ak.EXPRESSION_T, ak.EXPRESSION_T], ne);
  ak.overload(ak.pow,  [ak.EXPRESSION_T, ak.EXPRESSION_T], pow);
  ak.overload(ak.sub,  [ak.EXPRESSION_T, ak.EXPRESSION_T], sub);
 }

 ak.using('Number/Bignum.js', define);
})();