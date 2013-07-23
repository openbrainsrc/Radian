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
      if (layout.type == 'plot' || layout.type == 'empty') return layout;
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

radian.factory('addToLayout', function()
{
  return function(sc, sublayout, size) {
    if (sublayout.hasOwnProperty('$id'))
      sc.layoutItems.push({ size: size != null ? Number(size) : null,
                            item: { type: 'plot', items: sublayout } });
    else
      sc.layoutItems.push({ size: size != null ? Number(size) : null,
                            item: sublayout });
  };
});

radian.factory('extractFrames',
 ['layoutToString',
  function(layoutToString)
{
  // A "frame" is an object of the form { x, y, w, h, plot }, where
  // plot points to the plot scope.
  return function(spc, w, h, layout) {
    function go(curx, cury, curw, curh, lay) {
      var frames = [];
      if (lay.type == 'hbox') {
        for (var i = 0; i < lay.items.length; ++i) {
          var item = lay.items[i].item;
          var itype = lay.items[i].item.type;
          var isize = lay.items[i].size;
          if (item.type == 'plot') {
            frames.push({ x: curx, y: cury, w: isize, h: curh,
                          plot: item.items });
          } else if (item.type == 'vbox') {
            frames = frames.concat(go(curx, cury, isize, curh, item));
          }
          curx += isize + spc;
        }
      } else if (lay.type == 'vbox') {
        for (var i = 0; i < lay.items.length; ++i) {
          var item = lay.items[i].item;
          var itype = lay.items[i].item.type;
          var isize = lay.items[i].size;
          if (item.type == 'plot') {
            frames.push({ x: curx, y: cury, w: curw, h: isize,
                          plot: item.items });
          } else if (item.type == 'hbox') {
            frames = frames.concat(go(curx, cury, curw, isize, item));
          }
          cury += isize + spc;
        }
      } else throw Error("invalid layout passed to extractFrames");
      return frames;
    };
    return go(0, 0, w, h, layout);
  };
}]);

radian.factory('layoutDirective',
 ['layoutSizes', 'processAttrs', 'calcPlotDimensions',
  'addToLayout', 'extractFrames', 'layoutToString',
  function(layoutSizes, processAttrs, calcPlotDimensions,
           addToLayout, extractFrames, layoutToString)
{
  'use strict';

  return function(container) {
    function preLink(sc, elm, as, transclude) {
      processAttrs(sc, as);
      if (!sc.inLayout) {
        sc.layoutTop = true;
        sc.inLayout = true;
        if (!sc.inStack) calcPlotDimensions(sc, elm, as);
        $(elm).css('width', sc.width).css('height', sc.height);
        sc.layoutsvg = elm.children()[0];
      } else
        $(elm.children()[1]).remove();
      sc.layoutItems = [];
      transclude(sc.$new(), function (cl) { elm.append(cl); });
    };

    function postLink(sc, elm) {
      var items = { type: container, items: sc.layoutItems };
      if (sc.hasOwnProperty('layoutTop')) {
        var spacing = sc.spacing || 0;
        var layedout = layoutSizes(sc.width, sc.height, spacing, items);
        var frames = extractFrames(0, sc.width, sc.height, layedout);
        if (sc.hasOwnProperty('title')) items.title = sc.title;
        frames.forEach(function(fr) {
          fr.plot.width = fr.w;
          fr.plot.height = fr.h;
          fr.plot.svg = d3.select(sc.layoutsvg).append('g')
            .attr('width', fr.w).attr('height', fr.h)
            .attr('transform', 'translate(' + fr.x + ',' + fr.y + ')')[0][0];
        });
      }
      if (!sc.hasOwnProperty('layoutTop') || sc.inStack)
        addToLayout(sc.$parent, items, sc.layoutShare);
    };

    return {
      restrict: 'E',
      template: '<div class="radian"><svg></svg></div>',
      replace: true,
      transclude: true,
      scope: true,
      compile: function(elm, as, trans) {
        return { pre: function(s, e, a) { preLink(s, e, a, trans); },
                 post: postLink };
      }
    };
  };
}]);

radian.directive('plotRow', ['layoutDirective', function(layoutDirective)
{
  return layoutDirective('hbox');
}]);

radian.directive('plotCol', ['layoutDirective', function(layoutDirective)
{
  return layoutDirective('vbox');
}]);

radian.directive('plotGrid',
 ['layoutSizes', 'processAttrs', 'calcPlotDimensions',
  'addToLayout', 'extractFrames', 'layoutToString',
  function(layoutSizes, processAttrs, calcPlotDimensions,
           addToLayout, extractFrames, layoutToString)
{
  'use strict';

  function preLink(sc, elm, as, transclude) {
    processAttrs(sc, as);
    if (!sc.inLayout) {
      sc.layoutTop = true;
      sc.inLayout = true;
      if (!sc.inStack) calcPlotDimensions(sc, elm, as);
      $(elm).css('width', sc.width).css('height', sc.height);
      sc.layoutsvg = elm.children()[0];
    } else
      $(elm.children()[1]).remove();
    sc.layoutItems = [];
    transclude(sc.$new(), function (cl) { elm.append(cl); });
  };

  function postLink(sc, elm) {
    var nrows = sc.rows || Math.floor(Math.sqrt(sc.layoutItems.length));
    var ncols = sc.cols || Math.ceil(sc.layoutItems.length / nrows);
    var rows = [];
    var i = 0;
    for (var r = 0; r < nrows; ++r) {
      var cols = [];
      for (var c = 0; c < ncols; ++c) {
        if (i >= sc.layoutItems.length)
          cols.push({ size: null, item: { type: 'empty' } });
        else
          cols.push(sc.layoutItems[i++]);
      }
      rows.push({ size: null, item: { type: 'hbox', items: cols } });
    }
    var items = { type: 'vbox', items: rows };
    if (sc.hasOwnProperty('layoutTop')) {
      var spacing = sc.spacing || 0;
      var layedout = layoutSizes(sc.width, sc.height, spacing, items);
      var frames = extractFrames(0, sc.width, sc.height, layedout);
      if (sc.hasOwnProperty('title')) items.title = sc.title;
      frames.forEach(function(fr) {
        fr.plot.width = fr.w;
        fr.plot.height = fr.h;
        fr.plot.svg = d3.select(sc.layoutsvg).append('g')
          .attr('width', fr.w).attr('height', fr.h)
          .attr('transform', 'translate(' + fr.x + ',' + fr.y + ')')[0][0];
      });
    }
    if (!sc.hasOwnProperty('layoutTop') || sc.inStack)
      addToLayout(sc.$parent, items, sc.layoutShare);
  };

  return {
    restrict: 'E',
    template: '<div class="radian"><svg></svg></div>',
    replace: true,
    transclude: true,
    scope: true,
    compile: function(elm, as, trans) {
      return { pre: function(s, e, a) { preLink(s, e, a, trans); },
               post: postLink };
    }
  };
}]);


radian.directive('plotStack',
 ['$rootScope', 'layoutSizes', 'processAttrs', 'calcPlotDimensions',
  'addToLayout', 'extractFrames', 'layoutToString',
  function($rootScope, layoutSizes, processAttrs, calcPlotDimensions,
           addToLayout, extractFrames, layoutToString)
{
  'use strict';

  function preLink(sc, elm, as, transclude) {
    processAttrs(sc, as);
    if (sc.inLayout)
      throw Error("<plot-stack> cannot appear inside other layout directives");
    if (!sc.inStack) calcPlotDimensions(sc, elm, as);
    if (sc.inStack) addToLayout(sc.$parent, { type: 'stack', items: sc }, null);
    sc.inStack = true;
    sc.layoutItems = [];
    if (!$rootScope.radianNavIDs) $rootScope.radianNavIDs = { };
    transclude(sc.$new(), function (cl) {
      elm.append('<div class="tab-content radian-tabs"></div>');
      var tabs = elm.children(0);
      tabs.append(cl);
      sc.ids = [];
      cl.filter('div.radian,div.radian-stack').each(function(i) {
        var idx = 0, tabid;
        do {
          ++idx;
          tabid = 'tab' + idx + '_' + i;
        } while ($rootScope.radianNavIDs[tabid]);
        sc.ids.push(tabid);
        $rootScope.radianNavIDs[tabid] = 1;
        var cls = i == 0 ? 'tab-pane active' : 'tab-pane';
        $(this).wrap('<div class="' + cls + '" id="' + tabid + '"></div>');
      });
    });
  };

  function postLink(sc, elm) {
    var is = sc.layoutItems;
    elm.prepend('<ul class="nav nav-tabs"></ul>');
    var nav = elm.children('ul');
    for (var i = 0; i < is.length; ++i) {
      var it = is[i].item;
      var t = it.title ? it.title :
        (it.items.title ? it.items.title : 'Tab ' + (i+1));
      var link = '<a href="#' + sc.ids[i] + '" data-toggle="tab">' + t + '</a>';
      var active = i == 0 ? ' class="active"' : '';
      nav.append('<li' + active + '>' + link + '</li>');
    }
  };

  return {
    restrict: 'E',
    template: '<div class="radian-stack"></div>',
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
      case 'empty': return { type: 'empty' };
      case 'plot': return { type: 'plot', items: lay.items.$id };
      default: return { type: lay.type, items: lay.items.map(function(i) {
        return { size: i.size, item: fixplots(i.item) };
      }) };
      }
    };
    return JSON.stringify(fixplots(layout));
  };
});
