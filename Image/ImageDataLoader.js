//AK/Image/ImageDataLoader.js

//Copyright Richard Harris 2014.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

//Use of this code for anything other than illustrative purposes is discouraged.

"use strict";

(function() {
 function define() {
  if(ak.imageDataLoader) return;

  function imageDataLoader(i, images, f) {
   var img, canvas, ctx;

   if(i<images.length) {
    img = document.createElement('img');
    img.src = images[i];
    images[i] = img;

    img.onerror = function() {images[i]=undefined; imageDataLoader(i+1, images, f);};
    img.onload  = function() {imageDataLoader(i+1, images, f);};
   }
   else {
    canvas = document.createElement('canvas');
    for(i=0;i<images.length;++i) {
     if(images[i]) {
      canvas.width  = images[i].naturalWidth;
      canvas.height = images[i].naturalHeight;

      ctx = canvas.getContext('2d');
      ctx.drawImage(images[i], 0, 0);

      try      {images[i] = ctx.getImageData(0, 0, canvas.width, canvas.height);}
      catch(e) {images[i] = undefined;}
     }
    }
    f(images);
   }
  }

  ak.imageDataLoader = function(images, f) {
   if(ak.nativeType(images)!==ak.ARRAY_T) images = [images];
   else images = images.slice(0);

   imageDataLoader(0, images, f);
  };
 }

 ak.using('', define);
})();