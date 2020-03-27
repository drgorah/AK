//AK/Invert/LevenbergInverse.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.levenbergInverse) return;

  function delta(state, lambda, threshold) {
   var dftdf = state.dftdf;
   var n = dftdf.length;
   var a = new Array(n);
   var i;

   for(i=0;i<n;++i) {
    a[i] = dftdf[i].slice(0);
    a[i][i] += lambda;
   }
   a = ak.matrix(a);
   a = ak.spectralDecomposition(a);
   state.dx = ak.stableDiv(state.dftdy, a, threshold);
  }

  function scalarSquare(state) {
   var df = state.df;
   var dy = state.dy;
   var dftdf = state.dftdf;
   var n = df.dims();
   var r, c;

   for(r=0;r<n;++r) {
    for(c=r;c<n;++c) {
     dftdf[r][c] = dftdf[c][r] = df.at(r) * df.at(c);
    }
   }
  }

  function scalarStep(f, df, y, state, rhom, rhop, threshold, steps) {
   var k = 0;
   var lambda, x1, y1, ady;

   state.df = df(state.x);
   state.dy = ak.sub(state.y, y);
   state.dftdy = ak.mul(state.dy, state.df);
   scalarSquare(state);

   lambda = state.lambda*rhom;
   if(lambda===0) lambda = state.lambda;
   delta(state, lambda, threshold);

   x1 = ak.sub(state.x, state.dx);
   y1 = f(x1);
   ady = ak.diff(y1, y);

   while(ady>state.ady) {
    if(k===steps) throw new Error('failure to converge in ak.levenbergInverse');

    lambda = state.lambda*Math.pow(rhop, k++);
    delta(state, lambda, threshold);

    x1 = ak.sub(state.x, state.dx);
    y1 = f(x1);
    ady = ak.diff(y1, y);
   }

   state.ady = ady;
   state.adx = ak.diff(x1, state.x);
   state.x = x1;
   state.y = y1;
   state.lambda = lambda;
  }

  function scalarSolve(f, df, y, x0, lambda, rhom, rhop, threshold, steps) {
   var y0 = f(x0);
   var state = {x:x0, y:y0, lambda:lambda, ady:ak.diff(y0, y)};
   var nx = x0.dims();
   var step = 0;
   var a, i;

   if(!(state.ady>threshold)) return x0;

   a = new Array(nx);
   for(i=0;i<nx;++i) a[i] = new Array(nx);
   state.dftdf = a;

   do {
    if(step++===steps) throw new Error('failure to converge in ak.levenbergInverse');
    scalarStep(f, df, y, state, rhom, rhop, threshold, steps);
   }
   while(state.ady>threshold && state.adx>threshold*nx);
   return !isNaN(state.y) ? state.x : ak.vector(nx, ak.NaN);
  }

  function vectorSquare(state) {
   var df = state.df;
   var dy = state.dy;
   var dftdf = state.dftdf;
   var nr = df.rows();
   var nc = df.cols();
   var r, c, s, k;

   for(r=0;r<nc;++r) {
    for(c=r;c<nc;++c) {
     s = 0;
     for(k=0;k<nr;++k) s += df.at(k, r) * df.at(k, c);
     dftdf[r][c] = dftdf[c][r] = s;
    }
   }
  }

  function vectorStep(f, df, y, state, rhom, rhop, threshold, steps) {
   var k = 0;
   var lambda, x1, y1, ady;

   state.df = df(state.x);
   state.dy = ak.sub(state.y, y);
   state.dftdy = ak.mul(state.dy, state.df);
   vectorSquare(state);

   lambda = state.lambda*rhom;
   if(lambda===0) lambda = state.lambda;
   delta(state, lambda, threshold);

   x1 = ak.sub(state.x, state.dx);
   y1 = f(x1);
   ady = ak.diff(y1, y);

   while(ady>state.ady) {
    if(k===steps) throw new Error('failure to converge in ak.levenbergInverse');

    lambda = state.lambda*Math.pow(rhop, k++);
    delta(state, lambda, threshold);

    x1 = ak.sub(state.x, state.dx);
    y1 = f(x1);
    ady = ak.diff(y1, y);
   }

   state.ady = ady;
   state.adx = ak.diff(x1, state.x);
   state.x = x1;
   state.y = y1;
   state.lambda = lambda;
  }

  function vectorSolve(f, df, y, x0, lambda, rhom, rhop, threshold, steps) {
   var y0 = f(x0);
   var state = {x:x0, y:y0, lambda:lambda, ady:ak.diff(y0, y)};
   var nx = x0.dims();
   var ny = y0.dims();
   var step = 0;
   var a, i;

   if(!(state.ady>threshold*ny)) return x0;

   a = new Array(nx);
   for(i=0;i<nx;++i) a[i] = new Array(nx);
   state.dftdf = a;

   do {
    if(step++===steps) throw new Error('failure to converge in ak.levenbergInverse');
    vectorStep(f, df, y, state, rhom, rhop, threshold, steps);
   }
   while(state.ady>threshold*ny && state.adx>threshold*nx);
   for(i=0;i<ny && !isNaN(state.y.at(i));++i);
   return i===ny ? state.x : ak.vector(nx, ak.NaN);
  }

  function solve(f, df, y, x0, lambda, rhom, rhop, threshold, steps) {
   if(ak.type(x0)!==ak.VECTOR_T) throw new Error('invalid hint in ak.levenbergInverse');
   if(ak.type(y)===ak.VECTOR_T) return vectorSolve(f, df, y, x0, lambda, rhom, rhop, threshold, steps);
   return scalarSolve(f, df, y, x0, lambda, rhom, rhop, threshold, steps);
  }

  ak.levenbergInverse = function(f, df, lambda, rhom, rhop, threshold, steps) {
   if(ak.nativeType(f)!==ak.FUNCTION_T)  throw new Error('invalid function in ak.levenbergInverse');
   if(ak.nativeType(df)!==ak.FUNCTION_T) throw new Error('invalid derivative in ak.levenbergInverse');

   if(ak.nativeType(lambda)!==ak.NUMBER_T || lambda<=0 || !isFinite(lambda))  throw new Error('invalid lambda in ak.levenbergInverse');
   if(ak.nativeType(rhom)!==ak.NUMBER_T || !(rhom>0 && rhom<1))        throw new Error('invalid rho- in ak.levenbergInverse');
   if(ak.nativeType(rhop)!==ak.NUMBER_T || rhop<=1 || !isFinite(rhop)) throw new Error('invalid rho+ in ak.levenbergInverse');

   threshold = ak.nativeType(threshold)===ak.UNDEFINED_T ? Math.pow(ak.EPSILON, 0.75) : Math.abs(threshold);
   if(isNaN(threshold)) throw new Error('invalid convergence threshold in ak.levenbergInverse');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 1000 : ak.floor(Math.abs(steps));
   if(isNaN(steps)) throw new Error('invalid maximum steps in ak.levenbergInverse');

   return function(y, hint) {return solve(f, df, y, hint, lambda, rhom, rhop, threshold, steps);};
  };
 }

 ak.using('Matrix/SpectralDecomposition.js', define);
})();