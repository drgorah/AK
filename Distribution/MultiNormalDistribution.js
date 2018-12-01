//AK/Distribution/MultiNormalDistribution.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.multiNormalPDF) return;

  var RT2PI = Math.sqrt(2*ak.PI);

  function uncorrPDF(mu, root, scale, x) {
   var n = mu.length;
   var z2 = 0;
   var i, zi;

   if(ak.type(x)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiNormalPDF');
   if(x.dims()!==n) throw new Error('dimension mismatch in ak.multiNormalPDF');

   x = x.toArray();
   for(i=0;i<n;++i) x[i] -= mu[i];

   for(i=0;i<n;++i) {
    zi = x[i]*root[i];
    z2 += zi*zi;
   }
   return scale*Math.exp(-0.5*z2);
  }

  function corrPDF(mu, root, scale, x) {
   var n = mu.length;
   var z2 = 0;
   var i, j, zi, rooti;

   if(ak.type(x)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiNormalPDF');
   if(x.dims()!==n) throw new Error('dimension mismatch in ak.multiNormalPDF');

   x = x.toArray();
   for(i=0;i<n;++i) x[i] -= mu[i];
   if(x.some(isNaN)) return ak.NaN;

   for(i=0;i<n;++i) {
    rooti = root[i];
    zi = 0;
    for(j=0;j<i;++j) zi += rooti[j]*x[j];
    zi = (x[i]-zi)*rooti[i];
    x[i] = zi;
    z2 += zi*zi;
   }

   if(!isFinite(z2)) return 0;
   return scale*Math.exp(-0.5*z2);
  }

  ak.multiNormalPDF = function() {
   var state = {mu: [0], sigma: [1], root: [1]};
   var arg0  = arguments[0];
   var n, scale, i, f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   n = state.mu.length;
   scale = Math.pow(RT2PI, -n);

   if(state.sigma.length===0 || ak.nativeType(state.sigma[0])===ak.NUMBER_T) {
    for(i=0;i<n;++i) {
     scale /= state.root[i];
     state.root[i] = 1/state.root[i];
    }

    f = function(x){return uncorrPDF(state.mu, state.root, scale, x);};
    f.sigma = function(){return ak.matrix('diagonal', state.sigma);};
   }
   else {
    for(i=0;i<n;++i) {
     scale /= state.root[i][i];
     state.root[i][i] = 1/state.root[i][i];
    }

    f = function(x){return corrPDF(state.mu, state.root, scale, x);};
    f.sigma = function(){return ak.matrix(state.sigma);};
   }
   f.mu = function(){return ak.vector(state.mu);};

   return Object.freeze(f);
  };

  function uncorrCF(mu, root, t) {
   var n = mu.length;
   var re = 0;
   var im = 0;
   var i, rt;

   if(ak.type(t)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiNormalCF');
   if(t.dims()!==n) throw new Error('dimension mismatch in ak.multiNormalCF');
   t = t.toArray();
   if(t.some(isNaN)) return ak.complex(ak.NaN, ak.NaN);

   for(i=0;i<n;++i) {
    rt = root[i]*t[i];
    re += rt*rt;
    im += mu[i]*t[i];
   }

   re = Math.exp(-0.5*re);
   return re>0 ? ak.complex(re*Math.cos(im), re*Math.sin(im)) : ak.complex(0);
  }

  function corrCF(mu, root, t) {
   var n = mu.length;
   var re = 0;
   var im = 0;
   var i, j, rt;

   if(ak.type(t)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiNormalCF');
   if(t.dims()!==n) throw new Error('dimension mismatch in ak.multiNormalCF');
   t = t.toArray();
   if(t.some(isNaN)) return ak.complex(ak.NaN, ak.NaN);

   for(i=0;i<n;++i) {
    rt = 0;
    for(j=i;j<n;++j) rt += root[j][i]*t[j];
    re += rt*rt;
    im += mu[i]*t[i];
   }

   re = Math.exp(-0.5*re);
   return re>0 ? ak.complex(re*Math.cos(im), re*Math.sin(im)) : ak.complex(0);
  }

  ak.multiNormalCF = function() {
   var state = {mu: [0], sigma: [1], root: [1]};
   var arg0  = arguments[0];
   var f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   if(state.sigma.length===0 || ak.nativeType(state.sigma[0])===ak.NUMBER_T) {
    f = function(t){return uncorrCF(state.mu, state.root, t);};
    f.sigma = function(){return ak.matrix('diagonal', state.sigma);};
   }
   else {
    f = function(t){return corrCF(state.mu, state.root, t);};
    f.sigma = function(){return ak.matrix(state.sigma);};
   }
   f.mu = function(){return ak.vector(state.mu);};

   return Object.freeze(f);
  };

  function uncorrCDF(mu, root, ucdf, x) {
   var n = mu.length;
   var c = 1;
   var i, rt;

   if(ak.type(x)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiNormalCDF');
   if(x.dims()!==n) throw new Error('dimension mismatch in ak.multiNormalCDF');

   for(i=0;i<n;++i) c *= ucdf((x.at(i)-mu[i])*root[i]);
   return c;
  }

  function corrStd2dCDF(r, x0, x1, c0, c1, threshold, steps) {
   var c = 0;
   var p, s, f;

   if(c0!==0 && c0!==1 && c1!==0 && c1!==1) {
    p = x0*x1;
    s = (x0*x0+x1*x1)/2;

    f = function(t) {
     var st = Math.sin(t);
     var ct = Math.cos(t);
     return Math.exp(-(s-p*st)/(ct*ct));
    };

    c = ak.rombergIntegral(f, threshold, steps)(0, Math.asin(r))/(2*ak.PI);
   }

   return Math.max(0, Math.min(1, c0*c1 + c));
  }

  function corr2dCDF(mu, s0, s1, r, x, cdf, threshold, steps) {
   var x0, x1, c0, c1;

   if(ak.type(x)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiNormalCDF');
   if(x.dims()!==2) throw new Error('dimension mismatch in ak.multiNormalCDF');

   x0 = (x.at(0)-mu[0])/s0;
   x1 = (x.at(1)-mu[1])/s1;
   if(isNaN(x0) || isNaN(x1)) return ak.NaN;

   c0 = cdf(x0);
   c1 = cdf(x1);
   return corrStd2dCDF(r, x0, x1, c0, c1, threshold, steps);
  }

  function makeCorr2dCDF(mu, sigma, threshold, steps) {
   var cdf = ak.normalCDF();
   var s0 = Math.sqrt(sigma[0][0]);
   var s1 = Math.sqrt(sigma[1][1]);
   var r = sigma[0][1]/(s0*s1);

   return function(x){return corr2dCDF(mu, s0, s1, r, x, cdf, threshold, steps);};
  }

  function corrStd3dCDF(r01, r02, rt01, rt02, rho, x0, x1, x2, cdf, inv, threshold, steps) {
   var f = function(u) {
    var z = inv(u);
    var z0 = (x1-r01*z)*rt01;
    var z1 = (x2-r02*z)*rt02;

    if(isNaN(z0) || isNaN(z1)) return ak.NaN;
    return corrStd2dCDF(rho, z0, z1, cdf(z0), cdf(z1), threshold, steps);
   };
   return Math.max(0, Math.min(1, ak.rombergIntegral(f, threshold, steps)(0, cdf(x0))));
  }

  function corr3dCDF(mu, s0, s1, s2, r01, r02, r12, rt01, rt02, rho, x, cdf, inv, threshold, steps) {
   var x0, x1, x2, c0, c1, c2;

   if(ak.type(x)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiNormalCDF');
   if(x.dims()!==3) throw new Error('dimension mismatch in ak.multiNormalCDF');

   x0 = (x.at(0)-mu[0])/s0;
   x1 = (x.at(1)-mu[1])/s1;
   x2 = (x.at(2)-mu[2])/s2;
   if(isNaN(x0) || isNaN(x1) || isNaN(x2)) return ak.NaN;

   c0 = cdf(x0);
   c1 = cdf(x1);
   c2 = cdf(x2);
   if(c0===0 || c1===0 || c2===0) return 0;
   if(c0===1) return corrStd2dCDF(r12, x1, x2, c1, c2, threshold, steps);
   if(c1===1) return corrStd2dCDF(r02, x0, x2, c0, c2, threshold, steps);
   if(c2===1) return corrStd2dCDF(r01, x0, x1, c0, c1, threshold, steps);

   return corrStd3dCDF(r01, r02, rt01, rt02, rho, x0, x1, x2, cdf, inv, threshold, steps);
  }

  function makeCorr3dCDF(mu, sigma, threshold, steps) {
   var cdf = ak.normalCDF();
   var inv = ak.normalInvCDF();
   var s0 = Math.sqrt(sigma[0][0]);
   var s1 = Math.sqrt(sigma[1][1]);
   var s2 = Math.sqrt(sigma[2][2]);
   var r01 = sigma[0][1]/(s0*s1);
   var r02 = sigma[0][2]/(s0*s2);
   var r12 = sigma[1][2]/(s1*s2);
   var rt01 = 1/Math.sqrt(1-r01*r01);
   var rt02 = 1/Math.sqrt(1-r02*r02);
   var rho = (r12-r01*r02)*rt01*rt02;

   if(ak.nativeType(threshold)===ak.UNDEFINED_T) threshold = Math.pow(ak.EPSILON, 0.375);
   else threshold = Math.sqrt(Math.abs(threshold));

   if(ak.nativeType(steps)===ak.UNDEFINED_T) steps = 12;
   else steps = ak.ceil(Math.abs(steps)*2/3);

   return function(x){return corr3dCDF(mu, s0, s1, s2, r01, r02, r12, rt01, rt02, rho, x, cdf, inv, threshold, steps);};
  }

  function corrNdMarginalCDF(sigma, devs, x, cdf, threshold, steps, qrnd, prnd) {
   var n = x.length;
   var c = 0;
   var f = [];
   var i, j, k, s, y;

   for(i=0;i<n;++i) if(cdf(x[i]*devs[i])<1) f[c++] = i;
   if(c===0) return 1;
   if(c===1) return cdf(x[f[0]]*devs[f[0]]);

   s = new Array(c);
   y = new Array(c);

   for(i=0;i<c;++i) {
    k = f[i];
    s[i] = new Array(c);
    y[i] = x[k];
    for(j=0;j<c;++j) s[i][j] = sigma[k][f[j]];
   }
   return ak.multiNormalCDF(ak.matrix(s), threshold, steps, qrnd, prnd)(ak.vector(y));
  }

  function corrNdIntegrand(root, x, cdf, inv, e0, y) {
   var n = x.length;

   return function(u) {
    var em = e0;
    var fm = e0;
    var m, ly, i;

    for(m=1;m<n;++m) {
     y[m-1] = inv(u.at(m-1)*em);

     ly = 0;
     for(i=0;i<m;++i) ly += root[m][i]*y[i];
     
     em = cdf((x[m]-ly)*root[m][m]);
     fm *= em;
    }
    return fm;
   };
  }

  function corrNdCDF(mu, sigma, root, devs, x, zero, one, cdf, inv, y, threshold, steps, qrnd, prnd) {
   var n = mu.length;
   var i, c, inf, e0;

   if(ak.type(x)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiNormalCDF');
   if(x.dims()!==n) throw new Error('dimension mismatch in ak.multiNormalCDF');

   x = x.toArray();
   for(i=0;i<n;++i) x[i] -= mu[i];

   if(x.some(isNaN)) return ak.NaN;

   inf = 0;
   for(i=0;i<n && inf!==-1;++i) {
    c = cdf(x[i]*devs[i]);
    if(c===0 || c===1) inf = 2*c-1;
   }
   if(inf===-1) return 0;
   if(inf===+1) return corrNdMarginalCDF(sigma, devs, x, cdf, threshold, steps, qrnd, prnd);

   e0 = cdf(x[0]*root[0][0]);
   return ak.quasiRandomIntegral(corrNdIntegrand(root, x, cdf, inv, e0, y), threshold, steps, qrnd, prnd)(zero, one);
  }

  function makeCorrNdCDF(mu, sigma, root, threshold, steps, qrnd, prnd) {
   var n = mu.length;
   var zero = ak.vector(n-1, 0);
   var one = ak.vector(n-1, 1);
   var cdf = ak.normalCDF();
   var inv = ak.normalInvCDF();
   var devs = new Array(n);
   var y = new Array(n-1);
   var i;

   for(i=0;i<n;++i) {
    root[i][i] = 1/root[i][i];
    devs[i] = 1/Math.sqrt(sigma[i][i]);
   }
   return function(x) {return corrNdCDF(mu, sigma, root, devs, x, zero, one, cdf, inv, y, threshold, steps, qrnd, prnd);};
  }

  ak.multiNormalCDF = function() {
   var state = {mu: [0], sigma: [1], root: [1]};
   var arg0  = arguments[0];
   var n, i, cdf, f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   n = state.sigma.length;

   if(n===0 || ak.nativeType(state.sigma[0])===ak.NUMBER_T) {
    cdf = ak.normalCDF();
    for(i=0;i<n;++i) state.root[i] = 1/state.root[i];

    f = function(x){return uncorrCDF(state.mu, state.root, cdf, x);};
    f.sigma = function(){return ak.matrix('diagonal', state.sigma);};
   }
   else {
    if(n===2)      f = makeCorr2dCDF(state.mu, state.sigma, state.threshold, state.steps);
    else if(n===3) f = makeCorr3dCDF(state.mu, state.sigma, state.threshold, state.steps);
    else           f = makeCorrNdCDF(state.mu, state.sigma, state.root, state.threshold, state.steps, state.qrnd, state.prnd);

    f.sigma = function(){return ak.matrix(state.sigma);};
   }
   f.mu = function(){return ak.vector(state.mu);};

   return Object.freeze(f);
  };

  ak.multiNormalCompCDF = function() {
   var state = {mu: [0], sigma: [1], root: [1]};
   var arg0  = arguments[0];
   var nmu = [];
   var n, i, cdf, f, g;

   constructors[ak.type(arg0)](state, arg0, arguments);

   n = state.sigma.length;
   nmu.length = n;
   for(i=0;i<n;++i) nmu[i] = -state.mu[i];

   if(n===0 || ak.nativeType(state.sigma[0])===ak.NUMBER_T) {
    cdf = ak.normalCDF();
    for(i=0;i<n;++i) state.root[i] = 1/state.root[i];

    f = function(x){return uncorrCDF(nmu, state.root, cdf, ak.neg(x));};
    f.sigma = function(){return ak.matrix('diagonal', state.sigma);};
   }
   else {
    if(n===2)      g = makeCorr2dCDF(nmu, state.sigma, state.threshold, state.steps);
    else if(n===3) g = makeCorr3dCDF(nmu, state.sigma, state.threshold, state.steps);
    else           g = makeCorrNdCDF(nmu, state.sigma, state.root, state.threshold, state.steps, state.qrnd, state.prnd);

    f = function(x){return g(ak.neg(x));};
    f.sigma = function(){return ak.matrix(state.sigma);};
   }
   f.mu = function(){return ak.vector(state.mu);};

   return Object.freeze(f);
  };

  function uncorrMap(mu, root, uinv, c) {
   var n = mu.length;
   var i;

   if(ak.type(c)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiNormalMap');
   if(c.dims()!==n) throw new Error('dimension mismatch in ak.multiNormalMap');
   c = c.toArray();

   for(i=0;i<n;++i) c[i] = mu[i] + root[i]*uinv(c[i]);
   return ak.vector(c);
  }

  function corrMap(mu, root, uinv, c) {
   var n = mu.length;
   var i, j, rooti;

   if(ak.type(c)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiNormalMap');
   if(c.dims()!==n) throw new Error('dimension mismatch in ak.multiNormalMap');
   c = c.toArray();

   if(c.some(isNaN)) return ak.vector(n, ak.NaN);
   for(i=0;i<n;++i) c[i] = uinv(c[i]);

   for(i=n-1;i>=0;--i) {
    rooti = root[i];
    c[i] = mu[i] + rooti[i]*c[i];
    for(j=0;j<i;++j) c[i] += rooti[j]*c[j];
    if(isNaN(c[i])) c[i] = -ak.INFINITY;
   }
   return ak.vector(c);
  }

  ak.multiNormalMap = function() {
   var uinv = ak.normalInvCDF();
   var state = {mu: [0], sigma: [1], root: [1]};
   var arg0  = arguments[0];
   var f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   if(state.sigma.length===0 || ak.nativeType(state.sigma[0])===ak.NUMBER_T) {
    f = function(c){return uncorrMap(state.mu, state.root, uinv, c);};
    f.sigma = function(){return ak.matrix('diagonal', state.sigma);};
   }
   else {
    f = function(c){return corrMap(state.mu, state.root, uinv, c);};
    f.sigma = function(){return ak.matrix(state.sigma);};
   }
   f.mu = function(){return ak.vector(state.mu);};

   return Object.freeze(f);
  };

  function uncorrRnd(mu, root, rnd) {
   var n = mu.length;
   var z = new Array(n);
   var i;

   for(i=0;i<n;++i) z[i] = mu[i] + root[i]*rnd();
   return ak.vector(z);
  }

  function corrRnd(mu, root, rnd) {
   var n = mu.length;
   var z = new Array(n);
   var i, j, rooti;

   for(i=0;i<n;++i) z[i] = rnd();
   if(z.some(isNaN)) return ak.vector(n, ak.NaN);

   for(i=n-1;i>=0;--i) {
    rooti = root[i];
    z[i] = mu[i] + rooti[i]*z[i];
    for(j=0;j<i;++j) z[i] += rooti[j]*z[j];
    if(isNaN(z[i])) z[i] = -ak.INFINITY;
   }
   return ak.vector(z);
  }

  ak.multiNormalRnd = function() {
   var state = {mu: [0], sigma: [1], root: [1], rnd: Math.random};
   var arg0  = arguments[0];
   var rnd, f;

   constructors[ak.type(arg0)](state, arg0, arguments);

   rnd = ak.normalRnd(state.rnd);

   if(state.sigma.length===0 || ak.nativeType(state.sigma[0])===ak.NUMBER_T) {
    f = function(){return uncorrRnd(state.mu, state.root, rnd);};
    f.sigma = function(){return ak.matrix('diagonal', state.sigma);};
   }
   else {
    f = function(){return corrRnd(state.mu, state.root, rnd);};
    f.sigma = function(){return ak.matrix(state.sigma);};
   }
   f.mu = function(){return ak.vector(state.mu);};
   f.rnd = function(){return state.rnd;};

   return Object.freeze(f);
  };

  function isDiagonal(m) {
   var n = m.rows();
   var i, j;

   for(i=0;i<n;++i) {
    for(j=0;j<i;++j)   if(m.at(i, j)!==0) return false;
    for(j=i+1;j<n;++j) if(m.at(i, j)!==0) return false;
   }
   return true;
  }

  var constructors = {};

  constructors[ak.UNDEFINED_T] = function() {
  };

  constructors[ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T] = function(state, n, args) {
   var arg1 = args[1];

   if(n!==ak.floor(n)) throw new Error('invalid dimension in ak.multiNormal distribution');
   state.mu.length = n;
   state.sigma.length = n;
   state.root.length = n;

   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, n, arg1, args);
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state, n) {
   while(n--) {
    state.mu[n] = 0;
    state.sigma[n] = 1;
    state.root[n] = 1;
   }
  };

  constructors[ak.NUMBER_T][ak.FUNCTION_T] = function(state, n, rnd) {
   while(n--) {
    state.mu[n] = 0;
    state.sigma[n] = 1;
    state.root[n] = 1;
   }
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, n, arg1, args) {
   var arg2 = args[2];
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg2)](state, n, arg1, arg2, args);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function(state, n, sigma) {
   var root;

   sigma = Number(sigma);
   if(sigma<=0 || !isFinite(sigma)) throw new Error('invalid sigma in ak.multiNormal distribution');
   root = Math.sqrt(sigma);

   while(n--) {
    state.mu[n] = 0;
    state.sigma[n] = sigma;
    state.root[n] = root;
   }
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, n, sigma, rnd) {
   var root;

   sigma = Number(sigma);
   if(sigma<=0 || !isFinite(sigma)) throw new Error('invalid sigma in ak.multiNormal distribution');
   root = Math.sqrt(sigma);

   while(n--) {
    state.mu[n] = 0;
    state.sigma[n] = sigma;
    state.root[n] = root;
   }
   state.rnd = rnd;
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, n, mu, sigma, args) {
   var arg3 = args[3];
   var root;

   mu = Number(mu);
   if(!isFinite(mu)) throw new Error('invalid mu in ak.multiNormal distribution');

   sigma = Number(sigma);
   if(sigma<=0 || !isFinite(sigma)) throw new Error('invalid sigma in ak.multiNormal distribution');
   root = Math.sqrt(sigma);

   while(n--) {
    state.mu[n] = mu;
    state.sigma[n] = sigma;
    state.root[n] = root;
   }
   constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.nativeType(arg3)](state, arg3);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.VECTOR_T] = function(state, arg0, args) {
   var arg1 = args[1];
   constructors[ak.VECTOR_T][ak.type(arg1)](state, arg0, arg1, args);
  };

  constructors[ak.VECTOR_T][ak.UNDEFINED_T] = function(state, sigma) {
   var n = sigma.dims();

   state.sigma = sigma.toArray();
   state.mu.length = n;
   state.root.length = n;

   while(n--) {
    if(state.sigma[n]<=0 || !isFinite(state.sigma[n])) throw new Error('invalid sigma in ak.multiNormal distribution');
    state.mu[n] = 0;
    state.root[n] = Math.sqrt(state.sigma[n]);
   }
  };

  constructors[ak.VECTOR_T][ak.FUNCTION_T] = function(state, sigma, rnd) {
   var n = sigma.dims();

   state.sigma = sigma.toArray();
   state.mu.length = n;
   state.root.length = n;

   while(n--) {
    if(state.sigma[n]<=0 || !isFinite(state.sigma[n])) throw new Error('invalid sigma in ak.multiNormal distribution');
    state.mu[n] = 0;
    state.root[n] = Math.sqrt(state.sigma[n]);
   }

   state.rnd = rnd;
  };

  constructors[ak.VECTOR_T][ak.VECTOR_T] = function(state, mu, sigma, args) {
   var n = sigma.dims();
   var arg2 = args[2];

   if(mu.dims()!==n) throw new Error('dimension mismatch in ak.multiNormal distribution');

   state.mu = mu.toArray();
   state.sigma = sigma.toArray();
   state.root.length = n;

   while(n--) {
    if(!isFinite(state.mu[n])) throw new Error('invalid mu in ak.multiNormal distribution');
    if(state.sigma[n]<=0 || !isFinite(state.sigma[n])) throw new Error('invalid sigma in ak.multiNormal distribution');
    state.root[n] = Math.sqrt(state.sigma[n]);
   }

   constructors[ak.VECTOR_T][ak.VECTOR_T][ak.nativeType(arg2)](state, arg2);
  };

  constructors[ak.VECTOR_T][ak.VECTOR_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.VECTOR_T][ak.VECTOR_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.VECTOR_T][ak.MATRIX_T] = function(state, mu, sigma, args) {
   var n = sigma.cols();
   var arg2 = args[2];
   var i, chol;

   if(sigma.rows()!==n) throw new Error('non-square sigma in ak.multiNormal distribution');
   if(mu.dims()!==n) throw new Error('dimension mismatch in ak.multiNormal distribution');

   state.mu = mu.toArray();
   for(i=0;i<n;++i) if(!isFinite(state.mu[i])) throw new Error('invalid mu in ak.multiNormal distribution'); 

   if(isDiagonal(sigma)) {
    state.sigma.length = n;
    state.root.length = n;
    for(i=0;i<n;++i) {
     state.sigma[i] = sigma.at(i, i);
     if(state.sigma[i]<=0 || !isFinite(state.sigma[i])) throw new Error('invalid sigma in ak.multiNormal distribution');

     state.root[i] = Math.sqrt(state.sigma[i]);
    }
   }
   else {
    try {chol = ak.choleskyDecomposition(sigma);}
    catch(e) {throw new Error('invalid sigma in ak.multiNormal distribution');}

    state.root = chol.l().toArray();
    state.sigma = chol.toMatrix().toArray();

    while(n--) for(i=0;i<=n;++i) if(!isFinite(state.sigma[n][i])) throw new Error('invalid sigma in ak.multiNormal distribution');
   }

   constructors[ak.VECTOR_T][ak.MATRIX_T][ak.nativeType(arg2)](state, arg2, args);
  };

  constructors[ak.VECTOR_T][ak.MATRIX_T][ak.UNDEFINED_T] = function() {
  };

  constructors[ak.VECTOR_T][ak.MATRIX_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.VECTOR_T][ak.MATRIX_T][ak.NUMBER_T] = function(state, threshold, args) {
   state.threshold = threshold;
   state.steps = args[3];
   state.qrnd = args[4];
   state.prnd = args[5];
  };

  constructors[ak.VECTOR_T][ak.OBJECT_T] = function(state, mu, sigma, args) {
   var n = mu.dims();
   var arg2 = args[2];
   var chol, l, i;

   state.mu = mu.toArray();
   for(i=0;i<n;++i) if(!isFinite(state.mu[i])) throw new Error('invalid mu in ak.multiNormal distribution');

   try {chol = ak.choleskyDecomposition(sigma);}
   catch(e) {throw new Error('invalid sigma in ak.multiNormal distribution');}

   l = chol.l();
   if(l.cols()!==n) throw new Error('dimension mismatch in ak.multiNormal distribution');

   if(isDiagonal(l)) {
    state.root.length = n;
    state.sigma.length = n;

    for(i=0;i<n;++i) {
     state.root[i] = l.at(i, i);
     state.sigma[i] = state.root[i]*state.root[i];
     if(!isFinite(state.sigma[i])) throw new Error('invalid sigma in ak.multiNormal distribution');
    }
   }
   else {
    state.root = l.toArray();
    state.sigma = chol.toMatrix().toArray();

    while(n--) for(i=0;i<=n;++i) if(!isFinite(state.sigma[n][i])) throw new Error('invalid sigma in ak.multiNormal distribution');
   }
   constructors[ak.VECTOR_T][ak.MATRIX_T][ak.nativeType(arg2)](state, arg2, args);
  };

  constructors[ak.VECTOR_T][ak.CHOLESKY_DECOMPOSITION_T] = constructors[ak.VECTOR_T][ak.OBJECT_T];

  constructors[ak.MATRIX_T] = function(state, sigma, args) {
   var n = sigma.cols();
   var arg1 = args[1];
   var i, chol;

   if(sigma.rows()!==n) throw new Error('non-square sigma in ak.multiNormal distribution');

   state.mu.length = n;
   for(i=0;i<n;++i) state.mu[i] = 0;

   if(isDiagonal(sigma)) {
    state.sigma.length = n;
    state.root.length = n;
    for(i=0;i<n;++i) {
     state.sigma[i] = sigma.at(i, i);
     if(state.sigma[i]<=0 || !isFinite(state.sigma[i])) throw new Error('invalid sigma in ak.multiNormal distribution');

     state.root[i] = Math.sqrt(state.sigma[i]);
    }
   }
   else {
    try {chol = ak.choleskyDecomposition(sigma);}
    catch(e) {throw new Error('invalid sigma in ak.multiNormal distribution');}

    state.root = chol.l().toArray();
    state.sigma = chol.toMatrix().toArray();

    while(n--) for(i=0;i<=n;++i) if(!isFinite(state.sigma[n][i])) throw new Error('invalid sigma in ak.multiNormal distribution');
   }

   constructors[ak.MATRIX_T][ak.nativeType(arg1)](state, arg1, args);
  };

  constructors[ak.MATRIX_T][ak.UNDEFINED_T] = function(state) {
  };

  constructors[ak.MATRIX_T][ak.FUNCTION_T] = function(state, rnd) {
   state.rnd = rnd;
  };

  constructors[ak.MATRIX_T][ak.NUMBER_T] = function(state, threshold, args) {
   state.threshold = threshold;
   state.steps = args[2];
   state.qrnd = args[3];
   state.prnd = args[4];
  };

  constructors[ak.OBJECT_T] = function(state, sigma, args) {
   var arg1 = args[1];
   var chol, l, n, i;

   try {chol = ak.choleskyDecomposition(sigma);}
   catch(e) {throw new Error('invalid sigma in ak.multiNormal distribution');}

   l = chol.l();
   n = l.cols();

   state.mu.length = n;
   for(i=0;i<n;++i) state.mu[i] = 0;

   if(isDiagonal(l)) {
    state.root.length = n;
    state.sigma.length = n;

    for(i=0;i<n;++i) {
     state.root[i] = l.at(i, i);
     state.sigma[i] = state.root[i]*state.root[i];
     if(!isFinite(state.sigma[i])) throw new Error('invalid sigma in ak.multiNormal distribution');
    }
   }
   else {
    state.root = l.toArray();
    state.sigma = chol.toMatrix().toArray();

    while(n--) for(i=0;i<=n;++i) if(!isFinite(state.sigma[n][i])) throw new Error('invalid sigma in ak.multiNormal distribution');
   }
   constructors[ak.MATRIX_T][ak.nativeType(arg1)](state, arg1, args);
  };

  constructors[ak.CHOLESKY_DECOMPOSITION_T] = constructors[ak.OBJECT_T];
 }

 ak.using(['Matrix/CholeskyDecomposition.js', 'Complex/Complex.js', 'Distribution/NormalDistribution.js', 'Calculus/RombergIntegral.js', 'Calculus/QuasiRandomIntegral.js'], define);
})();
