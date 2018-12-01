//AK/Calculus/PolynomialDerivative.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {

  if(ak.polynomialDerivative) return;

  function system(f, x, e, n) {
   var lhs = [];
   var rhs = [];
   var abs_x = Math.abs(x);
   var f_x = f(x);
   var i, j, y, fac, dn, li;

   for(i=0;i<n;++i) {
    y = x + (i+1)*e*(abs_x+1);
    fac = 1;
    li = [];

    for(j=0;j<n;++j) {
     fac *= j+1;
     dn = Math.pow(y-x, j+1);

     li[j] = dn/fac;
    }
    lhs[i] = li;
    rhs[i] = f(y)-f(x);
   }

   return {
    lhs: lhs,
    rhs: rhs
   };
  }

  function symmetricSystem(f, x, e, n) {
   var lhs = [];
   var rhs = [];
   var abs_x = Math.abs(x);
   var f_x = f(x);
   var i, j, y, d, fac, dn, li;

   for(i=0;i<n;++i) {
    y = abs_x + (i+1)*e*(abs_x+1);
    d = y-abs_x;
    fac = 1;
    li = [];

    for(j=0;j<n;++j) {
     dn = Math.pow(d, 2*j+1);

     li[j] = dn/fac;

     fac *= (2*j+2) * (2*j+3);
    }
    lhs[i] = li;
    rhs[i] = 0.5*(f(x+d)-f(x-d));
   }

   return {
    lhs: lhs,
    rhs: rhs
   };
  }

  function systemBounds(s) {
   var n = s.rhs.length;
   var i, j, li;

   for(i=0;i<n;++i) {
    li = s.lhs[i];
    for(j=0;j<n;++j) li[j] = ak.interval(li[j]);
    s.rhs[i] = ak.interval(s.rhs[i]);
   }
   return s;
  }


  function solve(s, n) {
   var lhs = s.lhs;
   var rhs = s.rhs;
   var ln = lhs[n];
   var i, j, li;
   
   for(i=0;i<n;++i) {
    li = lhs[i];
    for(j=0;j<n;++j) li[j] -= li[n]*ln[j]/ln[n];
    rhs[i] -= li[n]*rhs[n]/ln[n];
   }
   return n>0 ? solve(s, n-1) : rhs[0]/ln[0];
  }

  function solveBounds(s, n) {
   var lhs = s.lhs;
   var rhs = s.rhs;
   var ln = lhs[n];
   var i, j, li;

   for(i=0;i<n;++i) {
    li = lhs[i];
    for(j=0;j<n;++j) li[j] = ak.sub(li[j], ak.div(ak.mul(li[n],ln[j]),ln[n]));
    rhs[i] = ak.sub(rhs[i], ak.div(ak.mul(li[n], rhs[n]), ln[n]));
   }
   return n>0 ? solveBounds(s, n-1) : ak.div(rhs[0], ln[0]);
  }

  function stableSolve(s, n) {
   var lhs = s.lhs;
   var rhs = s.rhs;
   var abs_nn = Math.abs(lhs[n][n]);
   var i, j, abs_in, t, li, ln;

   for(i=0;i<n;++i) {
    abs_in = Math.abs(lhs[i][n]);

    if(abs_in>abs_nn) {
     abs_nn = abs_in;
     t = lhs[i]; lhs[i] = lhs[n]; lhs[n] = t;
     t = rhs[i]; rhs[i] = rhs[n]; rhs[n] = t;
    }
   }

   ln = lhs[n];

   if(abs_nn>0) {
    for(i=0;i<n;++i) {
     li = lhs[i];
     for(j=0;j<n;++j) li[j] -= li[n]*ln[j]/ln[n];
     rhs[i] -= li[n]*rhs[n]/ln[n];
    }
   }
   return n>0 ? stableSolve(s, n-1) : rhs[0]/lhs[0][0];
  }

  function stableSolveBounds(s, n) {
   var lhs = s.lhs;
   var rhs = s.rhs;
   var abs_nn = ak.abs(lhs[n][n]);
   var i, j, abs_in, t, li, ln;

   for(i=0;i<n;++i) {
    abs_in = ak.abs(lhs[i][n]);

    if(abs_in.lb()>abs_nn.lb()) {
     abs_nn = abs_in;
     t = lhs[i]; lhs[i] = lhs[n]; lhs[n] = t;
     t = rhs[i]; rhs[i] = rhs[n]; rhs[n] = t;
    }
   }

   ln = lhs[n];

   if(abs_nn.ub()>0) {
    for(i=0;i<n;++i) {
     li = lhs[i];
     for(j=0;j<n;++j) li[j] = ak.sub(li[j], ak.div(ak.mul(li[n],ln[j]),ln[n]));
     rhs[i] = ak.sub(rhs[i], ak.div(ak.mul(li[n], rhs[n]), ln[n]));
    }
   }
   return n>0 ? stableSolveBounds(s, n-1) : ak.div(rhs[0], lhs[0][0]);
  }

  ak.polynomialDerivative = function(f, n) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('non-function passed to ak.polynomialDerivative');
   if(ak.nativeType(n)!==ak.NUMBER_T)   throw new Error('non-numeric number of terms passed to ak.polynomialDerivative');

   n = ak.trunc(n);
   if(!(n>0)) throw new Error('non-positive order passed to ak.polynomialDerivative');

   var e = Math.pow((n+1)*ak.EPSILON, 1/(n+1));

   return function(x) {
    return solve(system(f, x, e, n), n-1);
   };
  };

  ak.polynomialDerivativeBounds = function(f, n) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('non-function passed to ak.polynomialDerivativeBounds');
   if(ak.nativeType(n)!==ak.NUMBER_T)   throw new Error('non-numeric number of terms passed to ak.polynomialDerivativeBounds');

   n = ak.trunc(n);
   if(!(n>0)) throw new Error('non-positive order passed to ak.polynomialDerivativeBounds');

   var e = Math.pow((n+1)*ak.EPSILON, 1/(n+1));

   return function(x) {
    return solveBounds(systemBounds(system(f, x, e, n)), n-1);
   };
  };

  ak.stablePolynomialDerivative = function(f, n) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('non-function passed to ak.stablePolynomialDerivative');
   if(ak.nativeType(n)!==ak.NUMBER_T)   throw new Error('non-numeric number of terms passed to ak.stablePolynomialDerivative');

   n = ak.trunc(n);
   if(!(n>0)) throw new Error('non-positive order passed to ak.stablePolynomialDerivative');

   var e = Math.pow((n+1)*ak.EPSILON, 1/(n+1));

   return function(x) {
    return stableSolve(system(f, x, e, n), n-1);
   };
  };

  ak.stablePolynomialDerivativeBounds = function(f, n) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('non-function passed to ak.stablePolynomialDerivativeBounds');
   if(ak.nativeType(n)!==ak.NUMBER_T)   throw new Error('non-numeric number of terms passed to ak.stablePolynomialDerivativeBounds');

   n = ak.trunc(n);
   if(!(n>0)) throw new Error('non-positive order passed to ak.stablePolynomialDerivativeBounds');

   var e = Math.pow((n+1)*ak.EPSILON, 1/(n+1));

   return function(x) {
    return stableSolveBounds(systemBounds(system(f, x, e, n)), n-1);
   };
  };

  ak.symmetricPolynomialDerivative = function(f, n) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('non-function passed to ak.symmetricPolynomialDerivative');
   if(ak.nativeType(n)!==ak.NUMBER_T)   throw new Error('non-numeric number of terms passed to ak.symmetricPolynomialDerivative');

   n = ak.trunc(n);
   if(!(n>0)) throw new Error('non-positive order passed to ak.symmetricPolynomialDerivative');

   var e = Math.pow((2*n+1)*ak.EPSILON, 1/(2*n+1));

   return function(x) {
    return stableSolve(symmetricSystem(f, x, e, n), n-1);
   };
  };

  ak.symmetricPolynomialDerivativeBounds = function(f, n) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('non-function passed to ak.symmetricPolynomialDerivativeBounds');
   if(ak.nativeType(n)!==ak.NUMBER_T)   throw new Error('non-numeric number of terms passed to ak.symmetricPolynomialDerivativeBounds');

   n = ak.trunc(n);
   if(!(n>0)) throw new Error('non-positive order passed to ak.symmetricPolynomialDerivativeBounds');

   var e = Math.pow((2*n+1)*ak.EPSILON, 1/(2*n+1));

   return function(x) {
    return stableSolveBounds(systemBounds(symmetricSystem(f, x, e, n)), n-1);
   };
  };
 }

 ak.using('Number/Interval.js', define);
})();