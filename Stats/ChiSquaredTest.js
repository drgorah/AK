//AK/Stats/ChiSquaredTest.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.chiSquaredStat) return;

  ak.chiSquaredStat = function(observed, expected) {
   var no = 0;
   var ne = 0;
   var s = 0;
   var n, i, oi, ei;
 
   if(ak.nativeType(observed)!==ak.ARRAY_T) throw new Error('invalid observed samples in ak.chiSquaredStat');
   if(ak.nativeType(expected)!==ak.ARRAY_T) throw new Error('invalid expected samples in ak.chiSquaredStat');
   n = observed.length;

   if(n<2) throw new Error('too few classes in ak.chiSquaredStat');
   if(expected.length!==n) throw new Error('observed/expected size mismatch in ak.chiSquaredStat');

   for(i=0;i<n;++i) {
    oi = observed[i];
    ei = expected[i];
    if(ak.nativeType(oi)!==ak.NUMBER_T || oi<0 || !isFinite(oi)) throw new Error('invalid observed sample in ak.chiSquaredStat');
    if(ak.nativeType(ei)!==ak.NUMBER_T || ei<0 || !isFinite(ei)) throw new Error('invalid expected sample in ak.chiSquaredStat');
    no += oi;
    ne += ei;
   }
   if(no===0 || !isFinite(no)) throw new Error('invalid observed samples in ak.chiSquaredStat');
   if(ne===0 || !isFinite(ne)) throw new Error('invalid expected samples in ak.chiSquaredStat');

   for(i=0;i<n;++i) {
    oi = observed[i];
    if(oi>0) s += expected[i]!==0 ? oi*oi/expected[i] : ak.INFINITY;
   }
   s *= ne/no;
   return Math.max(s-no, 0);
  };

  ak.chiSquaredTest = function(observed, expected) {
   var s = ak.chiSquaredStat(observed, expected);
   var x = ak.chiSquaredCDF(observed.length-1);
   return 1-x(s);
  };
 }

 ak.using('Distribution/ChiSquaredDistribution.js', define);
})();
