//AK/Optimise/ClusterMinima.js

//Copyright Richard Harris 2021.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.clusterMinima) return;

  function compare(l, r) {return ak.numberCompare(l.y, r.y);}

  function cluster(samples, clustering, clusteringArgs) {
   var length, i;

   samples = samples.slice(0);
   length = samples.length;

   for(i=0;i<length;++i) samples[i] = samples[i].x;
   clusteringArgs = clusteringArgs.slice(0);
   clusteringArgs.unshift(samples);
   clustering = clustering.apply(null, clusteringArgs);
   if(ak.type(clustering)!==ak.CLUSTERING_T) throw new Error('invalid clustering in ak.clusterMinima');
   return clustering;
  }

  function clusterMedian(samples, members) {
   var length, i;

   members = members.toArray();
   length = members.length;
   for(i=0;i<length;++i) members[i] = samples[members[i]];
   return ak.median(members, compare);
  }

  function clusterMedians(samples, members, clusters) {
   var medians = [];
   var length = members.size();
   var i, median;

   for(i=0;i<length;++i) {
    median = clusterMedian(samples, members.at(i));
    medians.push(median[0]);
    if(ak.ne(median[0].x, median[1].x)) medians.push(median[1]);
   }

   if(medians.length<clusters) {
    medians.sort(compare);
   }
   else {
    ak.partialSort(medians, clusters, compare);
    medians.splice(clusters, medians.length-clusters);
   }
   return medians;
  }

  function minima(samples, n, clusters, clustering, clusteringArgs) {
   var i, length, sample, x, y;

   if(ak.nativeType(samples)!==ak.ARRAY_T) throw new Error('invalid samples in ak.clusterMinima');

   length = samples.length;
   if(n!==ak.floor(n) || n<1 || n>length) throw new Error('invalid sample number cut off in ak.clusterMinima');
   if(clusters!==ak.floor(clusters) || clusters<1) throw new Error('invalid maximum number of clusters in ak.clusterMinima');

   samples = samples.slice(0);

   for(i=0;i<length;++i) {
    sample = samples[i];
    x = sample.x;
    y = sample.y;
    if(ak.nativeType(x)===ak.FUNCTION_T) x = x();
    if(ak.nativeType(y)===ak.FUNCTION_T) y = y();

    if(ak.nativeType(y)!==ak.NUMBER_T || isNaN(y)) throw new Error('invalid sample in ak.clusterMinima');

    samples[i] = {x:x, y:y};
   }

   if(n<length) {
    ak._unsafeNthElement(samples, n, compare, 0, length);
    samples.splice(n, length-n);
   }

   return clusterMedians(samples, cluster(samples, clustering, clusteringArgs).clusters, clusters);
  }

  ak.clusterMinima = function(clustering, clusteringArgs) {
   if(ak.nativeType(clustering)!==ak.FUNCTION_T) throw new Error('invalid clustering algorithm in ak.clusterMinima');
   if(ak.nativeType(clusteringArgs)===ak.UNDEFINED_T) clusteringArgs = [];
   else if(ak.nativeType(clusteringArgs)!==ak.ARRAY_T) clusteringArgs = [clusteringArgs];

   return function(samples, n, clusters) {return minima(samples, n, clusters, clustering, clusteringArgs);};
  };
 }

 ak.using(['Algorithm/NthElement.js', 'Algorithm/PartialSort.js', 'Algorithm/Median.js', 'Cluster/Clustering.js'], define);
})();