//AK/Random/MTRnd.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.mtRnd) return;

  var TWO_P16 = Math.pow(2,  16);
  var TWO_P32 = Math.pow(2,  32);
  var TWO_M32 = Math.pow(2, -32);

  var N = 624;
  var M = 397;

  var MA = 0x9908b0df;

  var A  = 1812433253;
  var AL = A&0xffff;
  var AH = A>>>16;

  var B  = 1566083941;
  var BL = B&0xffff;
  var BH = B>>>16;

  var C = 1664525;

  var seedMT = {};

  seedMT[ak.ARRAY_T] = function(s, mt) {
   var n = s.length;
   var i = 1;
   var j = 0;
   var k, x, xl, xh;

   if(n===0) throw new Error('empty seed in ak.mtRnd');

   for(k=0;k<n;++k) {
    if(ak.nativeType(s[k])!==ak.NUMBER_T) throw new Error('non-numeric seed in ak.mtRnd');
    if(!isFinite(s[k]) || s[k]<0 || s[k]!=ak.floor(s[k])) throw new Error('invalid seed in ak.mtRnd');
    s[k] %= TWO_P32;
   }

   seedMT[ak.NUMBER_T](19650218, mt);

   for(k=Math.max(n, N);k>0;--k) {
    x = mt[i-1] ^ (mt[i-1]>>>30);
    mt[i] = (x>=0 ? (mt[i] ^ (x*C)) : (mt[i] ^ ((x+TWO_P32)*C))) + s[j] + j;

    if(++i===N) {mt[0] = mt[N-1]; i=1;}
    if(++j===n) j=0;
   }

   for(k=N-1;k>0;--k) {
    x  = mt[i-1] ^ (mt[i-1]>>>30);
    xl = x&0xffff;
    xh = x>>>16;

    mt[i] = (mt[i] ^ ((BH*xl+BL*xh)*TWO_P16 + BL*xl)) + TWO_P32-i;

    if(++i===N) {mt[0] = mt[N-1]; i=1;}
   }
   mt[0] = 0x80000000;
  };

  seedMT[ak.NUMBER_T] = function(s, mt) {
   var i, x, xl, xh;

   if(!isFinite(s) || s<0 || s!=ak.floor(s)) throw new Error('invalid seed in ak.mtRnd');

   mt[0]= s%TWO_P32;
   for (i=1;i<N;++i) {
    x  = mt[i-1] ^ (mt[i-1]>>>30);
    xl = x&0xffff;
    xh = x>>>16;

    mt[i] = (AH*xl+AL*xh)*TWO_P16 + AL*xl + i;
   }
  };

  seedMT[ak.UNDEFINED_T] = function(s, mt) {
   seedMT[ak.NUMBER_T](ak.floor(Math.random()*TWO_P32), mt);
  };

  function fillMT(mt) {
   var k, y;

   for(k=0;k<N-M;++k) {
    y = (mt[k+1]&0x7fffffff) | (mt[k]&0x80000000);
    mt[k] = y&0x01 ? mt[k+M] ^ (y>>>1) ^ MA : mt[k+M] ^ (y>>>1);
   }
   for(;k<N-1;++k) {
    y = (mt[k+1]&0x7fffffff) | (mt[k]&0x80000000);
    mt[k] = y&0x01 ? mt[k+M-N] ^ (y>>>1) ^ MA : mt[k+M-N] ^ (y>>>1);
   }
   y = (mt[0]&0x7fffffff) | (mt[N-1]&0x80000000);
   mt[N-1] = y&0x01 ? mt[M-1] ^ (y>>>1) ^ MA : mt[M-1] ^ (y>>>1);
  }

  ak.mtRnd = function(s) {
   var mt = new Array(N);
   var i = N;
   var y;

   seedMT[ak.nativeType(s)](s, mt);

   return function() {
    if(i===N) {
     fillMT(mt);
     i = 0;
    }

    y = mt[i++];
    y ^= y>>>11;
    y ^= (y<<7) & 0x9d2c5680;
    y ^= (y<<15) & 0xefc60000;
    y ^= y>>>18;

    return y<0 ? y*TWO_M32+1 : y*TWO_M32;
   };
  };
 }

 ak.using('', define);
})();

/*
Derived from the C reference implementation (http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/CODES/mt19937ar.c) released under the terms:

   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.                          

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.

     3. The names of its contributors may not be used to endorse or promote 
        products derived from this software without specific prior written 
        permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/