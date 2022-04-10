//AK/Number/Dimensional.js

//Copyright Richard Harris 2022.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.DIMENSION_T) return;
  ak.DIMENSION_T = 'ak.dimension';
  ak.DIMENSIONAL_T = 'ak.dimensional';

  function Dimension(){}
  Dimension.prototype = {TYPE: ak.DIMENSION_T, valueOf: function(){return ak.NaN;}};

  function Dimensional(){}
  Dimensional.prototype = {TYPE: ak.DIMENSIONAL_T, valueOf: function(){return ak.NaN;}};

  ak.dimension = function(unit, power) {
   var dimension = new Dimension();
   if(ak.nativeType(unit)!==ak.STRING_T || unit.length===0) throw new Error('invalid unit in ak.dimension');
   if(ak.nativeType(power)===ak.UNDEFINED_T) power = 1;
   else if(ak.nativeType(power)!==ak.NUMBER_T || !isFinite(power)) throw new Error('invalid power in ak.dimension');

   dimension.unit = unit;
   dimension.power = power;

   return Object.freeze(dimension);
  };

  ak.dimensional = function(value, dimensions) {
   var dimensional = new Dimensional();
   var state = {};
   var n;

   constructors[ak.type(value)](state, value, dimensions);
   value = state.value;
   dimensions = normalise(state.dimensions);
   n = dimensions.length;

   dimensional.value = function() {return value;};
   dimensional.dimensions = function() {return n;};
   dimensional.dimension = function(j) {return dimensions[j];};

   dimensional.toString = function() {
    var result = value.toString();
    var i;

    for(i=0;i<n;++i) {
     result += ' ' + dimensions[i].unit;
     if(dimensions[i].power!==1) result += '^' + dimensions[i].power.toString();
    }

    return result;
   };

   return Object.freeze(dimensional);
  };

  var constructors = {};

  constructors[ak.DIMENSIONAL_T] = function(state, dimensional) {
   var n = dimensional.dimensions;
   var dimensions = new Array(n);

   state.value = dimensional.value();
   state.dimensions = getDimensions(dimensional);
  };

  constructors[ak.NUMBER_T] = function(state, value, dimensions) {
   state.value = value;
   constructors[ak.NUMBER_T][ak.type(dimensions)](state, dimensions);
  };

  constructors[ak.NUMBER_T][ak.ARRAY_T] = function(state, dimensions) {
   state.dimensions = dimensions.slice(0);
  };

  constructors[ak.NUMBER_T][ak.DIMENSION_T] = function(state, dimension) {
   state.dimensions = [dimension];
  };

  constructors[ak.NUMBER_T][ak.UNDEFINED_T] = function(state, dimension) {
   state.dimensions = [];
  };

  constructors[ak.OBJECT_T] = function(state, obj) {
   constructors[ak.OBJECT_T][ak.nativeType(obj.value)](state, obj.value, obj);
  };

  constructors[ak.OBJECT_T][ak.FUNCTION_T] = function(state, value, obj) {
   value = value();
   constructors[ak.OBJECT_T][ak.nativeType(value)](state, value, obj);
  };

  constructors[ak.OBJECT_T][ak.NUMBER_T] = function(state, value, obj) {
   state.value = value;
   constructors[ak.OBJECT_T][ak.NUMBER_T][ak.nativeType(obj.dimensions)](state, obj.dimensions, obj);
  };

  constructors[ak.OBJECT_T][ak.NUMBER_T][ak.ARRAY_T] = function(state, dims) {
   state.dimensions = dims.slice(0);
  };

  constructors[ak.OBJECT_T][ak.NUMBER_T][ak.DIMENSION_T] = function(state, dims) {
   state.dimensions = [dims];
  };

  constructors[ak.OBJECT_T][ak.NUMBER_T][ak.FUNCTION_T] = function(state, dims, obj) {
   dims = dims();
   constructors[ak.OBJECT_T][ak.NUMBER_T][ak.nativeType(dims)](state, dims, obj);
  };

  constructors[ak.OBJECT_T][ak.NUMBER_T][ak.NUMBER_T] = function(state, dims, obj) {
   var i;

   if(ak.nativeType(obj.dimension)!==ak.FUNCTION_T) throw new Error('invalid dimension accessor in ak.dimensional');

   state.dimensions = new Array(dims);
   for(i=0;i<dims;++i) state.dimensions[i] = obj.dimension(i);
  };

  function normalise(dimensions) {
   var ni = dimensions.length;
   var i, j, nj, dims;

   for(i=0;i<ni;++i) if(ak.type(dimensions[i])!==ak.DIMENSION_T) throw new Error('invalid dimension in ak.dimensionaal');

   dimensions.sort(function(l, r) {
     l = l.unit;
     r = r.unit;

     if(l<r) return -1;
     if(l>r) return  1;
     return 0;
    }
   );

   for(i=1;i<ni;++i) {
    if(dimensions[i].unit===dimensions[i-1].unit) {
     dimensions[i] = ak.dimension(dimensions[i].unit, dimensions[i].power+dimensions[i-1].power);
     dimensions[i-1] = ak.dimension(dimensions[i].unit, 0);
    }
   }

   nj = 0;
   for(i=0;i<ni;++i) if(dimensions[i].power!==0) ++nj;

   if(nj===ni) {
    dims = dimensions;
   }
   else {
    dims = new Array(nj);
    j = 0;
    for(i=0;j<nj;++i) if(dimensions[i].power!==0) dims[j++] = dimensions[i];
   }
   return dims;
  }

  function getDimensions(dimensional) {
   var n = dimensional.dimensions();
   var dimensions = new Array(n);
   var i;

   for(i=0;i<n;++i) dimensions[i] = dimensional.dimension(i);
   return dimensions;
  }

  function abs(x) {
   return ak.dimensional(Math.abs(x.value()), getDimensions(x));
  }

  function inv(x) {
   var dims = getDimensions(x);
   var n = dims.length;
   var i;

   for (i=0;i<n;++i) dims[i] = ak.dimension(dims[i].unit, -dims[i].power);
   return ak.dimensional(1/x.value(), dims);
  }

  function neg(x) {
   return ak.dimensional(-x.value(), getDimensions(x));
  }

  function sqrt(x) {
   var dims = getDimensions(x);
   var n = dims.length;
   var i;

   for (i=0;i<n;++i) dims[i] = ak.dimension(dims[i].unit, dims[i].power/2);
   return ak.dimensional(Math.sqrt(x.value()), dims);
  }

  function eqDimensions(x, y) {
   var nx = x.dimensions();
   var ny = y.dimensions();
   var i, dx, dy;

   if(nx!==ny) return false;

   for(i=0;i<nx;++i) {
    dx = x.dimension(i);
    dy = y.dimension(i)
    if(dx.unit!==dy.unit || dx.power!==dy.power) return false;
   }
   return true;
  }

  function add(x, y) {
   if(!eqDimensions(x, y)) throw new Error('incompatible dimensionals in ak.add');
   return ak.dimensional(x.value()+y.value(), getDimensions(x));
  }

  function cmp(x, y) {
   if(!eqDimensions(x, y)) throw new Error('incompatible dimensionals in ak.cmp');
   return x.value()-y.value();
  }

  function dist(x, y) {
   if(!eqDimensions(x, y)) throw new Error('incompatible dimensionals in ak.dist');
   return ak.dimensional(Math.abs(x.value()-y.value()), getDimensions(x));
  }

  function div(x, y) {
   var dims = getDimensions(x);
   var n = y.dimensions();
   var i, dim;

   for(i=0;i<n;++i) {
    dim = y.dimension(i);
    dims.push(ak.dimension(dim.unit, -dim.power));
   }
   return ak.dimensional(x.value()/y.value(), dims);
  }

  function lNumDiv(x, y) {
   return ak.dimensional(x.value()/y, getDimensions(x));
  }

  function rNumDiv(x, y) {
   var dims = getDimensions(y);
   var n = dims.length;
   var i;

   for(i=0;i<n;++i) dims[i] = ak.dimension(dims[i].unit, -dims[i].power);
   return ak.dimensional(x/y.value(), dims);
  }

  function eq(x, y) {
   return eqDimensions(x, y) && x.value()===y.value();
  }

  function ge(x, y) {
   if(!eqDimensions(x, y)) throw new Error('incompatible dimensionals in ak.ge');
   return x.value()>=y.value();
  }

  function gt(x, y) {
   if(!eqDimensions(x, y)) throw new Error('incompatible dimensionals in ak.gt');
   return x.value()>y.value();
  }

  function le(x, y) {
   if(!eqDimensions(x, y)) throw new Error('incompatible dimensionals in ak.le');
   return x.value()<=y.value();
  }

  function lt(x, y) {
   if(!eqDimensions(x, y)) throw new Error('incompatible dimensionals in ak.lt');
   return x.value()<y.value();
  }

  function mod(x, y) {
   return ak.dimensional(x.value()%y, getDimensions(x));
  }

  function mul(x, y) {
   return ak.dimensional(x.value()*y.value(), getDimensions(x).concat(getDimensions(y)));
  }

  function lNumMul(x, y) {
   return ak.dimensional(x.value()*y, getDimensions(x));
  }

  function rNumMul(x, y) {
   return ak.dimensional(x*y.value(), getDimensions(y));
  }

  function ne(x, y) {
   return !eqDimensions(x, y) || x.value()!==y.value();
  }

  function pow(x, y) {
   var dims = getDimensions(x);
   var n = dims.length;
   var i;

   for (i=0;i<n;++i) dims[i] = ak.dimension(dims[i].unit, dims[i].power*y);
   return ak.dimensional(Math.pow(x.value(), y), dims);
  }

  function sub(x, y) {
   if(!eqDimensions(x, y)) throw new Error('incompatible dimensionals in ak.sub');
   return ak.dimensional(x.value()-y.value(), getDimensions(x));
  }

  ak.dimensionalDiff = function(x, y) {
   if(ak.type(x)!==ak.DIMENSIONAL_T || ak.type(y)!==ak.DIMENSIONAL_T) throw new Error('non-dimensional argument in ak.dimensionalDiff');
   if(!eqDimensions(x, y)) throw new Error('incompatible dimensionals in ak.dimensionalDiff');

   x = x.value();
   y = y.value();
   return Math.abs(x - y)/(1 + Math.min(Math.abs(x), Math.abs(y)));
  };

  ak.overload(ak.abs,  ak.DIMENSIONAL_T, abs);
  ak.overload(ak.inv,  ak.DIMENSIONAL_T, inv);
  ak.overload(ak.neg,  ak.DIMENSIONAL_T, neg);
  ak.overload(ak.sqrt, ak.DIMENSIONAL_T, sqrt);

  ak.overload(ak.add,  [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], add);
  ak.overload(ak.cmp,  [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], cmp);
  ak.overload(ak.dist, [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], dist);
  ak.overload(ak.div,  [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], div);
  ak.overload(ak.div,  [ak.DIMENSIONAL_T, ak.NUMBER_T],      lNumDiv);
  ak.overload(ak.div,  [ak.NUMBER_T,      ak.DIMENSIONAL_T], rNumDiv);
  ak.overload(ak.eq,   [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], eq);
  ak.overload(ak.ge,   [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], ge);
  ak.overload(ak.gt,   [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], gt);
  ak.overload(ak.le,   [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], le);
  ak.overload(ak.lt,   [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], lt);
  ak.overload(ak.mod,  [ak.DIMENSIONAL_T, ak.NUMBER_T],      mod);
  ak.overload(ak.mul,  [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], mul);
  ak.overload(ak.mul,  [ak.DIMENSIONAL_T, ak.NUMBER_T],      lNumMul);
  ak.overload(ak.mul,  [ak.NUMBER_T,      ak.DIMENSIONAL_T], rNumMul);
  ak.overload(ak.ne,   [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], ne);
  ak.overload(ak.pow,  [ak.DIMENSIONAL_T, ak.NUMBER_T],      pow);
  ak.overload(ak.sub,  [ak.DIMENSIONAL_T, ak.DIMENSIONAL_T], sub);
 }

 ak.using('', define);
})();