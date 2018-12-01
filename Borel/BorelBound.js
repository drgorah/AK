//AK/Borel/BorelBound.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.BOREL_BOUND_T) return;

  ak.BOREL_BOUND_T = 'ak.borelBound';

  function BorelBound(){}
  BorelBound.prototype = {TYPE: ak.BOREL_BOUND_T, valueOf: function(){return ak.NaN;}};

  ak.borelBound = function(arg0, arg1) {
   var b = new BorelBound();
   var state = {};
   var lower, open;

   constructors[ak.nativeType(arg0)][ak.nativeType(arg1)](state, arg0, arg1);

   lower = state.type==='(' || state.type==='[';
   open  = state.type==='(' || state.type===')';

   b.value  = function() {return state.value;};
   b.type   = function() {return state.type;};
   b.lower  = function() {return lower};
   b.upper  = function() {return !lower;};
   b.open   = function() {return open;};
   b.closed = function() {return !open;};

   if(lower) {
    b.toString      = function()  {return state.type+state.value.toString();};
    b.toExponential = function(d) {return state.type+state.value.toExponential(d);};
    b.toFixed       = function(d) {return state.type+state.value.toFixed(d);};
    b.toPrecision   = function(d) {return state.type+state.value.toPrecision(d);};
   }
   else {
    b.toString      = function()  {return state.value.toString()+state.type;};
    b.toExponential = function(d) {return state.value.toExponential(d)+state.type;};
    b.toFixed       = function(d) {return state.value.toFixed(d)+state.type;};
    b.toPrecision   = function(d) {return state.value.toPrecision(d)+state.type;};
   }

   return Object.freeze(b);
  };

  var constructors = {};

  constructors[ak.NUMBER_T] = {};
  constructors[ak.STRING_T] = {};
  constructors[ak.OBJECT_T] = {};

  constructors[ak.NUMBER_T][ak.STRING_T] = function(state, value, type) {
   value = Number(value);
   type  = String(type);

   if(isNaN(value)) throw new Error('invalid value in ak.borelBound');
   if(type!==')' && type!==']') throw new Error('invalid type in ak.borelBound');

   state.value = value;
   state.type  = type;
  };

  constructors[ak.STRING_T][ak.NUMBER_T] = function(state, type, value) {
   value = Number(value);
   type  = String(type);

   if(isNaN(value)) throw new Error('invalid value in ak.borelBound');
   if(type!=='(' && type!=='[') throw new Error('invalid type in ak.borelBound');

   state.value = value;
   state.type  = type;
  };

  constructors[ak.OBJECT_T][ak.UNDEFINED_T] = function(state, obj) {
   var type  = (ak.nativeType(obj.type)===ak.FUNCTION_T)  ? String(obj.type())  : String(obj.type);
   var value = (ak.nativeType(obj.value)===ak.FUNCTION_T) ? Number(obj.value()) : Number(obj.value);

   if(isNaN(value)) throw new Error('invalid value in ak.borelBound');
   if(type!=='(' && type!=='[' && type!==')' && type!==']') throw new Error('invalid type in ak.borelBound');

   state.value = value;
   state.type  = type;
  };

  function eq(l, r) {
   return l.value()===r.value() && l.type()===r.type();
  }

  function ne(l, r) {
   return l.value()!==r.value() || l.type()!==r.type();
  }

  ak.overload(ak.eq, [ak.BOREL_BOUND_T, ak.BOREL_BOUND_T], eq);
  ak.overload(ak.ne, [ak.BOREL_BOUND_T, ak.BOREL_BOUND_T], ne);
 }

 ak.using('', define);
})();
