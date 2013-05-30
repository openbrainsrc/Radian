// Deal with plot layout and processing for <plot-row>, <plot-col>,
// <plot-grid> and <plot-layout> directives.


// How much relative space a plot takes up in the current layout
// direction is specified as a number or nothing (if the plot will be
// sized according to the average size of plots in the box).
//
// A layout is made up of plots arranged in horizontal boxes and
// vertical boxes.  A single <plot> directive manages its own layout
// (which is trivial).
//
// Within the data structures for managing layouts, individual plots
// are represented by their associated Angular scopes.
//
// If we have some plots, A, B, C, D, which we'll represent by
// $scopeA, $scopeB, etc., then here's how we represent some example
// layouts:
//
//  +---+ +---+
//  | A | | B |    ["hbox", [$scopeA, $scopeB]]
//  +---+ +---+
//
//  +---+
//  | A |          ["vbox", [$scopeA, $scopeB]]
//  +---+
//  +---+
//  | B |
//  +---+
//
//  +---+ +---+
//  | A | | B |    ["vbox", ["hbox", [$scopeA, $scopeB]],
//  +---+ +---+             ["hbox", [$scopeC, $scopeD]]]
//  +---+ +---+
//  | C | | D |
//  +---+ +---+
//
//  +---+ +---+
//  | A | |   |    ["hbox", ["vbox", [$scopeA, $scopeB, $scopeC]],
//  +---+ |   |             $scopeD]
//  +---+ |   |
//  | B | | D |
//  +---+ |   |
//  +---+ |   |
//  | C | |   |
//  +---+ +---+
//
//  +-------+ +----+
//  |       | |    |    ["hbox", [[3, $scopeA], [2, $scopeB]]]
//  |   A   | |  B |
//  |       | |    |
//  +-------+ +----+
//
//  +--------------+    (Here, B is supposed to be a box two rows high.)
//  |      A       |
//  |              |    ["vbox", [[2, $scopeA], [1, $scopeB], [3, $scopeC]]]
//  +--------------+
//  +------B-------+
//  +--------------+
//  +--------------+
//  |              |
//  |              |
//  |      C       |
//  |              |
//  |              |
//  +--------------+
//
// In Haskell, a layout is defined as
//
//   data Layout a = HBox [(a, Layout a)]
//                 | VBox [(a, Layout a)]
//                 | Frame String
//                 deriving (Eq, Show)
//
// where a is a type parameterising the size specifications for the
// individual plots.  As specified by the user, a ~ Maybe (Ratio Int),
// and using Nothing means that a plot should just take up the
// "average" space.  For rendering, the Layout (Maybe (Ratio Int))
// type is transformed into a Layout Int which specifies the actual
// dimensions of the plots.  This transformation is the job of the
// layoutSizes function.


radian.factory('layoutSizes', ['layoutToString', function(layoutToString) {
  'use strict';

  // Determine sizes of frames in a layout.
  return function(w, h, spc, layout)
  {
    // console.log("layoutSizes: w=" + w + " h=" + h + " spc=" + spc +
    //             " layout: " + layoutToString(layout));
    // Fit a range of space parameters into a given size and spacing.
    function fitSizes(w, ws)
    {
      var realw = w - spc * (ws.length - 1);
      var vs = ws.filter(function(x) { return x != null; });
      function sum(a) { return a.reduce(function(a,b) { return a+b; }, 0); };
      var mean = vs.length == 0 ? 1 : sum(vs) / vs.length;
      var realvals = ws.map(function(x) { return x == null ? mean : x; });
      var realtot = sum(realvals);
      var widths = realvals.map(function(x) {
        return Math.floor(x * realw / realtot);
      });
      var wdiff = realw - sum(widths);
      if (wdiff != 0) {
        var outspc = Math.floor(ws.length / wdiff);
        for (var i = 0; i < ws.length; ++i)
          if (i % (outspc + 1) == 0) ++widths[i];
      }
      return widths;
    };

    function help(w, h, layout)
    {
      // console.log("help w=" + w + " h=" + h + " layout: " +
      //             layoutToString(layout));
      if (layout.type == 'plot') return layout;
      function getratios(ls) {
        return ls.map(function(l) { return l.size || null; });
      };
      var sizes =
        fitSizes(layout.type == 'hbox' ? w : h, getratios(layout.items));
      var outitems = [];
      for (var i = 0; i < layout.items.length; ++i) {
        if (layout.type == 'hbox')
          outitems[i] = { size: sizes[i],
                          item: help(sizes[i], h, layout.items[i].item) };
        else
          outitems[i] = { size: sizes[i],
                          item: help(w, sizes[i], layout.items[i].item) };
      }
      return { type: layout.type, items: outitems };
    };

    var sub = help(w, h, layout);
    if (layout.type == 'hbox')
      return { type: 'vbox', items: [{ size: h, item: sub }] };
    else if (layout.type == 'vbox')
      return { type: 'hbox', items: [{ size: w, item: sub }] };
    else
      return { type:'hbox',
               items: [{ size: w, item: { type: 'vbox', items: sub }}]};
  };
}]);


radian.directive('plotRow',
 ['layoutSizes', 'processAttrs', 'calcPlotDimensions', 'layoutToString',
  function(layoutSizes, processAttrs, calcPlotDimensions, layoutToString)
{
  'use strict';

  function preLink(sc, elm, as, transclude) {
    processAttrs(sc, as);
    // console.log("<plot-row> preLink: scope, as");
    // console.log(sc);
    // console.log(as);
    if (!sc.inLayout) {
      calcPlotDimensions(sc, elm, as);
      sc.layoutTop = true;
      sc.inLayout = true;
    }
    sc.layoutItems = [];
    sc.addToLayout = function(sublayout, size) {
      if (sublayout.hasOwnProperty('$id'))
        sc.layoutItems.push({ size: Number(size),
                              item: { type: 'plot', items: sublayout } });
      else
        sc.layoutItems.push({ size: Number(size), item: sublayout });
    };
    transclude(sc.$new(), function (cl) { elm.append(cl); });
  };

  function postLink(sc, elm) {
    // console.log("<plot-row> postLink: scope");
    // console.log(sc);
    var row = { type: 'hbox', items: sc.layoutItems };
    if (sc.hasOwnProperty('layoutTop')) {
      console.log("Top-level <plot-row> postLink: scope");
//      console.log(sc);
      console.log("row: " + layoutToString(row));
      var spacing = sc.layoutSpacing || 0;
      var layedout = layoutSizes(sc.width, sc.height, spacing, row);
//      console.log(layedout);
      console.log("layedout: " + layoutToString(layedout));
    } else sc.$parent.addToLayout(row, sc.layoutShare);
  };

  return {
    restrict: 'E',
    template:
    ['<div class="radian-row">',
     '</div>'].join(""),
    replace: true,
    transclude: true,
    scope: true,
    compile: function(elm, as, trans) {
      return { pre: function(s, e, a) { preLink(s, e, a, trans); },
               post: postLink };
    }
  };
}]);


radian.directive('plotCol',
 ['layoutSizes', 'processAttrs', 'calcPlotDimensions', 'layoutToString',
  function(layoutSizes, processAttrs, calcPlotDimensions, layoutToString)
{
  'use strict';

  function preLink(sc, elm, as, transclude) {
    processAttrs(sc, as);
    // console.log("<plot-col> preLink: scope, as");
    // console.log(sc);
    // console.log(as);
    if (!sc.inLayout) {
      calcPlotDimensions(sc, elm, as);
      sc.layoutTop = true;
      sc.inLayout = true;
    }
    sc.layoutItems = [];
    sc.addToLayout = function(sublayout, size) {
      if (sublayout.hasOwnProperty('$id'))
        sc.layoutItems.push({ size: Number(size),
                              item: { type: 'plot', items: sublayout } });
      else
        sc.layoutItems.push({ size: Number(size), item: sublayout });
    };
    transclude(sc.$new(), function (cl) { elm.append(cl); });
  };

  function postLink(sc, elm) {
    // console.log("<plot-col> postLink: scope");
    // console.log(sc);
    var col = { type: 'vbox', items: sc.layoutItems };
    if (sc.hasOwnProperty('layoutTop')) {
      console.log("Top-level <plot-col> postLink: scope");
//      console.log(sc);
      console.log("col: " + layoutToString(col));
      var spacing = sc.layoutSpacing || 0;
      var layedout = layoutSizes(sc.width, sc.height, spacing, col);
//      console.log(layedout);
      console.log("layedout: " + layoutToString(layedout));
    } else sc.$parent.addToLayout(col, sc.layoutShare);
  };

  return {
    restrict: 'E',
    template:
    ['<div class="radian-col">',
     '</div>'].join(""),
    replace: true,
    transclude: true,
    scope: true,
    compile: function(elm, as, trans) {
      return { pre: function(s, e, a) { preLink(s, e, a, trans); },
               post: postLink };
    }
  };
}]);


radian.factory('layoutToString', function() {
  'use strict';

  return function(layout) {
    function fixplots(lay) {
      switch (lay.type) {
      case 'plot': return { type: 'plot', items: lay.items.$id };
      default: return { type: lay.type, items: lay.items.map(function(i) {
        return { size: i.size, item: fixplots(i.item) };
      }) };
      }
    };
    return JSON.stringify(fixplots(layout));
  };
});
