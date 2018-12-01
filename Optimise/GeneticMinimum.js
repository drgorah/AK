//AK/Optimise/GeneticMinimum.js

//Copyright Richard Harris 2017.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.geneticMinimum) return;

  function chromosome(length, bitRnd) {
   var n = ak.ceil(length/32);
   var bits = new Array(n);
   var pos = 0;
   var bit = 1;
   var i;

   for(i=0;i<n;++i) bits[i] = 0;

   while(length-->0) {
    if(bitRnd()!==0) bits[pos] |= bit;
    if((bit<<=1)===0) {bit=1; ++pos;}
   }
   return {bits: bits, fitness: undefined};
  }

  function swapBit(bits0, bits1, locus) {
   var pos = ak.floor(locus/32);
   var bit = 1 << locus%32;
   var tmp = bits0[pos];

   bits0[pos] &= ~bit;
   bits0[pos] |= bits1[pos] & bit;
   bits1[pos] &= ~bit;
   bits1[pos] |= tmp & bit;
  }

  function flipBit(bits, locus) {
   var pos = ak.floor(locus/32);
   var bit = 1 << locus%32;
   bits[pos] ^= bit;
  }

  function uniArg(bits, lb, ub, locus, length) {
   var pos, from, to, u, mask;

   if(length===0) return lb;

   pos = ak.floor(locus/32);
   from = locus%32;
   to = (locus+length-1)%32;

   if(from+length<=32) u = (bits[pos]<<(31-to))>>>(32-length);
   else                u = (bits[pos]>>>from) | ((bits[pos+1]&(0xffffffff>>>(31-to)))<<(32-from));

   u ^= u>>>1;
   u ^= u>>>2;
   u ^= u>>>4;
   u ^= u>>>8;
   u ^= u>>>16;
   if(u<0) u += 0x100000000;

   u /= Math.pow(2, length);
   return lb*(1-u) + ub*u;
  }

  function multiArg(bits, lb, ub, lengths) {
   var n = lb.length;
   var locus = 0;
   var arg = function(i) {
    var a = uniArg(bits, lb[i], ub[i], locus, lengths[i]);
    locus += lengths[i];
    return a;
   };
   return ak.vector(n, arg);
  }

  function populate(pop, length) {
   var n = pop.length;
   var bitRnd = ak.wardMoltenoRnd();
   var i;

   for(i=0;i<n;++i) pop[i] = chromosome(length, bitRnd);
  }

  function uniEval(f, lb, ub, length) {
   return function(c) {
    var arg = uniArg(c.bits, lb, ub, 0, length);
    c.fitness = f(arg);
   };
  }

  function multiEval(f, lb, ub, lengths) {
   return function(c) {
    var arg = multiArg(c.bits, lb, ub, lengths);
    c.fitness = f(arg);
   };
  }

  function crossover(pop, length, rate, rnd) {
   var n = pop.length;
   var count = ak.floor(n*rate);
   var i, j;

   for(i=1;i<count;i+=2) {
    for(j=0;j<length;++j) {
     if(rnd()<0.5) swapBit(pop[i-1].bits, pop[i].bits, j);
    }
    pop[i-1].fitness = undefined;
    pop[i].fitness = undefined;
   }
  }

  function mutation(pop, length, rate, rnd) {
   var n = pop.length;
   var count = ak.floor(n*length*rate);
   var i, j, locus;

   for(i=0;i<count;++i) {
    j = ak.floor(rnd()*n);
    locus = ak.floor(rnd()*length);
    flipBit(pop[j].bits, locus);
    pop[j].fitness = undefined;
   }
  }

  function evaluation(pop, best, evaluate) {
   var n = pop.length;
   var i;

   for(i=0;i<n;++i) {
    if(ak.nativeType(pop[i].fitness)===ak.UNDEFINED_T) {
     evaluate(pop[i]);
     if(isNaN(pop[i].fitness)) pop[i].fitness = ak.INFINITY;

     if(pop[i].fitness<best.fitness) {
      best.bits = pop[i].bits.slice(0);
      best.fitness = pop[i].fitness;
     }
    }
   }
  }

  function selection(pop, pressure, rnd) {
   var n = pop.length;
   var tmp = new Array(n);
   var i, i0, i1, tmp;

   for(i=0;i<n;++i) {
    i0 = ak.floor(rnd()*n);
    i1 = ak.floor(rnd()*n);

    if(rnd()<pressure) tmp[i] = pop[i0].fitness<pop[i1].fitness ? pop[i0] : pop[i1];
    else               tmp[i] = pop[i0].fitness<pop[i1].fitness ? pop[i1] : pop[i0];
   }

   for(i=0;i<n;++i) {
    pop[i].bits = tmp[i].bits.slice(0);
    pop[i].fitness = tmp[i].fitness;
   }
  }

  function initialise(pop, best, length, evaluate) {
   populate(pop, length);
   evaluate(pop[0]);
   if(isNaN(pop[0].fitness)) pop[0].fitness = ak.INFINITY;

   best.bits = pop[0].bits.slice(0);
   best.fitness = pop[0].fitness;
   evaluation(pop, best, evaluate);
  }

  function generation(pop, best, length, cross, mutate, pressure, evaluate, rnd) {
   crossover(pop, length, cross, rnd);
   mutation(pop, length, mutate, rnd);
   evaluation(pop, best, evaluate);
   selection(pop, pressure, rnd);
  }

  function uniMinimum(f, lb, ub, length, size, cross, mutate, pressure, steps, rnd) {
   var pop, best, evaluate;

   length = ak.floor(Math.abs(length));
   if(!isFinite(lb)) throw new Error('invalid lower bound in ak.geneticMinimum');
   if(ak.nativeType(ub)!==ak.NUMBER_T || !isFinite(ub)) throw new Error('invalid upper bound in ak.geneticMinimum');
   if(!(length<=32)) throw new Error('invalid gene length in ak.geneticMinimum');

   if(size===0 || length===0) return lb;

   pop = new Array(size);
   best = {};
   evaluate = uniEval(f, lb, ub, length);

   initialise(pop, best, length, evaluate);
   while(steps-->0) generation(pop, best, length, cross, mutate, pressure, evaluate, rnd);
   
   if(!isFinite(best.fitness)) evaluate(best);
   return !isNaN(best.fitness) ? uniArg(best.bits, lb, ub, 0, length) : ak.NaN;
  }

  function multiMinimum(f, lb, ub, lengths, size, cross, mutate, pressure, steps, rnd) {
   var n, i, length, pop, best, evaluate;

   if(ak.type(lb)!==ak.VECTOR_T || lb.dims()===0) throw new Error('invalid lower bounds in ak.geneticMinimum');
   if(ak.type(ub)!==ak.VECTOR_T || ub.dims()!==lb.dims()) throw new Error('invalid upper bounds in ak.geneticMinimum');

   lb = lb.toArray();
   ub = ub.toArray();

   n = lb.length;

   if(ak.nativeType(lengths)!==ak.ARRAY_T) {
    length = lengths;
    lengths = new Array(n);
    for(i=0;i<n;++i) lengths[i] = length;
   }
   else if(lengths.length!==n) {
    throw new Error('invalid gene lengths in ak.geneticMinimum');
   }

   length = 0;
   for(i=0;i<n;++i) {
    lengths[i] = ak.floor(Math.abs(lengths[i]));
    if(!isFinite(lb[i])) throw new Error('invalid lower bound in ak.geneticMinimum');
    if(!isFinite(ub[i])) throw new Error('invalid upper bound in ak.geneticMinimum');
    if(!(lengths[i]<=32)) throw new Error('invalid gene length in ak.geneticMinimum');
    length += lengths[i];
   }

   if(size===0 || length===0) return ak.vector(lb);

   pop = new Array(size);
   best = {};
   evaluate = multiEval(f, lb, ub, lengths);

   initialise(pop, best, length, evaluate);
   while(steps-->0) generation(pop, best, length, cross, mutate, pressure, evaluate, rnd);

   if(!isFinite(best.fitness)) evaluate(best);
   return !isNaN(best.fitness) ? multiArg(best.bits, lb, ub, lengths) : ak.vector(n, ak.NaN);
  }

  ak.geneticMinimum = function(f, size, cross, mutate, pressure, steps, rnd) {
   if(ak.nativeType(f)!==ak.FUNCTION_T) throw new Error('invalid function in ak.geneticMinimum');

   size = ak.nativeType(size)===ak.UNDEFINED_T ? 50 : ak.floor(Math.abs(size));
   if(!isFinite(size)) throw new Error('invalid population size in ak.geneticMinimum');

   if(ak.nativeType(cross)===ak.UNDEFINED_T) cross = 0.6;
   else if(ak.nativeType(cross)!==ak.NUMBER_T || !(cross>=0 && cross<=1)) throw new Error('invalid crossover rate in ak.geneticMinimum');

   if(ak.nativeType(mutate)===ak.UNDEFINED_T) mutate = 0.01;
   else if(ak.nativeType(mutate)!==ak.NUMBER_T || !(mutate>=0 && mutate<=1)) throw new Error('invalid mutation rate in ak.geneticMinimum');

   if(ak.nativeType(pressure)===ak.UNDEFINED_T) pressure = 0.75;
   else if(ak.nativeType(pressure)!==ak.NUMBER_T || !(pressure>=0 && pressure<=1)) throw new Error('invalid selection pressure in ak.geneticMinimum');

   steps = ak.nativeType(steps)===ak.UNDEFINED_T ? 100 : ak.floor(Math.abs(steps));
   if(!isFinite(steps)) throw new Error('invalid number of steps in ak.geneticMinimum');

   if(ak.nativeType(rnd)===ak.UNDEFINED_T) rnd = Math.random;
   else if(ak.nativeType(rnd)!==ak.FUNCTION_T) throw new Error('invalid random number generator in ak.geneticMinimum');

   pressure = 0.5*(1+pressure);

   return function(lb, ub, lengths) {
    var minimum = ak.nativeType(lb)===ak.NUMBER_T ? uniMinimum : multiMinimum;
    return minimum(f, lb, ub, lengths, size, cross, mutate, pressure, steps, rnd);
   };
  };
 }

 ak.using(['Matrix/Vector.js', 'Random/WardMoltenoRnd.js'], define);
})();