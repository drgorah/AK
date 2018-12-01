//AK/Image/ImageDataMatrix.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.imageDataToMatrix) return;

  ak.imageDataToMatrix = function(img) {
   var rows = img.height;
   var cols = img.width;
   var data = img.data;
   var arr = new Array(rows);
   var i, r, c, row, x;

   i = 0;
   for(r=0;r<rows;++r) {
    row = new Array(cols);
    for(c=0;c<cols;++c) {
     x  = data[i++];
     x += data[i++];
     x += data[i++];
     x *= data[i++]/255;

     row[c] = x/765;
    }
    arr[r] = row;
   }
   return ak.matrix(arr);
  };

  ak.matrixToImageData = function(matrix, max, min) {
   var canvas = document.createElement('canvas');
   var rows, cols, arr, img, data;
   var s, arr, i, r, c, row, x;

   if(ak.nativeType(max)===ak.UNDEFINED_T) max = 1.0;
   if(ak.nativeType(min)===ak.UNDEFINED_T) min = 0.0;
   s = 1/(max-min);

   if(!isFinite(s) || s<=0) throw new Error('invalid range in ak.matrixToImageData');
   if(ak.type(matrix)!==ak.MATRIX_T) throw new Error('invalid matrix in ak.matrixToImageData');

   rows = matrix.rows();
   cols = matrix.cols();
   arr  = matrix.toArray();

   img  = canvas.getContext('2d').createImageData(cols, rows);
   data = img.data;

   i = 0;
   for(r=0;r<rows;++r) {
    row = arr[r];
    for(c=0;c<cols;++c) {

     x = Math.min(Math.max((row[c]-min)*s, 0), 1);
     x = Math.round(x*255);

     data[i++] = x;
     data[i++] = x;
     data[i++] = x;
     data[i++] = 255;
    }
   }
   return img;
  };
 }

 ak.using('Matrix/Matrix.js', define);
})();