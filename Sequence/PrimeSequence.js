//AK/Sequence/PrimeSequence.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.primeSequence) return;

  var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  var n = primes.length;

  ak.primeSequence = function(i) {
   var c, j, p;

   if(i!==ak.floor(i) || i<0) throw new Error('invalid index in ak.primeSequence');
   
   if(i===ak.INFINITY) return i;
   if(i<n) return primes[i];

   c = primes[n-1];
   while(n<=i) {
    c += 2;

    j = 0;
    do {p = primes[++j];}
    while(p*p<c && c%p!==0);

    if(p*p>c) {
     primes.push(c);
     ++n;
    }
   }
   return c;
  };
 }
 ak.using('', define);
})();
