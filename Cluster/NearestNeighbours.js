//AK/Cluster/NearestNeighbours.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.nearestNeighbours) return;

  function compare(ix0, ix1) {return ak.floatCompare(ix0[1], ix1[1]);}

  ak.nearestNeighbours = function(a0, a1, a2, a3) {
   var t0 = ak.type(a0);
   var distances, k, rows, cols, row, col, a;

   if(ak.type(a0)===ak.MATRIX_T) {
    distances = a0;
    k = a1;
   }
   else if(ak.nativeType(a2)===ak.NUMBER_T) {
    distances = ak.distanceMatrix(a0, a1, a3);
    k = a2;
   }
   else {
    distances = ak.distanceMatrix(a0, a1, a2);
   }

   rows = distances.rows();
   cols = distances.cols();

   if(ak.nativeType(k)===ak.UNDEFINED_T) k = cols;
   else if(ak.nativeType(k)!==ak.NUMBER_T || ak.floor(k)!==k || k<0 || k>cols) throw new Error('invalid neighbourhood size in ak.nearestNeighbours');

   distances = distances.toArray();
   for(row=0;row<rows;++row) {
    a = distances[row];
    for(col=0;col<cols;++col) a[col] = [col, a[col]];
    ak.partialSort(a, k, compare);
    a.length = k;
    for(col=0;col<k;++col) a[col] = a[col][0];
    distances[row] = a;
   }
   return distances;
  };
 }

 ak.using(['Cluster/DistanceMatrix.js', 'Algorithm/PartialSort.js', 'Algorithm/Compare.html'], define);
})();