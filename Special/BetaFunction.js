//AK/Special/BetaFunction.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.beta) return;

  function betaR(a, b) {
   return a>=0 && b>=0 ? Math.exp(ak.logGamma(a)+ak.logGamma(b)-ak.logGamma(a+b))
                       : ak.gamma(a)*ak.gamma(b)/ak.gamma(a+b);
  };

  function betaC(a, b) {
   return ak.div(ak.mul(ak.gamma(a), ak.gamma(b)), ak.gamma(ak.add(a, b)));
  };

  ak.beta = function(a, b) {return ak.beta[ak.type(a)][ak.type(b)](a, b);};
  
  ak.overload(ak.beta, [ak.COMPLEX_T, ak.COMPLEX_T], betaC);
  ak.overload(ak.beta, [ak.COMPLEX_T, ak.NUMBER_T],  betaC);
  ak.overload(ak.beta, [ak.NUMBER_T,  ak.COMPLEX_T], betaC);
  ak.overload(ak.beta, [ak.NUMBER_T,  ak.NUMBER_T],  betaR);

  ak.logBeta = function(a, b) {return ak.logGamma(a)+ak.logGamma(b)-ak.logGamma(a+b);};

  var BETA_EPS = ak.EPSILON*ak.EPSILON;
  var BETA_STEPS = 10000;

  function betaFraction(a, b, x) {
   var n  = 1;
   var an = 1;
   var cn = 1/BETA_EPS;
   var dn = 1;
   var fn = 1;
   var m;

   do {
    if(n%2===0) {m = n/2; an = m*(b-m)*x/((a+n-1)*(a+n));}
    else {m = (n-1)/2; an = -(a+m)*(a+b+m)*x/((a+n-1)*(a+n));}
    cn = 1 + an/cn;
    dn = 1 + an/dn;

    if(Math.abs(cn)<BETA_EPS) cn = cn>=0 ? BETA_EPS : -BETA_EPS;
    if(Math.abs(dn)<BETA_EPS) dn = dn>=0 ? BETA_EPS : -BETA_EPS;

    fn *= cn/dn;
    if(++n===BETA_STEPS) throw new Error('failure to converge in ak.betaP/betaQ');
   }
   while(Math.abs(cn-dn)>=ak.EPSILON*Math.abs(dn));

   return fn * (Math.pow(x, a)*Math.pow(1-x, b))/(a*ak.beta(a, b));
  }

  ak.betaP = function(a, b, x) {
   a = Number(a);
   b = Number(b);
   if(!(a>0) || !(b>0)) return ak.NaN;

   x = Number(x);
   if(!(x>=0) || !(x<=1)) return ak.NaN;
   if(x===0) return 0;
   if(x===1) return 1;

   return x<(a+1)/(a+b+2) ? betaFraction(a, b, x) : 1-betaFraction(b, a, 1-x);
  };

  ak.betaQ = function(a, b, x) {
   a = Number(a);
   b = Number(b);
   if(!(a>0) || !(b>0)) return ak.NaN;

   x = Number(x);
   if(!(x>=0) || !(x<=1)) return ak.NaN;
   if(x===0) return 1;
   if(x===1) return 0;

   return x<(a+1)/(a+b+2) ? 1-betaFraction(a, b, x) : betaFraction(b, a, 1-x);
  };
 }
 ak.using('Special/GammaFunction.js', define);
})();
