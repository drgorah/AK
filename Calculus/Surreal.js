//AK/Calculus/Surreal.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.SURREAL_T) return;
  ak.SURREAL_T = 'ak.surreal';

  function Surreal(){}
  Surreal.prototype = {TYPE: ak.SURREAL_T, valueOf: function(){return ak.NaN;}};

  var factCache = [1];

  function fact(i) {
   var n = factCache.length;
   while(n++<=i) factCache[n-1] = (n-1)*factCache[n-2];
   return factCache[i];
  }

  function derivs(terms) {
   var fac = 1;
   var n = terms.length;
   var i;

   terms = terms.slice(0);

   for(i=0;i<n;++i) {
    terms[i] *= fac;
    fac *= i+1;
   }
   return terms;
  }

  function toString(state, f, d) {
   var n = state.length;
   var s = [];
   var i;

   //assert(n>0)

   s.push(f.call(state[0], d));

   if(n>1) {
    if(state[1]<0) s.push(' - ' + f.call(-state[1], d) + 'd');
    else           s.push(' + ' + f.call( state[1], d) + 'd');
   }

   for(i=2;i<n;++i) {
    if(state[i]<0) s.push(' - ' + f.call(-state[i], d) + 'd^' + i);
    else           s.push(' + ' + f.call( state[i], d) + 'd^' + i);
   }

   return s.join('');
  }

  ak.surreal = function() {
   var s = new Surreal();
   var state = [];
   var arg0  = arguments[0];

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   s.order  = function()  {return state.length-1;};
   s.coeff  = function(i) {return state[Number(i)]+0;};
   s.coeffs = function()  {return state.slice(0);};
   s.deriv  = function(i) {return fact(Number(i))*state[Number(i)];};
   s.derivs = function()  {return derivs(state);};

   s.toString = function() {return toString(state, Number.prototype.toString);};

   s.toExponential = function(d) {return toString(state, Number.prototype.toExponential, d);};
   s.toFixed       = function(d) {return toString(state, Number.prototype.toFixed, d);};
   s.toPrecision   = function(d) {return toString(state, Number.prototype.toPrecision, d);};

   return Object.freeze(s);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, arr) {
   var n = arr.length;
   var i;

   if(n===0) throw new Error('no coefficients in ak.surreal constructor');

   for(i=0;i<n;++i) state[i] = Number(arr[i]);
  };

  constructors[ak.NUMBER_T] = function(state, n, args) {
   var arg1 = args[1];

   n = ak.trunc(n);
   if(n<0) throw new Error('negative order in ak.surreal constructor');
   state.length = n+1;

   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1, args);
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
   var n = state.length;
   var i;

   for(i=0;i<n;++i) state[i] = 0;
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, func) {
   var n = state.length;
   var i;

   for(i=0;i<n;++i) state[i] = Number(func(i));
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, x, args) {
   var arg2 = args[2];
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg2)](state, x, arg2);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state, x) {
   var n = state.length;
   var i;

   //assert(n>0)

   state[0] = x;
   for(i=1;i<n;++i) state[i] = 0;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, x, d) {
   var n = state.length;
   var i;

   //assert(n>0)

   state[0] = x;
   if(n>1) state[1] = d;
   for(i=2;i<n;++i) state[i] = 0;
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   var n = obj.order;
   var i;

   n = (ak.nativeType(n)===ak.FUNCTION_T) ? Number(n()) : Number(n);
   if(n<0 || n>ak.INT_MAX-1) throw new Error('invalid order in ak.surreal constructor');

   state.length = n+1;
   for(i=0;i<=n;++i) state[i] = Number(obj.coeff(i));
  };

  var symbolicDerivsCache = {};

  function symbolicCoeffs(f, s) {
   var coeffs = [];
   var cache = symbolicDerivsCache[f]
   var fac = 1;
   var n = s.order()+1;
   var z, dfz, i;

   if(symbolicDerivsCache[f]) {
    cache = symbolicDerivsCache[f];
    z = cache.z;
    dfz = cache.dfz;
   }
   else {
    z  = ak.varExpr();
    dfz = [ak[f](z)];
    cache = {z: z, dfz: dfz};
    symbolicDerivsCache[f] = cache;
   }

   z.value(ak.approxExpr(s.coeff(0)));

   coeffs.length = n;
   coeffs[0] = dfz[0].approx();

   for(i=1;i<n;++i) {
    if(!dfz[i]) dfz[i] = ak.symbolicDerivative(dfz[i-1], z);
    fac *= i;

    coeffs[i] = dfz[i].approx() / fac;
   }
   return coeffs;
  }

  function iPow(s, i, di) {
   var n = s.order();
   var j, k;

   for(j=0;j<=n-i;++j) {
    di[n-j] = 0;
    for(k=1;k<=n+1-(i+j);++k) di[n-j] += di[n-(j+k)] * s.coeff(k);
   }
  }

  function chain(c, s) {
   var di = s.coeffs();
   var cs = [];
   var n  = di.length;
   var i, j;

   cs.length = n;
   cs[0] = c[0];

   for(j=1;j<n;++j) cs[j] = c[1] * di[j];

   for(i=2;i<n;++i) {
    iPow(s, i, di);
    for(j=i;j<n;++j) cs[j] += c[i] * di[j];
   }
   return ak.surreal(cs);
  }

  function elemNeg(x, i, a) {a[i] *= -1;}
  function elemNaN(x, i, a) {a[i]  = ak.NaN;}

  function abs(s) {
   var s = s.coeffs();
   var x = s[0];

   if(x<0) {
    s.forEach(elemNeg);
   }
   else if(!(x>0)) {
    s.forEach(elemNaN);
    s[0] = x;
   }
   return ak.surreal(s);
  }

  function acos(s) {
   return chain(symbolicCoeffs('acos', s), s);
  }

  function asin(s) {
   return chain(symbolicCoeffs('asin', s), s);
  }

  function atan(s) {
   return chain(symbolicCoeffs('atan', s), s);
  }

  function cos(s) {
   var x  = s.coeff(0);
   var fx = [Math.cos(x), -Math.sin(x), -Math.cos(x), Math.sin(x)];
   var c  = [];
   var n  = s.order()+1;
   var f  = 1;
   var i;

   c.length = n;
   c[0] = fx[0];

   for(i=1;i<n;++i) {
    f *= i;
    c[i] = fx[i%4] / f;
   }
   return chain(c, s);
  }

  function cosh(s) {
   var x  = s.coeff(0);
   var fx = [ak.cosh(x), ak.sinh(x)];
   var c  = [];
   var n  = s.order()+1;
   var f  = 1;
   var i;

   c.length = n;
   c[0] = fx[0];

   for(i=1;i<n;++i) {
    f *= i;
    c[i] = fx[i%2] / f;
   }
   return chain(c, s);
  }

  function exp(s) {
   var fx = Math.exp(s.coeff(0));
   var c  = [];
   var n  = s.order()+1;
   var f  = 1;
   var i;

   c.length = n;
   c[0] = fx;

   for(i=1;i<n;++i) {
    f *= i;
    c[i] = fx / f;
   }
   return chain(c, s);
  }

  function inv(s) {
   var fx = 1/s.coeff(0);
   var fi = fx;
   var c  = [];
   var n  = s.order()+1;
   var i;

   c.length = n;
   c[0] = fx;

   for(i=1;i<n;++i) {
    fi *= -fx;
    c[i] = fi;
   }
   return chain(c, s);
  }

  function log(s) {
   var x  = s.coeff(0);
   var fx = 1/x;
   var fi = -1;
   var c  = [];
   var n  = s.order()+1;
   var i;

   c.length = n;
   c[0] = Math.log(x);

   for(i=1;i<n;++i) {
    fi *= -fx;
    c[i] = fi / i;
   }
   return chain(c, s);
  }

  function neg(s) {
   var a = s.coeffs();
   a.forEach(elemNeg);
   return ak.surreal(a);
  }

  function sin(s) {
   var x  = s.coeff(0);
   var fx = [Math.sin(x), Math.cos(x), -Math.sin(x), -Math.cos(x)];
   var c  = [];
   var n  = s.order()+1;
   var f  = 1;
   var i;

   c.length = n;
   c[0] = fx[0];

   for(i=1;i<n;++i) {
    f *= i;
    c[i] = fx[i%4] / f;
   }
   return chain(c, s);
  }

  function sinh(s) {
   var x  = s.coeff(0);
   var fx = [ak.sinh(x), ak.cosh(x)];
   var c  = [];
   var n  = s.order()+1;
   var f  = 1;
   var i;

   c.length = n;
   c[0] = fx[0];

   for(i=1;i<n;++i) {
    f *= i;
    c[i] = fx[i%2] / f;
   }
   return chain(c, s);
  }

  function sqrt(s) {
   var x  = s.coeff(0);
   var fi = Math.sqrt(x);
   var c  = [];
   var n  = s.order()+1;
   var i;

   c.length = n;
   c[0] = fi;

   for(i=1;i<n;++i) {
    fi *= 0.5*(3-2*i) / (i*x);
    c[i] = fi;
   }
   return chain(c, s);
  }

  function tan(s) {
   return div(sin(s), cos(s));
  }

  function tanh(s) {
   return div(sinh(s), cosh(s));
  }

  function add(s0, s1) {
   var n = s0.order();
   var s = s0.coeffs();
   var i;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal add');

   for(i=0;i<=n;++i) s[i] += s1.coeff(i);
   return ak.surreal(s);
  }

  function addSR(s, r) {
   s = s.coeffs();
   s[0] += r;
   return ak.surreal(s);
  }

  function addRS(r, s) {
   s = s.coeffs();
   s[0] += r;
   return ak.surreal(s);
  }

  function cmp(s0, s1) {
   var n = s0.order();
   var i;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal cmp');

   for(i=0;i<=n && s0.coeff(i)===s1.coeff(i);++i);
   return i===n+1 ? 0 : s0.coeff(i)-s1.coeff(i);
  }

  function cmpSR(s, r) {
   var n = s.order();
   var i;

   if(s.coeff(0)!==r) return s.coeff(0)-r;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i===n+1 ? 0 : s.coeff(i);
  }

  function cmpRS(r, s) {
   var n = s.order();
   var i;

   if(s.coeff(0)!==r) return r-s.coeff(0);

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i===n+1 ? 0 : -s.coeff(i);
  }

  function dist(s0, s1) {
   var n = s0.order();
   var s = s0.coeffs();
   var x, i;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal dist');

   for(i=0;i<=n;++i) s[i] -= s1.coeff(i);
   x = s[0];

   if(x<0) {
    s.forEach(elemNeg);
   }
   else if(!(x>0)) {
    s.forEach(elemNaN);
    s[0] = x;
   }
   return ak.surreal(s);
  }

  function distSR(s, r) {
   var s = s.coeffs();
   var x = s[0] - r;

   s[0] = x;

   if(x<0) {
    s.forEach(elemNeg);
   }
   else if(!(x>0)) {
    s.forEach(elemNaN);
    s[0] = x;
   }
   return ak.surreal(s);
  }

  function distRS(r, s) {
   var s = s.coeffs();
   var x = r - s[0];

   s[0] = x;

   if(x<0) {
    s.forEach(elemNeg);
   }
   else if(!(x>0)) {
    s.forEach(elemNaN);
    s[0] = x;
   }
   return ak.surreal(s);
  }

  function div(s0, s1) {
   return mul(s0, inv(s1));
  }

  function divSR(s, r) {
   var n = s.order();
   var i;

   s = s.coeffs();
   for(i=0;i<=n;++i) s[i] /= r;
   return ak.surreal(s);
  }

  function divRS(r, s) {
   return mulRS(r, inv(s));
  }

  function eq(s0, s1) {
   var n = s0.order();
   var i;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal eq');

   for(i=0;i<=n && s0.coeff(i)===s1.coeff(i);++i);
   return i===n+1;
  }

  function eqSR(s, r) {
   var n = s.order();
   var i;

   if(s.coeff(0)!==r) return false;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i===n+1;
  }

  function eqRS(r, s) {
   var n = s.order();
   var i;

   if(s.coeff(0)!==r) return false;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i===n+1;
  }

  function ge(s0, s1) {
   var n = s0.order();
   var i;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal ge');

   for(i=0;i<=n && s0.coeff(i)===s1.coeff(i);++i);
   return i===n+1 || s0.coeff(i)>s1.coeff(i);
  }

  function geSR(s, r) {
   var n = s.order();
   var i;

   if(s.coeff(0)>r) return true;
   if(s.coeff(0)<r) return false;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i===n+1 || s.coeff(i)>0;
  }

  function geRS(r, s) {
   var n = s.order();
   var i;

   if(r>s.coeff(0)) return true;
   if(r<s.coeff(0)) return false;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i===n+1 || s.coeff(i)<0;
  }

  function gt(s0, s1) {
   var n = s0.order();
   var i;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal gt');

   for(i=0;i<=n && s0.coeff(i)===s1.coeff(i);++i);
   return i!==n+1 && s0.coeff(i)>s1.coeff(i);
  }

  function gtSR(s, r) {
   var n = s.order();
   var i;

   if(s.coeff(0)>r) return true;
   if(s.coeff(0)<r) return false;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i!==n+1 && s.coeff(i)>0;
  }

  function gtRS(r, s) {
   var n = s.order();
   var i;

   if(r>s.coeff(0)) return true;
   if(r<s.coeff(0)) return false;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i!==n+1 && s.coeff(i)<0;
  }

  function le(s0, s1) {
   var n = s0.order();
   var i;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal le');

   for(i=0;i<=n && s0.coeff(i)===s1.coeff(i);++i);
   return i===n+1 || s0.coeff(i)<s1.coeff(i);
  }

  function leSR(s, r) {
   var n = s.order();
   var i;

   if(s.coeff(0)<r) return true;
   if(s.coeff(0)>r) return false;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i===n+1 || s.coeff(i)<0;
  }

  function leRS(r, s) {
   var n = s.order();
   var i;

   if(r<s.coeff(0)) return true;
   if(r>s.coeff(0)) return false;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i===n+1 || s.coeff(i)>0;
  }

  function lt(s0, s1) {
   var n = s0.order();
   var i;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal lt');

   for(i=0;i<=n && s0.coeff(i)===s1.coeff(i);++i);
   return i!==n+1 && s0.coeff(i)<s1.coeff(i);
  }

  function ltSR(s, r) {
   var n = s.order();
   var i;

   if(s.coeff(0)<r) return true;
   if(s.coeff(0)>r) return false;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i!==n+1 && s.coeff(i)<0;
  }

  function ltRS(r, s) {
   var n = s.order();
   var i;

   if(r<s.coeff(0)) return true;
   if(r>s.coeff(0)) return false;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i!==n+1 && s.coeff(i)>0;
  }

  function mul(s0, s1) {
   var n = s0.order();
   var s = s0.coeffs();
   var i, j;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal mul');

   for(i=0;i<=n;++i)
   {
    s[n-i] *= s1.coeff(0);

    for(j=1;j<=n-i;++j)
    {
     s[n-i] += s[n-i-j] * s1.coeff(j);
    }
   }
   return ak.surreal(s);
  }

  function mulSR(s, r) {
   var n = s.order();
   var i;

   s = s.coeffs();
   for(i=0;i<=n;++i) s[i] *= r;
   return ak.surreal(s);
  }

  function mulRS(r, s) {
   var n = s.order();
   var i;

   s = s.coeffs();
   for(i=0;i<=n;++i) s[i] *= r;
   return ak.surreal(s);
  }

  function ne(s0, s1) {
   var n = s0.order();
   var i;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal eq');

   for(i=0;i<=n && s0.coeff(i)===s1.coeff(i);++i);
   return i!==n+1;
  }

  function neSR(s, r) {
   var n = s.order();
   var i;

   if(s.coeff(0)!==r) return true;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i!==n+1;
  }

  function neRS(r, s) {
   var n = s.order();
   var i;

   if(s.coeff(0)!==r) return true;

   for(i=1;i<=n && s.coeff(i)===0;++i);
   return i!==n+1;
  }

  function pow(s0, s1) {
   var x = s1.coeff(0);
   return neSR(s1, x) ? exp(mul(s1, log(s0))) : powSR(s0, x);
  }

  function powSR(s, r) {
   var n = s.order();
   var x, c, f, p, i;

   x = s.coeff(0);
   f = 1;
   p = 1;
   c = [];
   c.length = n+1;

   c[0] = Math.pow(x, r);

   for(i=1;i<=n && r!==0;++i) {
    p *= r;
    r -= 1;
    f *= i;

    c[i] = p * Math.pow(x, r) / f;
   }
   while(i<=n) c[i] = 0;

   return chain(c, s);
  }

  function powRS(r, s) {
   var x = s.coeff(0);
   return neSR(s, x) ? exp(mulSR(s, Math.log(r))) : ak.surreal(s.order(), Math.pow(r, x));
  }

  function sub(s0, s1) {
   var n = s0.order();
   var s = s0.coeffs();
   var i;

   if(s1.order()!==n) throw new Error('order mismatch in ak.surreal sub');

   for(i=0;i<=n;++i) s[i] -= s1.coeff(i);
   return ak.surreal(s);
  }

  function subSR(s, r) {
   s = s.coeffs();
   s[0] -= r;
   return ak.surreal(s);
  }

  function subRS(r, s) {
   var n = s.order();
   var i;

   s = s.coeffs();
   s[0] = r - s[0];
   for(i=1;i<=n;++i) s[i] = -s[i];

   return ak.surreal(s);
  }

  ak.surrealDiv = function(s0, s1, d) {
   var a0, a1, i0, i1, n;

   if(ak.nativeType(d)===ak.UNDEFINED_T) d = 0;
   d = Math.abs(d);

   if(ak.type(s0)!==ak.SURREAL_T) throw new Error('non-surreal dividend in ak.surrealDiv');
   if(ak.type(s1)!==ak.SURREAL_T) throw new Error('non-surreal divisor in ak.surrealDiv');
   if(ak.nativeType(d)!==ak.NUMBER_T) throw new Error('non-numeric delta in ak.surrealDiv');
   if(s1.order()!==s0.order()) throw new Error('order mismatch in ak.surrealDiv');

   n  = s0.order();
   i0 = 0;
   i1 = 0;

   while(i1<=n && Math.abs(s0.coeff(i1))<=d && Math.abs(s1.coeff(i1))<=d) ++i1;

   if(i1===0) return div(s0, s1);

   a0 = new Array(n+1);
   a1 = new Array(n+1);

   while(i1<=n) {
    a0[i0] = s0.coeff(i1);
    a1[i0] = s1.coeff(i1);
    ++i0;
    ++i1;
   }
   while(i0<=n) {
    a0[i0] = ak.NaN;
    a1[i0] = ak.NaN;
    ++i0;
   }
   return div(ak.surreal(a0), ak.surreal(a1));
  }

  ak.overload(ak.abs,  ak.SURREAL_T, abs);
  ak.overload(ak.acos, ak.SURREAL_T, acos);
  ak.overload(ak.asin, ak.SURREAL_T, asin);
  ak.overload(ak.atan, ak.SURREAL_T, atan);
  ak.overload(ak.cos,  ak.SURREAL_T, cos);
  ak.overload(ak.cosh, ak.SURREAL_T, cosh);
  ak.overload(ak.exp,  ak.SURREAL_T, exp);
  ak.overload(ak.inv,  ak.SURREAL_T, inv);
  ak.overload(ak.log,  ak.SURREAL_T, log);
  ak.overload(ak.neg,  ak.SURREAL_T, neg);
  ak.overload(ak.sin,  ak.SURREAL_T, sin);
  ak.overload(ak.sinh, ak.SURREAL_T, sinh);
  ak.overload(ak.sqrt, ak.SURREAL_T, sqrt);
  ak.overload(ak.tan,  ak.SURREAL_T, tan);
  ak.overload(ak.tanh, ak.SURREAL_T, tanh);

  ak.overload(ak.add,  [ak.SURREAL_T, ak.SURREAL_T], add);
  ak.overload(ak.add,  [ak.SURREAL_T, ak.NUMBER_T],  addSR);
  ak.overload(ak.add,  [ak.NUMBER_T,  ak.SURREAL_T], addRS);
  ak.overload(ak.cmp,  [ak.SURREAL_T, ak.SURREAL_T], cmp);
  ak.overload(ak.cmp,  [ak.SURREAL_T, ak.NUMBER_T],  cmpSR);
  ak.overload(ak.cmp,  [ak.NUMBER_T,  ak.SURREAL_T], cmpRS);
  ak.overload(ak.dist, [ak.SURREAL_T, ak.SURREAL_T], dist);
  ak.overload(ak.dist, [ak.SURREAL_T, ak.NUMBER_T],  distSR);
  ak.overload(ak.dist, [ak.NUMBER_T,  ak.SURREAL_T], distRS);
  ak.overload(ak.div,  [ak.SURREAL_T, ak.SURREAL_T], div);
  ak.overload(ak.div,  [ak.SURREAL_T, ak.NUMBER_T],  divSR);
  ak.overload(ak.div,  [ak.NUMBER_T,  ak.SURREAL_T], divRS);
  ak.overload(ak.eq,   [ak.SURREAL_T, ak.SURREAL_T], eq);
  ak.overload(ak.eq,   [ak.SURREAL_T, ak.NUMBER_T],  eqSR);
  ak.overload(ak.eq,   [ak.NUMBER_T,  ak.SURREAL_T], eqRS);
  ak.overload(ak.ge,   [ak.SURREAL_T, ak.SURREAL_T], ge);
  ak.overload(ak.ge,   [ak.SURREAL_T, ak.NUMBER_T],  geSR);
  ak.overload(ak.ge,   [ak.NUMBER_T,  ak.SURREAL_T], geRS);
  ak.overload(ak.gt,   [ak.SURREAL_T, ak.SURREAL_T], gt);
  ak.overload(ak.gt,   [ak.SURREAL_T, ak.NUMBER_T],  gtSR);
  ak.overload(ak.gt,   [ak.NUMBER_T,  ak.SURREAL_T], gtRS);
  ak.overload(ak.le,   [ak.SURREAL_T, ak.SURREAL_T], le);
  ak.overload(ak.le,   [ak.SURREAL_T, ak.NUMBER_T],  leSR);
  ak.overload(ak.le,   [ak.NUMBER_T,  ak.SURREAL_T], leRS);
  ak.overload(ak.lt,   [ak.SURREAL_T, ak.SURREAL_T], lt);
  ak.overload(ak.lt,   [ak.SURREAL_T, ak.NUMBER_T],  ltSR);
  ak.overload(ak.lt,   [ak.NUMBER_T,  ak.SURREAL_T], ltRS);
  ak.overload(ak.mul,  [ak.SURREAL_T, ak.SURREAL_T], mul);
  ak.overload(ak.mul,  [ak.SURREAL_T, ak.NUMBER_T],  mulSR);
  ak.overload(ak.mul,  [ak.NUMBER_T,  ak.SURREAL_T], mulRS);
  ak.overload(ak.ne,   [ak.SURREAL_T, ak.SURREAL_T], ne);
  ak.overload(ak.ne,   [ak.SURREAL_T, ak.NUMBER_T],  neSR);
  ak.overload(ak.ne,   [ak.NUMBER_T,  ak.SURREAL_T], neRS);
  ak.overload(ak.pow,  [ak.SURREAL_T, ak.SURREAL_T], pow);
  ak.overload(ak.pow,  [ak.SURREAL_T, ak.NUMBER_T],  powSR);
  ak.overload(ak.pow,  [ak.NUMBER_T,  ak.SURREAL_T], powRS);
  ak.overload(ak.sub,  [ak.SURREAL_T, ak.SURREAL_T], sub);
  ak.overload(ak.sub,  [ak.SURREAL_T, ak.NUMBER_T],  subSR);
  ak.overload(ak.sub,  [ak.NUMBER_T,  ak.SURREAL_T], subRS);
 }

 ak.using('Calculus/SymbolicDerivative.js', define);
})();
