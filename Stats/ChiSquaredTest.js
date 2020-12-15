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
    ei = expected[i];
    if(oi!==0) s += ei!==0 ? oi*oi/ei : ak.INFINITY;
   }
   s *= ne/no;
   return Math.max(s-no, 0);
  };

  ak.chiSquaredTest = function(observed, expected, params) {
   var n, s, x;

   if(ak.nativeType(observed)!==ak.ARRAY_T) throw new Error('invalid observed samples in ak.chiSquaredTest');
   n = observed.length;
   if(ak.nativeType(params)!==ak.NUMBER_T || params!==ak.floor(params) || params<1 || params>=n) throw new Error('invalid params in sk.chiSquaredTest');

   s = ak.chiSquaredStat(observed, expected);
   x = ak.chiSquaredCDF(n-params);
   return 1-x(s);
  };

  ak.chiSquaredTestNonParamFit = function(observed, expected) {
   return ak.chiSquaredTest(observed, expected, 1);
  };

  ak.chiSquaredTestContingent = function(cons) {
   var nr, nc, r, c, i, observed, expected, sr, sc, crc;

   if(ak.type(cons)!==ak.MATRIX_T) throw new Error('invalid contingency matrix in ak.chiSquaredTestContingent');
   nr = cons.rows();
   nc = cons.cols();
   if(nr<2) throw new Error('too few rows in ak.chiSquaredTestContingent');
   if(nc<2) throw new Error('too few columns in ak.chiSquaredTestContingent');

   observed = new Array(nr*nc);
   expected = new Array(nr*nc);

   sr = new Array(nr);
   sc = new Array(nc);
   for(r=0;r<nr;++r) sr[r] = 0;
   for(c=0;c<nc;++c) sc[c] = 0;

   i = 0;
   for(r=0;r<nr;++r) for(c=0;c<nc;++c) {
     crc = cons.at(r, c);
     sr[r] += crc;
     sc[c] += crc;
     observed[i++] = crc;
   }
   i = 0;
   for(r=0;r<nr;++r) for(c=0;c<nc;++c) expected[i++] = sr[r]*sc[c];

   return ak.chiSquaredTest(observed, expected, nr+nc-1);
  };

  ak.chiSquaredTestIndependent = function(sample1, sample2) {
   var n1 = 0;
   var n2 = 0;
   var n, i, j, k, x1i, x2i, n12, p1, p2, observed, expected;

   if(ak.nativeType(sample1)!==ak.ARRAY_T) throw new Error('invalid first samples in ak.chiSquaredTestIndependent');
   if(ak.nativeType(sample2)!==ak.ARRAY_T) throw new Error('invalid second samples in ak.chiSquaredTestIndependent');
   n = sample1.length;
   if(sample2.length!==n) throw new Error('sample size mismatch in ak.chiSquaredTestIndependent');

   for(i=0;i<n;++i) {
    x1i = sample1[i];
    x2i = sample2[i];

    if(ak.nativeType(x1i)!==ak.NUMBER_T || x1i!==ak.floor(x1i) || !isFinite(x1i) || x1i<0) throw new Error('invalid first sample in sk.chiSquaredTestIndependent');
    if(ak.nativeType(x2i)!==ak.NUMBER_T || x2i!==ak.floor(x2i) || !isFinite(x2i) || x2i<0) throw new Error('invalid second sample in sk.chiSquaredTestIndependent');

    n1 = Math.max(n1, x1i);
    n2 = Math.max(n2, x2i);
   }
   ++n1;
   ++n2;

   if(n1<2) throw new Error('too few first categories in ak.chiSquaredTestIndependent');
   if(n2<2) throw new Error('too few second categories in ak.chiSquaredTestIndependent');
   n12 = n1*n2;

   p1 = new Array(n1);
   p2 = new Array(n2);
   for(i=0;i<n1;++i) p1[i] = 0;
   for(i=0;i<n2;++i) p2[i] = 0;

   observed = new Array(n12);
   expected = new Array(n12);
   for(i=0;i<n12;++i) observed[i] = 0;

   for(i=0;i<n;++i) {
    x1i = sample1[i];
    x2i = sample2[i];

    ++p1[x1i];
    ++p2[x2i];
    ++observed[x1i*n2+x2i];
   }
   k = 0;
   for(i=0;i<n1;++i) for(j=0;j<n2;++j) expected[k++] = p1[i]*p2[j];

   return ak.chiSquaredTest(observed, expected, n1+n2-1);
  };
 }

 ak.using(['Distribution/ChiSquaredDistribution.js', 'Matrix/Matrix.js'], define);
})();
