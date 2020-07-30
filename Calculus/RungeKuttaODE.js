//AK/Calculus/RungeKuttaODE.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {
  if(ak.RungeKuttaODE) return;

  function numberRungeKuttaODE(f, n, x0, x1, y0, a, b, c, s, alb, k) {
   var kn = k.length;
   var dx = (x1-x0)/n;
   var i, j, l, dy, aj, kj;

   for(i=0;i<n;++i) {
    k[0] = f(x0, y0);
    dy = b[0]*k[0];
    for(j=1;j<kn;++j) {
     aj = a[j-1];
     l = alb[j-1];

     kj = y0;
     if(l!==j) {
      kj += k[l]*aj[l]*dx;
      while(++l<j) kj += k[l]*aj[l]*dx;
     }
     kj = f(x0+c[j-1]*dx, kj);
     dy += b[j]*kj;
     k[j] = kj;
    }
    x0 += dx;
    y0 += dy*dx/s;
   }
   return y0;
  }

  function generalRungeKuttaODE(f, n, x0, x1, y0, a, b, c, s, alb, k) {
   var kn = k.length;
   var dx = (x1-x0)/n;
   var i, j, l, dy, aj, kj;

   for(i=0;i<n;++i) {
    k[0] = f(x0, y0);
    dy = ak.mul(b[0], k[0]);
    for(j=1;j<kn;++j) {
     aj = a[j-1];
     l = alb[j-1];

     kj = y0;
     if(l!==j) {
      kj = ak.add(kj, ak.mul(k[l], aj[l]*dx));
      while(++l<j) if(aj[l]!==0) kj = ak.add(kj, ak.mul(k[l], aj[l]*dx));
     }
     kj = f(x0+c[j-1]*dx, kj);
     if(b[j]!==0) dy = ak.add(dy, ak.mul(b[j], kj));
     k[j] = kj;
    }
    x0 += dx;
    y0 = ak.add(y0, ak.mul(dy, dx/s));
   }
   return y0;
  }

  ak.rungeKuttaODE = function(f, dx, a, b, c) {
   var s = 0;
   var tc = ak.nativeType(c);
   var ai, i, j, al0, k;

   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.rungeKuttaODE');
   dx = Math.abs(dx);
   if(isNaN(dx) || dx===0) throw new Error('invalid step length in ak.rungeKuttaODE');

   if(ak.nativeType(a)!==ak.ARRAY_T) throw new Error('invalid matrix in ak.rungeKuttaODE');
   if(ak.nativeType(b)!==ak.ARRAY_T) throw new Error('invalid weights in ak.rungeKuttaODE');

   if(tc===ak.UNDEFINED_T) c = new Array(a.length);
   else if(tc!==ak.ARRAY_T) throw new Error('invalid nodes in ak.rungeKuttaODE');

   if(b.length!==a.length+1) throw new Error('matrix/weights size mismatch in ak.rungeKuttaODE');
   if(c.length!==a.length) throw new Error('matrix/notes size mismatch in ak.rungeKuttaODE');

   al0 = new Array(a.length);

   for(i=0;i<a.length;++i) {
    ai = a[i];
    if(tc===ak.UNDEFINED_T) c[i] = 0;

    if(ak.nativeType(b[i])!==ak.NUMBER_T || !isFinite(b[i])) throw new Error('invalid weight in ak.rungeKuttaODE');
    if(ak.nativeType(ai)!==ak.ARRAY_T || ai.length!==i+1) throw new Error('invalid matrix row in ak.rungeKuttaODE');
    for(j=0;j<=i;++j) {
     if(ak.nativeType(ai[j])!==ak.NUMBER_T || !isFinite(ai[j])) throw new Error('invalid matrix element in ak.rungeKuttaODE');
     if(tc===ak.UNDEFINED_T) c[i] += ai[j];
    }
    if(ak.nativeType(c[i])!==ak.NUMBER_T || !isFinite(c[i]) || c[i]===0) throw new Error('invalid node in ak.rungeKuttaODE');

    j = 0;
    while(j<=i && ai[j]===0) ++j;
    al0[i] = j;
    s += b[i];
   }
   if(ak.nativeType(b[i])!==ak.NUMBER_T || !isFinite(b[i])) throw new Error('invalid weight in ak.rungeKuttaODE');
   s += b[i];
   if(!isFinite(s) || s===0) throw new Error('invalid total weight in ak.rungeKuttaODE');

   a = a.map(function(r){return r.slice(0);});
   b = b.slice(0);
   c = c.slice(0);
   k = new Array(a.length+1);

   return function(x0, x1, y0) {
    var n;
    if(ak.nativeType(x0)!==ak.NUMBER_T || !isFinite(x0) || ak.nativeType(x1)!==ak.NUMBER_T || !isFinite(x1)) throw new Error('invalid interval in ak.rungeKuttaODE');
    n = ak.ceil(Math.abs(x1-x0)/dx);
    if(n>ak.INT_MAX) throw new Error('too many steps in ak.rungeKuttaODE');
    return ak.nativeType(y0)===ak.NUMBER_T ? numberRungeKuttaODE(f, n, x0, x1, y0, a, b, c, s, al0, k) : generalRungeKuttaODE(f, n, x0, x1, y0, a, b, c, s, al0, k);
   };
  };

  ak.rk1EulerODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [], [1]);};
  ak.rk2MidpointODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[0.5]], [0,1]);};
  ak.rk2HeunODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[1]], [0.5,0.5]);};
  ak.rk2RalstonODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[2/3]], [0.25,0.75]);};
  ak.rk3KuttaODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[0.5],[-1,2]], [1,4,1]);};
  ak.rk3HeunODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[1/3],[0,2/3]], [1,0,3]);};
  ak.rk3RalstonODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[0.25],[0,0.75]], [2,3,4]);};
  ak.rk4ClassicODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[0.5],[0,0.5],[0,0,1]], [1,2,2,1]);};
  ak.rk4KuttaODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[1/3],[-1/3,1],[1,-1,1]], [1,3,3,1]);};
  ak.rk5FehlbergODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[1/4],[3/32,9/32],[1932/2197,-7200/2197,7296/2197],[439/216,-8,3680/513,-845/4104],[-8/27,2,-3544/2565,1859/4104,-11/40]], [33440,0,146432,142805,-50787,10260]);};
  ak.rk5CashKarpODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[1/5],[3/40,9/40],[3/10,-9/10,6/5],[-11/54,5/2,-70/27,35/27],[1631/55296,175/512,575/13824,44275/110592,253/4096]], [9361,0,38500,20125,0,27648]);};
  ak.rk5DormandPrinceODE = function(f, dx) {return ak.rungeKuttaODE(f, dx, [[1/5],[3/40,9/40],[44/45,-56/15,32/9],[19372/6561,-25360/2187,64448/6561,-212/729],[9017/3168,-355/33,46732/5247,49/176,-5103/18656]], [12985,0,64000,92750,-45927,18656]);};
 }

 ak.using('', define);
})();