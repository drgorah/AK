//AK/Complex/FFT.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.fft) return;

  function nextPowerOfTwo(n) {
   var n2 = 1;
   while(n2<n) n2 *= 2;
   return n2;
  }

  function fft(F, F0, f, f0, n, d, sTwoPi) {
   var n2, d2, F1, f1, j, theta, twiddle, F0j, F1j;

   if(n===1) {
    F[F0] = f0<f.length ? ak.complex(f[f0]) : ak.complex(0);
   }
   else {
    n2 = n/2;
    d2 = d*2;
    F1 = F0+n2;
    f1 = f0+d;

    fft(F, F0, f, f0, n2, d2, sTwoPi);
    fft(F, F1, f, f1, n2, d2, sTwoPi);

    for(j=0;j<n2;++j) {
     theta   = sTwoPi * j/n;
     twiddle = ak.complex(Math.cos(theta), Math.sin(theta));

     F0j = F[F0+j];
     F1j = ak.mul(twiddle, F[F1+j]);

     F[F0+j] = ak.add(F0j, F1j);
     F[F1+j] = ak.sub(F0j, F1j);
    }
   }
  }

  ak.fft = function(f) {
   var n = nextPowerOfTwo(f.length);
   var F = new Array(n);

   fft(F, 0, f, 0, n, 1, -2*ak.PI);
   return F;
  };

  ak.fftInv = function(F) {
   var n = nextPowerOfTwo(F.length);
   var f = new Array(n);

   fft(f, 0, F, 0, n, 1, 2*ak.PI);
   f.forEach(function(x, i, f){f[i] = ak.div(x, n);});
   return f;
  };
 }

 ak.using('Complex/Complex.js', define);
})();