//AK/Copula/BlendCopula.js

//Copyright Richard Harris 2020.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.BLEND_COPULA_ELEMENT_T) return;
  ak.BLEND_COPULA_ELEMENT_T = 'ak.blendCopulaElement';

  function BlendCopulaElement(){}
  BlendCopulaElement.prototype = {TYPE: ak.BLEND_COPULA_ELEMENT_T, valueOf: function(){return ak.NaN;}};

  ak.blendCopulaElement = function(copula, ids, weights) {
   var e = new BlendCopulaElement();
   var n, sorted, i;

   if(ak.nativeType(copula)!==ak.FUNCTION_T) throw new Error('invalid copula in ak.blendCopulaElement');
   if(ak.nativeType(ids)!==ak.ARRAY_T) throw new Error('invalid argument ids in ak.blendCopulaElement');
   if(ak.nativeType(weights)!==ak.ARRAY_T) throw new Error('invalid argument weights in ak.blendCopulaElement');

   n = ids.length;
   if(weights.length!==n) throw new Error('argument ids/weights size mismatch in ak.blendCopulaElement');

   for(i=0;i<n;++i) {
    if(!(ids[i]>=0 && ids[i]!==ak.INFINITY && ak.floor(ids[i])===ids[i])) throw new Error('invalid argument id in ak.blendCopulaElement');
    if(!(ak.nativeType(weights[i])===ak.NUMBER_T && weights[i]>0 && weights[i]!==ak.INFINITY)) throw new Error('invalid argument weight in ak.blendCopulaElement');
   }

   sorted = ids.slice(0);
   sorted.sort(function(x, y){return x-y;});
   for(i=1;i<n && sorted[i]!==sorted[i-1];++i);
   if(i<n) throw new Error('duplicate argument ids in ak.blendCopulaElement');

   ids = ids.slice(0);
   weights = weights.slice(0);

   e.copula  = function() {return copula;};
   e.args    = function() {return ids.length;};
   e.id      = function(i) {return ids[i];};
   e.weight  = function(i) {return weights[i];};
   return Object.freeze(e);
  };

  function copulaTerm(element, sum, u) {
   var n = element.args();
   var v = new Array(n);
   var i, j;

   for(i=0;i<n;++i) {
    j = element.id(i);
    v[i] = Math.pow(Math.max(0, Math.min(1, u[j])), element.weight(i)/sum[j]);
   }
   return element.copula()(ak.vector(v));
  }

  function copula(elements, sum, u) {
   var n = elements.length;
   var c = 1;
   var i;

   for(i=0;i<n;++i) c *= copulaTerm(elements[i], sum, u);
   return c;
  }

  ak.blendCopula = function(elements) {
   var state = constructor(elements);
   var f = function(u) {
    if(ak.type(u)!==ak.VECTOR_T) throw new Error('invalid argument in ak.blendCopula');
    if(u.dims()!==state.sum.length) throw new Error('argument size mismatch in ak.blendCopula');
    return copula(state.elements, state.sum, u.toArray());
   };
   f.elements = function() {return state.elements.slice(0);};
   return Object.freeze(f);
  };

  function density(elements, sum, delta, u, n) {
   var un = u[n];
   var u0 = un - delta;
   var u1 = un + delta;
   var f0, f1;

   u[n] = u0;
   f0 = n===0 ? copula(elements, sum, u) : density(elements, sum, delta, u, n-1);
   u[n] = u1;
   f1 = n===0 ? copula(elements, sum, u) : density(elements, sum, delta, u, n-1);
   u[n] = un;

   return Math.max(0, (f1-f0)/(u1-u0));
  }

  ak.blendCopulaDensity = function(elements, delta) {
   var state = constructor(elements);
   var n = state.sum.length;
   var f;

   if(ak.nativeType(delta)===ak.UNDEFINED_T)   delta = 0.5*Math.pow(n*ak.EPSILON, 1/(n+2));
   else if(ak.nativeType(delta)!==ak.NUMBER_T) throw new Error('non-numeric delta in ak.blendCopulaDensity');

   if(!(delta>0)) throw new Error('non-positive delta in ak.blendCopulaDensity');

   f = function(u) {
    if(ak.type(u)!==ak.VECTOR_T) throw new Error('invalid argument in ak.blendCopulaDensity');
    if(u.dims()!==n) throw new Error('argument size mismatch in ak.blendCopulaDensity');
    return density(state.elements, state.sum, delta, u.toArray(), n-1);
   };
   f.elements = function() {return state.elements.slice(0);};
   return Object.freeze(f);
  };

  function constructor(elements) {
   var max = 0;
   var n, i, j, element, sum;

   if(ak.nativeType(elements)!==ak.ARRAY_T) throw new Error('invalid elements in ak.blendCopula');
   n = elements.length;

   for(i=0;i<n;++i) {
    element = elements[i];
    if(ak.type(element)!==ak.BLEND_COPULA_ELEMENT_T) throw new Error('invalid element in ak.blendCopula');
    max = Math.max(max, element.id(element.args()-1));
   }
   ++max;
   sum = new Array(max);
   for(i=0;i<max;++i) sum[i] = 0;

   for(i=0;i<n;++i) {
    element = elements[i];
    for(j=0;j<element.args();++j) sum[element.id(j)] += element.weight(j);
   }
   for(i=0;i<max;++i) if(sum[i]===0 || !isFinite(sum[i])) throw new Error('invalid total weight in ak.blendCopula');

   return {
    elements: elements.slice(0),
    sum: sum
   };
  }
 }

 ak.using('Matrix/Vector.js', define);
})();
