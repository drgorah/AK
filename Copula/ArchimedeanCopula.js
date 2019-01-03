//AK/Copula/ArchimedeanCopula.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.archimedeanCopula) return;

  ak.archimedeanCopula = function(n, p, q) {
   var p0, f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.archimedeanCopula');
   if(ak.nativeType(p)!==ak.FUNCTION_T) throw new Error('invalid generator in ak.archimedeanCopula');
   if(ak.nativeType(q)!==ak.FUNCTION_T) throw new Error('invalid generator inverse in ak.archimedeanCopula');

   p0 = p(0);

   f = function(u) {
    var t = 0;
    var i;

    if(ak.type(u)!==ak.VECTOR_T || u.dims()!==n) throw new Error('invalid argument in ak.archimedeanCopula');
    for(i=0;i<n;++i) t += p(Math.max(Math.min(u.at(i), 1), 0));
    return t>=p0 ? 0 : Math.max(Math.min(q(t), 1), 0);
   };

   f.dims = function() {return n;};
   f.p = function() {return p;};
   f.q = function() {return q;};

   return Object.freeze(f);
  };

  ak.archimedeanCopulaDensity = function(n, p, dp, dnq) {
   var p0, f;

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.archimedeanCopulaDensity');
   if(ak.nativeType(p)!==ak.FUNCTION_T) throw new Error('invalid generator in ak.archimedeanCopulaDensity');
   if(ak.nativeType(dp)!==ak.FUNCTION_T) throw new Error('invalid generator derivative in ak.archimedeanCopulaDensity');
   if(ak.nativeType(dnq)!==ak.FUNCTION_T) throw new Error('invalid generator inverse derivative in ak.archimedeanCopulaDensity');

   p0 = p(0);

   f = function(u) {
    var d = 1;
    var s = 0;
    var i, ui, dq;

    if(ak.type(u)!==ak.VECTOR_T || u.dims()!==n) throw new Error('invalid argument in ak.archimedeanCopulaDensity');
    for(i=0;i<n;++i) {
     ui = Math.max(Math.min(u.at(i), 1), 0);
     d *= dp(ui);
     s += p(ui);
    }
    if(s>=p0) return 0;
    dq = dnq(s, n);
    if(ak.type(dq)===ak.SURREAL_T) dq = dq.deriv(n);
    return Math.max(dq*d, 0);
   };

   f.dims = function() {return n;};
   f.p = function() {return p;};
   f.dp = function() {return dp;};
   f.dnq = function() {return dnq;};

   return Object.freeze(f);
  };

  function coeffs(v, n, dnq) {
   var dq = dnq(v, n);
   var a, f, i;

   if(ak.type(dq)===ak.SURREAL_T) return dq.coeffs();
   a = new Array(n+1);
   f = 1;
   i = 0;
   while(i<n) {
    a[i] = dnq(v, i)/f;
    f *= ++i;
   }
   a[n] = dq/f;
   return a;
  }

  function dist(v, n, p0, dnq) {
   var c, df, f, i;

   if(v<=0)  return [0,0];
   if(v>=p0) return [1,0];

   c = coeffs(v, n, dnq);
   df = Math.pow(-1, n) * Math.pow(v, n-1) * n * c[n];

   f = 1 - c[0];
   for(i=1;i<n;++i) f += Math.pow(-1, n+i-1) * Math.pow(v, n-i) * c[n-i];
   return [Math.max(Math.min(f,1),0), Math.max(df,0)];
  }

  function extrapolate(node0, node1) {
   var u0 = node0.x; var v0 = node0.y;
   var u1 = node1.x; var v1 = node1.y;
   var a = (u0-u1)/((1-u1)*(v1-v0));
   var b = Math.log(1-u1) - a*v1;

   a = 1/a;
   return function(u) {return (Math.log(1-u)-b)*a;};
  }

  function interpolate(n, p, q, dnq, m, threshold) {
   var p0 = p(0);
   var nodes = isFinite(p0) ? new Array(m+1) : new Array(m);
   var du = 1/m;
   var fdf = function(v){return dist(v, n, p0, dnq);};
   var inv = ak.newtonInverse(fdf, threshold);
   var vu = Math.max(p(0.5), ak.EPSILON);
   var vl = vu*0.5;
   var i, u, v, interp, extrap;

   if(p0<=0 || isNaN(p0) || !isFinite(vu)) throw new Error('invalid generator result in ak.archimedeanCopulaRnd');
   while(vl>0 && fdf(vl)[0]>du) {vu = vl; vl *= 0.5;}

   nodes[0] = {x:0,y:0};
   for(i=1;i<m;++i) {
    u = i*du;
    while(isFinite(vu) && fdf(vu)[0]<u) {v = vu; vu += 2*(vu-vl); vl = v;}
    if(!isFinite(vu)) throw new Error('invalid CDF of sum in ak.archimedeanCopulaRnd');
    v = inv(u, [vl, vu]);
    if(!(v>nodes[i-1].y)) throw new Error('invalid CDF of sum in ak.archimedeanCopulaRnd');
    nodes[i] = {x:u, y:v};
    vu = v + 2*(v-nodes[i-1].y);
    vl = v;
   }
   if(!(p0>nodes[m-1].y)) throw new Error('invalid CDF of sum in ak.archimedeanCopulaRnd');

   if(isFinite(p0)) {
    nodes[m] = {x:1, y:p0};
    return ak.linearInterpolate(nodes);
   }

   interp = ak.linearInterpolate(nodes);
   extrap = extrapolate(nodes[m-2], nodes[m-1]);
   return function(x) {return x<=u ? interp(x) : extrap(x);};
  }

  function draw(q, inv, rnd, a) {
   var n = a.length;
   var v = inv(rnd());
   var s = 0;
   var i;

   if(v===0) return ak.vector(n, 1);
   for(i=0;i<n;++i) {
    a[i] = -Math.log(1-rnd());
    s += a[i];
   }
   if(s===0) return ak.vector(n, q(v/n));
   v /= s;
   for(i=0;i<n;++i) a[i] = Math.max(Math.min(q(a[i]*v), 1), 0);
   return ak.vector(a);
  }

  ak.archimedeanCopulaRnd = function(n, p, q, dnq, arg4, arg5, arg6) {
   var m, threshold, rnd, v, f, inv;

   if(ak.nativeType(arg4)!==ak.NUMBER_T) rnd = arg4;
   else if(ak.nativeType(arg5)!==ak.NUMBER_T) {m = arg4; rnd = arg5;}
   else {m = arg4; threshold = arg5; rnd = arg6;}

   if(ak.nativeType(n)!==ak.NUMBER_T || !isFinite(n) || n!==ak.floor(n) || n<0) throw new Error('invalid dimension in ak.archimedeanCopulaRnd');
   if(ak.nativeType(p)!==ak.FUNCTION_T) throw new Error('invalid generator in ak.archimedeanCopulaRnd');
   if(ak.nativeType(q)!==ak.FUNCTION_T) throw new Error('invalid generator inverse in ak.archimedeanCopulaRnd');
   if(ak.nativeType(dnq)!==ak.FUNCTION_T) throw new Error('invalid generator inverse derivative in ak.archimedeanCopulaRnd');
   if(ak.nativeType(m)===ak.UNDEFINED_T) m = 1024;
   else if(!isFinite(m) || m!==ak.floor(m) || m<2) throw new Error('invalid number of nodes in ak.archimedeanCopulaRnd');
   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.archimedeanCopulaRnd');

   switch(n) {
    case 0:  f = function() {return ak.vector(0);};
             break;

    case 1:  f = function() {return ak.vector(1, rnd());};
             break;

    default: v = new Array(n);
             inv = interpolate(n, p, q, dnq, m, threshold);
             f = function() {return draw(q, inv, rnd, v);};
             break;
   }

   f.dims = function() {return n;};
   f.p = function() {return p;};
   f.q = function() {return q;};
   f.dnq = function() {return dnq;};
   f.rnd = function() {return rnd;};

   return Object.freeze(f);
  };
 }

 ak.using(['Matrix/Vector.js', 'Calculus/Surreal.js', 'Invert/NewtonInverse.js', 'Approx/LinearInterpolate.js'], define);
})();
