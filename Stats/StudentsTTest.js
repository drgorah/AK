//AK/Stats/StudentsTTest.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.studentsTStatOne) return;

  function meanDev(sample, name) {
   var n = sample.length;
   var s1 = 0;
   var s2 = 0;
   var i, xi;

   if(ak.nativeType(sample)!==ak.ARRAY_T) throw new Error('invalid samples in ak.'+name);
   n = sample.length;
   if(n<2) throw new Error('too few samples in ak.'+name);

   for(i=0;i<n;++i) {
    xi = sample[i];
    if(ak.nativeType(xi)!==ak.NUMBER_T || !isFinite(xi)) throw new Error('invalid sample in ak.'+name);
    s1 += xi;
    s2 += xi*xi;
   }
   s1 /= n;
   s2 /= n-1;
   s2 -= s1*s1*n/(n-1);

   return {m: s1, s2: Math.max(s2, 0)};
  }

  ak.studentsTStatOne = function(sample, mu) {
   var ms;

   if(ak.nativeType(mu)!==ak.NUMBER_T || !isFinite(mu)) throw new Error('invalid mu in ak.studentsTStatOne');

   ms = meanDev(sample, 'studentsTStatOne');
   return ms.m===mu ? 0 : Math.abs(ms.m-mu)*Math.sqrt(sample.length/ms.s2);
  };

  ak.studentsTTestOne = function(sample, mu) {
   var s = ak.studentsTStatOne(sample, mu);
   var t = ak.studentsTCDF(sample.length-1);
   return 1-(t(s)-t(-s));
  };

  ak.studentsTStatTwo = function(sample1, sample2) {
   var ms1, ms2, n1, n2, s2;

   ms1 = meanDev(sample1, 'studentsTStatTwo');
   ms2 = meanDev(sample2, 'studentsTStatTwo');

   if(ms1.s2>4*ms2.s2 || ms2.s2>4*ms1.s2) throw new Error('incompatible deviations in ak.studentsTStatTwo');
   if(ms1.m===ms2.m) return 0;

   n1 = sample1.length;
   n2 = sample2.length;
   s2 = (1/n1 + 1/n2)*((n1-1)*ms1.s2 + (n2-1)*ms2.s2)/(n1+n2-2);
   return Math.abs(ms1.m-ms2.m)/Math.sqrt(s2);
  };

  ak.studentsTTestTwo = function(sample1, sample2) {
   var s = ak.studentsTStatTwo(sample1, sample2);
   var t = ak.studentsTCDF(sample1.length+sample2.length-2);
   return 1-(t(s)-t(-s));
  };

  ak.studentsTStatPaired = function(sample1, sample2, mu) {
   var n, i, x1i, x2i;

   if(ak.nativeType(sample1)!==ak.ARRAY_T) throw new Error('invalid initial samples in ak.studentsTTestPaired');
   if(ak.nativeType(sample2)!==ak.ARRAY_T) throw new Error('invalid final samples in ak.studentsTTestPaired');
   n = sample1.length;

   if(sample2.length!==n) throw new Error('sample size mismatch in ak.studentsTStatPaired');
   sample2 = sample2.slice(0);

   for(i=0;i<n;++i) {
    x1i = sample1[i];
    x2i = sample2[i];

    if(ak.nativeType(x1i)!==ak.NUMBER_T || !isFinite(x1i)) throw new Error('invalid initial sample in ak.studentsTTestPaired');
    if(ak.nativeType(x2i)!==ak.NUMBER_T || !isFinite(x2i)) throw new Error('invalid final sample in ak.studentsTTestPaired');
    sample2[i] -= x1i;
   }
   return ak.studentsTStatOne(sample2, mu);
  };

  ak.studentsTTestPaired = function(sample1, sample2, mu) {
   var s = ak.studentsTStatPaired(sample1, sample2, mu);
   var t = ak.studentsTCDF(sample1.length-1);
   return 1-(t(s)-t(-s));
  };
 }

 ak.using('Distribution/StudentsTDistribution.js', define);
})();
