//AK/Borel/BorelSet.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.BOREL_SET_T) return;

  ak.BOREL_SET_T = 'ak.borelSet';

  function nonEmptyInterval(i) {
   var lb = i.lb();
   var ub = i.ub();
   return lb.value()!==ub.value() || lb.closed();
  }

  function lbCompare(l, r) {
   var lv = l.value();
   var rv = r.value();
   if(lv===rv) {
    lv = Number(l.open());
    rv = Number(r.open());
   }
   return lv-rv;
  }

  function ubCompare(l, r) {
   var lv = l.value();
   var rv = r.value();
   if(lv===rv) {
    lv = Number(l.closed());
    rv = Number(r.closed());
   }
   return lv-rv;
  }

  function intervalCompare(l, r) {
   var lne = nonEmptyInterval(l);
   var rne = nonEmptyInterval(r);
   var c;

   if(lne && rne) {
    c = lbCompare(l.lb(), r.lb());
    return c!==0 ? c : ubCompare(r.ub(), l.ub());
   }
   return Number(rne)-Number(lne);
  }

  function numberCompare(li, rv) {return li.lb().value()-rv;}

  function touchesNextLB(ub0, lb1) {
   var v0 = ub0.value();
   var v1 = lb1.value();
   return v0>v1 || (v0===v1 && (ub0.closed() || lb1.closed()));
  }

  function includesNextUB(ub0, ub1) {
   var v0 = ub0.value();
   var v1 = ub1.value();
   return v0>v1 || (v0===v1 && (ub0.closed() || ub1.open()));
  }

  function compress(state) {
   var n, i0, i1;

   state.sort(intervalCompare);
   n = state.length;
   while(n>0 && !nonEmptyInterval(state[n-1])) --n;

   if(n>1) {
    i0 = i1 = 0;
    while(i1<n) {
     while(++i1<n && touchesNextLB(state[i0].ub(), state[i1].lb())) {
      if(!includesNextUB(state[i0].ub(), state[i1].ub())) {
       state[i0] = ak.borelInterval(state[i0].lb(), state[i1].ub());
      }
     }
     if(i1<n) state[++i0] = state[i1];
    }
    state.length = i0+1;
   }
   else {
    state.length = n;
   }
  }

  function containsNumber(state, x) {
   var n = state.length;
   var i = ak._unsafeLowerBound(state, x, numberCompare, 0, n);
   return (i>0 && state[i-1].contains(x)) || (i<n && state[i].contains(x));
  }

  function containsBound(state, x) {
   var n = state.length;
   var i = ak._unsafeLowerBound(state, x.value(), numberCompare, 0, n);
   return (i>0 && state[i-1].contains(x)) || (i<n && state[i].contains(x));
  }

  function includesInterval(state, x) {
   var n = state.length;
   var i = ak._unsafeLowerBound(state, x.lb().value(), numberCompare, 0, n);
   return (i>0 && state[i-1].includes(x)) || (i<n && state[i].includes(x));
  }

  function includesSet(state, x) {
   var n = state.length;
   var m = x.intervals();
   var i = 0;
   var j, xj;

   for(j=0;j<m;++j) {
    xj = x.at(j);
    i = ak._unsafeLowerBound(state, xj.lb().value(), numberCompare, i, n);
    if(!(i>0 && state[i-1].includes(xj)) && !(i<n && state[i].includes(xj))) return false;
   }
   return true;
  }

  function BorelSet(){}
  BorelSet.prototype = {TYPE: ak.BOREL_SET_T, valueOf: function(){return ak.NaN;}};

  ak.borelSet = function(set) {
   var b = new BorelSet();
   var state = [];

   constructors[ak.nativeType(set)](state, set);
   compress(state);

   b.intervals = function() {return state.length;};
   b.at = function(i) {return state[Number(i)];};

   b.contains = function(x) {
    switch(ak.type(x)) {
     case ak.NUMBER_T:      return containsNumber(state, x);
     case ak.BOREL_BOUND_T: return containsBound(state, x);
    }
    throw new Error('invalid argument in ak.borelSet.contains');
   };

   b.includes = function(x) {
    switch(ak.type(x)) {
     case ak.BOREL_INTERVAL_T: return includesInterval(state, x);
     case ak.BOREL_SET_T:      return includesSet(state, x);
    }
    throw new Error('invalid argument in ak.borelSet.includes');
   };

   b.toArray  = function() {return state.slice(0);};
   b.toString = function() {return '{'+state.join('+')+'}';};

   b.toExponential = function(d) {return '{'+state.map(function(x){return x.toExponential(d);}).join('+')+'}';};
   b.toFixed       = function(d) {return '{'+state.map(function(x){return x.toFixed(d);}).join('+')+'}';};
   b.toPrecision   = function(d) {return '{'+state.map(function(x){return x.toPrecision(d);}).join('+')+'}';};

   return Object.freeze(b);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, set) {
   var n = set.length;
   var i;

   state.length = n;
   for(i=0;i<n;++i) state[i] = ak.borelInterval(set[i]);
  };

  constructors[ak.OBJECT_T] = function(state, set) {
   var n = (ak.nativeType(set.intervals)===ak.FUNCTION_T) ? Number(set.intervals()) : Number(set.intervals);
   var i;

   state.length = n;
   for(i=0;i<n;++i) state[i] = ak.borelInterval(set.at(i));
  };

  var eqInterval = ak.eq[ak.BOREL_INTERVAL_T][ak.BOREL_INTERVAL_T];

  function abs(x) {
   var n = x.intervals();
   var l = 0;
   var i, xi;

   for(i=0;i<n;++i) {
    xi = x.at(i);
    l += xi.ub().value()-xi.lb().value();
   }
   return l;
  }

  function flipLB(lb) {return ak.borelBound(lb.value(), lb.open() ? ']' : ')');}
  function flipUB(ub) {return ak.borelBound(ub.open() ? '[' : '(', ub.value());}

  function not(x) {
   var n = x.intervals();
   var a = new Array(n+1);
   var i = 0;
   var l = ak.borelBound('[', -ak.INFINITY);
   var b;

   while(i<n) {
    b = x.at(i);
    a[i++] = ak.borelInterval(l, flipLB(b.lb()));
    l = flipUB(b.ub());
   }
   a[i] = ak.borelInterval(l, ak.borelBound(ak.INFINITY, ']'));
   return ak.borelSet(a);
  }

  function is (l, r) {return  r.contains(l);}
  function nis(l, r) {return !r.contains(l);}

  function eq(l, r) {
   var n = l.intervals();
   var i = 0;

   if(r.intervals()!==n) return false;
   while(i<n && eqInterval(l.at(i), r.at(i))) ++i;
   return i===n;
  }

  function ne(l, r) {
   var n = l.intervals();
   var i = 0;

   if(r.intervals()!==n) return true;
   while(i<n && eqInterval(l.at(i), r.at(i))) ++i;
   return i<n;
  }

  function le(l, r) {return r.includes(l);}
  function lt(l, r) {return r.includes(l) && ne(l, r);}
  function ge(l, r) {return l.includes(r);}
  function gt(l, r) {return l.includes(r) && ne(l, r);}

  function and (l, r) {return not(or(not(l), not(r)));}
  function nand(l, r) {return or(not(l), not(r));}
  function nor (l, r) {return not(or(l, r));}
  function or  (l, r) {return ak.borelSet(l.toArray().concat(r.toArray()));}
  function sub (l, r) {return not(or(not(l), r));}
  function xnor(l, r) {return or(not(or(l, r)), not(or(not(l), not(r))));}
  function xor (l, r) {return not(or(not(or(l, r)), not(or(not(l), not(r)))));}

  if(!ak.is)  ak.is  = function(x0, x1) {return ak.is [ak.type(x0)][ak.type(x1)](x0, x1)};
  if(!ak.nis) ak.nis = function(x0, x1) {return ak.nis[ak.type(x0)][ak.type(x1)](x0, x1)};

  ak.overload(ak.abs, ak.BOREL_SET_T, abs);
  ak.overload(ak.not, ak.BOREL_SET_T, not);

  ak.overload(ak.is,  [ak.BOREL_BOUND_T, ak.BOREL_SET_T], is);
  ak.overload(ak.is,  [ak.NUMBER_T,      ak.BOREL_SET_T], is);
  ak.overload(ak.nis, [ak.BOREL_BOUND_T, ak.BOREL_SET_T], nis);
  ak.overload(ak.nis, [ak.NUMBER_T,      ak.BOREL_SET_T], nis);

  ak.overload(ak.eq, [ak.BOREL_SET_T, ak.BOREL_SET_T], eq);
  ak.overload(ak.ge, [ak.BOREL_SET_T, ak.BOREL_SET_T], ge);
  ak.overload(ak.gt, [ak.BOREL_SET_T, ak.BOREL_SET_T], gt);
  ak.overload(ak.le, [ak.BOREL_SET_T, ak.BOREL_SET_T], le);
  ak.overload(ak.lt, [ak.BOREL_SET_T, ak.BOREL_SET_T], lt);
  ak.overload(ak.ne, [ak.BOREL_SET_T, ak.BOREL_SET_T], ne);

  ak.overload(ak.add,  [ak.BOREL_SET_T, ak.BOREL_SET_T], or);
  ak.overload(ak.and,  [ak.BOREL_SET_T, ak.BOREL_SET_T], and);
  ak.overload(ak.nand, [ak.BOREL_SET_T, ak.BOREL_SET_T], nand);
  ak.overload(ak.nor,  [ak.BOREL_SET_T, ak.BOREL_SET_T], nor);
  ak.overload(ak.or,   [ak.BOREL_SET_T, ak.BOREL_SET_T], or);
  ak.overload(ak.sub,  [ak.BOREL_SET_T, ak.BOREL_SET_T], sub);
  ak.overload(ak.xnor, [ak.BOREL_SET_T, ak.BOREL_SET_T], xnor);
  ak.overload(ak.xor,  [ak.BOREL_SET_T, ak.BOREL_SET_T], xor);
 }

 ak.using(['Borel/BorelInterval.js', 'Algorithm/LowerBound.js'], define);
})();
