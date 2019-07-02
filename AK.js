//AK/AK.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

var ak;
if(!ak) ak = {};

(function() {
 ak.DEC_DIG    = 15;
 ak.DEC_MAX    = Math.pow(10, ak.DEC_DIG)-1;
 ak.E          = Math.E;
 ak.EPSILON    = Math.pow(2, -52);
 ak.GAMMA      = 5.7721566490153286e-1;
 ak.INFINITY   = Number.POSITIVE_INFINITY;
 ak.INT_DIG    = 53;
 ak.INT_MAX    = Math.pow(2, ak.INT_DIG)-1;
 ak.MAX_VALUE  = Number.MAX_VALUE;
 ak.MIN_NORMAL = Math.pow(2, -1022);
 ak.MIN_VALUE  = Number.MIN_VALUE;
 ak.NaN        = Number.NaN;
 ak.PHI        = 0.5*(1+Math.sqrt(5));
 ak.PI         = Math.PI;

 ak.UNDEFINED_T = 'ak.undefined';

 ak.nativeType = function(x) {
  return typeof x==='undefined' ? ak.UNDEFINED_T : Object.prototype.toString.call(x);
 };

 ak.ARRAY_T    = ak.nativeType([]);
 ak.BOOLEAN_T  = ak.nativeType(false);
 ak.FUNCTION_T = ak.nativeType(function(){});
 ak.NUMBER_T   = ak.nativeType(0);
 ak.OBJECT_T   = ak.nativeType({});
 ak.STRING_T   = ak.nativeType('');

 ak.type = function(x) {
  var t, u;
  return (t=ak.nativeType(x))===ak.OBJECT_T && ak.nativeType(u=x.TYPE)===ak.STRING_T ? u : t;
 };

 ak.asynchLoop = function(body, end, err, ms) {
  try {
   if(body())   setTimeout(function(){ak.asynchLoop(body, end, err, ms);}, ms>0?ms:0);
   else if(end) end();
  }
  catch(e) {
   if(err) err(e);
   else    throw e;
  }
 };

 var path;
 var loading = [];
 var loaded = {};

 ak.path = function() {
  var dirs, type, i, dir;

  if(arguments.length!==0) {
   dirs = arguments[0];
   type = ak.nativeType(dirs);

   if(type!==ak.ARRAY_T && type!==ak.UNDEFINED_T) dirs = [dirs];
   if(type!==ak.UNDEFINED_T) {
    for(i=0;i<dirs.length;++i) {
     dir = dirs[i];
     if(ak.nativeType(dir)!==ak.STRING_T) throw new TypeError('invalid path in ak.path');
     if(dir!=='' && dir.charAt(dir.length-1)!=='/') dirs[i] = dir + '/';
    }
   }
   path = dirs;
  }
  return path;
 };

 function loader() {
  var next, script;

  if(loading.length>0) {
   next = loading.pop();

   if(ak.nativeType(next)===ak.STRING_T) {
    if(!loaded[next]) {
     script = document.createElement('script');

     script.onload = function() {
      if(!loaded[next]) {
       loaded[next] = true;
       loader();
      }
     };

     script.onerror = function() {
      if(!loaded[next]) {
       loaded[next] = true;
       loader();
      }
     };

     script.onreadystatechange = function() {
      if(!loaded[next] && (this.readyState==='complete' || this.readyState==='loaded')) {
       loaded[next] = true;
       loader();
      }
     }

     script.src = next;
     document.body.appendChild(script);
    }
    else {
     setTimeout(loader, 0);
    }
   }
   else {
    next();
    setTimeout(loader, 0);
   }
  }
 }

 ak.using = function(scripts, callback) {
  var l = loading.length;
  var i, j;

  if(callback) loading.push(callback);

  if(ak.nativeType(path)===ak.ARRAY_T) {
   if(ak.nativeType(scripts)===ak.STRING_T) {
    if(scripts!=='') {
     for(j=path.length-1;j>=0;--j) loading.push(path[j] + scripts);
    }
   }
   else {
    for(i=scripts.length-1;i>=0;--i) {
     if(scripts[i]!=='') {
      for(j=path.length-1;j>=0;--j) loading.push(path[j] + scripts[i]);
     }
    }
   }
  }

  if(l===0 && loading.length!==0) {
   if(window.addEventListener) window.addEventListener('load', loader, false);
   else if(window.attachEvent) window.attachEvent('onload', loader);
  }
 };

 ak.now = ak.nativeType(Date.now)===ak.FUNCTION_T ? Date.now : function() {return (new Date()).getTime();};

 var timeoutDefaultMS = 1000;

 ak.timeoutDefaultMS = function() {
  var ms;

  if(arguments.length!==0) {
   ms = Number(arguments[0]);
   if(isNaN(ms)) throw new TypeError('non-numeric timeout in ak.timeoutDefaultMS');
   timeoutDefaultMS = ms;
  }
  return timeoutDefaultMS;
 };

 ak.timeout = function(caller) {
  var t = {};
  var s = ak.now();
  var ms = timeoutDefaultMS;

  if(arguments.length>1) ms = Number(arguments[1]);
  if(isNaN(ms)) throw new TypeError('timeout ms must be a number');
  if(ms<=0) ms = ak.INFINITY;

  t.test = function() {if(ak.now()-s>ms) throw new Error('timeout in ' + caller);};

  return t;
 };

 ak.overload = function(f, t, o) {
  var n, i, s;

  if(ak.nativeType(t)===ak.ARRAY_T) {
   n = t.length - 1;
   for(i=0;i<n;++i) {
    s = t[i];
    if(ak.nativeType(s)!==ak.STRING_T) throw new TypeError('invalid type name in ak.overload');
    if(!f[s]) f[s] = {};
    f = f[s];
   }
   t = t[n];
  }

  if(ak.nativeType(t)!==ak.STRING_T) throw new TypeError('invalid type name in ak.overload');
  f[t] = o;
 };

 var ROUND_MAX = Math.pow(2, ak.INT_DIG-1);

 ak.ceil  = Math.ceil;
 ak.floor = Math.floor;
 ak.round = Math.round(ak.INT_MAX)===ak.INT_MAX && Math.round(-ak.INT_MAX)===-ak.INT_MAX ? Math.round : function(x) {return Math.abs(x)<ROUND_MAX ? Math.round(x) : Number(x)};
 ak.trunc = function(x) {return x>=0 ? ak.floor(x) : ak.ceil(x);};

 ak.hypot = Math.hypot;
 if(ak.nativeType(ak.hypot)===ak.UNDEFINED_T) {
  ak.hypot = function(x, y) {
   x = Math.abs(x);
   y = Math.abs(y);
   if(!isFinite(x) || !isFinite(y)) return x+y;
   if(x>y) {y/=x; return x*Math.sqrt(1+y*y);}
   if(y>0) {x/=y; return y*Math.sqrt(1+x*x);}
   return 0;
  };
 }

 ak.diff = function(lhs, rhs) {return ak.dist(lhs, rhs)/(1+Math.min(ak.abs(lhs), ak.abs(rhs)));};

 function not(x) {return !x;}

 function cosh(x) {var e = Math.exp(x); return 0.5*(e+1/e);}
 function inv (x) {return 1/x;}
 function neg (x) {return -x;}
 function sinh(x) {var e = Math.exp(x); return 0.5*(e-1/e);}
 function tanh(x) {var e2 = Math.exp(x*2); return e2!==ak.INFINITY ? (e2-1)/(e2+1) : 1;}

 function and (lhs, rhs) {return lhs && rhs;}
 function impl(lhs, rhs) {return !lhs || rhs;}
 function nand(lhs, rhs) {return !(lhs && rhs);}
 function nor (lhs, rhs) {return !(lhs || rhs);}
 function or  (lhs, rhs) {return lhs || rhs;}
 function xnor(lhs, rhs) {return lhs == rhs;}
 function xor (lhs, rhs) {return lhs != rhs;}

 function add (lhs, rhs) {return lhs+rhs;}
 function cmp (lhs, rhs) {return lhs!==rhs ? lhs-rhs : 0;}
 function dist(lhs, rhs) {return Math.abs(lhs-rhs);}
 function div (lhs, rhs) {return lhs/rhs;}
 function eq  (lhs, rhs) {return lhs===rhs;}
 function ge  (lhs, rhs) {return lhs>=rhs;}
 function gt  (lhs, rhs) {return lhs>rhs;}
 function le  (lhs, rhs) {return lhs<=rhs;}
 function lt  (lhs, rhs) {return lhs<rhs;}
 function mod (lhs, rhs) {return lhs%rhs;}
 function mul (lhs, rhs) {return lhs*rhs;}
 function ne  (lhs, rhs) {return lhs!==rhs;}
 function sub (lhs, rhs) {return lhs-rhs;}

 ak.not  = function(x) {return ak.not [ak.type(x)](x);};

 ak.abs  = function(x) {return ak.abs [ak.type(x)](x);};
 ak.acos = function(x) {return ak.acos[ak.type(x)](x);};
 ak.asin = function(x) {return ak.asin[ak.type(x)](x);};
 ak.atan = function(x) {return ak.atan[ak.type(x)](x);};
 ak.cos  = function(x) {return ak.cos [ak.type(x)](x);};
 ak.cosh = function(x) {return ak.cosh[ak.type(x)](x);};
 ak.exp  = function(x) {return ak.exp [ak.type(x)](x);};
 ak.inv  = function(x) {return ak.inv [ak.type(x)](x);};
 ak.log  = function(x) {return ak.log [ak.type(x)](x);};
 ak.neg  = function(x) {return ak.neg [ak.type(x)](x);};
 ak.sin  = function(x) {return ak.sin [ak.type(x)](x);};
 ak.sinh = function(x) {return ak.sinh[ak.type(x)](x);};
 ak.sqrt = function(x) {return ak.sqrt[ak.type(x)](x);};
 ak.tan  = function(x) {return ak.tan [ak.type(x)](x);};
 ak.tanh = function(x) {return ak.tanh[ak.type(x)](x);};

 ak.and  = function(lhs, rhs) {return ak.and [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.impl = function(lhs, rhs) {return ak.impl[ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.nand = function(lhs, rhs) {return ak.nand[ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.nor  = function(lhs, rhs) {return ak.nor [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.or   = function(lhs, rhs) {return ak.or  [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.xnor = function(lhs, rhs) {return ak.xnor[ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.xor  = function(lhs, rhs) {return ak.xor [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};

 ak.add  = function(lhs, rhs) {return ak.add [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.cmp  = function(lhs, rhs) {return ak.cmp [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.dist = function(lhs, rhs) {return ak.dist[ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.div  = function(lhs, rhs) {return ak.div [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.eq   = function(lhs, rhs) {return ak.eq  [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.ge   = function(lhs, rhs) {return ak.ge  [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.gt   = function(lhs, rhs) {return ak.gt  [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.le   = function(lhs, rhs) {return ak.le  [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.lt   = function(lhs, rhs) {return ak.lt  [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.mod  = function(lhs, rhs) {return ak.mod [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.mul  = function(lhs, rhs) {return ak.mul [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.ne   = function(lhs, rhs) {return ak.ne  [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.pow  = function(lhs, rhs) {return ak.pow [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};
 ak.sub  = function(lhs, rhs) {return ak.sub [ak.type(lhs)][ak.type(rhs)](lhs, rhs);};

 ak.overload(ak.not,  ak.BOOLEAN_T, not);

 ak.overload(ak.abs,  ak.NUMBER_T, Math.abs);
 ak.overload(ak.acos, ak.NUMBER_T, Math.acos);
 ak.overload(ak.asin, ak.NUMBER_T, Math.asin);
 ak.overload(ak.atan, ak.NUMBER_T, Math.atan);
 ak.overload(ak.cos,  ak.NUMBER_T, Math.cos);
 ak.overload(ak.cosh, ak.NUMBER_T, cosh);
 ak.overload(ak.exp,  ak.NUMBER_T, Math.exp);
 ak.overload(ak.inv,  ak.NUMBER_T, inv);
 ak.overload(ak.log,  ak.NUMBER_T, Math.log);
 ak.overload(ak.neg,  ak.NUMBER_T, neg);
 ak.overload(ak.sin,  ak.NUMBER_T, Math.sin);
 ak.overload(ak.sinh, ak.NUMBER_T, sinh);
 ak.overload(ak.sqrt, ak.NUMBER_T, Math.sqrt);
 ak.overload(ak.tan,  ak.NUMBER_T, Math.tan);
 ak.overload(ak.tanh, ak.NUMBER_T, tanh);

 ak.overload(ak.and,  [ak.BOOLEAN_T, ak.BOOLEAN_T], and);
 ak.overload(ak.eq,   [ak.BOOLEAN_T, ak.BOOLEAN_T], xnor);
 ak.overload(ak.impl, [ak.BOOLEAN_T, ak.BOOLEAN_T], impl);
 ak.overload(ak.nand, [ak.BOOLEAN_T, ak.BOOLEAN_T], nand);
 ak.overload(ak.ne,   [ak.BOOLEAN_T, ak.BOOLEAN_T], xor);
 ak.overload(ak.nor,  [ak.BOOLEAN_T, ak.BOOLEAN_T], nor);
 ak.overload(ak.or,   [ak.BOOLEAN_T, ak.BOOLEAN_T], or);
 ak.overload(ak.xnor, [ak.BOOLEAN_T, ak.BOOLEAN_T], xnor);
 ak.overload(ak.xor,  [ak.BOOLEAN_T, ak.BOOLEAN_T], xor);

 ak.overload(ak.add,  [ak.NUMBER_T, ak.NUMBER_T], add);
 ak.overload(ak.cmp,  [ak.NUMBER_T, ak.NUMBER_T], cmp);
 ak.overload(ak.dist, [ak.NUMBER_T, ak.NUMBER_T], dist);
 ak.overload(ak.div,  [ak.NUMBER_T, ak.NUMBER_T], div);
 ak.overload(ak.eq,   [ak.NUMBER_T, ak.NUMBER_T], eq);
 ak.overload(ak.ge,   [ak.NUMBER_T, ak.NUMBER_T], ge);
 ak.overload(ak.gt,   [ak.NUMBER_T, ak.NUMBER_T], gt);
 ak.overload(ak.le,   [ak.NUMBER_T, ak.NUMBER_T], le);
 ak.overload(ak.lt,   [ak.NUMBER_T, ak.NUMBER_T], lt);
 ak.overload(ak.mod,  [ak.NUMBER_T, ak.NUMBER_T], mod);
 ak.overload(ak.mul,  [ak.NUMBER_T, ak.NUMBER_T], mul);
 ak.overload(ak.ne,   [ak.NUMBER_T, ak.NUMBER_T], ne);
 ak.overload(ak.pow,  [ak.NUMBER_T, ak.NUMBER_T], Math.pow);
 ak.overload(ak.sub,  [ak.NUMBER_T, ak.NUMBER_T], sub);

 function unaryOperation(f) {
  return function(stack) {
   if(stack.length<1) throw new Error('too few operator arguments in ak.calc');
   stack.push(f(stack.pop()));
  };
 }

 function binaryOperation(f) {
  return function(stack) {
   var x0, x1;
   if(stack.length<2) throw new Error('too few operator arguments in ak.calc');
   x1 = stack.pop();
   x0 = stack.pop();
   stack.push(f(x0, x1));
  };
 }

 var operations = {};

 operations['!']    = unaryOperation(ak.not);

 operations['||']   = unaryOperation(ak.abs);
 operations['acos'] = unaryOperation(ak.acos);
 operations['asin'] = unaryOperation(ak.asin);
 operations['atan'] = unaryOperation(ak.atan);
 operations['cos']  = unaryOperation(ak.cos);
 operations['cosh'] = unaryOperation(ak.cosh);
 operations['e^']   = unaryOperation(ak.exp);
 operations['1/']   = unaryOperation(ak.inv);
 operations['log']  = unaryOperation(ak.log);
 operations['~']    = unaryOperation(ak.neg);
 operations['sin']  = unaryOperation(ak.sin);
 operations['sinh'] = unaryOperation(ak.sinh);
 operations['sqrt'] = unaryOperation(ak.sqrt);
 operations['tan']  = unaryOperation(ak.tan);
 operations['tanh'] = unaryOperation(ak.tanh);

 operations['&']    = binaryOperation(ak.and);
 operations['->']   = binaryOperation(ak.impl);
 operations['!&']   = binaryOperation(ak.nand);
 operations['!|']   = binaryOperation(ak.nor);
 operations['|']    = binaryOperation(ak.or);
 operations['I']    = binaryOperation(ak.xor);
 operations['!I']   = binaryOperation(ak.xnor);

 operations['+']    = binaryOperation(ak.add);
 operations['cmp']  = binaryOperation(ak.cmp);
 operations['diff'] = binaryOperation(ak.diff);
 operations['dist'] = binaryOperation(ak.dist);
 operations['/']    = binaryOperation(ak.div);
 operations['=']    = binaryOperation(ak.eq);
 operations['>=']   = binaryOperation(ak.ge);
 operations['>']    = binaryOperation(ak.gt);
 operations['<=']   = binaryOperation(ak.le);
 operations['<']    = binaryOperation(ak.lt);
 operations['%']    = binaryOperation(ak.mod);
 operations['*']    = binaryOperation(ak.mul);
 operations['!=']   = binaryOperation(ak.ne);
 operations['^']    = binaryOperation(ak.pow);
 operations['-']    = binaryOperation(ak.sub);

 ak.calc = function() {
  var stack = [];
  var n = arguments.length;
  var i, arg;

  for(i=0;i<n;++i) {
   arg = arguments[i];
   if(ak.nativeType(arg)===ak.STRING_T) operations[arg](stack);
   else stack.push(arg);
  }
  if(stack.length===0) throw new Error('too few operator arguments in ak.calc');
  if(stack.length!==1) throw new Error('too many operator arguments in ak.calc');
  return stack[0];
 };
})();
