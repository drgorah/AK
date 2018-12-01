//AK/Random/CongruentialRnd.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.congruentialRnd) return;

  function schrageMul(a, m, sup) {
   var q = ak.floor(m/a);
   var r = m%a;
   var f, g;

   sup = isNaN(sup) ? ak.floor((m-1)/q) : ak.floor(sup/q);

   if(r<=q) {
    f = function(x) {
     var lhs = a*(x%q);
     var rhs = r*ak.floor(x/q);
     return lhs>=rhs ? lhs-rhs : m-(rhs-lhs);
    };
   }
   else if(r*sup<=ak.INT_MAX+1) {
    f = function(x) {
     var lhs = a*(x%q);
     var rhs = (r*ak.floor(x/q))%m;
     return lhs>=rhs ? lhs-rhs : m-(rhs-lhs);
    };
   }
   else {
    g = schrageMul(r, m, sup);
    f = function(x) {
     var lhs = a*(x%q);
     var rhs = g(ak.floor(x/q));
     return lhs>=rhs ? lhs-rhs : m-(rhs-lhs);
    };
   }
   return f;
  }

  function isTiny(a, c, m) {
   return a*(m-1)+c<=ak.INT_MAX+1;
  }

  function isSmall(a, m) {
   return a*(m-1)<=ak.INT_MAX+1;
  }

  function tinyLCG(a, c, m, state) {
   return function() {
    state.x = (a*state.x+c)%m;
    return state.x/m;
   };
  }

  function smallLCG(a, c, m, state) {
   var f;

   if(m-1+c<=ak.INT_MAX+1) {
    f = function() {
     state.x = ((a*state.x)%m + c)%m;
     return state.x/m;
    };
   }
   else {
    f = function() {
     state.x = (a*state.x)%m - (m-c);
     if(state.x<0) state.x += m;
     return state.x/m;
    };
   }
   return f;
  }

  function bigLCG(a, c, m, state) {
   var mul = schrageMul(a, m);
   var f;

   if(m-1+c<=ak.INT_MAX+1) {
    f = function() {
     state.x = (mul(state.x) + c)%m;
     return state.x/m;
    };
   }
   else {
    f = function() {
     state.x = mul(state.x) - (m-c);
     if(state.x<0) state.x += m;
     return state.x/m;
    };
   }
   return f;
  }

  function seedLCG(m, x0, state) {
   if(ak.nativeType(x0)===ak.UNDEFINED_T) state.x = ak.floor(Math.random()*m);
   else if(ak.nativeType(x0)!==ak.NUMBER_T) throw new Error('non-numeric seed in ak.congruentialRnd');
   else if(!isFinite(x0) || x0!==ak.floor(x0) || x0<0) throw new Error('invalid seed in ak.congruentialRnd');
   else state.x = x0%m;
  }

  function smallMCG(a, m, state) {
   return function() {
    state.x = (a*state.x)%m;
    return (state.x-1)/(m-1);
   };
  }

  function bigMCG(a, m, state) {
   var mul = schrageMul(a, m);

   return function() {
    state.x = mul(state.x);
    return (state.x-1)/(m-1);
   };
  }

  function seedMCG(m, x0, state) {
   seedLCG(m, x0, state);
   while(ak.hcf(state.x, m)!==1) ++state.x;
  }

  ak.congruentialRnd = function(a, m, c, x0) {
   var state = {};
   var rnd;

   if(ak.nativeType(a)!==ak.NUMBER_T) throw new Error('non-numeric multiplier in ak.congruentialRnd');
   a = Number(a);

   if(ak.nativeType(m)!==ak.NUMBER_T) throw new Error('non-numeric modulus in ak.congruentialRnd');
   m = Number(m);

   if(ak.nativeType(c)===ak.UNDEFINED_T) c = 0;
   else if(ak.nativeType(c)!==ak.NUMBER_T) throw new Error('non-numeric offset in ak.congruentialRnd');
   c = Number(c);

   if(m!==ak.floor(m) || m<3 || m>ak.INT_MAX+1) throw new Error('invalid modulus in ak.congruentialRnd');
   if(a!==ak.floor(a) || a<2 || a>=m) throw new Error('invalid multiplier in ak.congruentialRnd');
   if(c!==ak.floor(c) || c<0 || c>=m) throw new Error('invalid offset in ak.congruentialRnd');

   if(c>0) {
    if(isTiny(a, c, m)) rnd = tinyLCG(a, c, m, state);
    else if(isSmall(a, m)) rnd = smallLCG(a, c, m, state);
    else rnd = bigLCG(a, c, m, state);
    seedLCG(m, x0, state);
   }
   else {
    if(ak.hcf(a, m)!==1) throw new Error('invalid multiplier in ak.congruentialRnd');
    if(isSmall(a, m)) rnd = smallMCG(a, m, state);
    else rnd = bigMCG(a, m, state);
    seedMCG(m, x0, state);
   }
   return rnd;
  };
 }

 ak.using('Number/Rational.js', define);
})();
