//AK/Algorithm/PrevState.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.prevState) return;

  var prevState = {};
  prevState[ak.ARRAY_T] = {};
  prevState[ak.ARRAY_T][ak.ARRAY_T] = function(n, a, l, u) {
   while(n>0 && !(--a[n-1]>=l[n-1])) {--n; a[n]=u[n]-1;}
   return n>0;
  };
  prevState[ak.ARRAY_T][ak.NUMBER_T] = function(n, a, l, u) {
   while(n>0 && !(--a[n-1]>=l[n-1])) {--n; a[n]=u-1;}
   return n>0;
  };
  prevState[ak.ARRAY_T][ak.UNDEFINED_T] = function(n, a, u) {
   while(n>0 && !(--a[n-1]>=0)) {--n; a[n]=u[n]-1;}
   return n>0;
  };
  prevState[ak.NUMBER_T] = {};
  prevState[ak.NUMBER_T][ak.ARRAY_T] = function(n, a, l, u) {
   while(n>0 && !(--a[n-1]>=l)) {--n; a[n]=u[n]-1;}
   return n>0;
  };
  prevState[ak.NUMBER_T][ak.NUMBER_T] = function(n, a, l, u) {
   while(n>0 && !(--a[n-1]>=l)) {--n; a[n]=u-1;}
   return n>0;
  };
  prevState[ak.NUMBER_T][ak.UNDEFINED_T] = function(n, a, u) {
   while(n>0 && !(--a[n-1]>=0)) {--n; a[n]=u-1;}
   return n>0;
  };

  ak.prevState = function(a, l, u) {return prevState[ak.nativeType(l)][ak.nativeType(u)](a.length, a, l, u);};
 }

 ak.using('', define);
})();
