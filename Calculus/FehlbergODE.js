//AK/Calculus/RungeKuttaODE.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

'use strict';

(function() {
 function define() {
  if(ak.FehlbergODE) return;

  function numberFehlbergODE(f, n, x0, x1, y0, e0, e1, order, a, b0, b1, c, s0, s1, alb, k, cyclic) {
   var kn = k.length;
   var dx = (x1-x0)/n;
   var i = 0;
   var j, l, dy0, dy1, aj, kj, d;

   if(cyclic) k[kn-1] = f(x0, y0);

   while(i<n) {
    k[0] = cyclic ? k[kn-1] : f(x0, y0);
    dy0 = b0[0]*k[0];
    dy1 = b1[0]*k[0];
    for(j=1;j<kn;++j) {
     aj = a[j-1];
     l = alb[j-1];

     kj = y0;
     if(l!==j) {
      kj += k[l]*aj[l]*dx;
      while(++l<j) kj += k[l]*aj[l]*dx;
     }
     kj = f(x0+c[j-1]*dx, kj);
     dy0 += b0[j]*kj;
     dy1 += b1[j]*kj;
     k[j] = kj;
    }
    dy0 *= dx/s0;
    dy1 *= dx/s1;
    d = Math.abs(dy0-dy1)/(1+Math.abs(y0));

    if(d<=e1) {
     x0 += dx;
     y0 += dy1;
    }
    else if(cyclic) {
     k[kn-1] = k[0];
    }

    if(d<e0 || d>e1) {
     dx *= Math.pow((e0/d)*(e1/d), 1/(2*order));
     n = ak.ceil(Math.abs(x1-x0)/dx);
     if(n>ak.INT_MAX) throw new Error('too many steps in ak.fehlbergODE');
     dx = (x1-x0)/n;
     i = -1;
    }

    ++i;
   }
   return y0;
  }

  function generalFehlbergODE(f, n, x0, x1, y0, e0, e1, order, a, b0, b1, c, s0, s1, alb, k, cyclic) {
   var kn = k.length;
   var dx = (x1-x0)/n;
   var i = 0;
   var j, l, dy0, dy1, aj, kj, d;

   if(cyclic) k[kn-1] = f(x0, y0);

   while(i<n) {
    k[0] = cyclic ? k[kn-1] : f(x0, y0);
    dy0 = ak.mul(b0[0], k[0]);
    dy1 = ak.mul(b1[0], k[0]);
    for(j=1;j<kn;++j) {
     aj = a[j-1];
     l = alb[j-1];

     kj = y0;
     if(l!==j) {
      kj = ak.add(kj, ak.mul(k[l], aj[l]*dx));
      while(++l<j) if(aj[l]!==0) kj = ak.add(kj, ak.mul(k[l], aj[l]*dx));
     }
     kj = f(x0+c[j-1]*dx, kj);
     if(b0[j]!==0) dy0 = ak.add(dy0, ak.mul(b0[j], kj));
     if(b1[j]!==0) dy1 = ak.add(dy1, ak.mul(b1[j], kj));
     k[j] = kj;
    }
    dy0 = ak.mul(dy0, dx/s0);
    dy1 = ak.mul(dy1, dx/s1);
    d = ak.dist(dy0, dy1)/(1+ak.abs(y0));

    if(d<=e1) {
     x0 += dx;
     y0 = ak.add(y0, dy1);
    }
    else if(cyclic) {
     k[kn-1] = k[0];
    }

    if(d<e0 || d>e1) {
     dx *= Math.pow((e0/d)*(e1/d), 1/(2*order));
     n = ak.ceil(Math.abs(x1-x0)/dx);
     if(n>ak.INT_MAX) throw new Error('too many steps in ak.fehlbergODE');
     dx = (x1-x0)/n;
     i = -1;
    }

    ++i;
   }
   return y0;
  }

  function checkArgTypes(f, dx, e0, e1, order, a, b0, b1, c, tc) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.fehlbergODE');
   if(isNaN(dx) || dx===0) throw new Error('invalid step length in ak.fehlbergODE');
   if(isNaN(e0) || e0===0) throw new Error('invalid lower error threshold in ak.fehlbergODE');
   if(isNaN(e1) || e1<=e0) throw new Error('invalid upper error threshold in ak.fehlbergODE');
   if(ak.nativeType(order)!==ak.NUMBER_T || order!==ak.floor(order) || order<1) throw new Error('invalid order in ak.fehlbergODE');
   if(ak.nativeType(a)!==ak.ARRAY_T) throw new Error('invalid matrix in ak.fehlbergODE');
   if(ak.nativeType(b0)!==ak.ARRAY_T) throw new Error('invalid error weights in ak.fehlbergODE');
   if(b0.length!==a.length+1) throw new Error('matrix/error weights size mismatch in ak.fehlbergODE');
   if(ak.nativeType(b1)!==ak.ARRAY_T) throw new Error('invalid step weights in ak.fehlbergODE');
   if(b1.length!==a.length+1) throw new Error('matrix/step weights size mismatch in ak.fehlbergODE');

   if(tc!==ak.UNDEFINED_T) {
    if(tc!==ak.ARRAY_T) throw new Error('invalid nodes in ak.fehlbergODE');
    if(c.length!==a.length) throw new Error('matrix/notes size mismatch in ak.fehlbergODE');
   }
  }

  function checkTableau(a, b0, b1, c, tc) {
   var ai, i, j;

   for(i=0;i<a.length;++i) {
    ai = a[i];

    if(ak.nativeType(b0[i])!==ak.NUMBER_T || !isFinite(b0[i])) throw new Error('invalid error weight in ak.fehlbergODE');
    if(ak.nativeType(b1[i])!==ak.NUMBER_T || !isFinite(b1[i])) throw new Error('invalid step weight in ak.fehlbergODE');
    if(ak.nativeType(ai)!==ak.ARRAY_T || ai.length!==i+1) throw new Error('invalid matrix row in ak.fehlbergODE');
    for(j=0;j<=i;++j) {
     if(ak.nativeType(ai[j])!==ak.NUMBER_T || !isFinite(ai[j])) throw new Error('invalid matrix element in ak.fehlbergODE');
    }
    if(tc!==ak.UNDEFINED_T && (ak.nativeType(c[i])!==ak.NUMBER_T || !isFinite(c[i]) || c[i]===0)) throw new Error('invalid node in ak.fehlbergODE');
   }
   if(ak.nativeType(b0[i])!==ak.NUMBER_T || !isFinite(b0[i])) throw new Error('invalid error weight in ak.fehlbergODE');
   if(ak.nativeType(b1[i])!==ak.NUMBER_T || !isFinite(b1[i])) throw new Error('invalid step weight in ak.fehlbergODE');
  }

  function makeNodes(a) {
   var c = new Array(a.length);
   var i;

   for(i=0;i<a.length;++i) {
    c[i] = a[i].reduce(function(s,x){return s+x;}, 0);
    if(!isFinite(c[i]) || c[i]===0) throw new Error('invalid node in ak.rungeKuttaODE');
   }
   return c;
  }

  function makeLB(a) {
   var alb = new Array(a.length);
   var ai, i, j;

   for(i=0;i<a.length;++i) {
    ai = a[i];

    j = 0;
    while(j<=i && ai[j]===0) ++j;
    alb[i] = j;
   }
   return alb;
  }

  function isCyclic(a, b1, s1) {
   var eps = (b1.length+1)*ak.EPSILON;
   var ai = a[a.length-1];
   var j = 0;
   while(j<ai.length && Math.abs(b1[j]-ai[j]*s1)<=eps*Math.abs(b1[j])) ++j;
   return j===ai.length && b1[j]===0;
  }

  ak.fehlbergODE = function(f, dx, e0, e1, order, a, b0, b1, c) {
   var tc = ak.nativeType(c);
   var s0, s1, alb, k, cyclic;

   dx = Math.abs(dx);
   e0 = Math.abs(e0);
   e1 = Math.abs(e1);
   checkArgTypes(f, dx, e0, e1, order, a, b0, b1, c, tc);
   checkTableau(a, b0, b1, c, tc);

   if(tc===ak.UNDEFINED_T) c = makeNodes(a);
   s0 = b0.reduce(function(s,x){return s+x;}, 0);
   if(!isFinite(s0) || s0===0) throw new Error('invalid total error weight in ak.fehlbergODE');
   s1 = b1.reduce(function(s,x){return s+x;}, 0);
   if(!isFinite(s1) || s1===0) throw new Error('invalid total step weight in ak.fehlbergODE');

   alb = makeLB(a);
   a = a.map(function(r){return r.slice(0);});
   b0 = b0.slice(0);
   b1 = b1.slice(0);
   if(tc!==ak.UNDEFINED_T) c = c.slice(0);
   k = new Array(a.length+1);
   cyclic = isCyclic(a, b1, s1);

   return function(x0, x1, y0) {
    var n;
    if(ak.nativeType(x0)!==ak.NUMBER_T || !isFinite(x0) || ak.nativeType(x1)!==ak.NUMBER_T || !isFinite(x1)) throw new Error('invalid interval in ak.fehlbergODE');
    n = ak.ceil(Math.abs(x1-x0)/dx);
    if(n>ak.INT_MAX) throw new Error('too many steps in ak.fehlbergODE');
    return ak.nativeType(y0)===ak.NUMBER_T ? numberFehlbergODE(f, n, x0, x1, y0, e0, e1, order, a, b0, b1, c, s0, s1, alb, k, cyclic) : generalFehlbergODE(f, n, x0, x1, y0, e0, e1, order, a, b0, b1, c, s0, s1, alb, k, cyclic);
   };
  };

  ak.heunRKF2ODE = function(f, dx, e0, e1) {return ak.fehlbergODE(f, dx, e0, e1, 2, [[1]], [1, 0], [1,1]);};
  ak.bogackiShampineRKF3ODE = function(f, dx, e0, e1) {return ak.fehlbergODE(f, dx, e0, e1, 3, [[1/2],[0,3/4],[2/9,1/3,4/9]], [7,6,8,3], [2,3,4,0]);};
  ak.fehlbergRKF5ODE = function(f, dx, e0, e1) {return ak.fehlbergODE(f, dx, e0, e1, 5, [[1/4],[3/32,9/32],[1932/2197,-7200/2197,7296/2197],[439/216,-8,3680/513,-845/4104],[-8/27,2,-3544/2565,1859/4104,-11/40]],[2375,0,11264,10985,-4104,0],[33440,0,146432,142805,-50787,10260]);};
  ak.cashKarpRKF5ODE = function(f, dx, e0, e1) {return ak.fehlbergODE(f, dx, e0, e1, 5, [[1/5],[3/40,9/40],[3/10,-9/10,6/5],[-11/54,5/2,-70/27,35/27],[1631/55296,175/512,575/13824,44275/110592,253/4096]],[39550,0,148600,94675,7479,96768],[9361,0,38500,20125,0,27648]);};
  ak.dormandPrinceRKF5ODE = function(f, dx, e0, e1) {return ak.fehlbergODE(f, dx, e0, e1, 5, [[1/5],[3/40,9/40],[44/45,-56/15,32/9],[19372/6561,-25360/2187,64448/6561,-212/729],[9017/3168,-355/33,46732/5247,49/176,-5103/18656],[35/384,0,500/1113,125/192,-2187/6784,11/84]],[1921409,0,9690880,13122270,-5802111,1902912,534240],[12985,0,64000,92750,-45927,18656,0]);};
 }

 ak.using('', define);
})();