//AK/Algorithm/Shuffle.js

//Copyright Richard Harris 2016.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.shuffle) return;

  ak.shuffle = function(a, start, end, rnd) {
   var n, i, j, c;

   if(ak.nativeType(a)!==ak.ARRAY_T) throw new Error('invalid array in ak.shuffle');
   n = a.length;

   if(ak.nativeType(start)===ak.UNDEFINED_T) start = 0;
   else if(start!==ak.floor(start)) throw new Error('invalid start in ak.shuffle');

   if(ak.nativeType(end)===ak.UNDEFINED_T) end = n;
   else if(end!==ak.floor(end)) throw new Error('invalid end in ak.shuffle');

   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid generator in ak.shuffle');

   if(start<=-n)    start = 0;
   else if(start<0) start += n;
   else if(start>n) start = n;

   if(end<=-n)    end = 0;
   else if(end<0) end += n;
   else if(end>n) end = n;

   for(i=start;i<end-1;++i) {
    j = i+ak.floor(rnd()*(end-i));
    c = a[j];
    a[j] = a[i];
    a[i] = c;
   }
  };
 }

 ak.using('', define);
})();
