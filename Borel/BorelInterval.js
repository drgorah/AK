//AK/Borel/BorelInterval.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.BOREL_INTERVAL_T) return;

  ak.BOREL_INTERVAL_T = 'ak.borelInterval';

  function BorelInterval(){}
  BorelInterval.prototype = {TYPE: ak.BOREL_INTERVAL_T, valueOf: function(){return ak.NaN;}};

  function isEmpty(lb, ub) {
   var lv = lb.value();
   var uv = ub.value();
   return lv>uv || (lv===uv && (lb.open() || ub.open()));
  }

  function containsNum(lb, ub, x) {
   var lv = lb.value();
   var uv = ub.value();
   return (x>lv || (x===lv && lb.closed()))
       && (x<uv || (x===uv && ub.closed()));
  }

  function containsLB(lb, ub, x) {
   var lv = lb.value();
   var uv = ub.value();
   var xv = x.value();
   var xc = x.closed();
   return (xv>lv || (xv===lv && (lb.closed() || !xc)))
       && (xv<uv || (xv===uv && ub.closed() && xc));
  }

  function containsUB(lb, ub, x) {
   var lv = lb.value();
   var uv = ub.value();
   var xv = x.value();
   var xc = x.closed();
   return (xv>lv || (xv===lv && lb.closed() && xc))
       && (xv<uv || (xv===uv && (ub.closed() || !xc)));
  }

  ak.borelInterval = function() {
   var b = new BorelInterval();
   var state = {};
   var arg0 = arguments[0];
   var empty;

   constructors[ak.type(arg0)](state, arg0, arguments);
   empty = isEmpty(state.lb, state.ub);

   if(empty) {
    state.lb = ak.borelBound('(', 0);
    state.ub = ak.borelBound(0, ')');
   }

   b.lb = function() {return state.lb;};
   b.ub = function() {return state.ub;};

   b.contains = function(x) {
    switch(ak.type(x)) {
     case ak.NUMBER_T: return !empty && containsNum(state.lb, state.ub, x);
     case ak.BOREL_BOUND_T: return !empty && x.lower() ? containsLB(state.lb, state.ub, x) : containsUB(state.lb, state.ub, x);
    }
    throw new Error('invalid argument in ak.borelInterval.contains');
   };

   b.includes = function(x) {
    if(ak.type(x)!==ak.BOREL_INTERVAL_T) throw new Error('invalid argument in ak.borelInterval.includes');
    return isEmpty(x.lb(), x.ub()) || (!empty && containsLB(state.lb, state.ub, x.lb()) && containsUB(state.lb, state.ub, x.ub()));
   };

   b.toString      = function()  {return state.lb.toString()+','+state.ub.toString();};
   b.toExponential = function(d) {return state.lb.toExponential(d)+','+state.ub.toExponential(d);};
   b.toFixed       = function(d) {return state.lb.toFixed(d)+','+state.ub.toFixed(d);};
   b.toPrecision   = function(d) {return state.lb.toPrecision(d)+','+state.ub.toPrecision(d);};

   return Object.freeze(b);
  };

  var constructors = {};

  constructors[ak.BOREL_BOUND_T] = function(state, lb, args) {
   var arg1 = args[1];

   state.lb = ak.borelBound(lb);
   if(state.lb.upper()) throw new Error('invalid lower bound in ak.borelInterval');

   constructors[ak.BOREL_BOUND_T][ak.type(arg1)](state, arg1, args);
  };

  constructors[ak.BOREL_BOUND_T][ak.BOREL_BOUND_T] = function(state, ub) {
   state.ub = ak.borelBound(ub);
   if(state.ub.lower()) throw new Error('invalid upper bound in ak.borelInterval');
  };

  constructors[ak.NUMBER_T] = function(state, val) {
   state.lb = ak.borelBound('[', val);
   state.ub = ak.borelBound(val, ']');
  };

  constructors[ak.STRING_T] = function(state, ltype, args) {
   var lval = args[1];
   var arg2 = args[2];

   state.lb = ak.borelBound(ltype, lval);
   constructors[ak.STRING_T][ak.type(arg2)](state, arg2, args);
  };

  constructors[ak.STRING_T][ak.NUMBER_T] = function(state, uval, args) {
   var utype = args[3];
   state.ub = ak.borelBound(uval, utype);
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var lb = (ak.nativeType(obj.lb)===ak.FUNCTION_T) ? ak.borelBound(obj.lb()) : ak.borelBound(obj.lb);
   var ub = (ak.nativeType(obj.ub)===ak.FUNCTION_T) ? ak.borelBound(obj.ub()) : ak.borelBound(obj.ub);

   if(lb.upper()) throw new Error('invalid lower bound in ak.borelInterval');
   if(ub.lower()) throw new Error('invalid upper bound in ak.borelInterval');

   state.lb = lb;
   state.ub = ub;
  };

  constructors[ak.BOREL_INTERVAL_T] = constructors[ak.OBJECT_T];

  constructors[ak.UNDEFINED_T] = function(state) {
   state.lb = ak.borelBound('(', 0);
   state.ub = ak.borelBound(0, ')');
  };

  var eqBound = ak.eq[ak.BOREL_BOUND_T][ak.BOREL_BOUND_T];
  var neBound = ak.ne[ak.BOREL_BOUND_T][ak.BOREL_BOUND_T];

  function abs(x) {return x.ub().value()-x.lb().value();}

  function is (l, r) {return  r.contains(l);}
  function nis(l, r) {return !r.contains(l);}

  function eq(l, r) {return eqBound(l.lb(), r.lb()) && eqBound(l.ub(), r.ub());}
  function ge(l, r) {return l.includes(r);}
  function gt(l, r) {return l.includes(r) && (neBound(l.lb(), r.lb()) || neBound(l.ub(), r.ub()));}
  function le(l, r) {return r.includes(l);}
  function lt(l, r) {return r.includes(l) && (neBound(l.lb(), r.lb()) || neBound(l.ub(), r.ub()));}
  function ne(l, r) {return neBound(l.lb(), r.lb()) || neBound(l.ub(), r.ub());}

  if(!ak.is)  ak.is  = function(x0, x1) {return ak.is [ak.type(x0)][ak.type(x1)](x0, x1)};
  if(!ak.nis) ak.nis = function(x0, x1) {return ak.nis[ak.type(x0)][ak.type(x1)](x0, x1)};

  ak.overload(ak.abs, ak.BOREL_INTERVAL_T, abs);

  ak.overload(ak.is,  [ak.BOREL_BOUND_T, ak.BOREL_INTERVAL_T], is);
  ak.overload(ak.is,  [ak.NUMBER_T,      ak.BOREL_INTERVAL_T], is);
  ak.overload(ak.nis, [ak.BOREL_BOUND_T, ak.BOREL_INTERVAL_T], nis);
  ak.overload(ak.nis, [ak.NUMBER_T,      ak.BOREL_INTERVAL_T], nis);

  ak.overload(ak.eq, [ak.BOREL_INTERVAL_T, ak.BOREL_INTERVAL_T], eq);
  ak.overload(ak.ge, [ak.BOREL_INTERVAL_T, ak.BOREL_INTERVAL_T], ge);
  ak.overload(ak.gt, [ak.BOREL_INTERVAL_T, ak.BOREL_INTERVAL_T], gt);
  ak.overload(ak.le, [ak.BOREL_INTERVAL_T, ak.BOREL_INTERVAL_T], le);
  ak.overload(ak.lt, [ak.BOREL_INTERVAL_T, ak.BOREL_INTERVAL_T], lt);
  ak.overload(ak.ne, [ak.BOREL_INTERVAL_T, ak.BOREL_INTERVAL_T], ne);
 }

 ak.using('Borel/BorelBound.js', define);
})();
