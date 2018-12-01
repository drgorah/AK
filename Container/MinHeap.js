//AK/Container/MinHeap.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.MIN_HEAP_T) return;
  ak.MIN_HEAP_T = 'ak.minHeap';

  function MinHeap(){}
  MinHeap.prototype = {TYPE: ak.MIN_HEAP_T, valueOf: function(){return ak.NaN;}};

  function bubbleUp(i, a, compare) {
   var p = i%2===0 ? i/2-1 : (i-1)/2;
   var x;

   while(i>0 && compare(a[i], a[p])<0) {
    x = a[i]; a[i] = a[p]; a[p] = x;
    i = p; p = i%2===0 ? i/2-1 : (i-1)/2;
   }
  }

  function bubbleDown(i, a, compare) {
   var n = a.length;
   var l = i*2+1;
   var r = l+1;
   var c = i;
   var x;

   if(l<n && compare(a[c], a[l])>0) c = l;
   if(r<n && compare(a[c], a[r])>0) c = r;

   while(c!==i) {
    x = a[i]; a[i] = a[c]; a[c] = x;
    i = c; l = i*2+1; r = l+1;
    if(l<n && compare(a[c], a[l])>0) c = l;
    if(r<n && compare(a[c], a[r])>0) c = r;
   }
  }

  function bubble(i, a, compare) {
   var p = i%2===0 ? i/2-1 : (i-1)/2;
   var c = p>=0 ? compare(a[i], a[p]) : 1;
   var x;

   if(c<0) {
    x = a[i]; a[i] = a[p]; a[p] = x;
    if(p>0) bubbleUp(p, a, compare);
   }
   else if(c!==0) {
    bubbleDown(i, a, compare);
   }
  }

  function initialise(a, compare) {
   var n = a.length-1;
   var p;

   if(n>0) {
    p = n%2===0 ? n/2-1 : (n-1)/2;
    while(p>=0) bubbleDown(p--, a, compare);
   }
  }

  function maxIndex(a, compare) {
   var n = a.length-1;
   var p, max;

   if(n<2) return n;

   p = n%2===0 ? n/2-1 : (n-1)/2;
   max = n;
   while(--n>p) if(compare(a[n],a[max])>0) max = n;
   return max;
  }

  function addElement(x, a, compare) {
   a.push(x);
   bubbleUp(a.length-1, a, compare);
   return a.length;
  }

  function removeIndex(i, a, compare) {
   var xi = a[i];
   if(i>=0 && i<a.length) {
    if(i===a.length-1) --a.length;
    else {
     a[i] = a.pop();
     bubble(i, a, compare);
    }
   }
   return xi;
  }

  function replaceIndex(i, x, a, compare) {
   var xi = a[i];
   if(i>=0 && i<a.length) {
    a[i] = x;
    bubble(i, a, compare);
   }
   else addElement(x, a, compare);
   return xi;
  }

  function merge(a, state) {
   var t = ak.nativeType(a);
   var n0 = state.a.length;
   var n1, at, i;

   if(t===ak.UNDEFINED_T) {
    n1 = 0;
   }
   else if(t===ak.ARRAY_T) {
    n1 = a.length;
    at = function(i){return a[i];};
   }
   else {
    n1 = a.size();
    at = a.at;
   }

   if(n1>0) {
    n0 = state.a.length;
    state.a.length = n0+n1;
    for(i=0;i<n1;++i) state.a[n0+i] = at(i);
    initialise(state.a, state.compare);
   }
  }

  ak.minHeap = function() {
   var h = new MinHeap();
   var state = {a:[], compare:ak.alphaCompare};
   var arg0 = arguments[0];
   
   constructors[ak.nativeType(arg0)](state, arg0, arguments);
   initialise(state.a, state.compare);

   h.size = function() {return state.a.length;};
   h.at = function(i) {return state.a[i];};
   h.min = function() {return state.a[0];};
   h.max = function() {return state.a[maxIndex(state.a, state.compare)];};
   h.indexOf = function(x) {return state.a.indexOf(x);};
   h.lastIndexOf = function(x) {return state.a.lastIndexOf(x);};
   h.add = function(x) {return addElement(x, state.a, state.compare);};
   h.push = h.add;
   h.pop = function() {return removeIndex(maxIndex(state.a, state.compare), state.a, state.compare);};
   h.unshift = h.add;
   h.shift = function() {return removeIndex(0, state.a, state.compare);};
   h.remove = function(i) {return removeIndex(i, state.a, state.compare);};
   h.replace = function(i, x) {return replaceIndex(i, x, state.a, state.compare);};
   h.merge = function(a) {merge(a, state);};
   h.toArray = function() {return state.a.slice(0);};
   h.toString = function() {return state.a.toString();};
   h.compare = function() {return state.compare;};

   return Object.freeze(h);
  };

  var constructors = {};

  constructors[ak.ARRAY_T] = function(state, a, args) {
   var f = args[1];
   state.a = a.slice(0);
   constructors[ak.ARRAY_T][ak.nativeType(f)](state, f);
  };

  constructors[ak.ARRAY_T][ak.FUNCTION_T]  = function(state, f) {state.compare = f;};
  constructors[ak.ARRAY_T][ak.UNDEFINED_T] = function() {};
 
  constructors[ak.OBJECT_T] = function(state, obj) {
   var n = obj.size;
   var f = obj.compare;
   var i;
 
   if(ak.nativeType(n)===ak.FUNCTION_T) n = n();
   if(ak.nativeType(n)!==ak.NUMBER_T || n<0 || n!==ak.floor(n) || !isFinite(n)) throw new Error('invalid size on ak.minHeap');
 
   if(ak.nativeType(f)===ak.FUNCTION_T) {
    try{if(ak.nativeType(f())===ak.FUNCTION_T) f = f();} catch(e){}
   }
 
   switch(ak.nativeType(f)) {
    case ak.FUNCTION_T:  state.compare = f; break;
    case ak.UNDEFINED_T: break;
    default: throw new Error('invalid compare in ak.minHeap');
   }
 
   state.a.length = n;
   for(i=0;i<n;++i) state.a[i] = obj.at(i);
  };
 
  constructors[ak.FUNCTION_T]  = constructors[ak.ARRAY_T][ak.FUNCTION_T];
  constructors[ak.UNDEFINED_T] = constructors[ak.ARRAY_T][ak.UNDEFINED_T];
 }
 
 ak.using('Algorithm/Compare.js', define);
})();
