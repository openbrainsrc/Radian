// Process attributes for plot directives.  All attributes, except for
// a small number of special cases (ID, CLASS, NG-*) are added as
// Angular scope variables, along with some extra information about
// the free variables and the original expression for the attribute.
// Changes to the attribute value are processed by re-evaluation using
// $observe and changes to free variables in the Radian expression are
// processed using a (slightly complicated) setup of scope.$watch
// listeners.

radian.factory('processAttrs', ['radianEval', function(radianEval) {
  'use strict';

  return function(scope, as) {
    scope.$$radianVars = { };
    Object.keys(as).forEach(function(a) {
      // Skip the specials.
      if (a == "id" || a == "class" || a.charAt(0) == "$" ||
          a.search(/^ng[A-Z]/) != -1) return;

      // Passing the true flag to radianEval gets us the free
      // variables in the expression as well as the current expression
      // value.
      var val = radianEval(scope, as[a], true, true);

      // Record the original expression and its free variables and set
      // the value of the scope variable.
      scope.$$radianVars[a] = { fvs: val[1], expr: as[a] };
      scope[a] = val[0];

      // Set up watchers for each of the free variables in the
      // expression.  When these watchers are triggered, they just
      // re-evaluate the expression for the attribute using its
      // original textual form.  We keep track of the return values
      // from the calls to scope.$watch so that we can cancel these
      // watches later if the free variables change.
      var entry = scope.$$radianVars[a];
      entry.fvwatchers = { };
      entry.fvs.forEach(function(v) {
        entry.fvwatchers[v] = scope.$watch(v, function(n, o) {
          if (n == undefined || n == o && typeof n != 'function') return;
          scope[a] = radianEval(scope, entry.expr);
        }, true);
      });

      // Observe the value of the attribute: if the value (i.e. the
      // expression) changes, we pull in the new expression,
      // re-evaluate and rearrange the free variable watchers.
      as.$observe(a, function(v) {
        entry.expr = v;
        try {
          var val = radianEval(scope, v, true);
          scope[a] = val[0];
          entry.fvs = val[1];
          Object.keys(entry.fvwatchers).forEach(function(v) {
            // The new free variables are already in entry.fvs.  If
            // this one isn't in there, deregister the watch and
            // remove it.
            if (entry.fvs.indexOf(v) == -1) {
              entry.fvwatchers[v]();
              delete entry.fvwatchers[v];
            }
          });
          // Add watchers for any new free variables.
          entry.fvs.forEach(function(v) {
            if (!entry.fvwatchers[v])
              entry.fvwatchers[v] = scope.$watch(v, function() {
                scope[a] = radianEval(scope, entry.expr);
              }, true);
          });
        } catch (e) {
          console.log("Exception in radianEval watcher.  Skipping...");
        }});
    });
  };
}]);


// Deal with plot dimension attributes: explicit attribute values
// override CSS values.  Do sensible things with width, height and
// aspect ratio.  This is called either for individual plots, or for
// the outermost plot layout directive (<plot-row>, <plot-col> or
// <plot-grid>).

radian.factory('calcPlotDimensions', function() {
  return function(scope, elm, as) {
    var h = 300, asp = 1.618, w = asp * h;
    var aw = as.width, ah = as.height, aasp = as.aspect;
    var cw = elm.width(), ch = elm.height();
    var casp = elm.css('aspect') ? parseFloat(elm.css('aspect')) : null;
    if (aw && ah && aasp || ah && aw) { h = ah; w = aw; asp = w / h; }
    else if (ah && aasp) { h = ah; asp = aasp; w = h * asp; }
    else if (aw && aasp) { w = aw; asp = aasp; h = w / asp; }
    else if (ah) {
      h = ah;
      if (cw) { w = cw; asp = w / h; }
      else if (casp) { asp = casp; w = h * asp; }
      else { w = h * asp; }
    } else if (aw) {
      w = aw;
      if (ch) { h = ch; asp = w / h; }
      else if (casp) { asp = casp; h = w / asp; }
      else { h = w / asp; }
    } else if (aasp) {
      asp = aasp;
      if (cw) { w = cw; h = w / asp; }
      else if (ch) { h = ch; w = h * asp; }
      else { w = h * asp; }
    } else if (ch && cw) { h = ch; w = cw; asp = w / h; }
    else if (ch && casp) { h = ch; asp = casp; w = h * asp; }
    else if (cw && casp) { w = cw; asp = casp; h = w / asp; }
    else if (ch) { h = ch; w = h * asp; }
    else if (cw) { w = cw; h = w / asp; }
    else if (casp) { asp = casp; h = w / asp; }
    scope.width = Number(w); scope.height = Number(h);
  };
});

// Main plot directive.  Kind of complicated...

radian.directive('plot',
 ['processAttrs', 'calcPlotDimensions', 'addToLayout',
  '$timeout', '$rootScope', 'dumpScope', 'dft',
  'radianLegend', 'radianAxisSwitch', 'plotLib',
 function(processAttrs, calcPlotDimensions, addToLayout,
          $timeout, $rootScope, dumpScope, dft,
          radianLegend, radianAxisSwitch, lib)
{
  'use strict';

  // ID generator for plots.
  var plotidgen = 0;

  // We do setup work here so that we can organise things before the
  // transcluded plotting directives are linked.
  function preLink(scope, elm, as, transclude) {
    // Process attributes, bringing all but a few special cases into
    // Angular scope as regular variables (to be use in data access
    // expressions).
    processAttrs(scope, as);
    scope.plotid = ++plotidgen;
    if (!scope.inLayout) {
      scope.layoutTop = true;
      if (!scope.inStack) calcPlotDimensions(scope, elm, as)
      $(elm).css('width', scope.width).css('height', scope.height);
      scope.topLevel = elm[0];
      scope.svg = elm.children()[0];
    } else
      $(elm.children()[0]).remove();
    if (scope.inLayout || scope.inStack)
      addToLayout(scope, scope, scope.layoutShare);
    if (as.hasOwnProperty('strokeSwitch')) scope.strokesel = 0;

    // Font attributes.
    scope.fontSize = Number(as.fontSize) || 12;
    scope.titleFontSize = 1.25 * scope.fontSize;
    if (as.titleFontSize) {
      if (as.titleFontSize.indexOf('%') != -1)
        scope.titleFontSize =
        parseFloat(as.titleFontSize) / 100.0 * scope.fontSize;
      else if (as.titleFontSize.indexOf('.') != -1)
        scope.titleFontSize = Number(as.titleFontSize) * scope.fontSize;
      else
        scope.titleFontSize = Number(as.titleFontSize) || 1.25 * scope.fontSize;
    }
    scope.fontFamily = as.fontFamily || null;
    scope.fontStyle = as.fontStyle || null;
    scope.fontWeight = as.fontWeight || null;
    scope.fontVariant = as.fontVariant || null;
    scope.titleFontFamily = as.titleFontFamily || scope.fontFamily;
    scope.titleFontStyle = as.titleFontStyle || scope.fontStyle;
    scope.titleFontWeight = as.titleFontWeight || 'bold';
    scope.titleFontVariant = as.titleFontVariant || scope.fontVariant;

    // Set up view list and function for child elements to add plots.
    scope.views = [];
    scope.nplots = 0;
    scope.switchable = [];
    function ancestor(ances, desc) {
      if (ances == desc) return true;
      if (desc == $rootScope) return false;
      return ancestor(ances, desc.$parent);
    };
    scope.addPlot = function(s) {
      ++scope.nplots;
      if (scope.hasOwnProperty('legendSwitches')) scope.switchable.push(s);
      s.enabled = true;
      scope.$emit('dataChange');
      s.$on('$destroy', function(e) {
        if (ancestor(e.targetScope, s)) {
          --scope.nplots;
          s.enabled = false;
          var idx = scope.switchable.indexOf(s);
          if (idx != -1) scope.switchable.splice(idx, 1);
          scope.$emit('dataChange');
        }
      });
    };

    transclude(scope.$new(), function (cl) { elm.append(cl); });
  };

  // We do the actual plotting after the transcluded plot type
  // elements are linked.
  function postLink(scope, elm) {
    var viewgroups = [];
    var setupBrush = null;
    scope.rangeExtendPixels = function(x, y) {
      if (x != null)
        scope.rangeXExtendPixels =
          [Math.max(scope.rangeXExtendPixels[0], x[0]),
           Math.max(scope.rangeXExtendPixels[1], x[1])];
      if (y != null)
        scope.rangeYExtendPixels =
          [Math.max(scope.rangeYExtendPixels[0], y[0]),
           Math.max(scope.rangeYExtendPixels[1], y[1])];
    };
    function redraw() {
      scope.views.forEach(function(v) { draw(v, scope); });
    };
    function reset() {
      scope.rangeXExtendPixels = [0, 0];
      scope.rangeYExtendPixels = [0, 0];
      scope.$broadcast('setupExtra');
      scope.views = viewgroups.map(function(grp, i) {
        grp.selectAll('.radian-plot').remove();
        grp.selectAll('.radian-ui').remove();
        return setup(scope, grp, i, viewgroups.length);
      });
      if (setupBrush) setupBrush();
      redraw();
    };
    function legend() { radianLegend(scope); };
    function drawAxisSwitch(e, type) { radianAxisSwitch(scope); };
    function axisSwitch(e, type) {
      if (type) scope.$apply('axisYTransform = "' + type + '"');
      redraw();
    }
    function init() {
      // Set up plot areas (including zoomers).
      var svgelm = d3.select(scope.svg);
      svgelm.attr('width', scope.width).attr('height', scope.height);
      var mainviewgroup = svgelm.append('g')
        .attr('width', scope.width).attr('height', scope.height);
      viewgroups = [mainviewgroup];
      if (!scope.sizeviewgroup) {
        var s = scope;
        if (scope.inStack)
          while (!s.hasOwnProperty('inStack')) s = s.$parent;
        s.sizeviewgroup = mainviewgroup;
      }
      if (scope.hasOwnProperty('zoomX')) {
        var zfrac = scope.zoomX == "" ? 0.2 : +scope.zoomX;
        zfrac = Math.min(0.95, Math.max(0.05, zfrac));
        var zoomHeight = (scope.height - 6) * zfrac;
        var mainHeight = (scope.height - 6) * (1 - zfrac);
        var zoomviewgroup = svgelm.append('g').classed('radian-zoom-x', true)
          .attr('transform', 'translate(0,' + (mainHeight + 6) + ')')
          .attr('width', scope.width).attr('height', zoomHeight);
        zoomviewgroup.zoomer = true;
        viewgroups.push(zoomviewgroup);
        mainviewgroup.attr('height', mainHeight);

        setupBrush = function() {
          var brush = d3.svg.brush().x(scope.views[1].x);
          brush.on('brush', function() {
            scope.views[0].x.domain(brush.empty() ?
                                    scope.views[1].x.domain() : brush.extent());
            draw(scope.views[0], scope);
          });
          scope.views[1].post = function(svg) {
            svg.append('g')
              .attr('class', 'x brush')
              .call(brush)
              .selectAll('rect')
              .attr('y', -6)
              .attr('height', scope.views[1].realheight + 7);
          }
        };
      }
    };

    $timeout(function() {
      // Draw plots and legend.
      init();
      reset();
      if (scope.hasOwnProperty('uiAxisYTransform')) {
        drawAxisSwitch();
        scope.$on('axisChange', axisSwitch);
      }
      if (scope.hasOwnProperty('legendSwitches')) {
        legend();
        scope.$on('dataChange', legend);
      }

      // Register plot data change handlers.
      scope.$on('paintChange', redraw);
      scope.$on('dataChange', reset);

      // Register UI event handlers.
      scope.$watch('strokesel', function(n,o) { if (n!=undefined) redraw(); });
      scope.$watch('xidx', function(n, o) { if (n != undefined) reset(); });
      scope.$watch('yidx', function(n, o) { if (n != undefined) reset(); });
    }, 0);

    // Set up interactivity.
    // ===> TODO: zoom and pan
    // ===> TODO: "layer" visibility
    // ===> TODO: styling changes
  };


  function processRanges(scope, rangea, rangexa, rangeya,
                         fixedxrv, xextv, xrngv,
                         fixedyrv, yextv, yrngv) {
    if (scope.hasOwnProperty(rangea) ||
        scope.hasOwnProperty(rangexa) || scope.hasOwnProperty(rangeya)) {
      var xrange, yrange;
      if (scope.hasOwnProperty(rangea)) {
        var ranges = scope[rangea].split(";");
        if (ranges.length == 2) {
          xrange = ranges[0];
          yrange = ranges[1];
        }
      }
      if (scope.hasOwnProperty(rangexa)) xrange = scope[rangexa];
      if (scope.hasOwnProperty(rangeya)) yrange = scope[rangeya];
      if (xrange) {
        var xs = xrange.split(","), vals = xs.map(parseFloat);
        var ok = false, ext = null;
        if (xs.length == 2 && xs[0] && xs[1]) {
          // "min,max"
          if (!isNaN(vals[0]) && !isNaN(vals[1])) {
            ok = true; ext = [vals[0], vals[1]];
            scope[fixedxrv] = true;
            scope[xextv] = ext;
          }
        } else if (xs.length == 1 || xs.length == 2 && !xs[1]) {
          // "min" or "min,"
          if (!isNaN(vals[0])) { ok = true;  ext = [vals[0], null]; }
        } else if (xs.length == 2 && !xs[0]) {
          // ",max"
          if (!isNaN(vals[1])) { ok = true;  ext = [null, vals[1]]; }
        }
        if (ok) scope[xrngv] = ext;
      }
      if (yrange) {
        var ys = yrange.split(","), vals = ys.map(parseFloat);
        var ok = false, ext = null;
        if (ys.length == 2 && ys[0] && ys[1]) {
          // "min,max"
          if (!isNaN(vals[0]) && !isNaN(vals[1])) {
            ok = true; ext = [vals[0], vals[1]];
            scope[fixedyrv] = true;
            scope[yextv] = ext;
          }
        } else if (ys.length == 1 || ys.length == 2 && !ys[1]) {
          // "min" or "min,"
          if (!isNaN(vals[0])) { ok = true;  ext = [vals[0], null]; }
        } else if (ys.length == 2 && !ys[0]) {
          // ",max"
          if (!isNaN(vals[1])) { ok = true;  ext = [null, vals[1]]; }
        }
        if (ok) scope[yrngv] = ext;
      }
    }
  };

  function makeXScaler(scope, v, hasdate, discvals, discorder) {
    var xform = scope.axisXTransform || "linear";
    var ext = scope.rangeXExtendPixels;
    var b = ext ? ext[0] : 0, t = v.realwidth - (ext ? ext[1] : 0);
    if (discvals) {
      var disctmp = null;
      if (scope.orderX)
        disctmp = scope.orderX.split(/ *; */);
      else if (discorder)
        disctmp = discorder.split(/ *; */);
      if (disctmp)
        discvals = disctmp.map(function(s) {
          var ss = s.split(/ *, */);
          return ss.length == 1 ? s : ss;
        });
      v.x =
        d3.scale.linear().range([b,t]).domain([0.5, discvals.length+0.5]);
      var offsets;
      if (discvals[0] instanceof Array) {
        var nd = discvals[0].length;
        var counts = new Array(nd);
        for (var i = 0; i < nd; ++i)
          counts[i] = lib.unique(discvals.map(function(v) {
            return v[i];
          })).length;
        var dx = new Array(nd);
        dx[nd - 1] = 1;
        for (var i = nd - 1; i > 0; --i) dx[i - 1] = dx[i] * counts[i];
        if (scope.groupX) {
          var grouping = scope.groupX % nd;
          var delta = scope.groupXDelta || 1.25;
          for (var i = 0; i < grouping; ++i) dx[i] *= delta;
        }
        offsets = new Array(discvals.length);
        var xs = new Array(nd);
        for (var i = 0; i < discvals.length; ++i) {
          var tmp = i;
          for (var j = nd - 1; j >= 0; --j) {
            xs[j] = tmp % counts[j];
            tmp = Math.floor(tmp / counts[j]);
          }
          offsets[i] = 0;
          for (var j = 0; j < nd; ++j) offsets[i] += xs[j] * dx[j];
        }
        var rescale = offsets[discvals.length - 1] / (discvals.length - 1);
        for (var i = 0; i < discvals.length; ++i)
          offsets[i] = offsets[i] / rescale + 1;
      }
      v.x.oton = function(x) {
        if (x instanceof Array) {
          for (var i = 0; i < discvals.length; ++i)
            if (discvals[i].every(function(d, i) { return d == x[i]; }))
              return offsets[i];
          throw Error("Discrete value mismatch!");
        } else
          return discvals.indexOf(x) + 1;
      };
      v.x.discrete = discvals;
    } else {
      if (hasdate)
        v.x = d3.time.scale().range([b,t]).domain(scope.xextent);
      else if (xform == "log")
        v.x = d3.scale.log().range([b,t]).domain(scope.xextent);
      else
        v.x = d3.scale.linear().range([b,t]).domain(scope.xextent);
      v.x.oton = function(x) { return x; };
    }
  };
  function makeX2Scaler(scope, v, hasdate, discvals, discorder) {
    var xform = scope.axisXTransform || "linear";
    var ext = scope.rangeXExtendPixels;
    var b = ext ? ext[0] : 0, t = v.realwidth - (ext ? ext[1] : 0);
    if (discvals) {
      var disctmp = null;
      if (scope.orderX2)
        disctmp = scope.orderX2.split(/ *; */);
      else if (discorder)
        disctmp = discorder.split(/ *; */);
      if (disctmp)
        discvals = disctmp.map(function(s) {
          var ss = s.split(/ *, */);
          return ss.length == 1 ? s : ss;
        });
      v.x2 = d3.scale.linear().range([b,t]).domain([0.5, discvals.length+0.5]);
      var offsets;
      if (discvals[0] instanceof Array) {
        var nd = discvals[0].length;
        var counts = new Array(nd);
        for (var i = 0; i < nd; ++i)
          counts[i] = lib.unique(discvals.map(function(v) {
            return v[i];
          })).length;
        var dx = new Array(nd);
        dx[nd - 1] = 1;
        for (var i = nd - 1; i > 0; --i) dx[i - 1] = dx[i] * counts[i];
        if (scope.groupX) {
          var grouping = scope.groupX2 % nd;
          var delta = scope.groupX2Delta || 1.25;
          for (var i = 0; i < grouping; ++i) dx[i] *= delta;
        }
        offsets = new Array(discvals.length);
        var xs = new Array(nd);
        for (var i = 0; i < discvals.length; ++i) {
          var tmp = i;
          for (var j = nd - 1; j >= 0; --j) {
            xs[j] = tmp % counts[j];
            tmp = Math.floor(tmp / counts[j]);
          }
          offsets[i] = 0;
          for (var j = 0; j < nd; ++j) offsets[i] += xs[j] * dx[j];
        }
        var rescale = offsets[discvals.length - 1] / (discvals.length - 1);
        for (var i = 0; i < discvals.length; ++i)
          offsets[i] = offsets[i] / rescale + 1;
      }
      v.x2.oton = function(x) {
        if (x instanceof Array) {
          for (var i = 0; i < discvals.length; ++i)
            if (discvals[i].every(function(d, i) { return d == x[i]; }))
              return offsets[i];
          throw Error("Discrete value mismatch!");
        } else
          return discvals.indexOf(x) + 1;
      };
      v.x2.discrete = discvals;
      v.x2.discmap = function(x) { return discvals.indexOf(x) + 1; };
    } else if (hasdate)
      v.x2 = d3.time.scale().range([b,t]).domain(scope.x2extent);
    else if (xform == "log")
      v.x2 = d3.scale.log().range([b,t]).domain(scope.x2extent);
    else
      v.x2 = d3.scale.linear().range([b,t]).domain(scope.x2extent);
  };
  function makeYScaler(scope, v) {
    var xform = scope.axisYTransform || "linear";
    var ext = scope.rangeYExtendPixels;
    var b = ext ? ext[0] : 0, t = v.realheight - (ext ? ext[1] : 0);
    if (xform == "log")
      v.y = d3.scale.log().range([t,b]).domain(scope.yextent);
    else
      v.y = d3.scale.linear().range([t,b]).domain(scope.yextent);
  };
  function makeY2Scaler(scope, v) {
    var xform = scope.axisYTransform || "linear";
    var ext = scope.rangeYExtendPixels;
    var b = ext ? ext[0] : 0, t = v.realheight - (ext ? ext[1] : 0);
    if (xform == "log")
      v.y2 = d3.scale.log().range([t,b]).domain(scope.y2extent);
    else
      v.y2 = d3.scale.linear().range([t,b]).domain(scope.y2extent);
  };

  function setupUI(viewgroup) {
    var uigroup = viewgroup.append('g').classed('radian-ui', true)
      .attr('visibility', 'hidden');
    function uiOn() { uigroup.attr('visibility', 'visible'); };
    function uiOff(e) {
      var elem = $(e.toElement), chk = $(uigroup[0][0]), uito = false;
      while (!uito && elem[0] && elem[0].parentElement) {
        if (elem[0] == chk[0]) uito = true;
        elem = elem.parent();
      }
      if (!uito) uigroup.attr('visibility', 'hidden');
    };
    var uirect = uigroup.append('rect')
      .attr('width', '100%').attr('height', '100%').attr('opacity', 0)
      .attr('visibility', 'visible');
    $(uirect[0][0]).on('mouseenter', uiOn).on('mouseleave', uiOff);
    return uigroup;
  };

  function setup(scope, viewgroup, idx, nviews) {
    var plotgroup = viewgroup.append('g').classed('radian-plot', true);
    var v = { group: viewgroup, plotgroup: plotgroup };
    if (viewgroup.hasOwnProperty('zoomer'))
      v.noTitle = true;
    else
      v.uigroup = setupUI(viewgroup);

    // Determine data ranges to use for plot -- either as specified in
    // RANGE-X, RANGE-Y or RANGE (for X1 and Y1 axes) and RANGE-X2,
    // RANGE-Y2 or RANGE2 (for X2 and Y2 axes) attributes on the plot
    // element, or the union of the data ranges for all plots.
    processRanges(scope, 'range', 'rangeX', 'rangeY',
                  'fixedXRange', 'xextent', 'xrange',
                  'fixedYRange', 'yextent', 'yrange');
    processRanges(scope, 'range2', 'rangeX2', 'rangeY2',
                  'fixedX2Range', 'x2extent', 'x2range',
                  'fixedY2Range', 'y2extent', 'y2range');
    function simpleExt(a) {
      if (typeof a[0] == 'string')
        return [0.5, lib.unique(a).length + 0.5];
      else
        return d3.extent(a);
    };
    function aext(d) {
      if (d[0] instanceof Array) {
        return d3.merge(d.map(function(a) { return simpleExt(a); }));
      } else
        return simpleExt(d);
    };
    function aext2(d, d2, d2min, d2max) {
      if (d[0] instanceof Array) {
        return d3.merge(d.map(function(a) {
          return d3.extent(a.filter(function(x, i) {
            return d2[i] >= d2min && d2[i] <= d2max;
          }));
        }));
      } else
        return d3.extent(d.filter(function(x, i) {
          return d2[i] >= d2min && d2[i] <= d2max;
        }));
    };
    var xexts = [], yexts = [], hasdate = false;
    var anyxdisc = false, anyxcont = false;
    var discx = null, discorder = null;
    var xextend = [0, 0], yextend = [0, 0];
    var x2exts = [], y2exts = [], hasdate2 = false;
    var anyx2disc = false, anyx2cont = false;
    var discx2 = null, discorder2 = null;
    dft(scope, function(s) {
      if (!scope.fixedXRange && s.enabled && s.x)
        xexts = xexts.concat(aext(s.x));
      if (!scope.fixedX2Range && s.enabled && s.x2)
        x2exts = x2exts.concat(aext(s.x2));
      if (!scope.fixedYRange && s.enabled && s.y) {
        if (scope.fixedXRange)
          yexts = yexts.concat(aext2(s.y, s.x,
                                     scope.xextent[0], scope.xextent[1]));
        else yexts = yexts.concat(aext(s.y));
      }
      if (!scope.fixedY2Range && s.enabled && s.y2) {
        if (scope.fixedXRange)
          y2exts = y2exts.concat(aext2(s.y2, s.x,
                                       scope.xextent[0], scope.xextent[1]));
        else y2exts = y2exts.concat(aext(s.y2));
      }
      if (s.x && s.x.metadata && s.x.metadata.format == 'date')
        hasdate = true;
      if (s.x && s.x instanceof Array) {
        // There are three possible cases where we want to treat the
        // X-values as discrete:
        //  1. String values.
        //  2. Array values (indicating parallel zipped data arrays
        //     for hierarchical treatment).
        //  3. When the X-data is explicitly marked as being discrete
        //     -- this is needed to deal with the case where we have
        //     integer values and want to treat them as discrete
        //     values.
        if (typeof s.x[0] == 'string' ||  // Case #1
            s.x[0] instanceof Array ||    // Case #2
            s.discreteX) {                // Case #3
          // The unique function in the Radian library will work with
          // array-valued entries without a problem.
          var vals = lib.unique(s.x);
          vals.sort();
          if (discx) {
            if (discx.length != vals.length ||
                discx.some(function(x, i) {
                  if (x instanceof Array)
                    return x.some(function(y, j) { return y != vals[i][j]; });
                  else
                    return x != vals[i];
                }))
              throw Error("Incompatible discrete X values");
          } else discx = vals;
          if (s.x.metadata && s.x.metadata.categoryOrder)
            discorder = s.x.metadata.categoryOrder;
          anyxdisc = true;
        } else anyxcont = true;
      }
      if (s.x2 && s.x2.metadata && s.x2.metadata.format == 'date')
        hasdate2 = true;
      if (s.x2 && s.x2 instanceof Array) {
        if (typeof s.x2[0] == 'string' ||  // Case #1
            s.x2[0] instanceof Array ||    // Case #2
            s.discreteX2) {                // Case #3
          var vals = lib.unique(s.x2);
          vals.sort();
          if (discx2) {
            if (discx2.length != vals.length ||
                discx2.some(function(x, i) {
                  if (x instanceof Array)
                    return x.some(function(y, j) { return y != vals[i][j]; });
                  else
                    return x != vals[i];
                }))
              throw Error("Incompatible discrete X2 values");
          } else discx2 = vals;
          if (s.x2.metadata && s.x2.metadata.categoryOrder)
            discorder2 = s.x2.metadata.categoryOrder;
          anyx2disc = true;
        } else anyx2cont = true;
      }
      if (s.rangeXExtend) {
        xextend[0] = Math.max(xextend[0], s.rangeXExtend[0]);
        xextend[1] = Math.max(xextend[1], s.rangeXExtend[1]);
      }
      if (s.rangeYExtend) {
        yextend[0] = Math.max(yextend[0], s.rangeYExtend[0]);
        yextend[1] = Math.max(yextend[1], s.rangeYExtend[1]);
      }
      if (s.rangeXExtendPixels) scope.rangeXExtendPixels = s.rangeXExtendPixels;
      if (s.rangeYExtendPixels) scope.rangeYExtendPixels = s.rangeYExtendPixels;
    });
    if (anyxdisc && anyxcont)
      throw Error("Can't mix discrete and continuous X values");
    if (anyx2disc && anyx2cont)
      throw Error("Can't mix discrete and continuous X2 values");
    if (!scope.fixedXRange && xexts.length > 0) {
      scope.xextent = d3.extent(xexts);
      if (scope.xrange) {
        if (scope.xrange[0] != null)
          scope.xextent[0] = Math.min(scope.xextent[0], scope.xrange[0]);
        if (scope.xrange[1] != null)
          scope.xextent[1] = Math.max(scope.xextent[1], scope.xrange[1]);
      }
      if (!hasdate) {
        scope.xextent[0] -= xextend[0];
        scope.xextent[1] += xextend[1];
      }
    }
    if (!scope.fixedYRange && yexts.length > 0) {
      scope.yextent = d3.extent(yexts);
      if (scope.yrange) {
        if (scope.yrange[0] != null)
          scope.yextent[0] = Math.min(scope.yextent[0], scope.yrange[0]);
        if (scope.yrange[1] != null)
          scope.yextent[1] = Math.max(scope.yextent[1], scope.yrange[1]);
      }
      scope.yextent[0] -= yextend[0];
      scope.yextent[1] += yextend[1];
    }
    if (!scope.fixedX2Range && x2exts.length > 0) {
      scope.x2extent = d3.extent(x2exts);
      if (scope.x2range) {
        if (scope.x2range[0] != null)
          scope.x2extent[0] = Math.min(scope.x2extent[0], scope.x2range[0]);
        if (scope.x2range[1] != null)
          scope.x2extent[1] = Math.max(scope.x2extent[1], scope.x2range[1]);
      }
      // scope.x2extent[0] -= x2extend[0];
      // scope.x2extent[1] += x2extend[1];
    }
    if (!scope.fixedY2Range && y2exts.length > 0) {
      scope.y2extent = d3.extent(y2exts);
      if (scope.y2range) {
        if (scope.y2range[0] != null)
          scope.y2extent[0] = Math.min(scope.y2extent[0], scope.y2range[0]);
        if (scope.y2range[1] != null)
          scope.y2extent[1] = Math.max(scope.y2extent[1], scope.y2range[1]);
      }
      // scope.y2extent[0] -= y2extend[0];
      // scope.y2extent[1] += y2extend[1];
    }

    // Extract plot attributes.
    v.xaxis = !scope.axisX || scope.axisX != 'off';
    v.yaxis = !scope.axisY || scope.axisY != 'off';
    v.x2axis = !!(scope.x2extent && (!scope.axisX2 || scope.axisX2 != 'off'));
    v.y2axis = !!(scope.y2extent && (!scope.axisY2 || scope.axisY2 != 'off'));
    var showXAxisLabel = (nviews == 1 || nviews == 2 && idx == 1) &&
      (!scope.axisXLabel || scope.axisXLabel != 'off');
    var showYAxisLabel = !scope.axisYLabel || scope.axisYLabel != 'off';
    var showX2AxisLabel = (nviews == 1 || nviews == 2 && idx == 1) &&
      (!scope.axisX2Label || scope.axisX2Label != 'off');
    var showY2AxisLabel = !scope.axisY2Label || scope.axisY2Label != 'off';
    v.margin = { top: +scope.topMargin || 2,
                 right: +scope.rightMargin || 2,
                 bottom: +scope.bottomMargin || 2,
                 left: +scope.leftMargin || 2 };
    v.margin.top += 0.5 * scope.fontSize;
    var xAxisTransform = scope.axisXTransform || "linear";
    var yAxisTransform = scope.axisYTransform || "linear";
    v.title = scope.title;

    // Set up top and bottom plot margins.
    if (scope.inStack) v.noTitle = true;
    var axisspace = 15;
    var del1 = axisspace + (+scope.fontSize);
    var del2 = 5 + (+scope.fontSize);
    var del3 = Math.floor(2.5 * scope.fontSize);
    if (v.xaxis) v.margin.bottom += del1 + (showXAxisLabel ? del2 : 0);
    if (v.x2axis) v.margin.top += del1 + (showX2AxisLabel ? del2 : 0);
    if (v.title && !v.noTitle) v.margin.top += del3;
    v.realheight = v.group.attr('height') - v.margin.top - v.margin.bottom;
    v.outh = v.realheight + v.margin.top + v.margin.bottom;

    // Set up D3 Y data ranges.
    if (scope.yextent) makeYScaler(scope, v);
    if (scope.y2extent) makeY2Scaler(scope, v);
//    if (scope.hasOwnProperty("axisYTransform") && !scope.watchYTransform)
    if (!scope.watchYTransform)
      scope.watchYTransform = scope.$watch('axisYTransform', function(n, o) {
        if (n == undefined || n == yAxisTransform) return;
        yAxisTransform = n || "linear";
        scope.views.forEach(function(v) {
          makeYScaler(scope, v);
          if (scope.y2) makeY2Scaler(scope, v);
          draw(v, scope);
        });
      });

    // Set up left and right plot margins.
    var yoffset = del3, y2offset = del3;
    if (v.yaxis && v.y) {
      var tmp = v.y.copy();
      var fmt = scope.axisYFormat ? d3.format(scope.axisYFormat) : null;
      var nticks =
        scope.axisYTicks ? scope.axisYTicks : v.group.attr('height') / 36;
      var fmtfn = tmp.tickFormat(nticks, fmt);
      var tst = '';
      tmp.ticks(nticks).map(fmtfn).forEach(function(s) {
        if (s.length > tst.length) tst = s;
      });
      tst = tst.replace(/[0-9]/g, '0');
      var g = scope.sizeviewgroup.append('g').attr('visibility', 'hidden');
      var tstel = g.append('text').attr('x', 0).attr('y', 0)
        .style('font-size', scope.fontSize).text(tst);
      yoffset = Math.max(del3, axisspace + tstel[0][0].getBBox().width);
      g.remove();
    }
    if (v.y2axis && v.y2) {
      var tmp = v.y2.copy();
      var fmt = scope.axisY2Format ? d3.format(scope.axisY2Format) : null;
      var nticks =
        scope.axisY2Ticks ? scope.axisY2Ticks : v.group.attr('height') / 36;
      var fmtfn = tmp.tickFormat(nticks, fmt);
      var tst = '';
      tmp.ticks(nticks).map(fmtfn).forEach(function(s) {
        if (s.length > tst.length) tst = s;
      });
      tst = tst.replace(/[0-9]/g, '0');
      var tstel = scope.sizeviewgroup.append('g').attr('visibility', 'hidden')
        .append('text')
        .attr('x', 0).attr('y', 0)
        .style('font-size', scope.fontSize)
        .text(tst);
      y2offset = Math.max(del3, axisspace + tstel[0][0].getBBox().width);
      tstel.remove();
    }
    if (v.yaxis) v.margin.left += yoffset + (showYAxisLabel ? del2 : 0);
    if (v.y2axis) v.margin.right += y2offset + (showY2AxisLabel ? del2 : 0);
    v.realwidth = v.group.attr('width') - v.margin.left - v.margin.right;
    v.outw = v.realwidth + v.margin.left + v.margin.right;

    // Set up D3 X data ranges.
    if (scope.xextent) makeXScaler(scope, v, hasdate, discx, discorder);
    if (scope.x2extent) makeX2Scaler(scope, v, hasdate2, discx2, discorder2);
    if (scope.hasOwnProperty("axisXTransform") && !scope.watchXTransform)
      scope.watchXTransform = scope.$watch('axisXTransform', function(n, o) {
        if (n == undefined || n == xAxisTransform) return;
        xAxisTransform = n || "linear";
        scope.views.forEach(function(v) {
          makeXScaler(scope, v, hasdate);
          if (scope.x2) makeX2Scaler(scope, v, hasdate2);
          draw(v, scope);
        });
      });

    // Figure out axis labels.
    function axisLabel(labelText, v, idxvar, selectvar, def) {
      var idx0 = null;
      if (!labelText) {
        dft(scope, function(s) {
          if (!labelText)
            if (s[v] && s[v].metadata && s[v].metadata.label) {
              labelText = s[v].metadata.label;
              if (s[v].metadata.units)
                labelText += ' (' + s[v].metadata.units + ')';
            }
          idx0 = idx0 || s[idxvar];
        });
        if (!labelText && scope[selectvar]) {
          var labs = scope[selectvar].split(',');
          labelText = labs[idx0];
        }
        if (!labelText) labelText = def;
      }
      return labelText;
    };
    if (showXAxisLabel)
      v.xlabel = axisLabel(scope.axisXLabel, 'x', 'xidx', 'selectX', 'X Axis');
    if (showYAxisLabel)
      v.ylabel = axisLabel(scope.axisYLabel, 'y', 'yidx', 'selectY', 'Y Axis');
    if (showX2AxisLabel)
      v.x2label = axisLabel(scope.axisX2Label, 'x2',
                            'xidx', 'selectX2', 'X2 Axis');
    if (showY2AxisLabel)
      v.y2label = axisLabel(scope.axisY2Label, 'y2',
                            'yidx', 'selectY2', 'Y2 Axis');

    if (idx == 0) {
      var svgelm = d3.select(scope.svg);
      v.clip = 'mainclip' + scope.plotid;
      svgelm.select('#' + v.clip).remove();
      svgelm.append('defs').append('clipPath')
        .attr('id', v.clip).append('rect')
        .attr('width', v.realwidth).attr('height', v.realheight);
    }

    return v;
  };

  function setFont(lab, scope) {
    if (scope.fontFamily) lab.style('font-family', scope.fontFamily);
    if (scope.fontStyle) lab.style('font-style', scope.fontStyle);
    if (scope.fontWeight) lab.style('font-weight', scope.fontWeight);
    if (scope.fontVariant) lab.style('font-variant', scope.fontVariant);
  };

  function defaultScaleFormat(xform, xs, m) {
    if (xform && xform == 'log') return d3.format(".0e");
    var extent = xs.domain();
    var span = extent[1] - extent[0];
    var step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10));
    var err = m / span * step;
    if (err <= .15) step *= 10;
    else if (err <= .35) step *= 5;
    else if (err <= .75) step *= 2;
    var n = Math.max(0, -Math.floor(Math.log(step) / Math.LN10 + .01));
    return d3.format(n > 6 ? ".2e" : (",." + n + "f"));
  };

  function makeAxis(sc, v, ax, tickDefault) {
    // Axis orientation.
    var ori;
    switch (ax) {
    case 'x':  ori = 'bottom';  break;
    case 'x2': ori = 'top';     break;
    case 'y':  ori = 'left';    break;
    case 'y2': ori = 'right';   break;
    }

    // Create base axis object.
    var axis = d3.svg.axis().scale(v[ax]).orient(ori);

    // Tick padding.
    var axatt = ax.toUpperCase();
    var paddingAttr = 'axis' + axatt + 'TickPadding';
    var padding = sc[paddingAttr] ? sc[paddingAttr] : sc.tickPadding;
    var padding_delta = 0;
    if (padding) {
      axis.tickPadding(+padding);
      padding_delta = +padding - 3;
    }

    // Process tick size information: there are global tick-sizes and
    // tick-size, minor-tick-size and end-tick-size attributes, and
    // there are also per-axis variants of these.
    var tickSizeAttr = 'axis' + axatt + 'TickSize';
    var minorTickSizeAttr = 'axis' + axatt + 'MinorTickSize';
    var endTickSizeAttr = 'axis' + axatt + 'EndTickSize';
    var tickSizesAttr = 'axis' + axatt + 'TickSizes';
    var norm_val = 6, minor_val = 6, end_val = 6;
    if (sc.tickSizes) {
      var vals = sc.tickSizes.split(/ *, */);
      if (vals.length >= 3) {
        norm_val = vals[0];  minor_val = vals[1];  end_val = vals[2];
      } else if (vals.length == 2) {
        norm_val = minor_val = vals[0];  end_val = vals[1];
      } else if (vals.length == 1)
        norm_val = minor_val = end_val = vals[0];
    }
    if (sc.tickSize) norm_val = sc.tickSize;
    if (sc.minorTickSize) minor_val = sc.minorTickSize;
    if (sc.endTickSize) end_val = sc.endTickSize;
    if (sc[tickSizesAttr]) {
      var vals = sc[tickSizesAttr].split(/ *, */);
      if (vals.length >= 3) {
        norm_val = vals[0];  minor_val = vals[1];  end_val = vals[2];
      } else if (vals.length == 2) {
        norm_val = minor_val = vals[0];  end_val = vals[1];
      } else if (vals.length == 1)
        norm_val = minor_val = end_val = vals[0];
    }
    if (sc[tickSizeAttr]) norm_val = sc[tickSizeAttr];
    if (sc[minorTickSizeAttr]) minor_val = sc[minorTickSizeAttr];
    if (sc[endTickSizeAttr]) end_val = sc[endTickSizeAttr];
    if (v[ax].discrete) end_val = 0;
    axis.tickSize(norm_val, minor_val, end_val);

    // Special treatment for discrete axes.
    if (v[ax].discrete) {
      var tickvals = [], ticklabs = [];
      v[ax].discrete.forEach(function(x, i) {
        tickvals.push(v[ax].oton(x));
        ticklabs.push(x);
      });
      axis.tickValues(tickvals);
      axis.tickFormat(function(x) {
          var i = tickvals.indexOf(x);
          return x == -1 ? '' : ticklabs[i];
        });
      axis.tickSize();
      return [axis, padding_delta];
    }

    // Do we need to use a date/time format?
    var dformat = '%Y-%m-%d';
    var has_date = false;
    dft(sc, function(s) {
      var d = s[ax];
      if (d && d.metadata && d.metadata.format == 'date') {
        if (d.metadata.dateFormat) dformat = d.metadata.dateFormat;
        has_date = true;
      }
    });

    // Figure out settings for ticks and tick format.
    var ticksAttr = 'axis' + axatt + 'Ticks';
    var fmtAttr = 'axis' + axatt + 'Format';
    var xformAttr = 'axis' + axatt + 'Transform';
    var ticks, fmt;
    ticks = sc[ticksAttr] ? sc[ticksAttr] : tickDefault;
    var explicit_ticks = false, explicit_labels = false;
    var tickvals = [], ticklabs = [];
    if (ticks instanceof Array) {
      // We have explicit tick values.
      explicit_ticks = true;
      ticks.forEach(function(t) {
        if (t instanceof Array) {
          tickvals.push(t[0]);
          ticklabs.push(t[1]);
          explicit_labels = true;
        } else {
          tickvals.push(t);
          ticklabs.push(t);
        }
      });
      ticks = 100 * ticks.length;
    }
    if (has_date)
      fmt = d3.time.format(sc[fmtAttr] ? sc[fmtAttr] : dformat);
    else
      fmt = sc[fmtAttr] ? d3.format(sc[fmtAttr]) :
      defaultScaleFormat(sc[xformAttr], v[ax], ticks);
    if (explicit_ticks) {
      axis.tickValues(tickvals);
      if (explicit_labels)
        axis.tickFormat(function(x) {
          var i = tickvals.indexOf(x);
          return x == -1 ? '' : ticklabs[i];
        });
      else
        axis.tickFormat(fmt);
    } else if (has_date) {
      var tickFn = null, tickNum = ticks;
      if (isNaN(Number(ticks))) {
        tickNum = parseFloat(ticks);
        var tickUnit = '';
        for (var i = ticks.length - 1; i >= 0; --i)
          if ("0123456789.".indexOf(ticks.charAt(i)) != -1) {
            tickUnit = ticks.substr(i + 1);
            break;
          }
        switch (tickUnit) {
        case 's':    tickFn = d3.time.seconds;  break;
        case 'min':  tickFn = d3.time.minutes;  break;
        case 'hr':   tickFn = d3.time.hours;    break;
        case 'd':    tickFn = d3.time.days;     break;
        case 'week': tickFn = d3.time.weeks;    break;
        case 'mon':  tickFn = d3.time.months;   break;
        case 'year': tickFn = d3.time.years;    break;
        }
      }
      if (tickFn)
        axis.ticks(tickFn, tickNum);
      else
        axis.ticks(tickNum);
      axis.tickFormat(fmt);
    } else if (sc[fmtAttr] || sc[xformAttr]) {
      axis.ticks(ticks, fmt);
    } else {
      axis.ticks(ticks);
      axis.tickFormat(fmt);
    }

    // Deal with tick sub-division, as indicated by the minorTicks
    // attributes.
    var minorTicksAttr = 'axis' + axatt + 'MinorTicks';
    var minor = sc[minorTicksAttr] ? sc[minorTicksAttr] : sc.minorTicks;
    if (minor) axis.tickSubdivide(minor);

    return [axis, padding_delta];
  };

  function jitter(xs, scale, jit) {
    var jsize = jit ? parseFloat(jit) : 0.05, j = [];
    if (isNaN(jsize)) jsize = 0.1;
    xs.forEach(function(x) { j.push((Math.random() * 2 - 1) * jsize); });
    var ret = function(d, i) { return scale(d + j[i]); };
    ret.oton = scale.oton;
    return ret;
  };

  function draw(v, scope) {
    // Clean out any pre-existing plots.
    $(v.plotgroup[0]).empty();

    // Set up plot margins.
    v.plotgroup.attr('width', v.outw).attr('height', v.outh);
    v.innergroup = v.plotgroup.append('g')
      .attr('width', v.realwidth).attr('height', v.realheight)
      .attr('transform', 'translate(' + v.margin.left + ',' +
                                        v.margin.top + ')');
    if (v.clip) v.innergroup.attr('clip-path', 'url(#' + v.clip + ')');

    // Draw D3 axes.
    var del1 = Math.floor(scope.fontSize / 3.0);
    var del2 = Math.floor(3.0 * scope.fontSize);
    if (v.xaxis && v.x) {
      var ax = makeAxis(scope, v, 'x', v.plotgroup.attr('width') / 100);
      var axis = ax[0], padding_delta = ax[1];
      v.plotgroup.append('g').attr('class', 'axis')
        .attr('transform', 'translate(' + v.margin.left + ',' +
              (+v.realheight + v.margin.top + del1) + ')')
        .call(axis);
      if (v.xlabel) {
        var lab = v.plotgroup.append('g').attr('class', 'axis-label')
          .attr('transform', 'translate(' +
                (+v.margin.left + v.realwidth / 2) +
                ',' + (+v.realheight + v.margin.top) + ')')
          .append('text')
          .attr('x', 0).attr('y', del2 + padding_delta)
          .style('font-size', scope.fontSize)
          .attr('text-anchor', 'middle').text(v.xlabel);
        setFont(lab, scope);
      }
    }
    if (v.x2axis && v.x2) {
      var ax = makeAxis(scope, v, 'x2', v.plotgroup.attr('width') / 100);
      var axis = ax[0], padding_delta = ax[1];
      v.plotgroup.append('g').attr('class', 'axis')
        .attr('transform', 'translate(' + v.margin.left + ',' +
              (+v.margin.top + del1) + ')')
        .call(axis);
      if (v.x2label) {
        var lab = v.plotgroup.append('g').attr('class', 'axis-label')
          .attr('transform', 'translate(' +
                (+v.margin.left + v.realwidth / 2) + ',' +
                (+v.margin.top) + ')')
          .append('text')
          .attr('x', 0).attr('y', del2 - padding_delta)
          .style('font-size', scope.fontSize)
          .attr('text-anchor', 'middle').text(v.x2label);
        setFont(lab, scope);
      }
    }
    if (v.yaxis && v.y) {
      var ax = makeAxis(scope, v, 'y', v.plotgroup.attr('height') / 36);
      var axis = ax[0], padding_delta = ax[1];
      v.plotgroup.append('g').attr('class', 'axis')
        .attr('transform', 'translate(' + (+v.margin.left - del1) + ',' +
              (+v.margin.top) + ')')
        .call(axis);
      if (v.ylabel) {
        var xpos = +scope.fontSize, ypos = +v.margin.top + v.realheight / 2;
        var lab = v.plotgroup.append('g').attr('class', 'axis-label')
        .append('text')
        .attr('x', xpos - padding_delta).attr('y', ypos)
        .attr('transform', 'rotate(-90,' + xpos + ',' + ypos + ')')
        .style('font-size', scope.fontSize)
        .attr('text-anchor', 'middle').text(v.ylabel);
        setFont(lab, scope);
      }
    }
    if (v.y2axis && v.y2) {
      var ax = makeAxis(scope, v, 'y2', v.plotgroup.attr('height') / 36);
      var axis = ax[0], padding_delta = ax[1];
      v.plotgroup.append('g').attr('class', 'axis')
        .attr('transform', 'translate(' +
              (+v.realwidth + v.margin.left) + ',' +
              (+v.margin.top) + ')')
        .call(axis);
      if (v.y2label) {
        var xpos = v.realwidth + v.margin.left + v.margin.right -
          scope.fontSize;
        var ypos = +v.margin.top + v.realheight / 2;
        var lab = v.plotgroup.append('g').attr('class', 'axis-label')
        .append('text')
        .attr('x', xpos + padding_delta).attr('y', ypos)
        .attr('transform', 'rotate(-90,' + xpos + ',' + ypos + ')')
        .style('font-size', scope.fontSize)
        .attr('text-anchor', 'middle').text(v.y2label);
        setFont(lab, scope);
      }
    }
    setFont(d3.selectAll('.axis text'), scope);

    // Plot title.
    v.plotgroup.selectAll('g.no-data').remove();
    if (scope.nplots == 0 && v == scope.views[0] && scope.noData)
      v.plotgroup.append('g').attr('class', 'no-data').append('text')
        .attr('x', v.outw / 2).attr('y', v.outh / 2)
        .attr('text-anchor', 'middle').text(scope.noData);
    if (v.title && !v.noTitle) {
      var t = v.plotgroup.append('g').attr('class', 'axis-label')
        .attr('transform', 'translate(' +
              (+v.margin.left + v.realwidth / 2) + ',0)')
        .append('text')
        .attr('x', 0).attr('y', Math.floor(1.35 * scope.titleFontSize))
        .style('font-size', Math.floor(scope.titleFontSize))
        .attr('text-anchor', 'middle').text(v.title);
      if (scope.titleFontFamily) t.style('font-family', scope.titleFontFamily);
      if (scope.titleFontStyle) t.style('font-style', scope.titleFontStyle);
      if (scope.titleFontWeight) t.style('font-weight', scope.titleFontWeight);
      if (scope.titleFontVariant)
        t.style('font-variant', scope.titleFontVariant);
    }

    // Loop over plots, calling their draw functions one by one.
    if (v.x && v.y || v.x2 && v.y || v.x && v.y2 || v.x2 && v.y2) {
      dft(scope, function(s) {
        if (s.draw && s.enabled) {
          var xvar = false, yvar = false, xdiscrete = false;
          var xs, ys;
          if (s.x)  { xvar = 'x';  xs = v.x;  xdiscrete = !!v.x.discrete; }
          if (s.x2) { xvar = 'x2'; xs = v.x2;  xdiscrete = !!v.x2.discrete; }
          if (s.y)  { yvar = 'y';  ys = v.y;  }
          if (s.y2) { yvar = 'y2'; ys = v.y2; }
          xs.full = xs, ys.full = ys;

          if (xvar && yvar) {
            // Append SVG group for this plot and draw the plot into it.
            var g = v.innergroup.append('g');
            var x = (s[xvar][0] instanceof Array && !v.x.discrete) ?
              s[xvar][s.xidx ? s.xidx : 0] : s[xvar];
            if (s.hasOwnProperty('jitterX')) xs = jitter(x, xs, s.jitterX);
            var y = (s[yvar][0] instanceof Array) ?
              s[yvar][s.yidx ? s.yidx : 0] : s[yvar];
            if (s.hasOwnProperty('jitterY')) ys = jitter(y, ys, s.jitterY);
            s.draw(g, x, xs, y, ys, s, v.realwidth, v.realheight,
                   yvar == 'y2' ? 2 : 1);
            s.$on('$destroy', function() { g.remove(); });
          }
        }
      });
      if (v.post) v.post(v.innergroup);
    }
  };

  return {
    restrict: 'E',
    template:
    ['<div class="radian">',
       '<svg></svg>',
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


// Link function shared by most simple plotting directives.  Does
// attribute processing, hides HTML element, sets up drawing function
// and sets up event emitters for data and paint changes.

radian.factory('plotTypeLink',
 ['processAttrs', '$timeout',
  function(processAttrs, $timeout)
{
  var paintas = [ 'orientation', 'fill', 'fillOpacity', 'label',
                  'marker', 'markerSize', 'stroke', 'strokeOpacity',
                  'strokeWidth' ];

  return function(scope, elm, as, draw) {
    processAttrs(scope, as);
    elm.hide();
    scope.draw = draw;
    scope.$parent.addPlot(scope);

    scope.xchange = scope.ychange = false;
    function emitChange() {
      var emit = scope.xchange || scope.ychange;
      scope.xchange = scope.ychange = false;
      if (emit) scope.$emit('dataChange', scope);
    }
    scope.$watch('x', function(n, o) {
      if (n == undefined || n === o || scope.xchange) return;
      scope.xchange = true;
      $timeout(emitChange);
    });
    scope.$watch('y', function(n, o) {
      if (n == undefined || n === o || scope.ychange) return;
      scope.ychange = true;
      $timeout(emitChange);
    });
    paintas.forEach(function(a) {
      if (scope.hasOwnProperty(a))
        scope.$watch(a, function() { scope.$emit('paintChange', scope); });
    });
  };
}]);


// Simple directive just to wrap inner plotting directives that share
// options.  Brings any attributes into scope and transcludes inner
// plot directives.

radian.directive('plotOptions', ['processAttrs', function(processAttrs)
{
  'use strict';

  return {
    restrict: 'E',
    template: '<div></div>',
    replace: true,
    transclude: true,
    scope: true,
    compile: function(elm, as, trans) {
      return { pre: function(s, e, a) {
        processAttrs(s, a);
        trans(s.$new(), function (cl) { e.append(cl); });
      } };
    }
  };
}]);
