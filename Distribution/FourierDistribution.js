//AK/Distribution/FourierDistribution.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.fourierPDF) return;

  function constructor(cf, x, w, n) {
   var state = {cf: cf, x: Number(x), w: Number(w), n: ak.floor(n)};
   var N = Math.pow(2, state.n);
   var z = new Array(N);
   var eps = 1/Math.sqrt(N);
   var dx, dt, df, k, t, y, s, m, l, u, f;

   if(ak.nativeType(cf)!==ak.FUNCTION_T) throw new TypeError('invalid CF in ak fourier distribution');
   if(!isFinite(state.x)) throw new TypeError('invalid mid point in ak fourier distribution');
   if(!isFinite(state.w) || state.w<=0) throw new TypeError('invalid range in ak fourier distribution');
   if(!isFinite(N) || N<2) throw new TypeError('invalid bit count in ak fourier distribution');

   x  = state.x;
   dx = state.w * eps;

   dt = -2*ak.PI*(x/dx - (N-1)/2)/N;
   df =  2*ak.PI/(N*dx);

   for(k=0;k<N;++k) {
    t = k*dt;
    y = ak.complex(Math.cos(t), Math.sin(t));
    z[k] = ak.mul(y, cf(df*k));
   }
   f = ak.fft(z);

   m = 0;
   for(k=0;k<N;++k) {
    y = Math.max(f[k].re(), 0);
    f[k] = y;
    if(y>m) m = y;
   }

   s = 0;
   for(k=0;k<N;++k) {
    y = f[k];
    if(y<m*eps) f[k] = 0;
    else        s += y;
   }

   for(k=0;k<N;++k) f[k] /= s;

   for(l=0;l<N-1 && f[l]===0;++l);
   for(u=N-1;u>l && f[u]===0;--u);

   if(l===u) throw new TypeError('empty terms in ak fourier distribution');

   state.dx = dx;
   state.f  = f.slice(l, u+1);
   state.o  = x - N*dx/2 + l*dx;

   return state;
  }

  function pdf(state, x) {
   var i = ak.floor((x-state.o)/state.dx);
   return i>=0 && i<state.f.length ? state.f[i] : 0;
  }

  ak.fourierPDF = function(cf, x, w, n) {
   var state = constructor(cf, x, w, n);
   var dx = state.dx;
   var f;

   state.f.forEach(function(x, i, a){a[i] = x/dx;});

   f = function(x){return pdf(state, x);};
   f.cf = function(){return state.cf;};
   f.x  = function(){return state.x;};
   f.w  = function(){return state.w;};
   f.n  = function(){return state.n;};
   return Object.freeze(f);
  };

  function accumulate(state) {
   var f  = state.f;
   var n1 = f.length-1;
   var s  = 0;
   var i;

   for(i=0;i<n1;++i) {
    s += f[i];
    f[i] = s;
   }
   f[n1] = 1;

   return state;
  }

  function cdf(state, x) {
   var i = ak.floor((x-state.o)/state.dx);
   var x0, f0, f1;

   if(i<0) return 0;
   if(i>=state.f.length) return 1;

   x0 = state.o + i*state.dx;
   f0 = i>0 ? state.f[i-1] : 0;
   f1 = state.f[i];

   return f0 + (x-x0)*(f1-f0)/state.dx;
  }

  ak.fourierCDF = function(cf, x, w, n) {
   var state = accumulate(constructor(cf, x, w, n));
   var f = function(x){return cdf(state, x);};

   f.cf = function(){return state.cf;};
   f.x  = function(){return state.x;};
   f.w  = function(){return state.w;};
   f.n  = function(){return state.n;};
   return Object.freeze(f);
  };

  function invert(state) {
   var f  = state.f;
   var n1 = f.length-1;
   var o  = state.o;
   var dx = state.dx;
   var c0 = f[0];
   var c1 = f[1];
   var x  = new Array(n1+1);
   var i, j, c;

   x[0] = state.o;

   for(i=1,j=1;i<n1;++i) {
    c = i/n1;
    while(c1<=c) {
     c0 = c1;
     c1 = f[++j];
    }
    x[i] = c1!==c0 ? o+j*dx + dx*(c-c0)/(c1-c0) : o+j*dx + dx/2;
   }

   x[n1] = state.o + (n1+1)*dx;

   state.f = x;
   return state;
  }

  function invCDF(state, c) {
   var f = state.f;
   var n = f.length;
   var d = c*(n-1);
   var j = ak.floor(d);

   d -= j;

   if(c<=0) return f[0];
   if(c>=1) return f[n-1];

   return (1-d)*f[j] + d*f[j+1];
  }

  ak.fourierInvCDF = function(cf, x, w, n) {
   var state = invert(accumulate(constructor(cf, x, w, n)));
   var f = function(c){return invCDF(state, c);};

   f.cf = function(){return state.cf;};
   f.x  = function(){return state.x;};
   f.w  = function(){return state.w;};
   f.n  = function(){return state.n;};
   return Object.freeze(f);
  };

  ak.fourierRnd = function(cf, x, w, n, rnd) {
   var inv = ak.fourierInvCDF(cf, x, w, n);
   var f;

   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   if(ak.nativeType(rnd)!==ak.FUNCTION_T)  throw new TypeError('invalid RNG in ak.fourierRnd');

   f = function(){return inv(rnd());};
   f.cf  = inv.cf;
   f.x   = inv.x;
   f.w   = inv.w;
   f.n   = inv.n;
   f.rnd = function(){return rnd;};
   return Object.freeze(f);
  };
 }
 ak.using('Complex/FFT.js', define);
})();

