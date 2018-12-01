//AK/Invert/BracketInverse.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.bracketInverse) return;

  function initHint(hint) {
   var hint_t = ak.nativeType(hint);
   var dx = 0.125;

   if(hint_t===ak.UNDEFINED_T) {
    hint = [-dx, dx];
   }
   else if(hint_t===ak.NUMBER_T) {
    dx *= Math.max(1, Math.abs(hint));
    hint = [hint-dx, hint+dx];
   }
   else if(hint_t!==ak.ARRAY_T
        || hint.length!==2
        || ak.nativeType(hint[0])!==ak.NUMBER_T
        || ak.nativeType(hint[1])!==ak.NUMBER_T
        || hint[0]===hint[1]) {
    throw new Error('invalid hint in ak.bracketInverse');
   }
   return hint;
  }

  function val(x) {
   return (ak.nativeType(x)!==ak.ARRAY_T) ? x : x[0];
  }

  function growHint(f, y, hint) {
   var a = Math.min(hint[0], hint[1]);
   var b = Math.max(hint[0], hint[1]);
   var d = (b-a)/2;

   var fa = val(f(a));
   var fb = val(f(b));

   while(((fa<y && fb<y) || (fa>y && fb>y)) && isFinite(d)) {
    a -= d;
    fa = val(f(a));

    if((fa<y && fb<y) || (fa>y && fb>y)) {
     b += d;
     fb = val(f(b));
    }
    d *= 2;
   }

   if(!isFinite(a) || !isFinite(b)) throw new Error('unable to find bracket in ak.bracketInverse');
   if(!(fa<=y && fb>=y) && !(fa>=y && fb<=y)) throw new Error('unable to find bracket in ak.bracketInverse');
   return [a, b];
  }

  ak.bracketInverse = function(f, y, hint) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.bracketInverse');
   if(!isFinite(y)) throw new Error('invalid target in ak.bracketInverse');

   hint = initHint(hint);
   return growHint(f, y, hint);
  };
 }

 ak.using('', define);
})();