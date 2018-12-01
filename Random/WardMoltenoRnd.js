//AK/Random/WardMoltenoRnd.js

//Copyright Richard Harris 2015.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.wardMoltenoRnd) return;

  ak.wardMolteno8Rnd    = function(seed) {return ak.galoisRnd(   8, [   4,    5,    6], seed);};
  ak.wardMolteno16Rnd   = function(seed) {return ak.galoisRnd(  16, [  11,   13,   14], seed);};
  ak.wardMolteno32Rnd   = function(seed) {return ak.galoisRnd(  32, [  25,   26,   30], seed);};
  ak.wardMolteno64Rnd   = function(seed) {return ak.galoisRnd(  64, [  60,   61,   63], seed);};
  ak.wardMolteno128Rnd  = function(seed) {return ak.galoisRnd( 128, [ 121,  126,  127], seed);};
  ak.wardMolteno256Rnd  = function(seed) {return ak.galoisRnd( 256, [ 246,  251,  254], seed);};
  ak.wardMolteno512Rnd  = function(seed) {return ak.galoisRnd( 512, [ 504,  507,  510], seed);};
  ak.wardMolteno1024Rnd = function(seed) {return ak.galoisRnd(1024, [1001, 1002, 1015], seed);};
  ak.wardMolteno2048Rnd = function(seed) {return ak.galoisRnd(2048, [2029, 2034, 2035], seed);};
  ak.wardMolteno4096Rnd = function(seed) {return ak.galoisRnd(4096, [4069, 4081, 4095], seed);};

  ak.wardMoltenoRnd = ak.wardMolteno4096Rnd;
 }

 ak.using('Random/GaloisRnd.js', define);
})();
