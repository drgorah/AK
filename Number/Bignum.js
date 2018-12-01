//AK/Number/Bignum.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

//This time I really, really mean it. The implementation of multiplication is
//hopelessly inefficient and that of division immeasurably worse.
//If you use this code in production your nose will fall off. Which is to say it won't
//of course, that would be ridiculous, but if it did I would have no sympathy at all.

"use strict";

(function() {
 function define() {
  if(ak.BIGNUM_T) return;
  ak.BIGNUM_T = 'ak.bignum';

  var BASE = ak.DEC_MAX+1;

  function normalise(state) {
   var n = state.length;
   var i;

   if(n===1) {
    if(isFinite(state[0]) && Math.abs(state[0])>=BASE) state[0] = ak.NaN;
   }
   else if(n>0) {
    for(i=0;i<n && state[i]===0;++i);
    if(i>0) {
     state.splice(0, i);
     n -= i;
    }

    for(i=1;i<n && state[i]>=0 && state[i]<BASE;++i);
    if(i<n || (n>0 && !(Math.abs(state[0])<BASE))) {
     n = 1;
     state.length = n;
     state[0] = ak.NaN;
    }
   }

   if(n===0) state[0] = 0;
  }

  function cmpAbs(b0, b1) {
   var d = Math.abs(b0.at(0)) - Math.abs(b1.at(0));
   var n, i;
   //assert(b0.size()===b1.size() && b0.size()>1);

   if(d!==0) return d;

   n = b0.size();
   for(i=1;i<n && b0.at(i)===b1.at(i);++i);
   return i<n ? b0.at(i)-b1.at(i) : 0;
  }

  function addAbs(a, b) {
   var na = a.length;
   var nb = b.size();
   var i  = 1;
   var c  = 0;
   var x;
   //assert(na>=nb);

   a[0] = Math.abs(a[0]);

   while(i<nb) {
    x = a[na-i] + b.at(nb-i) + c;
    c = x<BASE ? 0 : 1;
    a[na-i++] = x - c*BASE;
   }

   x = a[na-i] + Math.abs(b.at(0)) + c;
   c = x<BASE ? 0 : 1;
   a[na-i++] = x - c*BASE;

   while(i<=na && c===1) {
    x = a[na-i] + c;
    c = x<BASE ? 0 : 1;
    a[na-i++] = x - c*BASE;
   }

   if(c===1) a.unshift(1);
   return a;
  }

  function subAbs(a, b) {
   var na = a.length;
   var nb = b.size();
   var i  = 1;
   var c  = 0;
   var x;
   //assert(na>=nb);

   a[0] = Math.abs(a[0]);

   while(i<nb) {
    x = a[na-i] - b.at(nb-i) - c;
    c = x>=0 ? 0 : 1;
    a[na-i++] = x + c*BASE;
   }

   x = a[na-i] - Math.abs(b.at(0)) - c;
   c = x>=0 ? 0 : 1;
   a[na-i++] = x + c*BASE;

   while(c===1) {
    x = a[na-i] - c;
    c = x>=0 ? 0 : 1;
    a[na-i++] = x + c*BASE;
   }

   //assert(i<=na+1);
   return a;
  }

  ak.mulDec = function(lhs, rhs) {
   var ls, l1, l2, l3;
   var rs, r1, r2, r3;
   var h, m, m1, m2, l, c, s;

   ls = lhs<0 ? -1 : 1;
   rs = rhs<0 ? -1 : 1;

   lhs = Math.floor(ls*lhs);
   rhs = Math.floor(rs*rhs);

   if(lhs>=1E15) lhs = ak.INFINITY;
   if(rhs>=1E15) rhs = ak.INFINITY;

   l = lhs*rhs;
   if(!isFinite(l)) return isNaN(l) ? {sign: ak.NaN, hi: ak.NaN, lo: ak.NaN} : {sign: ls*rs, hi: ak.INFINITY, lo: ak.INFINITY};

   if(l<1E15) {
    h = 0;
   }
   else {
    l3 = lhs%1E5; l2 = ((lhs-l3)/1E5)%1E5; l1 = (lhs-l2*1E5-l3)/1E10;
    r3 = rhs%1E5; r2 = ((rhs-r3)/1E5)%1E5; r1 = (rhs-r2*1E5-r3)/1E10;

    h = l1*r1*1E5 + l1*r2 + l2*r1;
    m = l1*r3 + l2*r2 + l3*r1;
    l = (l2*r3+l3*r2)*1E5 + l3*r3;

    m2 = m%1E5;
    m1 = (m-m2)/1E5;

    h += m1;
    l += m2*1E10;

    if(l>=1E15) {
     c = l%1E15;
     h += (l-c)/1E15;
     l = c;
    }
   }
   s = (h!==0 || l!==0) ? ls*rs : 0;
   return {sign: s, hi: h, lo: l};
  };

  function Bignum(){}
  Bignum.prototype = {TYPE: ak.BIGNUM_T, valueOf: function(){return ak.NaN;}};

  ak.bignum = function() {
   var b     = new Bignum();
   var arg0  = arguments[0];
   var state = [];

   constructors[ak.nativeType(arg0)](state, arg0, arguments);
   normalise(state);

   b.size = function()  {return state.length;};
   b.at   = function(i) {return state[i];};

   b.toArray  = function() {return state.slice(0);};
   b.toNumber = function() {return toNumber(state);};
   b.toString = function() {return toString(state);};

   return Object.freeze(b);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, arr, args) {
   var n = arr.length;
   var arg1 = args[1];
   var i;

   for(i=0;i<n;++i) state[i] = ak.trunc(arr[i]);

   constructors[ak.ARRAY_T][ak.nativeType(arg1)](state, arg1);
  };

  constructors[ak.ARRAY_T][ak.NUMBER_T] = function(state, s) {
   var n, i;

   if(s<0) {
    n = state.length;
    for(i=0;i<n && state[i]===0;++i);
    if(i<n) state[i] *= -1;
   }
  };

  constructors[ak.ARRAY_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.NUMBER_T] = function(state, x) {
   var s = x<0 ? -1 : 1;
   x = ak.trunc(s*x);

   if(x<BASE) {
    state[0] = s*x;
   }
   else if(x<=ak.INT_MAX) {
    state[1] = x % BASE;
    state[0] = s * (x-state[1]) / BASE;
   }
   else {
    state[0] = s*x;
   }
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var n = obj.size;
   var i;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? n = Number(n()) : Number(n);
   state.length = n;

   for(i=0;i<n;++i) state[i] = ak.trunc(obj.at(i));
  };

  constructors[ak.STRING_T] = function(state, str) {
   var s = str.match(/^\s*([+-]?)\s*(\d{1,3}(?:,?\d{3})*)\s*$/);
   var n, c0, c1, i;

   if(s) {
    str = s[2].replace(/,/g, '');
    n = str.length;

    c0 = 0;
    c1 = n % ak.DEC_DIG;
    if(c1===0) c1 = ak.DEC_DIG;

    for(i=0;c0<n;++i) {
     state[i] = parseInt(str.substring(c0, c1), 10);

     c0  = c1;
     c1 += ak.DEC_DIG;
    }
    if(s[1]==='-') state[0] *= -1;
   }
   else {
    state[0] = ak.NaN; 
   }
  };

  function toNumber(state) {
   var n = state.length;
   var x = state[0];
   var s = x<0 ? -1 : 1;
   var i;

   x *= s;
   for(i=1;i<n;++i) {
    x *= BASE;
    x += state[i];
   }
   return s*x;
  }

  function toString(state) {
   var n = state.length;
   var s = [];
   var i, t;

   s.push(state[0].toString());

   for(i=1;i<n;++i) {
    t = state[i]+BASE;
    s.push(t.toFixed(0).slice(1));
   }
   return s.join('');
  }

  function abs(b) {
   return b.at(0)<0 ? neg(b) : b;
  }

  function neg(b) {
   var a = b.toArray();
   a[0] *= -1;
   return ak.bignum(a);
  }

  function add(b0, b1) {
   var n0 = b0.size();
   var n1 = b1.size();
   var d0 = b0.at(0);
   var d1 = b1.at(0);
   var s0 = d0<0 ? -1 : 1;
   var s1 = d1<0 ? -1 : 1;
   var sum;

   if(n0===1) {
    if(n1===1) return ak.bignum(d0+d1);

    if(d0===0) return b1;
    if(!isFinite(d0)) return b0;
   }

   if(n1===1) {
    if(d1===0) return b0;
    if(!isFinite(d1)) return b1;
   }

   if(s0===s1) {
    sum = n0>n1 ? addAbs(b0.toArray(), b1) : addAbs(b1.toArray(), b0);
   }
   else {
    if(n0===n1) n0 += cmpAbs(b0, b1);
    if(n0!==n1) sum = n0>n1 ? subAbs(b0.toArray(), b1) : subAbs(b1.toArray(), b0);
    else        sum = 0;
   }

   return ak.bignum(sum, n0>n1 ? s0 : s1);
  }

  function cmp(b0, b1) {
   var d0 = b0.at(0);
   var d1 = b1.at(0);
   var dd = d0-d1;
   var n0, n1, s, i;

   if(!isFinite(dd)) return d0!==d1 ? dd : 0;

   n0 = b0.size();
   n1 = b1.size();

   if(n0!==n1) return n0>n1 ? d0 : -d1;
   if(dd!==0)  return dd;

   s = d0<0 ? -1 : 1;

   for(i=1;i<n0 && b0.at(i)===b1.at(i);++i);
   return i<n0 ? s*(b0.at(i)-b1.at(i)) : 0;
  }

  function div(b0, b1) {
   var n0 = b0.size();
   var n1 = b1.size();
   var n  = n0-n1+1;
   var d0 = b0.at(0);
   var d1 = b1.at(0);
   var s0 = d0<0 ? -1 : 1;
   var s1 = d1<0 ? -1 : 1;
   var rat, i, c;

   if(n0===1) {
    if(n1===1) return ak.bignum(ak.trunc(d0/d1));
    if(d0===0 || !isFinite(d0)) return ak.bignum(d0/d1);
   }

   if(n1===1) {
    if(d1=== 0 || !isFinite(d1)) return ak.bignum(d0/d1);
    if(d1=== 1) return b0;
    if(d1===-1) return neg(b0);
   }

   b0  = abs(b0);
   b1  = abs(b1);
   d1 *= s1;

   rat = ak.bignum(0);

   while(n0>n1 || (n0===n1 && cmpAbs(b0, b1)>=0)) {
    d0 = b0.at(0);

    if(Math.abs(d0)>=d1) {
     c = [ak.trunc(d0/d1)];
     for(i=1;i<=n0-n1;++i) c[i] = 0;
    }
    else {
     c = [ak.trunc(BASE*d0/d1)];
     for(i=1;i<n0-n1;++i) c[i] = 0;
    }
    c   = ak.bignum(c);
    rat = add(rat, c);
    b0  = sub(b0, ak.mul(b1, c));
    n0  = b0.size();
   }
   if(b0.at(0)<0) rat = sub(rat, ak.bignum(1));
   return s0*s1<0 ? neg(rat) : rat;
  }

  function eq(b0, b1) {
   var n = b0.size();
   var i;

   if(b1.size()!==n) return false;
   for(i=0;i<n && b0.at(i)===b1.at(i);++i);
   return i===n;
  }

  function ge(b0, b1) {
   return cmp(b0, b1)>=0;
  }

  function gt(b0, b1) {
   return cmp(b0, b1)>0;
  }

  function le(b0, b1) {
   return cmp(b0, b1)<=0;
  }

  function lt(b0, b1) {
   return cmp(b0, b1)<0;
  }

  function mod(b0, b1) {
   var a1 = abs(b1);
   var d  = div(b0, a1);
   return sub(b0, mul(a1, d));
  }

  function mul(b0, b1) {
   var n0 = b0.size();
   var n1 = b1.size();
   var n  = n0+n1;
   var d0 = b0.at(0);
   var d1 = b1.at(0);
   var s0 = d0<0 ? -1 : 1;
   var s1 = d1<0 ? -1 : 1;
   var prod = [];
   var i, j, k, c, x;

   if(n0===1) {
    if(d0=== 0 || !isFinite(d0)) return ak.bignum(d0*d1);
    if(d0=== 1) return b1;
    if(d0===-1) return neg(b1);
   }

   if(n1===1) {
    if(d1=== 0 || !isFinite(d1)) return ak.bignum(d0*d1);
    if(d1=== 1) return b0;
    if(d1===-1) return neg(b0);
   }

   for(i=0;i<n;++i) prod[i] = 0;

   for(i=0;i<n0;++i) {
    for(j=0;j<n1;++j) {
     k = i+j+1;

     x = ak.mulDec(b0.at(i), b1.at(j));
     x.lo += prod[k];
     x.hi += prod[k-1];

     if(x.lo>=BASE) {
      x.lo -= BASE;
      x.hi += 1;
     }

     c = x.hi<BASE ? 0 : 1;
     prod[k--] = x.lo;
     prod[k--] = x.hi - c*BASE;

     while(c===1) {
      x = prod[k] + c;
      c = x<BASE ? 0 : 1;
      prod[k--] = x - c*BASE;
     }
     //assert(k>=-1);
    }
   }
   return ak.bignum(prod, s0*s1);
  }

  function ne(b0, b1) {
   return !eq(b0, b1);
  }

  function sub(b0, b1) {
   var n0 = b0.size();
   var n1 = b1.size();
   var d0 = b0.at(0);
   var d1 = b1.at(0);
   var s0 = d0<0 ? -1 : 1;
   var s1 = d1<0 ? -1 : 1;
   var diff;

   if(n0===1) {
    if(n1===1) return ak.bignum(d0-d1);

    if(d0===0) return neg(b1);
    if(!isFinite(d0)) return b0;
   }

   if(n1===1) {
    if(d1===0) return b0;
    if(!isFinite(d1)) return ak.bignum(-d1);
   }

   s1 *= -1;
   if(s0===s1) {
    diff = n0>n1 ? addAbs(b0.toArray(), b1) : addAbs(b1.toArray(), b0);
   }
   else {
    if(n0===n1) n0 += cmpAbs(b0, b1);
    if(n0!==n1) diff = n0>n1 ? subAbs(b0.toArray(), b1) : subAbs(b1.toArray(), b0);
    else        diff = 0;
   }

   return ak.bignum(diff, n0>n1 ? s0 : s1);
  }

  ak.overload(ak.abs,  ak.BIGNUM_T, abs);
  ak.overload(ak.neg,  ak.BIGNUM_T, neg);

  ak.overload(ak.add, [ak.BIGNUM_T, ak.BIGNUM_T], add);
  ak.overload(ak.cmp, [ak.BIGNUM_T, ak.BIGNUM_T], cmp);
  ak.overload(ak.div, [ak.BIGNUM_T, ak.BIGNUM_T], div);
  ak.overload(ak.eq,  [ak.BIGNUM_T, ak.BIGNUM_T], eq);
  ak.overload(ak.ge,  [ak.BIGNUM_T, ak.BIGNUM_T], ge);
  ak.overload(ak.gt,  [ak.BIGNUM_T, ak.BIGNUM_T], gt);
  ak.overload(ak.le,  [ak.BIGNUM_T, ak.BIGNUM_T], le);
  ak.overload(ak.lt,  [ak.BIGNUM_T, ak.BIGNUM_T], lt);
  ak.overload(ak.mod, [ak.BIGNUM_T, ak.BIGNUM_T], mod);
  ak.overload(ak.mul, [ak.BIGNUM_T, ak.BIGNUM_T], mul);
  ak.overload(ak.ne,  [ak.BIGNUM_T, ak.BIGNUM_T], ne);
  ak.overload(ak.sub, [ak.BIGNUM_T, ak.BIGNUM_T], sub);
 }

 ak.using('', define);
})();