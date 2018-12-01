//AK/Special/GammaFunction.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.logGamma) return;
  
  var RT2PI = Math.sqrt(2*ak.PI);
  
  function gammaC(z) {
   var t, x;
 
   if(z.re()<0.5) return ak.div(ak.PI, ak.mul(ak.sin(ak.mul(ak.PI,z)), gammaC(ak.sub(1, z))));
 
   t = ak.add(z, 6.5);
   x = 9.9999999999980993e-1;
   x = ak.add(x, ak.div(6.7652036812188510e+2, z));
   x = ak.sub(x, ak.div(1.2591392167224028e+3, ak.add(z,1)));
   x = ak.add(x, ak.div(7.7132342877765313e+2, ak.add(z,2)));
   x = ak.sub(x, ak.div(1.7661502916214059e+2, ak.add(z,3)));
   x = ak.add(x, ak.div(1.2507343278686905e+1, ak.add(z,4)));
   x = ak.sub(x, ak.div(1.3857109526572012e-1, ak.add(z,5)));
   x = ak.add(x, ak.div(9.9843695780195716e-6, ak.add(z,6)));
   x = ak.add(x, ak.div(1.5056327351493116e-7, ak.add(z,7)));

   return ak.mul(RT2PI, ak.mul(ak.pow(t, ak.sub(z,0.5)), ak.div(x, ak.exp(t))));
  }
  
  function gammaR(z) {
   var t, x;
 
   if(z<0.5) return ak.PI / (Math.sin(ak.PI*z) * gammaR(1-z));
 
   t  = z + 6.5;
   x  = 9.9999999999980993e-1;
   x += 6.7652036812188510e+2 / z;
   x -= 1.2591392167224028e+3 / (z+1);
   x += 7.7132342877765313e+2 / (z+2);
   x -= 1.7661502916214059e+2 / (z+3);
   x += 1.2507343278686905e+1 / (z+4);
   x -= 1.3857109526572012e-1 / (z+5);
   x += 9.9843695780195716e-6 / (z+6);
   x += 1.5056327351493116e-7 / (z+7);

   return RT2PI * Math.pow(t, z-0.5) * Math.exp(-t) * x;
  }
  
  if(!ak.gamma) ak.gamma = function(z) {return ak.gamma[ak.type(z)](z)};
  
  ak.overload(ak.gamma, ak.COMPLEX_T, gammaC);
  ak.overload(ak.gamma, ak.NUMBER_T,  gammaR);
  
  var LOG_PI = Math.log(ak.PI);
  var LOG_RT2PI = Math.log(RT2PI);
  
  ak.logGamma = function(z) {
   var t, x;
 
   if(z<0)   return ak.NaN;
   if(z===0) return ak.INFINITY;
   if(z<0.5) return LOG_PI - Math.log(Math.sin(ak.PI*z)) - ak.logGamma(1-z);
 
   t  = z + 6.5;
   x  = 9.9999999999980993e-1;
   x += 6.7652036812188510e+2 / z;
   x -= 1.2591392167224028e+3 / (z+1);
   x += 7.7132342877765313e+2 / (z+2);
   x -= 1.7661502916214059e+2 / (z+3);
   x += 1.2507343278686905e+1 / (z+4);
   x -= 1.3857109526572012e-1 / (z+5);
   x += 9.9843695780195716e-6 / (z+6);
   x += 1.5056327351493116e-7 / (z+7);

   return LOG_RT2PI + (z-0.5)*Math.log(t) - t + Math.log(x);
  };
  
  var GAMMA_STEPS = 10000;
  
  function gammaSeries(s, x) {
   var gamma = (s===0.5) ? 0.5*LOG_PI : ak.logGamma(s);
   var scale = Math.exp(-x + s*Math.log(x) - gamma);
   var n  = 1;   
   var tn = 1/s;
   var sn = tn;
   
   do {
    tn *= x/(s+n);
    sn += tn;
    if(++n===GAMMA_STEPS) throw new Error('failure to converge in ak.gammaP/ak.gammaQ');
   }
   while(tn>=sn*ak.EPSILON);

   return scale*sn;
  }
  
  var GAMMA_EPS = ak.EPSILON*ak.EPSILON;
  
  function gammaFraction(s, x) {
   var gamma = (s===0.5) ? 0.5*LOG_PI : ak.logGamma(s);
   var scale = Math.exp(-x + s*Math.log(x) - gamma);  
   var n  = 1;
   var an = 1;
   var bn = x+1-s;
   var cn = an/GAMMA_EPS;
   var dn = bn;
   var fn = 1/bn;
   
   do {
    an  = -n*(n-s);
    bn += 2;
    cn  = bn + an/cn;
    dn  = bn + an/dn;

    if(Math.abs(cn)<GAMMA_EPS) cn = cn>=0 ? GAMMA_EPS : -GAMMA_EPS;
    if(Math.abs(dn)<GAMMA_EPS) dn = dn>=0 ? GAMMA_EPS : -GAMMA_EPS;

    fn *= cn/dn;
    if(++n===GAMMA_STEPS) throw new Error('failure to converge in ak.gammaP/ak.gammaQ');
   }
   while(Math.abs(cn-dn)>=ak.EPSILON*Math.abs(dn));
   
   return scale*fn;
  }
  
  ak.gammaP = function(s, x) {
   if(!(s>=0) || !(x>=0)) return ak.NaN;
   if(x===0)              return 0;
   if(x===ak.INFINITY)    return 1;
   if(s===0)              return 1;
   if(s===ak.INFINITY)    return 0;
   if(x<s+1)              return gammaSeries(s, x);
   return 1-gammaFraction(s, x);
  };
  
  ak.gammaQ = function(s, x) {
   if(!(s>=0) || !(x>=0)) return ak.NaN;
   if(x===0)              return 1;
   if(x===ak.INFINITY)    return 0;
   if(s===0)              return 0;
   if(s===ak.INFINITY)    return 1;
   if(x<s+1)              return 1-gammaSeries(s, x);
   return gammaFraction(s, x);
  };
 }
 ak.using('Complex/Complex.js', define);
})();
