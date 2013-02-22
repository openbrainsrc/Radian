// Process attributes for plot directives.  All attributes, except for
// a small number of special cases (ID, CLASS, NG-*) are added as
// Angular scope variables, along with some extra information about
// the free variables and the original expression for the attribute.
// Changes to the attribute value are processed by re-evaluation using
// $observe and changes to free variables in the Radian expression are
// processed using a (slightly complicated) setup of scope.$watch
// listeners.

//===> THERE MIGHT BE ONE NASTY THING HERE.  WE MIGHT NEED TO
//     TRANSLATE "{{expr}}" INTO "scope.$eval(expr)" IN radianEval.
//     I'M MEDIUM CONVINCED THAT THIS SHOULDN'T BE A PROBLEM.  HERE'S
//     THE POSSIBLE CHAIN OF EVENTS CASING TROUBLE: YOU SET UP AN
//     ATTRIBUTE WITH AN EXPRESSION CONTAINING BOTH A FREE VARIABLE
//     AND A "{{expr}}" THING.  ANGULAR SHOULD IMMEDIATELY INTERPOLATE
//     THE "{{expr}}" SO THAT WE NEVER SEE IT, IN WHICH CASE CHANGES
//     TO THE "expr" SHOULD BE DEALT WITH BY A $observe.  CHANGES TO
//     THE FREE VARIABLE (WHICH WILL REQUIRE A RE-EVALUATION OF THE
//     EXPRESSION) SHOULD GO OFF O.K., SINCE THE STORED EXPRESSION HAS
//     ALREADY HAD ITS "{{expr}}" BITS INTERPOLATED BY ANGULAR.
//     THERE, I CONVINCED MYSELF IT WOULD ALL BE ALL RIGHT...

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
      var val = radianEval(scope, as[a], true);

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
        entry.fvwatchers[v] = scope.$watch(v, function() {
          scope[a] = radianEval(scope, entry.expr);
        });
      });

      // Observe the value of the attribute: if the value (i.e. the
      // expression) changes, we pull in the new expression,
      // re-evaluate and rearrange the free variable watchers.
      as.$observe(a, function(v) {
        entry.expr = v;
        var val = radianEval(scope, v, true);
        scope[a] = val[0];
        entry.fvs = val[1];
        Object.keys(entry.fvwatchers).forEach(function(v) {
          // The new free variables are already in entry.fvs.  If this
          // one isn't in there, deregister the watch and remove it.
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
            });
        });
      });
    });
  };
}]);


// Main plot directive.  Kind of complicated...

radian.directive('plot',
 ['radianEval', 'processAttrs', '$timeout', '$rootScope', 'dumpScope',
  'dft', 'radianLegend',
 function(radianEval, processAttrs, $timeout, $rootScope, dumpScope,
          dft, radianLegend)
{
  'use strict';

  // We do setup work here so that we can organise things before the
  // transcluded plotting directives are linked.
  function preLink(scope, elm, as, transclude) {
    // Process attributes, bringing all but a few special cases into
    // Angular scope as regular variables (to be use in data access
    // expressions).
    processAttrs(scope, as);
    scope.strokesel = 0;
    scope.xidx = 0;
    scope.yidx = 0;

    // Deal with plot dimension attributes: explicit attribute values
    // override CSS values.  Do sensible things with width, height and
    // aspect ratio...
    var h = 300, asp = 1.618, w = asp * h;
    var aw = as.width, ah = as.height, aasp = as.aspect;
    if (aw && ah && aasp) aasp = null;
    if (ah && aw) { h = ah; w = aw; asp = w / h; }
    else if (ah && aasp) { h = ah; asp = aasp; w = h * asp; }
    else if (aw && aasp) { w = aw; asp = aasp; h = w / asp; }
    else if (ah) { h = ah; w = h * asp; }
    else if (aw) { w = aw; h = w / asp; }
    else if (aasp) { asp = aasp; h = w / asp; }
    else {
      var cw = elm.width(), ch = elm.height();
      var casp = elm.css('aspect') ? parseFloat(elm.css('aspect')) : null;
      if (cw && ch && casp) casp = null;
      if (ch && cw) { h = ch; w = cw; asp = w / h; }
      else if (ch && casp) { h = ch; asp = casp; w = h * asp; }
      else if (cw && casp) { w = cw; asp = casp; h = w / asp; }
      else if (ch) { h = ch; w = h * asp; }
      else if (cw) { w = cw; h = w / asp; }
      else if (casp) { asp = casp; h = w / asp; }
    }
    scope.width = w; scope.height = h;
    scope.svg = elm.children()[1];
    $(elm).css('width', w).css('height', h);

    // Set up view list and function for child elements to add plots.
    scope.views = [];
    scope.switchable = [];
    scope.addPlot = function(s) {
      if (scope.hasOwnProperty('legendSwitches')) scope.switchable.push(s);
      s.enabled = true;
    };

    transclude(scope.$new(), function (cl) { elm.append(cl); });
  };

  // We do the actual plotting after the transcluded plot type
  // elements are linked.
  function postLink(scope, elm) {
    function redraw() {
      scope.views.forEach(function(v) { draw(v, scope); });
    };
    function reset() {
      scope.views = svgs.map(function(s) { return setup(scope, s); });
      if (setupBrush) setupBrush();
      redraw();
    };

    // Set up plot areas (including zoomers).
    var svgelm = d3.select(scope.svg);
    if (scope.uivisible)
      scope.height -= parseInt($(elm.children()[0]).css('height'));
    svgelm.attr('width', scope.width).attr('height', scope.height);
    var mainsvg = svgelm.append('g')
      .attr('width', scope.width).attr('height', scope.height);
    var svgs = [mainsvg];
    var setupBrush = null;
    if (scope.hasOwnProperty('zoomX')) {
      var zfrac = scope.zoomFraction || 0.2;
      zfrac = Math.min(0.95, Math.max(0.05, zfrac));
      var zoomHeight = scope.height * zfrac;
      var mainHeight = scope.height * (1 - zfrac);
      var zoomsvg = svgelm.append('g')
        .attr('transform', 'translate(0,' + mainHeight + ')')
        .attr('width', scope.width).attr('height', scope.height * zfrac);
      svgs.push(zoomsvg);
      svgs[0].attr('height', scope.height * (1 - zfrac));

      setupBrush = function() {
        svgelm.append('defs').append('clipPath')
          .attr('id', 'xzoomclip')
          .append('rect')
          .attr('width', scope.views[0].realwidth)
          .attr('height', scope.views[0].realheight);
        scope.views[0].clip = 'xzoomclip';
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

    $timeout(function() {
      // Draw plots and legend.
      reset();
      radianLegend(svgelm, scope);

      // Register plot data change handlers.
      scope.$on('paintChange', redraw);
      scope.$on('dataChange', reset);

      // Register UI event handlers.
      scope.$watch('strokesel', redraw);
      scope.$watch('xidx', reset);
      scope.$watch('yidx', reset);
    }, 0);

    // Set up interactivity.
    // ===> TODO: axis type control (linear, log, etc.)
    // ===> TODO: zoom and pan
    // ===> TODO: "layer" visibility
    // ===> TODO: styling changes
  };


  function setup(scope, topgroup) {
    var v = { svg: topgroup };

    // Extract plot attributes.
    v.xaxis = !scope.axisX || scope.axisX != 'off';
    v.yaxis = !scope.axisY || scope.axisY != 'off';
    var showXAxisLabel = !scope.axisXLabel || scope.axisXLabel != 'off';
    var showYAxisLabel = !scope.axisYLabel || scope.axisYLabel != 'off';
    v.margin = { top: scope.topMargin || 2, right: scope.rightMargin || 10,
                 bottom: scope.bottomMargin || 2, left: scope.leftMargin || 2 };

    // Set up plot margins.
    if (v.xaxis) v.margin.bottom += 20 + (showXAxisLabel ? 15 : 0);
    if (v.yaxis) v.margin.left += 30 + (showYAxisLabel ? 22 : 0);
    v.realwidth = v.svg.attr('width') - v.margin.left - v.margin.right;
    v.realheight = v.svg.attr('height') - v.margin.top - v.margin.bottom;
    v.outw = v.realwidth + v.margin.left + v.margin.right;
    v.outh = v.realheight + v.margin.top + v.margin.bottom;

    // Determine data ranges to use for plot -- either as specified in
    // X-RANGE, Y-RANGE or COORD-RANGE attributes on the plot element,
    // or the union of the data ranges for all plots.
    // ===> TODO: <plot> range attributes
    // ===> TODO: management of linear/log/etc. axis type
    // ===> TODO: deal with x1/x2, y1/y2 axes
    function aext(d) {
      if (d[0] instanceof Array) {
        return d3.merge(d.map(function(a) { return d3.extent(a); }));
      } else
        return d3.extent(d);
    };
    var xexts = [], yexts = [], hasdate = false;
    dft(scope, function(s) {
      if (s.enabled && s.x) xexts = xexts.concat(aext(s.x));
      if (s.enabled && s.y) yexts = yexts.concat(aext(s.y));
      if (s.x && s.x.metadata && s.x.metadata.format == 'date')
        hasdate = true;
    });
    var xextent = d3.extent(xexts), yextent = d3.extent(yexts);

    // Set up D3 data ranges.
    // ===> TODO: deal with x1/x2, y1/y2 axes -- check for conflicts
    //            in data types and figure out what axes need to be
    //            drawn
    if (hasdate)
      v.x = d3.time.scale().range([0, v.realwidth]).domain(xextent);
    else
      v.x = d3.scale.linear().range([0, v.realwidth]).domain(xextent);
    v.y = d3.scale.linear().range([v.realheight, 0]).domain(yextent);

    // Figure out axis labels.
    function axisLabel(labelText, idxvar, selectvar, def) {
      var idx0 = null;
      if (!labelText) {
        dft(scope, function(s) {
          if (!labelText)
            if (s.x && s.x.metadata && s.x.metadata.label) {
              labelText = s.x.metadata.label;
              if (s.x.metadata.units)
                labelText += ' (' + s.x.metadata.units + ')';
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
      v.xlabel = axisLabel(scope.axisXLabel, 'xidx', 'selectX', 'X Axis');
    if (showYAxisLabel)
      v.ylabel = axisLabel(scope.axisYLabel, 'yidx', 'selectY', 'Y Axis');

    return v;
  };

  function draw(v, scope) {
    // Clean out any pre-existing plots.
    $(v.svg[0]).empty();

    // Set up plot margins.
    var outsvg = v.svg.append('g').attr('width', v.outw).attr('height', v.outh);
    var svg = outsvg.append('g')
      .attr('transform', 'translate(' + v.margin.left + ',' +
                                        v.margin.top + ')');
    if (v.clip) svg.attr('clip-path', 'url(#' + v.clip + ')');

    // Draw D3 axes.
    // ===> TODO: may need to draw up to two x-axes and two y-axes
    if (v.xaxis && v.x) {
      var axis = d3.svg.axis()
        .scale(v.x).orient('bottom')
        .ticks(outsvg.attr('width') / 100);
      var dformat = '%Y-%m-%d';
      var has_date = false;
      dft(scope, function(s) {
        var x = s.x;
        if (x && x.metadata && x.metadata.format == 'date') {
          if (x.metadata.dateFormat) dformat = x.metadata.dateFormat;
          has_date = true;
        }
        has_date = false;
      });
      if (has_date) axis.tickFormat(d3.time.format(dformat));
      outsvg.append('g').attr('class', 'axis')
        .attr('transform', 'translate(' + v.margin.left + ',' +
              (+v.realheight + 4) + ')')
        .call(axis);
      if (v.xlabel)
        var xpos = 0, ypos = 35;
        outsvg.append('g').attr('class', 'axis-label')
        .attr('transform', 'translate(' +
              (+v.margin.left + v.realwidth / 2) +
              ',' + v.realheight + ')')
        .append('text')
        .attr('x', xpos).attr('y', ypos)
        .attr('text-anchor', 'middle').text(v.xlabel);
    }
    if (v.yaxis && v.y) {
      var axis = d3.svg.axis()
        .scale(v.y).orient('left')
        .ticks(outsvg.attr('height') / 36);
      outsvg.append('g').attr('class', 'axis')
        .attr('transform', 'translate(' + (+v.margin.left - 4) + ',0)')
        .call(axis);
      if (v.ylabel) {
        var xpos = 12, ypos = v.realheight / 2;
        outsvg.append('g').attr('class', 'axis-label')
        .append('text')
        .attr('x', xpos).attr('y', ypos)
        .attr('transform', 'rotate(-90,' + xpos + ',' + ypos + ')')
        .attr('text-anchor', 'middle').text(v.ylabel);
      }
    }

    // Loop over plots, calling their draw functions one by one.
    if (v.x && v.y) {
      dft(scope, function(s) {
        if (s.draw && s.enabled && s.x && s.y) {
          // Append SVG group for this plot and draw the plot into it.
          var g = svg.append('g');
          var x = (s.x[0] instanceof Array) ? s.x[s.xidx] : s.x;
          var y = (s.y[0] instanceof Array) ? s.y[s.yidx] : s.y;
          s.draw(g, x, v.x, y, v.y, s);
        }
      });
      if (v.post) v.post(v.svg);
    }
  };

  return {
    restrict: 'E',
    template:
    ['<div class="radian">',
       '<radian-ui></radian-ui>',
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


radian.factory('plotTypeLink', ['processAttrs', function(processAttrs)
{
  var paintas = [ 'fill', 'fillOpacity', 'label', 'marker', 'markerSize',
                  'stroke', 'strokeOpacity', 'strokeWidth' ];

  return function(scope, elm, as, draw) {
    processAttrs(scope, as);
    elm.hide();
    scope.draw = draw;
    scope.$parent.addPlot(scope);

    scope.$watch('x', function() { scope.$emit('dataChange', scope); });
    scope.$watch('y', function() { scope.$emit('dataChange', scope); });
    paintas.forEach(function(a) {
      if (scope.hasOwnProperty(a))
        scope.$watch(a, function() { scope.$emit('paintChange', scope); });
    });
  };
}]);
