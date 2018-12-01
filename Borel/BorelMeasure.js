//AK/Borel/BorelMeasure.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.borelMeasure) return;

  ak.borelMeasure = function(s, f) {
   var m = 0;
   var n, i, l, u;

   if(ak.type(s)!==ak.BOREL_SET_T) throw new Error('invalid set in ak.borelMeasure');
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid measure in ak.borelMeasure');

   n = s.intervals();
   while(n-->0) {
    i = s.at(n);
    l = i.lb(); l = l.closed() ? l.value() : ak.nextAfter(l.value(),  ak.INFINITY);
    u = i.ub(); u = u.closed() ? u.value() : ak.nextAfter(u.value(), -ak.INFINITY);
    m += f(l, u);
   }
   return m;
  };
 }

 ak.using(['Borel/BorelSet.js', 'Number/NextAfter.js'], define);
})();
