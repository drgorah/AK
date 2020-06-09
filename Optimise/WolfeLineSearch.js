//AK/Optimise/WolfeLineSearch.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.wolfeLineSearch) return;

  function armijo(c1, fx, dxdfx, a, fxadx) {
   return fxadx <= fx + c1*a*dxdfx;
  }

  function curvature(c2, dx, dxdfx, dfxadx) {
   return ak.mul(dx, dfxadx) >= c2*dxdfx;
  }

  function bracketLeft(x, dx, fx, dfx, dxdfx, f, df, c1, c2, steps) {
   var a = 0.5;
   var xadx = ak.add(x, ak.mul(a, dx));
   var fxadx = f(xadx);
   var dfxadx = df(xadx);
   var ac = armijo(c1, fx, dxdfx, a, fxadx);

   while(!ac) {
    if(steps--===0) throw new Error('failure to find bracket in ak.wolfeLineSearch');
    a *= 0.5;
    xadx = ak.add(x, ak.mul(a, dx));
    fxadx = f(xadx);
    dfxadx = df(xadx);
    ac = armijo(c1, fx, dxdfx, a, fxadx);
   }
   return {a0:a, a1:2*a, x:xadx, fx:fxadx, dfx:dfxadx, passed:ac && curvature(c2, dx, dxdfx, dfxadx)};
  }

  function bracketRight(x, dx, fx, dfx, dxdfx, fxdx, f, df, c1, c2, steps) {
   var a = 2;
   var a0 = 1;
   var xadx = ak.add(x, ak.mul(a, dx));
   var fxadx = f(xadx);
   var dfxadx = df(xadx);
   var ac = armijo(c1, fx, dxdfx, a, fxadx);
   var cc = curvature(c2, dx, dxdfx, dfxadx);

   while(ac && !cc) {
    if(steps--===0) throw new Error('failure to find bracket in ak.wolfeLineSearch');
    a *= 2;
    xadx = ak.add(x, ak.mul(a, dx));
    fxadx = f(xadx);
    dfxadx = df(xadx);
    ac = armijo(c1, fx, dxdfx, a, fxadx);
    cc = curvature(c2, dx, dxdfx, dfxadx);

    if(fxadx<fxdx) {
     a0 = a;
     fxdx = fxadx;
    }
   }
   return {a0:a0, a1:a, x:xadx, fx:fxadx, dfx:dfxadx, passed:ac&&cc};
  }

  function bracket(x, dx, fx, dfx, dxdfx, f, df, c1, c2, steps) {
   var xdx = ak.add(x, dx);
   var fxdx, dfxdx;

   fxdx = f(xdx);
   if(!armijo(c1, fx, dxdfx, 1, fxdx)) return bracketLeft(x, dx, fx, dfx, dxdfx, f, df, c1, c2, steps);

   dfxdx = df(xdx);
   if(!curvature(c2, dx, dxdfx, dfxdx)) return bracketRight(x, dx, fx, dfx, dxdfx, fxdx, f, df, c1, c2, steps);

   return {x:xdx, fx:fxdx, dfx:dfxdx, passed:true};
  }

  function bisect(a0, a1, x, dx, fx, dfx, dxdfx, f, df, c1, c2, steps) {
   var a = a0/2 + a1/2;
   var xadx = ak.add(x, ak.mul(a, dx));
   var fxadx = f(xadx);
   var dfxadx = df(xadx);
   var ac = armijo(c1, fx, dxdfx, a, fxadx);
   var cc = curvature(c2, dx, dxdfx, dfxadx);

   while(!ac || !cc) {
    if(steps--===0) throw new Error('failure to converge in ak.wolfeLineSearch');

    if(!ac) a1 = a;
    else    a0 = a;

    a = a0/2 + a1/2;
    xadx = ak.add(x, ak.mul(a, dx));
    fxadx = f(xadx);
    dfxadx = df(xadx);
    ac = armijo(c1, fx, dxdfx, a, fxadx);
    cc = curvature(c2, dx, dxdfx, dfxadx);
   }
   return {x:xadx, fx:fxadx, dfx:dfxadx};
  }

  ak.wolfeLineSearch = function(f, df, c1, c2, steps) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.wolfeLineSearch');
   if(ak.nativeType(df)!==ak.FUNCTION_T) throw new Error('invalid derivative in ak.wolfeLineSearch');

   c1 = Number(c1);
   if(!(c1>0 && c1<1)) throw new Error('invalid armijo constant in ak.wolfeLineSearch');

   c2 = Number(c2);
   if(!(c2>c1 && c2<1)) throw new Error('invalid curvature constant in ak.wolfeLineSearch');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 1000 : ak.floor(steps);
   if(!(steps>0)) throw new Error('invalid steps in ak.wolfeLineSearch');

   return function(x, dx, fx, dfx) {
    var dxdfx, b;
    if(ak.nativeType(fx)===ak.UNDEFINED_T)  fx = f(x);
    if(ak.nativeType(dfx)===ak.UNDEFINED_T) dfx = df(x);

    dxdfx = ak.mul(dx, dfx);
    if(dxdfx===0) return {x: x, fx: fx, dfx: dfx};

    if(dxdfx>0) {
     dx = ak.neg(dx);
     dxdfx = -dxdfx;
    }

    b = bracket(x, dx, fx, dfx, dxdfx, f, df, c1, c2, steps);
    if(b.passed) return {x:b.x, fx:b.fx, dfx:b.dfx};
    return bisect(b.a0, b.a1, x, dx, fx, dfx, dxdfx, f, df, c1, c2, steps);
   };
  };
 }

 ak.using('Matrix/Vector.js', define);
})();