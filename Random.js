//AK/Random.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 var all = [];
 all.push('Random/BaysDurhamRnd.js');
 all.push('Random/CongruentialRnd.js');
 all.push('Random/GaloisRnd.js');
 all.push('Random/HaltonRnd.js');
 all.push('Random/KnuthRnd.js');
 all.push('Random/MINSTDRnd.js');
 all.push('Random/MTRnd.js');
 all.push('Random/RANDURnd.js');
 all.push('Random/RANFRnd.js');
 all.push('Random/WardMoltenoRnd.js');
 ak.using(all);
})();