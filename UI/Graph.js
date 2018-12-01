//AK/UI/Graph.js

//Copyright Richard Harris 2013.
//Distributed under the Boost Software License, Version 1.0.
//(See accompanying file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

"use strict";

(function() {
 function define() {
  if(ak.ui.graph) return;

  ak.ui.graph = function(out, options) {
   var g = ak.ui.chart(out, options);

   g.recreate = function() {return ak.ui.graph(out, options);};
   g.plot     = function(xys, options) {g.path(xys.map(g.toCR), options);};

   return g;
  }
 }

 ak.using('UI/Chart.js', define);
})();
