//AK/Optimise.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 var all = [];
 all.push('Optimise/AnnealMinimum.js');
 all.push('Optimise/BiasedSampler.js');
 all.push('Optimise/BisectMinimum.js');
 all.push('Optimise/BlindfoldMinimum.js');
 all.push('Optimise/ClusterMinima.js');
 all.push('Optimise/ConjugateMinimum.js');
 all.push('Optimise/GeneticMinimum.js');
 all.push('Optimise/GoldenMinimum.js');
 all.push('Optimise/NoisyAnnealMinimum.js');
 all.push('Optimise/NoisyBlindfoldMinimum.js');
 all.push('Optimise/PolytopeMinimum.js');
 all.push('Optimise/QuasiNewtonMinimum.js');
 all.push('Optimise/WolfeLineSearch.js');
 ak.using(all);
})();