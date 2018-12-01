//AK/Approx/MultiLinearInterpolate.js

//Copyright Richard Harris 2018.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.multiLinearInterpolate) return;

  function copyValues(values) {
   var n;
   if(ak.nativeType(values)===ak.ARRAY_T) {
    n = values.length;
    values = values.slice(0);
    while(n-->0) values[n] = copyValues(values[n]);
   }
   return values;
  }

  function mapValues(i, dims, x, axes, f) {
   var axis, n, values;

   if(i<dims) {
    axis = axes[i];
    n = axis.length;
    values = new Array(n);
    while(n-->0) {
     x[i] = axis[n];
     values[n] = mapValues(i+1, dims, x, axes, f);
    }
   }
   else {
    values = f(ak.vector(x));
   }
   return values;
  }

  function valueType(values) {
   return (ak.nativeType(values)===ak.ARRAY_T) ? valueType(values[0]) : ak.type(values);
  }

  function validateValues(i, dims, t, grid, values) {
   var n;
   if(i<dims) {
    n = grid.length(i);
    if(ak.nativeType(values)!==ak.ARRAY_T || values.length!==n) throw new Error('values size mismatch in ak.multiLinearInterpolate');
    while(n-->0) validateValues(i+1, dims, t, grid, values[n]);
   }
   else {
    if(ak.type(values)!==t) throw new Error('values type mismatch in ak.multiLinearInterpolate');
   }
  }

  function interpolateNumber(vol, i, dims, values, x, lb) {
   var xi, j;

   if(i===dims) return vol*values;

   xi = x[i]; j = lb[i];
   return interpolateNumber(vol*xi[0], i+1, dims, values[j+1], x, lb)
        + interpolateNumber(vol*xi[1], i+1, dims, values[j],   x, lb);
  }

  function interpolateGeneral(add, mul, vol, i, dims, values, x, lb) {
   var xi, j;

   if(i===dims) return mul(vol, values);

   xi = x[i]; j = lb[i];
   return add(interpolateGeneral(add, mul, vol*xi[0], i+1, dims, values[j+1], x, lb),
              interpolateGeneral(add, mul, vol*xi[1], i+1, dims, values[j],   x, lb));
  }

  function interpolateType(t, dims, values) {
   var add, mul;

   if(t===ak.NUMBER_T) return function(x, lb) {return interpolateNumber(1, 0, dims, values, x, lb);};

   try{add=ak.add[t][t]; mul=ak.mul[ak.NUMBER_T][t];} catch(e){}

   if(ak.nativeType(add)!==ak.FUNCTION_T || ak.nativeType(mul)!==ak.FUNCTION_T) {
    throw new Error('non-arithmetic value type in ak.multiLinearInterpolate');
   }

   return function(x, lb) {return interpolateGeneral(add, mul, 1, 0, dims, values, x, lb);};
  }

  function jumpLBFwd(x, axis, x0, dx) {
   var n = axis.length;
   var i = Math.min(ak.floor(n*((x-x0)/dx)), n-2);

   if(x<axis[i]) {if(i>0) --i;}
   else if(x>axis[i+1]) {if(i<n-2) ++i;}
   return i;
  }

  function jumpLBRev(x, axis, x0, dx) {
   var n = axis.length;
   var i = Math.max(ak.floor(n*((x-x0)/dx)), 0);

   if(x<axis[i]) {if(i>0) --i;}
   else if(x>axis[i+1]) {if(i<n-2) ++i;}
   return i;
  }

  function jumpLB(x, axis, x0, dx, lb) {
   if(x>axis[lb+1]) {
    if(lb<axis.length-2) lb = jumpLBFwd(x, axis, x0, dx);
   }
   else if(x<axis[lb]) {
    if(lb>0) lb = jumpLBRev(x, axis, x0, dx);
   }
   return lb;
  }

  function canJump(axis, x0, dx) {
   var n = axis.length;
   var i, j;

   for(i=1;i<n-1;++i) {
    j = ak.floor(n*((axis[i]-x0)/dx));
    if(j<i-1 || j>i) return false;
   }
   return true;
  }

  function compare(l, r) {return l-r;}

  function findLBFwd(x, axis, lb) {
   if(++lb<axis.length-2 && x>axis[lb+1]) {
    lb = ak._unsafeLowerBound(axis, x, compare, lb+2, axis.length-1)-1;
   }
   return lb;
  }

  function findLBRev(x, axis, lb) {
   if(--lb>0 && x<axis[lb]) {
    lb = ak._unsafeLowerBound(axis, x, compare, 1, lb)-1;
   }
   return lb;
  }

  function findLB(x, axis, lb) {
   if(x>axis[lb+1]) {
    if(lb<axis.length-2) lb = findLBFwd(x, axis, lb);
   }
   else if(x<axis[lb]) {
    if(lb>0) lb = findLBRev(x, axis, lb);
   }
   return lb;
  }

  function updateLB(axis) {
   var x0, dx;

   if(axis.length===3) return function(x) {return x<axis[1]?0:1;};

   x0 = axis[0];
   dx = axis[axis.length-1]-x0;

   if(canJump(axis, x0, dx)) return function(x, lb) {return jumpLB(x, axis, x0, dx, lb);};
   return function(x, lb) {return findLB(x, axis, lb);};
  }

  function transformX(x, wide, axes, lb, dx) {
   var n, i, axis, lbi, dxi, xi;

   if(ak.type(x)!==ak.VECTOR_T) throw new Error('invalid argument in ak.multiLinearInterpolate');
   if(x.dims()!==axes.length) throw new Error('argument size mismatch in ak.multiLinearInterpolate');

   x = x.toArray();
   n = wide.length;
   while(n-->0) {
    i = wide[n].i;
    axis = axes[i];
    lbi = wide[n].lb(x[i], lb[i]);
    if(lbi!==lb[i]) {
     lb[i] = lbi;
     dx[i] = axis[lbi+1]-axis[lbi];
    }
   }
   i = x.length;
   while(i-->0) {
    axis = axes[i];
    lbi = lb[i];
    dxi = dx[i];
    xi = x[i];
    x[i] = [(xi-axis[lbi])/dxi, (axis[lbi+1]-xi)/dxi];
   }
   return x;
  }

  function makeNodes(dims, grid, values) {
   var ub = grid.lengths();
   var pos = new Array(dims);
   var n = 1;
   var i, nodes, y;

   for(i=0;i<dims;++i) {pos[i]=0; n*=ub[i];}
   nodes = new Array(n);

   n = 0;
   do {
    y = values;
    for(i=0;i<dims;++i) y = y[pos[i]];
    nodes[n++] = {x:grid.map(pos), y:y};
   }
   while(ak.nextState(pos, ub));
   return nodes;
  }

  ak.multiLinearInterpolate = function(grid, values) {
   var wide = [];
   var axes, dims, lb, dx, i, axis, n, t, interpolate, f;

   if(ak.type(grid)!==ak.GRID_T) throw new Error('invalid grid in ak.multiLinearInterpolate');
   axes = grid.axes();
   dims = axes.length;

   lb = new Array(dims);
   dx = new Array(dims);
   for(i=0;i<dims;++i) {
    axis = axes[i];
    n = axis.length;
    if(n<2) throw new Error('axis too short in ak.multiLinearInterpolate');
    if(!isFinite(axis[0]) || !isFinite(axis[n-1])) throw new Error('non-finite axis in ak.multiLinearInterpolate');
    if(n>2) wide.push({i:i, lb:updateLB(axes[i])});
    lb[i] = 0;
    dx[i] = axis[1]-axis[0];
   }

   switch(ak.nativeType(values)) {
    case ak.ARRAY_T: values = copyValues(values); break;
    case ak.FUNCTION_T: values = mapValues(0, dims, new Array(dims), axes, values); break;
    default: throw new Error('invalid values in ak.multiLinearInterpolate');
   }
   t = valueType(values);
   validateValues(0, dims, t, grid, values); 

   interpolate = interpolateType(t, dims, values);
   f = function(x) {return interpolate(transformX(x, wide, axes, lb, dx), lb);};

   f.grid = function() {return grid;};
   f.values = function() {return copyValues(values);};
   f.nodes = function() {return makeNodes(dims, grid, values);};
   return Object.freeze(f);
  };
 }

 ak.using(['Algorithm/LowerBound.js', 'Geometry/Grid.js', 'Algorithm/NextState.js'], define);
})();