//AK/Number/Fixed.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.FIXED_T) return;
  ak.FIXED_T = 'ak.fixed';

  function Fixed(){}
  Fixed.prototype = {TYPE: ak.FIXED_T, valueOf: function(){return ak.NaN;}};

  ak.fixed = function() {
   var f     = new Fixed();
   var arg0  = arguments[0];
   var state = {places: 0, digits: 0, scale: 1};

   constructors[ak.nativeType(arg0)](state, arg0, arguments);

   if(!(state.places>=0 && state.places<=ak.DEC_DIG)) throw new Error('invalid decimal places in ak.fixed');

   if     (state.digits<-ak.DEC_MAX) state.digits = -ak.INFINITY;
   else if(state.digits> ak.DEC_MAX) state.digits =  ak.INFINITY;

   state.scale = Math.pow(10, state.places);

   f.digits = function() {return state.digits;};
   f.places = function() {return state.places;};
   f.scale  = function() {return state.scale;};

   f.toNumber = function() {return state.digits/state.scale;};
   f.toString = function() {return toString(state);};

   return Object.freeze(f);
  };

  var constructors = {};

  constructors[ak.NUMBER_T] = function(state, places, args) {
   var arg1 = args[1];
   state.places = ak.trunc(places);
   constructors[ak.NUMBER_T][ak.nativeType(arg1)](state, arg1);
  };

  constructors[ak.NUMBER_T][ak.NUMBER_T] = function(state, digits) {
   state.digits = ak.trunc(digits);
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state) {
   state.digits = 0;
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   state.places = (ak.nativeType(obj.places)===ak.FUNCTION_T) ? ak.trunc(obj.places()) : ak.trunc(obj.places);
   state.digits = (ak.nativeType(obj.digits)===ak.FUNCTION_T) ? ak.trunc(obj.digits()) : ak.trunc(obj.digits);
  };

  function toString(state) {
   var r, l;

   if(state.places===0 || !isFinite(state.digits)) return state.digits.toString();

   r = state.digits % state.scale;
   l = (state.digits-r) / state.scale;
   r = state.scale + Math.abs(r);

   return l + '.' + r.toString().slice(1);
  }

  function abs(f) {
   return ak.fixed(f.places(), Math.abs(f.digits()));
  }

  function inv(f) {
   return ak.fixed(f.places(), ak.round(f.scale()*f.scale()/f.digits()));
  }

  function neg(f) {
   return ak.fixed(f.places(), -f.digits());
  }

  function sqrt(f) {
   return ak.fixed(f.places(), ak.round(Math.sqrt(f.toNumber())*f.scale()));
  }

  function add(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed add');
   return ak.fixed(f0.places(), f0.digits()+f1.digits());
  }

  function cmp(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed cmp');
   return ak.cmp(f0.digits(), f1.digits());
  }

  function div(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed div');
   return ak.fixed(f0.places(), ak.round(f0.scale()*f0.digits()/f1.digits()));
  }

  function eq(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed eq');
   return f0.digits()===f1.digits();
  }

  function ge(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed ge');
   return f0.digits()>=f1.digits();
  }

  function gt(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed gt');
   return f0.digits()>f1.digits();
  }

  function le(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed le');
   return f0.digits()<=f1.digits();
  }

  function lt(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed lt');
   return f0.digits()<f1.digits();
  }

  function mod(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed mod');
   return ak.fixed(f0.places(), f0.digits()%f1.digits());
  }

  function mul(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed mul');
   return ak.fixed(f0.places(), ak.round(f0.digits()*f1.digits()/f0.scale()));
  }

  function ne(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed ne');
   return f0.digits()!==f1.digits();
  }

  function sub(f0, f1) {
   if(f0.places()!==f1.places()) throw new Error('places mismatch in ak.fixed sub');
   return ak.fixed(f0.places(), f0.digits()-f1.digits());
  }

  ak.overload(ak.abs,  ak.FIXED_T, abs);
  ak.overload(ak.inv,  ak.FIXED_T, inv);
  ak.overload(ak.neg,  ak.FIXED_T, neg);
  ak.overload(ak.sqrt, ak.FIXED_T, sqrt);

  ak.overload(ak.add, [ak.FIXED_T, ak.FIXED_T], add);
  ak.overload(ak.cmp, [ak.FIXED_T, ak.FIXED_T], cmp);
  ak.overload(ak.div, [ak.FIXED_T, ak.FIXED_T], div);
  ak.overload(ak.eq,  [ak.FIXED_T, ak.FIXED_T], eq);
  ak.overload(ak.ge,  [ak.FIXED_T, ak.FIXED_T], ge);
  ak.overload(ak.gt,  [ak.FIXED_T, ak.FIXED_T], gt);
  ak.overload(ak.le,  [ak.FIXED_T, ak.FIXED_T], le);
  ak.overload(ak.lt,  [ak.FIXED_T, ak.FIXED_T], lt);
  ak.overload(ak.mod, [ak.FIXED_T, ak.FIXED_T], mod);
  ak.overload(ak.mul, [ak.FIXED_T, ak.FIXED_T], mul);
  ak.overload(ak.ne,  [ak.FIXED_T, ak.FIXED_T], ne);
  ak.overload(ak.sub, [ak.FIXED_T, ak.FIXED_T], sub);
 }

 ak.using('', define);
})();