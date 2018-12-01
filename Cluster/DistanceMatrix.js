//AK/Cluster/DistanceMatrix.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.distanceMatrix) return;

  ak.distanceMatrix = function(lhs, rhs, dist) {
   var lt = ak.type(lhs);
   var rt = ak.type(rhs);
   var lat, rat, rows, cols, a, irc, icr, row, col, d;

   if(lt!==ak.ARRAY_T && lt!==ak.CLUSTER_DATA_T) throw new Error('invalid lhs in ak.distanceMatrix');
   if(rt!==ak.ARRAY_T && rt!==ak.CLUSTER_DATA_T) throw new Error('invalid rhs in ak.distanceMatrix');
   if(ak.nativeType(dist)===ak.UNDEFINED_T) dist = ak.dist;
   else if(ak.nativeType(dist)!==ak.FUNCTION_T) throw new Error('invalid distance measure in ak.distanceMatrix');

   lat = lt===ak.ARRAY_T ? function(i){return lhs[i];} : lhs.at;
   rat = rt===ak.ARRAY_T ? function(i){return rhs[i];} : rhs.at;

   rows = lt===ak.ARRAY_T ? lhs.length : lhs.size();
   cols = rt===ak.ARRAY_T ? rhs.length : rhs.size();
   a = new Array(rows*cols);

   if(lhs===rhs) {
    irc = 0;
    for(row=0;row<rows;++row) {
     icr = irc;
     a[irc] = 0;
     for(col=row+1;col<cols;++col) {
      d = Number(dist(lat(row), rat(col)));
      if(d<0) throw new Error('invalid distance in ak.distanceMatrix');
      a[++irc] = a[icr+=cols] = d;
     }
     irc += row+2;
    }
   }
   else {
    irc = 0;
    for(row=0;row<rows;++row) {
     for(col=0;col<cols;++col) {
      d = Number(dist(lat(row), rat(col)));
      if(d<0) throw new Error('invalid distance in ak.distanceMatrix');
      a[irc++] = d;
     }
    }
   }
   return ak.matrix(rows, cols, a);
  }
 }

 ak.using(['Matrix/Matrix.js', 'Cluster/Clustering.js'], define);
})();