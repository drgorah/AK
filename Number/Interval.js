//AK/Number/Interval.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {

  if(ak.INTERVAL_T) return;
  ak.INTERVAL_T = 'ak.interval';

  var EPS_SUB = 1-ak.EPSILON;
  var EPS_SUP = 1+ak.EPSILON;

  function sort(x, y) {
   return x<=y ? {lb: x, ub: y} : {lb: y, ub: x};
  }

  function widenLB(lb) {
   if(lb>ak.MIN_NORMAL)       lb *= EPS_SUB;
   else if(lb<-ak.MIN_NORMAL) lb *= EPS_SUP;
   else                       lb -= ak.MIN_VALUE;
   return lb
  }

  function widenUB(ub) {
   if(ub>ak.MIN_NORMAL)       ub *= EPS_SUP;
   else if(ub<-ak.MIN_NORMAL) ub *= EPS_SUB;
   else                       ub += ak.MIN_VALUE;
   return ub;
  }

  function widen(lb, ub) {
   var i = sort(lb, ub);
   i.lb = widenLB(i.lb);
   i.ub = widenUB(i.ub);
   return i;
  }

  function Interval(){}
  Interval.prototype = {TYPE: ak.INTERVAL_T, valueOf: function(){return ak.NaN;}};

  ak.interval = function() {
   var i     = new Interval();
   var arg0  = arguments[0];
   var state = {lb: 0, ub: 0};

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   if(isNaN(state.lb) || isNaN(state.ub)) {
    state.lb = ak.NaN;
    state.ub = ak.NaN;
   }

   if(state.lb=== ak.INFINITY) state.lb =  ak.MAX_VALUE;
   if(state.ub===-ak.INFINITY) state.ub = -ak.MAX_VALUE;

   i.lb  = function() {return state.lb;};
   i.ub  = function() {return state.ub;};
   i.mid = function() {return 0.5*(state.lb+state.ub);};

   i.toNumber = i.mid;
   i.toString = function() {return '[' + state.lb + ',' + state.ub + ']';};

   i.toExponential = function(d) {return '['+state.lb.toExponential(d)+','+state.ub.toExponential(d)+']';};
   i.toFixed       = function(d) {return '['+state.lb.toFixed(d)+','+state.ub.toFixed(d)+']';};
   i.toPrecision   = function(d) {return '['+state.lb.toPrecision(d)+','+state.ub.toPrecision(d)+']';};

   return Object.freeze(i);
  };

  var constructors = {};

  constructors[ak.NUMBER_T] = function(state, x, args) {
   var arg1 = args[1];
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, x, arg1);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, lb, ub) {
   var i = sort(Number(lb), Number(ub));

   state.lb = i.lb;
   state.ub = i.ub;
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state, x) {
   var y = Number(x);
   var i = widen(y, y)

   state.lb = i.lb;
   state.ub = i.ub;
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var lb = ak.nativeType(obj.lb)===ak.FUNCTION_T ? Number(obj.lb()) : Number(obj.lb);
   var ub = ak.nativeType(obj.ub)===ak.FUNCTION_T ? Number(obj.ub()) : Number(obj.ub);
   var i  = sort(lb, ub);

   state.lb = i.lb;
   state.ub = i.ub;
  };

  function simpleFunc(f) {
   return function(x) {return ak.interval(widen(f(x.lb()), f(x.ub())));};
  }

  var acos = simpleFunc(Math.acos);
  var asin = simpleFunc(Math.asin);
  var atan = simpleFunc(Math.atan);
  var log  = simpleFunc(Math.log);
  var sqrt = simpleFunc(Math.sqrt);

  function abs(x) {
   if(x.lb()>=0) return x;
   if(x.ub()<=0) return ak.interval(-x.ub(), -x.lb());
   return ak.interval(0, Math.max(-x.lb(), x.ub()));
  }

  function cos(x) {
   var sl, su, i;

   if(x.lb()<=x.ub()-2*ak.PI) return ak.interval(-1, 1);

   sl = Math.sin(x.lb());
   su = Math.sin(x.ub());

   if(su*sl>=0)  i = widen(Math.cos(x.lb()), Math.cos(x.ub()));
   else if(sl>0) i = widen(-1, Math.max(Math.cos(x.lb()), Math.cos(x.ub())));
   else          i = widen( 1, Math.min(Math.cos(x.lb()), Math.cos(x.ub())));

   if(i.lb<-1)     i.lb = -1;
   else if(i.lb>1) i.lb =  1;

   if(i.ub<-1)     i.ub = -1;
   else if(i.ub>1) i.ub =  1;

   return ak.interval(i);
  }

  function cosh(x) {
   var ep = exp(x);
   var en = exp(neg(x));
   var i;

   if(x.lb()>=0 || x.ub()<=0) i = widen(0.5*(ep.lb()+en.ub()), 0.5*(ep.ub()+en.lb()));
   else                       i = widen(1, Math.max(0.5*(ep.lb()+en.ub()), 0.5*(ep.ub()+en.lb())));

   if(i.lb<1) i.lb = 1;

   return ak.interval(i);
  }

  var exp = function(x) {
   var i = widen(Math.exp(x.lb()), Math.exp(x.ub()));
   if(i.lb<0) i.lb = 0;
   return ak.interval(i);
  }

  function inv(x) {
   return div(ak.interval(1, 1), x);
  }

  function neg(x) {
   return ak.interval(-x.ub(), -x.lb());
  }

  function sin(x) {
   var cl, cu, i;

   if(x.lb()<=x.ub()-2*ak.PI) return ak.interval(-1, 1);

   cl = Math.cos(x.lb());
   cu = Math.cos(x.ub());

   if(cu*cl>=0)  i = widen(Math.sin(x.lb()), Math.sin(x.ub()));
   else if(cl>0) i = widen( 1, Math.min(Math.sin(x.lb()), Math.sin(x.ub())));
   else          i = widen(-1, Math.max(Math.sin(x.lb()), Math.sin(x.ub())));

   if(i.lb<-1)     i.lb = -1;
   else if(i.lb>1) i.lb =  1;

   if(i.ub<-1)     i.ub = -1;
   else if(i.ub>1) i.ub =  1;

   return ak.interval(i);
  };

  function sinh(x) {
   var epl = widenLB(Math.exp( x.lb()));
   var enl = widenUB(Math.exp(-x.lb()));
   var epu = widenUB(Math.exp( x.ub()));
   var enu = widenLB(Math.exp(-x.ub()));
   var i   = widen(0.5*(epl-enl), 0.5*(epu-enu));

   return ak.interval(i);
  }

  var tan = function(x) {
   var tl = Math.tan(x.lb());
   var tu = Math.tan(x.ub());

   if(x.lb()<=x.ub()-ak.PI || tl>tu) return ak.interval(-ak.INFINITY, ak.INFINITY);
   return ak.interval(widen(tl, tu));
  }

  function tanh(x) {
   var e2l = Math.exp(x.lb()*2);
   var e2u = Math.exp(x.ub()*2);
   var esl = widenLB(widenLB(e2l)-1);
   var epl = widenUB(widenUB(e2l)+1);
   var esu = widenUB(widenUB(e2u)-1);
   var epu = widenLB(widenLB(e2u)+1);
   var i   = widen(esl/epl, esu/epu);

   if(epl===ak.INFINITY) i.lb = 1;
   if(esu===ak.INFINITY) i.ub = 1;

   if(i.lb<-1)     i.lb = -1;
   else if(i.lb>1) i.lb =  1;

   if(i.ub<-1)     i.ub = -1;
   else if(i.ub>1) i.ub =  1;

   return ak.interval(i);
  }

  function add(lhs, rhs) {
   return ak.interval(widen(lhs.lb()+rhs.lb(), lhs.ub()+rhs.ub()));
  }

  function dist(lhs, rhs) {
   return ak.interval(widen(Math.abs(lhs.lb()-rhs.ub()), Math.abs(lhs.ub()-rhs.lb())));
  }

  function div(lhs, rhs) {
   var ll, lu, ul, uu, lb, ub;

   if(isNaN(lhs.lb()) || isNaN(rhs.lb())) return ak.interval(ak.NaN, ak.NaN);

   if(rhs.lb()>0 || rhs.ub()<0) {
    ll = lhs.lb() / rhs.lb();
    lu = lhs.lb() / rhs.ub();
    ul = lhs.ub() / rhs.lb();
    uu = lhs.ub() / rhs.ub();

    if(isNaN(ll)) ll =  ak.INFINITY;
    if(isNaN(lu)) lu = -ak.INFINITY;
    if(isNaN(ul)) ul = -ak.INFINITY;
    if(isNaN(uu)) uu =  ak.INFINITY;

    lb = Math.min(Math.min(ll, lu), Math.min(ul, uu));
    ub = Math.max(Math.max(ll, lu), Math.max(ul, uu));

    return ak.interval(widen(lb, ub));
   }

   if((rhs.lb()<0 && rhs.ub()>0) || (rhs.lb()===0 && rhs.ub()===0) || (lhs.lb()<0 && lhs.ub()>0)) {
    lb = -ak.INFINITY;
    ub =  ak.INFINITY;
   }
   else if((rhs.lb()===0 && lhs.lb()>=0) || (rhs.ub()===0 && lhs.ub()<=0)) {
    lb =  0;
    ub =  ak.INFINITY;
   }
   else if((rhs.lb()===0 && lhs.ub()<=0) || (rhs.ub()===0 && lhs.lb()>=0)) {
    lb = -ak.INFINITY;
    ub =  0;
   }
   return ak.interval(lb, ub);
  }

  function eq(lhs, rhs) {
   return lhs.lb()===rhs.lb() && lhs.ub()===rhs.ub();
  }

  function mod(lhs, rhs) {
   var lhs_lb, lhs_ub, rhs_lb, rhs_ub;
   var lf, uf;
   var ll, lu, ul, uu;
   var ll_n, lu_n, ul_n, uu_n;
   var lb, ub, i;

   if(isNaN(lhs.lb()) || isNaN(rhs.lb())) return ak.interval(ak.NaN, ak.NaN);

   if(rhs.lb()<0) rhs = abs(rhs);

   lhs_lb = lhs.lb();
   lhs_ub = lhs.ub();
   rhs_lb = rhs.lb();
   rhs_ub = rhs.ub();

   if(rhs_lb===0) {
    if(rhs_ub===0 || (lhs_lb<=0 && lhs_ub>=0)) return lhs;
    return lhs_lb>=0 ? ak.interval(0, lhs_ub) : ak.interval(lhs_lb, 0);
   }

   lf = isFinite(lhs_lb);
   uf = isFinite(lhs_ub);

   ll = lf ? lhs_lb % rhs_lb : -rhs_lb;
   lu = lf ? lhs_lb % rhs_ub : -rhs_ub;
   ul = uf ? lhs_ub % rhs_lb :  rhs_lb;
   uu = uf ? lhs_ub % rhs_ub :  rhs_ub;

   ll_n = lf ? (lhs_lb-ll)/rhs_lb : lhs_lb;
   lu_n = lf ? (lhs_lb-lu)/rhs_ub : lhs_lb;
   ul_n = uf ? (lhs_ub-ul)/rhs_lb : lhs_ub;
   uu_n = uf ? (lhs_ub-uu)/rhs_ub : lhs_ub;

   lb = Math.min(Math.min(ll, lu), Math.min(ul, uu));
   ub = Math.max(Math.max(ll, lu), Math.max(ul, uu));

   if(ll_n!=uu_n || lu_n!=ul_n) {
    if(lhs_lb<0) {
     if(uu_n!==lu_n && lu_n!==0) {
      lb = -rhs_ub;
      if(ub<0) ub = 0;
     }
     else if(ll_n!=lu_n) {
      lb = -lhs_lb/(lu_n-1);
      if(ub<0) ub = 0;
     }
    }

    if(lhs_ub>0) {
     if(lu_n!=uu_n && uu_n!==0) {
      if(lb>0) lb = 0;
      ub = rhs_ub;
     }
     else if(ul_n!==uu_n) {
      if(lb>0) lb = 0;
      ub = lhs_ub/(uu_n+1);
     }
    }
   }

   i = widen(lb, ub);

   if(lhs_lb>=0) {
    if(i.lb <  0)      i.lb =  0;
    if(i.ub >  rhs_ub) i.ub =  rhs_ub;
   }
   else if(lhs_ub<=0) {
    if(i.lb < -rhs_ub) i.lb = -rhs_ub;
    if(i.ub >  0)      i.ub =  0;
   }
   else {
    if(i.lb < -rhs_ub) i.lb = -rhs_ub;
    if(i.ub >  rhs_ub) i.ub =  rhs_ub;
   }

   return ak.interval(i);
  }

  function mul(lhs, rhs) {
   var ll, lu, ul, uu, lb, ub;

   if(isNaN(lhs.lb()) || isNaN(rhs.lb())) return ak.interval(ak.NaN, ak.NaN);

   ll = lhs.lb() * rhs.lb();
   lu = lhs.lb() * rhs.ub();
   ul = lhs.ub() * rhs.lb();
   uu = lhs.ub() * rhs.ub();

   if(isNaN(ll)) ll = 0;
   if(isNaN(lu)) lu = 0;
   if(isNaN(ul)) ul = 0;
   if(isNaN(uu)) uu = 0;

   lb = Math.min(Math.min(ll, lu), Math.min(ul, uu));
   ub = Math.max(Math.max(ll, lu), Math.max(ul, uu));

   return ak.interval(widen(lb, ub));
  }

  function ne(lhs, rhs) {
   return lhs.lb()!==rhs.lb() || lhs.ub()!==rhs.ub();
  }

  function pow(lhs, rhs) {
   var ll, lu, ul, uu, lb, ub, i;

   if(isNaN(lhs.lb()) || isNaN(rhs.lb())) return ak.interval(ak.NaN, ak.NaN);

   if(rhs.lb()!==rhs.ub()) {
    if(lhs.lb<0) return ak.interval(ak.NaN, ak.NaN);

    ll = Math.pow(lhs.lb(), rhs.lb());
    lu = Math.pow(lhs.lb(), rhs.ub());
    ul = Math.pow(lhs.ub(), rhs.lb());
    uu = Math.pow(lhs.ub(), rhs.ub());

    lb = Math.min(Math.min(ll, lu), Math.min(ul, uu));
    ub = Math.max(Math.max(ll, lu), Math.max(ul, uu));

    i = widen(lb, ub);
   }
   else if(rhs.lb()%2!==0 || lhs.lb()>0 || lhs.ub()<0) {
    lb = Math.pow(lhs.lb(), rhs.lb());
    ub = Math.pow(lhs.ub(), rhs.lb());

    i = widen(lb, ub);
   }
   else {
    ub = Math.max(Math.pow(lhs.lb(), rhs.lb()), Math.pow(lhs.ub(), rhs.lb()));

    i = {lb: 0, ub: widenUB(ub)};
   }
   return ak.interval(i);
  }

  function sub(lhs, rhs) {
   return ak.interval(widen(lhs.lb()-rhs.ub(), lhs.ub()-rhs.lb()));
  }

  ak.overload(ak.abs,  ak.INTERVAL_T, abs);
  ak.overload(ak.acos, ak.INTERVAL_T, acos);
  ak.overload(ak.asin, ak.INTERVAL_T, asin);
  ak.overload(ak.atan, ak.INTERVAL_T, atan);
  ak.overload(ak.cos,  ak.INTERVAL_T, cos);
  ak.overload(ak.cosh, ak.INTERVAL_T, cosh);
  ak.overload(ak.exp,  ak.INTERVAL_T, exp);
  ak.overload(ak.inv,  ak.INTERVAL_T, inv);
  ak.overload(ak.log,  ak.INTERVAL_T, log);
  ak.overload(ak.neg,  ak.INTERVAL_T, neg);
  ak.overload(ak.sin,  ak.INTERVAL_T, sin);
  ak.overload(ak.sinh, ak.INTERVAL_T, sinh);
  ak.overload(ak.sqrt, ak.INTERVAL_T, sqrt);
  ak.overload(ak.tan,  ak.INTERVAL_T, tan);
  ak.overload(ak.tanh, ak.INTERVAL_T, tanh);

  ak.overload(ak.add,  [ak.INTERVAL_T, ak.INTERVAL_T], add);
  ak.overload(ak.dist, [ak.INTERVAL_T, ak.INTERVAL_T], dist);
  ak.overload(ak.div,  [ak.INTERVAL_T, ak.INTERVAL_T], div);
  ak.overload(ak.eq,   [ak.INTERVAL_T, ak.INTERVAL_T], eq);
  ak.overload(ak.mod,  [ak.INTERVAL_T, ak.INTERVAL_T], mod);
  ak.overload(ak.mul,  [ak.INTERVAL_T, ak.INTERVAL_T], mul);
  ak.overload(ak.ne,   [ak.INTERVAL_T, ak.INTERVAL_T], ne);
  ak.overload(ak.pow,  [ak.INTERVAL_T, ak.INTERVAL_T], pow);
  ak.overload(ak.sub,  [ak.INTERVAL_T, ak.INTERVAL_T], sub);
 }

 ak.using('', define);
})();
