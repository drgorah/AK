//AK/Random/GaloisRnd.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.galoisRnd) return;

  var TWO_P32 = Math.pow(2, 32);

  function smallMask(bits, taps) {
   var mask = 0;
   var n = taps.length;
   var i;

   for(i=0;i<n;++i) mask |= 1<<(taps[i]-1);
   mask |= 1<<(bits-1);
   return mask;
  }

  function smallRnd(bits, taps, seed) {
   var state = ak.floor((Math.pow(2, bits)-1)*ak.ranfRnd(seed)())+1;
   var mask = smallMask(bits, taps);

   return function() {
    var b = state&0x01;
    state >>>= 1;
    if(b) state ^= mask;
    return b;
   };
  }

  function bigMask(bits, taps) {
   var words = ak.ceil(bits/32);
   var mask = [];
   var curr = {};
   var n = taps.length;
   var tap = taps[0]-1;
   var i, pos;

   curr.pos = ak.floor(tap/32);
   curr.bits = 1<<(tap%32);
   mask.push(curr);

   for(i=1;i<n;++i) {
    tap = taps[i]-1;
    pos = ak.floor(tap/32);

    if(pos === curr.pos) {
     curr.bits |= 1<<(tap%32);
    }
    else {
     curr = {};
     curr.pos = pos;
     curr.bits = 1<<(tap%32);
     mask.push(curr);
    }
   }

   if(curr.pos<words-1) {
    curr = {};
    curr.pos = words-1;
    curr.bits = 0;
    mask.push(curr);
   }
   curr.bits |= 1<<((bits-1)%32);

   return mask.length > 1 ? mask : mask[0].bits;
  }

  function bigMaskRnd(state, mask) {
   var words = state.length;
   var masks = mask.length;

   return function() {
    var b = state[0]&0x01;
    var i;

    state[0] >>>= 1;
    for(i=1;i<words;++i) {
     state[i-1] |= (state[i]&0x01)<<31;
     state[i] >>>= 1;
    }

    if(b) for(i=0;i<masks;++i) state[mask[i].pos] ^= mask[i].bits;
    return b;
   };
  }

  function smallMaskRnd(state, mask) {
   var words = state.length;

   return function() {
    var b = state[0]&0x01;
    var i;

    state[0] >>>= 1;
    for(i=1;i<words;++i) {
     state[i-1] |= (state[i]&0x01)<<31;
     state[i] >>>= 1;
    }

    if(b) state[words-1] ^= mask;
    return b;
   };
  }

  function bigRnd(bits, taps, seed) {
   var words = ak.ceil(bits/32);
   var rnd = ak.ranfRnd(seed);
   var state = new Array(words);
   var mask = bigMask(bits, taps);
   var i;

   state[0] = ak.floor((TWO_P32-1) * rnd())+1;
   for(i=1;i<words-1;++i) state[i] = ak.floor(TWO_P32 * rnd());
   state[words-1] = ak.floor(Math.pow(2, bits%32) * rnd());

   return ak.nativeType(mask)===ak.ARRAY_T ? bigMaskRnd(state, mask) : smallMaskRnd(state, mask);
  }

  ak.galoisRnd = function(bits, taps, seed) {
   var n, i;

   if(ak.nativeType(bits)!==ak.NUMBER_T) throw new Error('non-numeric bit count in ak.galoisRnd');
   if(!isFinite(bits) || bits<2 || bits!==ak.floor(bits)) throw new Error('invalid bit count in ak.galoisRnd');

   if(ak.nativeType(taps)===ak.NUMBER_T) taps = [taps];
   if(ak.nativeType(taps)!==ak.ARRAY_T || taps.length===0) throw new Error('invalid taps in ak.galoisRnd');

   n = taps.length;
   taps = taps.slice(0);
   taps.sort(function(a,b){return a-b;});

   if(taps[0]<1 || taps[n-1]>bits) throw new Error('invalid tap in ak.galoisRnd');

   for(i=0;i<n;++i) {
    if(ak.nativeType(taps[i])!==ak.NUMBER_T) throw new Error('non-numeric tap in ak.galoisRnd');
    if(taps[i]!==ak.floor(taps[i])) throw new Error('invalid tap in ak.galoisRnd');
    if(i>0 && taps[i]===taps[i-1]) throw new Error('repeated tap in ak.galoisRnd');
   }

   return bits<=32 ? smallRnd(bits, taps, seed) : bigRnd(bits, taps, seed);
  };
 }

 ak.using('Random/RANFRnd.js', define);
})();
