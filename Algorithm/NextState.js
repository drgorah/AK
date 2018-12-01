//AK/Algorithm/NextState.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.nextState) return;

  var nextState = {};
  nextState[ak.ARRAY_T] = {};
  nextState[ak.ARRAY_T][ak.ARRAY_T] = function(n, a, l, u) {
   while(n>0 && !(++a[n-1]<u[n-1])) {--n; a[n]=l[n];}
   return n>0;
  };
  nextState[ak.ARRAY_T][ak.NUMBER_T] = function(n, a, l, u) {
   while(n>0 && !(++a[n-1]<u)) {--n; a[n]=l[n];}
   return n>0;
  };
  nextState[ak.ARRAY_T][ak.UNDEFINED_T] = function(n, a, u) {
   while(n>0 && !(++a[n-1]<u[n-1])) {--n; a[n]=0;}
   return n>0;
  };
  nextState[ak.NUMBER_T] = {};
  nextState[ak.NUMBER_T][ak.ARRAY_T] = function(n, a, l, u) {
   while(n>0 && !(++a[n-1]<u[n-1])) {--n; a[n]=l;}
   return n>0;
  };
  nextState[ak.NUMBER_T][ak.NUMBER_T] = function(n, a, l, u) {
   while(n>0 && !(++a[n-1]<u)) {--n; a[n]=l;}
   return n>0;
  };
  nextState[ak.NUMBER_T][ak.UNDEFINED_T] = function(n, a, u) {
   while(n>0 && !(++a[n-1]<u)) {--n; a[n]=0;}
   return n>0;
  };

  ak.nextState = function(a, l, u) {return nextState[ak.nativeType(l)][ak.nativeType(u)](a.length, a, l, u);};
 }

 ak.using('', define);
})();
