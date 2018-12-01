//AK/Calculus/SymbolicDerivative.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.symbolicDerivative) return;

  var zero = ak.intExpr(0);
  var one  = ak.intExpr(1);
  var two  = ak.intExpr(2);

  var symbolicDerivative = {};

  symbolicDerivative['num'] = function(f, x) {
   return zero;
  };

  symbolicDerivative['var'] = function(f, x) {
   return f.id()===x.id() ? one : zero;
  };

  symbolicDerivative['abs'] = function(f, x) {
   return ak.mul(ak.div(f.arg(), f), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['acos'] = function(f, x) {
   var a2  = ak.pow(f.arg(), two);
   var den = ak.sqrt(ak.sub(one, a2));
   return ak.mul(ak.neg(ak.inv(den)), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['asin'] = function(f, x) {
   var a2  = ak.pow(f.arg(), two);
   var den = ak.sqrt(ak.sub(one, a2));
   return ak.mul(ak.inv(den), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['atan'] = function(f, x) {
   var a2  = ak.pow(f.arg(), two);
   var den = ak.add(one, a2);
   return ak.mul(ak.inv(den), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['cos'] = function(f, x) {
   return ak.mul(ak.neg(ak.sin(f.arg())), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['cosh'] = function(f, x) {
   return ak.mul(ak.sinh(f.arg()), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['exp'] = function(f, x) {
   return ak.mul(f, ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['inv'] = function(f, x) {
   return ak.mul(ak.neg(ak.pow(f, ak.intExpr(2))), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['log'] = function(f, x) {
   return ak.mul(ak.inv(f.arg()), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['neg'] = function(f, x) {
   return ak.neg(ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['sin'] = function(f, x) {
   return ak.mul(ak.cos(f.arg()), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['sinh'] = function(f, x) {
   return ak.mul(ak.cosh(f.arg()), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['sqrt'] = function(f, x) {
   var den = ak.mul(two, f);
   return ak.mul(ak.inv(den), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['tan'] = function(f, x) {
   var ca  = ak.cos(f.arg());
   var den = ak.pow(ca, two);
   return ak.mul(ak.inv(den), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['tanh'] = function(f, x) {
   var ca  = ak.cosh(f.arg());
   var den = ak.pow(ca, two);
   return ak.mul(ak.inv(den), ak.symbolicDerivative(f.arg(), x));
  };

  symbolicDerivative['add'] = function(f, x) {
   return ak.add(ak.symbolicDerivative(f.lhs(), x), ak.symbolicDerivative(f.rhs(), x));
  };

  symbolicDerivative['dist'] = function(f, x) {
   var lhs = ak.div(ak.sub(f.lhs(), f.rhs()), f);
   var rhs = ak.sub(ak.symbolicDerivative(f.lhs(), x), ak.symbolicDerivative(f.rhs(), x));
   return ak.mul(lhs, rhs);
  };

  symbolicDerivative['div'] = function(f, x) {
   var lhs = ak.div(ak.symbolicDerivative(f.lhs(), x), f.rhs());
   var rhs = ak.mul(ak.div(f.lhs(), ak.pow(f.rhs(), two)), ak.symbolicDerivative(f.rhs(), x));
   return ak.sub(lhs, rhs);
  };

  symbolicDerivative['mul'] = function(f, x) {
   var lhs = ak.mul(ak.symbolicDerivative(f.lhs(), x), f.rhs());
   var rhs = ak.mul(f.lhs(), ak.symbolicDerivative(f.rhs(), x));
   return ak.add(lhs, rhs);
  };

  symbolicDerivative['pow'] = function(f, x) {
   var lhs = ak.mul(ak.symbolicDerivative(f.rhs(), x), ak.log(f.lhs()));
   var rhs = ak.mul(ak.div(f.rhs(), f.lhs()), ak.symbolicDerivative(f.lhs(), x));
   return ak.mul(f, ak.add(lhs, rhs));
  };

  symbolicDerivative['sub'] = function(f, x) {
   return ak.sub(ak.symbolicDerivative(f.lhs(), x), ak.symbolicDerivative(f.rhs(), x));
  };

  ak.symbolicDerivative = function(f, x) {
   if(ak.type(f)!==ak.EXPRESSION_T) throw new Error('non-expression function passed to ak.symbolicDerivative');
   if(ak.type(x)!==ak.EXPRESSION_T || x.SUB!=='var') throw new Error('non-expression variable argument passed to ak.symbolicDerivative');

   return symbolicDerivative[f.SUB](f, x);
  };

  function bounds(df) {
   if(df.SUB==='var' || df.SUB==='num') return ak.interval(df.approx());
   if(df.arg) return ak[df.SUB](bounds(df.arg()));
   return ak[df.SUB](bounds(df.lhs()), bounds(df.rhs()));
  }

  ak.symbolicDerivativeBounds = function(f, x) {
   var df = symbolicDerivative[f.SUB](f, x);
   var b  = {};

   b.approx = df.approx();
   b.bounds = function() {return bounds(df);};
   return Object.freeze(b);
  };
 }

 ak.using(['Number/Expression.js', 'Number/Interval.js'], define);
})();
