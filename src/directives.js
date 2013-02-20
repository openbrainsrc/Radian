/* Directives */

radian.directive('plotData',
 ['$rootScope', 'splitAttrs',
  function($rootScope, splitAttrs)
{
  'use strict';

  var okas = { };
  [ 'cols', 'format', 'name', 'separator', 'src' ]
    .forEach(function(a) { okas[a] = 1; });

  function postLink(scope, elm, as) {
    // The <plot-data> element is only there to carry data, so hide
    // it right away.
    elm.hide();

    // Process attributes.
    splitAttrs(scope, as, okas, false, 'plot-data');
    var os = scope.plotOptions;
    if (!os.name) throw Error('<plot-data> must had NAME attribute');
    var dataset = os.name;
    var format = os.format || 'json';
    var sep = os.separator === '' ? ' ' : (os.separator || ',');
    var cols = os.cols;
    if (cols) cols = cols.split(',').map(function (s) { return s.trim(); });
    var formats = ['json', 'csv'];
    if (formats.indexOf(format) == -1)
      throw Error('invalid FORMAT "' + format + '" in <plot-data>');
    if (format == 'csv' && !cols)
      throw Error('CSV <plot-data> must have COLS');

    // Process content -- all text children are appended together
    // for parsing.
    var datatext = '';
    elm.contents().each(function(i,n) {
      if (n instanceof Text) datatext += n.textContent;
    });

    // Parse data.
    var d;
    var fpre = /^\s*[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\s*$/;
    switch (format) {
    case 'json':
      try { d = JSON.parse(datatext); }
      catch (e) { throw Error('invalid JSON data in <plot-data>'); }
      break;
    case 'csv':
      try {
        d = $.csv.toArrays(datatext.replace(/^\s*\n/g, '').split('\n')
                           .map(function(s) {
                             return s.replace(/^\s+/, '');
                           }).join('\n'),
                           { separator: sep });
        if (d.length > 0) {
          if (d[0].length != cols.length)
            throw Error('mismatch between COLS and' +
                        ' CSV data in <plot-data>');
          var tmp = { }, nums = [];
          for (var c = 0; c < cols.length; ++c) {
            tmp[cols[c]] = [];
            nums.push(d[0][c].match(fpre));
          }
          for (var i = 0; i < d.length; ++i)
            for (var c = 0; c < cols.length; ++c) {
              if (nums[c])
                tmp[cols[c]].push(parseFloat(d[i][c]));
              else
                tmp[cols[c]].push(d[i][c]);
            }
          d = tmp;
        }
      } catch (e) { throw Error('invalid CSV data in <plot-data>'); }
    }

    // Process any date fields.
    function dateProcess(d, k, f) {
      function go(x, active) {
        if (x instanceof Array && x.length > 0) {
          if (typeof x[0] == 'string' && active)
            x.forEach(function(v, i) { x[i] = f(v); });
          else
            x.forEach(function(v) { go(v, false); });
        } else if (typeof x == 'object')
          Object.keys(x).forEach(function(xk) { go(x[xk], xk == k); });
      }
      go(d, false);
    };
    if (scope.$parent[dataset] && scope.$parent[dataset].metadata) {
      for (var k in scope.$parent[dataset].metadata) {
        var md = scope.$parent[dataset].metadata[k];
        if (md.format == 'date') {
          if (!md.dateParseFormat)
            dateProcess(d, k, function(v) { return new Date(v); });
          else {
            var parse;
            if (md.dateParseFormat == 'isodate')
              parse = d3.time.format.iso.parse;
            else
              parse = d3.time.format(md.dateParseFormat).parse;
            dateProcess(d, k, function(v) { return parse(v); });
          }
        }
      }
    }

    // Install data in scope, preserving any metadata.
    var md = scope.$parent[dataset] ? scope.$parent[dataset].metadata : null;
    scope.$parent[dataset] = d;
    if (md) scope.$parent[dataset].metadata = md;
  };

  return {
    restrict: 'E',
    scope: false,
    compile: function(elm, as, trans) {
      return { post: postLink };
    }
  };
}]);


radian.directive('metadata',
 ['$rootScope', 'splitAttrs',
  function($rootScope, splitAttrs)
{
  'use strict';

  var okas = { };
  [ 'dateFormat', 'dateParseFormat', 'errorFor',
    'format', 'label', 'name', 'units' ]
    .forEach(function(a) { okas[a] = 1; });
  return {
    restrict: 'E',
    scope: false,
    link: function(scope, elm, as) {
      // Identify the data set that we're metadata for.
      if (!elm[0].parentNode || elm[0].parentNode.tagName != 'PLOT-DATA' ||
          !$(elm[0].parentNode).attr('name'))
        throw Error('<metadata> not properly nested inside <plot-data>');
      var dataset = $(elm[0].parentNode).attr('name');

      // Split attributes into standard plot attributes and all others
      // (used as variables in data access expressions).
      splitAttrs(scope, as, okas, false, 'metadata');
      var os = scope.plotOptions;
      delete scope.plotOptions;
      if (!os.hasOwnProperty('name'))
        throw Error('<metadata> without NAME attribute');
      var name = os.name;
      delete os.name;

      // Set up metadata for this data set.
      if (!scope.$parent[dataset]) scope.$parent[dataset] = { metadata: { } };
      if (!scope.$parent[dataset].metadata)
        scope.$parent[dataset].metadata = { };
      scope.$parent[dataset].metadata[name] = os;
    }
  };
}]);


radian.directive('radianUi', [function()
{
  'use strict';

  function setup(scope) {
    var po = scope.plotOptions;

    // Deal with switching between stroke types.
    if (po.strokeSwitch !== undefined) {
      var label = po.strokeSwitchLabel;
      var switches = po.strokeSwitch.split(';');
      if (switches.length == 1) {
        // On/off UI.
        scope.stroke = 0;
        scope.swbut = switches[0];
        scope.swbutlab = label;
        scope.switchfn =
          function() {
            scope.stroke = 1 - scope.stroke;
            scope.$emit('strokeSelChange', scope.stroke);
          };
      } else {
        // Selector UI.
        scope.stroke = switches[0];
        scope.swsel = switches;
        scope.swsellab = label;
        scope.$watch('stroke', function(n, o) {
          scope.$emit('strokeSelChange', n);
        });
      }
    }

    // Deal with selection of X and Y variables.
    if (po.selectX !== undefined) {
      var xvars = po.selectX.split(',');
      if (xvars.length > 1) {
        // Selector UI.
        scope.xv = xvars[0];
        scope.xvs = xvars;
        scope.xlab = po.selectXLabel;
        scope.$watch('xv',
          function(n, o) {
            if (n == scope.yv) scope.yv = o;
            scope.yvs = scope.xvs.filter(function(s) {
              return s != scope.xv;
            });
            scope.$emit('xDataSelChange', scope.xvs.indexOf(n));
          });
      }
    }
    if (po.selectY !== undefined) {
      var yvars = po.selectY.split(',');
      if (yvars.length > 1) {
        // Selector UI.
        scope.yv = yvars[0];
        scope.yvs = yvars;
        scope.ylab = po.selectYLabel;
        scope.allyvs = po.selectY.split(',');
        if (scope.selectX == scope.selectY) {
          scope.yvs = yvars.splice(1);
          scope.yv = scope.allyvs[1];
        }
        scope.$watch('yv',
          function(n, o) {
            scope.$emit('yDataSelChange', scope.allyvs.indexOf(n));
          });
      }
    }

    // Set up plot data.
    var xi = 0, yi = 0;
    if (scope.xv) xi = scope.xvs.indexOf(scope.xv);
    if (scope.yv) yi = scope.allyvs.indexOf(scope.yv);
    scope.$emit('xDataSelChange', xi);
    scope.$emit('yDataSelChange', yi);
  };

  return {
    restrict: 'E',
    scope: false,
    template:
    ['<div class="radian-ui">',
       '<span class="form-inline">',
         '<span ng-show="xvs">',
           '<span>{{xlab}}</span>',
           '<select ng-model="xv" class="span1" ng-options="v for v in xvs">',
           '</select>',
         '</span>',
         '<span ng-show="xvs && yvs">',
           '&nbsp;&nbsp;vs&nbsp;&nbsp;',
         '</span>',
         '<span ng-show="yvs">',
           '<span>{{ylab}}</span>',
           '<select ng-model="yv" class="span1" ng-options="v for v in yvs">',
           '</select>',
         '</span>',
         '<span ng-show="yvs && (swbut || swsel)">',
           '&nbsp;&nbsp;',
         '</span>',
         '<span ng-show="swbut">',
           '<span>{{swbutlab}}</span>',
           '<button class="btn" data-toggle="button" ng-click="switchfn()">',
             '{{swbut}}',
           '</button>',
         '</span>',
         '<span ng-show="swsel">',
           '<label>{{swsellab}}&nbsp;</label>',
           '<select ng-model="stroke" .span1 ng-options="o for o in swsel">',
           '</select>',
         '</span>',
       '</span>',
     '</div>'].join(""),
    replace: true,
    link: function(scope, elm, as) {
      scope.$on('uiSetup', function() { setup(scope); });
    }
  };
}]);


radian.directive('plot',
 ['evalPlotExpr', 'plotOption', 'splitAttrs',
  '$timeout', '$rootScope', 'dumpScope',
 function(evalPlotExpr, plotOption, splitAttrs,
          $timeout, $rootScope, dumpScope)
{
  'use strict';

  var okas = { };
  [ 'aspect', 'axisX', 'axisXLabel', 'axisX2', 'axisY', 'axisYLabel',
    'axisY2', 'fill', 'fillOpacity', 'height', 'id', 'label',
    'legendSwitches', 'marker', 'markerSize', 'range', 'rangeX', 'rangeY',
    'selectX', 'selectY', 'stroke', 'strokeOpacity', 'strokeSwitch',
    'strokeWidth', 'title', 'width', 'zoom2d', 'zoomX', 'zoomY' ]
    .forEach(function(a) { okas[a] = 1; });

  // We do setup work here so that we can organise things before the
  // transcluded plotting directives are linked.
  function preLink(scope, elm, as, transclude) {
    // Split attributes into standard plot attributes and all others
    // (used as variables in data access expressions).
    splitAttrs(scope, as, okas, true, 'plot');
    scope.strokesel = 0;

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
    var svg = elm.children()[1];
    d3.select(svg).style('width', w).style('height', h);

    // Set up plot queue and function for child elements to add plots.
    scope.plots = [];
    scope.views = [];
    scope.switchable = [];
    scope.addPlot = function(draw, sc) {
      if (sc.plotOptions && sc.plotOptions.hasOwnProperty('legendSwitches') ||
          scope.plotOptions &&
          scope.plotOptions.hasOwnProperty('legendSwitches'))
        scope.switchable.push(scope.plots.length);
      scope.plots.push({ xidx:0, yidx:0, draw:draw,
                         scope:sc, enabled:true });
    };

    transclude(scope.$new(), function (cl) { elm.append(cl); });
  };

  // We do the actual plotting after the transcluded plot type
  // elements are linked -- each plot element puts a function on the
  // plot queue plus information about data ranges and we process all
  // the plots here.
  function postLink(scope, elm) {
    function redraw() {
      scope.views.forEach(function(v) { draw(v, scope.plots); });
    };
    function reset() {
      scope.views = svgs.map(function(s) { return setup(scope, s); });
    };

    // Set up plot areas (including zoomers).
    var popts = scope.plotOptions;
    var svgelm = d3.select(elm.children()[1]);
    var mainsvg = svgelm.append('g')
      .attr('width', scope.width).attr('height', scope.height);
    var svgs = [mainsvg];
    var setupBrush = null;
    if (popts.hasOwnProperty('zoomX')) {
      var zfrac = plotOption(scope, 'zoom-fraction', 0.2);
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
          draw(scope.views[0], scope.plots, scope.ui);
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
      // Draw plots.
      reset();
      if (setupBrush) setupBrush();
      redraw();
      legend(svgelm, scope);

      // Register plot data change handlers.
      scope.$on('paintChange', function(e) { redraw(); });
      scope.$on('dataChange', function(e, i) {
        reset();
        if (setupBrush) setupBrush();
        redraw();
      });

      // Register UI event handlers.
      scope.$on('strokeSelChange', function(e, i) {
        scope.strokesel = i;
        redraw();
      });
      scope.$on('xDataSelChange', function(e, i) {
        scope.plots.forEach(function(p) {
          if (p.scope.x && p.scope.x[0] instanceof Array)
            p.xidx = i % p.scope.x.length;
        });
        reset();
        if (setupBrush) setupBrush();
        redraw();
      });
      scope.$on('yDataSelChange', function(e, i) {
        scope.plots.forEach(function(p) {
          if (p.scope.y && p.scope.y[0] instanceof Array)
            p.yidx = i % p.scope.y.length;
        });
        reset();
        if (setupBrush) setupBrush();
        redraw();
      });

      scope.$broadcast('uiSetup');
    }, 0);

    // Set up interactivity.
    // ===> TODO: axis type control (linear, log, etc.)
    // ===> TODO: zoom and pan
    // ===> TODO: "layer" visibility
    // ===> TODO: styling changes
  };

  function legend(svgelm, scope) {
    // Render interactive legend.
    var nswitch = scope.switchable.length;
    if (nswitch > 0) {
      var legendps = scope.plots.filter(function(d,i) {
        return scope.switchable.indexOf(i) != -1;
      });
      var leggs = svgelm.append('g').selectAll('g')
        .data(legendps).enter().append('g');
      var legcs = leggs.append('circle').style('stroke-width', 1).attr('r', 5)
        .attr('fill', function(d,i) {
          return d.scope.plotOptions.stroke.split(';')[0] || '#000';
        })
        .attr('stroke', function(d,i) {
          return d.scope.plotOptions.stroke.split(';')[0] || '#000';
        });
      var clickHandler = function(d,i) {
        d.enabled = !d.enabled;
        d3.select(this).select('circle')
          .attr('fill', d.enabled ?
                (d.scope.plotOptions.stroke.split(';')[0] || '#000') : '#fff');
        scope.views.forEach(function(v) { draw(v, scope.plots, scope.ui); });
      };
      leggs.on('click', clickHandler);
      var legts = leggs.append('text')
        .attr('text-anchor', 'start').attr('dy', '.32em').attr('dx', '8')
        .text(function(d,i) {
          return d.scope.plotOptions.label || ('data' + i);
        });
      var widths = [];
      legts.each(function(d,i) { widths.push(d3.select(this).node().
                                             getComputedTextLength() + 10); });
      var mwidth = d3.max(widths), spacing = 15;
      var sep = mwidth + spacing;
      var len = nswitch * mwidth + (nswitch - 1) * spacing;
      leggs.attr('transform', function(d,i) {
        return 'translate(' + (scope.width - len + sep*i) + ',10)';
      });
    }
  };

  function setup(scope, svgelm) {
    var v = { svg:svgelm };

    // Extract plot attributes.
    var po = scope.plotOptions;
    v.xaxis = !po.axisX || po.axisX != 'off';
    v.yaxis = !po.axisY || po.axisY != 'off';
    var showXAxisLabel = !po.axisXLabel || po.axisXLabel != 'off';
    var showYAxisLabel = !po.axisYLabel || po.axisYLabel != 'off';
    var xAxisLabelText = po.axisXLabel;
    var yAxisLabelText = po.axisYLabel;
    v.margin = { top: po.topMargin || 2, right: po.rightMargin || 10,
                 bottom: po.bottomMargin || 2, left: po.leftMargin || 2 };

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
    var ps = scope.plots;
    function aext(d) {
      if (d[0] instanceof Array) {
        return d3.merge(d.map(function(a) { return d3.extent(a); }));
      } else
        return d3.extent(d);
    };
    var xextent =
      d3.extent(d3.merge(ps.filter(function(p) { return p.enabled; })
                         .map(function(p) { return aext(p.scope.x); })));
    var yextent =
      d3.extent(d3.merge(ps.filter(function(p) { return p.enabled; })
                         .map(function(p) { return aext(p.scope.y); })));

    // Set up D3 data ranges.
    // ===> TODO: deal with x1/x2, y1/y2 axes -- check for conflicts
    //            in data types and figure out what axes need to be
    //            drawn
    var hasdate = ps.some(function(p) {
      return p.scope.x.metadata && p.scope.x.metadata.format == 'date';
    });
    if (hasdate)
      v.x = d3.time.scale().range([0, v.realwidth]).domain(xextent);
    else
      v.x = d3.scale.linear().range([0, v.realwidth]).domain(xextent);
    v.y = d3.scale.linear().range([v.realheight, 0]).domain(yextent);

    // Figure out axis labels.
    if (showXAxisLabel) {
      if (!xAxisLabelText) {
        for (var i = 0; i < ps.length; ++i) {
          var px = ps[i].scope.x;
          if (px.metadata && px.metadata.label) {
            xAxisLabelText = px.metadata.label;
            if (px.metadata.units)
              xAxisLabelText += ' (' + px.metadata.units + ')';
            break;
          }
        }
        if (!xAxisLabelText && po.selectX) {
          var labs = po.selectX.split(',');
          xAxisLabelText = labs[ps[0].xidx];
        }
        if (!xAxisLabelText) xAxisLabelText = 'X Axis';
      }
      v.xlabel = xAxisLabelText;
    }
    if (showYAxisLabel) {
      if (!yAxisLabelText) {
        for (var i = 0; i < ps.length; ++i) {
          var py = ps[i].scope.y;
          if (py.metadata && py.metadata.label) {
            yAxisLabelText = py.metadata.label;
            if (py.metadata.units)
              yAxisLabelText += ' (' + py.metadata.units + ')';
            break;
          }
        }
        if (!yAxisLabelText && po.selectY) {
          var labs = po.selectY.split(',');
          yAxisLabelText = labs[ps[0].yidx];
        }
        if (!yAxisLabelText) yAxisLabelText = 'Y Axis';
      }
      v.ylabel = yAxisLabelText;
    }

    return v;
  };

  function draw(v, ps, ui) {
    // Clean out any pre-existing plots.
    v.svg.selectAll('g').remove();

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
      var has_date = ps.some(function(p) {
        var x = p.scope.x;
        if (x && x.metadata && x.metadata.format == 'date') {
          if (x.metadata.dateFormat) dformat = x.metadata.dateFormat;
          return true;
        }
        return false;
      });
      if (has_date) axis.tickFormat(d3.time.format(dformat));
      outsvg.append('g').attr('class', 'axis')
        .attr('transform', 'translate(' + v.margin.left + ',' +
              (+v.realheight + 4) + ')').call(axis);
      if (v.xlabel)
        outsvg.append('g').attr('class', 'axis-label')
        .attr('transform', 'translate(' +
              (+v.margin.left + v.realwidth / 2) +
              ',' + v.realheight + ')')
        .append('text')
        .attr('x', 0).attr('y', 35)
        .attr('text-anchor', 'middle').text(v.xlabel);
    }
    if (v.yaxis && v.y) {
      var axis = d3.svg.axis()
        .scale(v.y).orient('left')
        .ticks(outsvg.attr('height') / 36);
      var axsvg = outsvg.append('g').attr('class', 'axis');
      axsvg = axsvg
        .attr('transform', 'translate(' + (+v.margin.left - 4) + ',0)');
      axsvg.call(axis);
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
    ps.forEach(function(p) {
      if (p.enabled && p.scope.x && p.scope.y) {
        // Append SVG group for this plot and draw the plot into it.
        var g = svg.append('g');
        var x = (p.scope.x[0] instanceof Array) ? p.scope.x[p.xidx] : p.scope.x;
        var y = (p.scope.y[0] instanceof Array) ? p.scope.y[p.yidx] : p.scope.y;
        p.draw(g, x, v.x, y, v.y, p.scope);
      }
    });

    if (v.post) v.post(svg);
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


radian.directive('lines',
 ['getStyle', 'splitAttrs', 'evalPlotExpr', '$rootScope', 'dumpScope',
 function(getStyle, splitAttrs, evalPlotExpr, $rootScope, dumpScope)
{
  'use strict';

  var as = [ 'fill', 'fillOpacity', 'label', 'legendSwitches', 'marker',
             'markerSize', 'selectX', 'selectY', 'stroke', 'strokeOpacity',
             'strokeWidth' ];
  var plotas = { };
  as.forEach(function(a) { plotas[a] = 1; });

  function draw(svg, x, xs, y, ys, sc) {
    var width   = getStyle('strokeWidth',   sc, 1);
    var opacity = getStyle('strokeOpacity', sc, 1.0);

    // Deal with stroke selection.
    var sopts = getStyle('stroke', sc, '#000').split(';');
    var s;
    if (sopts.length == 1 || !sc.strokesel)
      s = sopts[0];
    else if (!isNaN(parseInt(sc.strokesel)))
      s = sopts[sc.strokesel % sopts.length];
    else
      s = sopts[Math.max(0, sc.swsel.indexOf(sc.strokesel)) % sopts.length];

    // Switch on type of stroke...
    if (s.indexOf(':') == -1) {
      // Normal single-colour line.
      var line = d3.svg.line()
        .x(function (d) { return xs(d[0]); })
        .y(function (d) { return ys(d[1]); });
      svg.append('path').datum(d3.zip(x, y))
        .attr('class', 'line').attr('d', line)
        .style('fill', 'none')
        .style('stroke-width', width)
        .style('stroke-opacity', opacity)
        .style('stroke', s);
    } else {
      // Fading stroke.
      var strokes = s.split(':');
      var sc = function(dx) { return 1 - Math.exp(-20*dx/(3*x.length)); };
      var ihsl = d3.interpolateHsl(strokes[0], strokes[1]);
      var based = d3.zip(x, y);
      var lined = d3.zip(based, based.slice(1));
      svg.selectAll('path').data(lined).enter().append('path')
        .attr('class', 'line')
        .style('stroke-width', width)
        .style('stroke-opacity', opacity)
        .style('stroke', function(d,i) { return ihsl(sc(i)); })
        .attr('d', d3.svg.line()
              .x(function (d) { return xs(d[0]); })
              .y(function (d) { return ys(d[1]); }));
    }
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
      splitAttrs(scope, as, plotas, true, 'lines');
      elm.hide();
      scope.$parent.addPlot(draw, scope);
      as.$observe('x', function(newx) {
        scope.x = evalPlotExpr(scope, newx);
        scope.$emit('dataChange');
      });
      as.$observe('y', function(newy) {
        scope.y = evalPlotExpr(scope, newy);
        scope.$emit('dataChange');
      });
      as.$observe('stroke', function() { scope.$emit('paintChange'); });
    }
  };
}]);
