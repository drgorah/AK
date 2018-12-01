//AK/UI/Console.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

"use strict";

(function() {
 function define() {
  if(ak.ui.console) return;

  ak.ui.console = function(out) {
   var c = {};

   c.elem     = function()    {return out;};
   c.active   = function()    {return out && out.select;};
   c.clear    = function()    {out.value='';};
   c.reset    = function()    {out.value='';};
   c.recreate = function()    {return ak.ui.console(out);};
   c.error    = function(err) {c.writeln(err.name + ': ' + err.message);};

   c.write   = function() {out.value+=Array.prototype.join.call(arguments, ''); out.scrollTop=out.scrollHeight;};
   c.writeln = function() {c.write(Array.prototype.join.call(arguments, ''), '\n');};

   return c;
  }
 }

 ak.using('UI/AKUI.js', define);
})();
