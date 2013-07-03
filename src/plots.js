// Line plots.

radian.directive('lines',
 ['plotTypeLink', function(plotTypeLink)
{
  'use strict';

  function draw(svg, x, xs, y, ys, s) {
    function sty(v) {
      return (v instanceof Array) ? function(d, i) { return v[i]; } : v;
    };
    var width   = s.strokeWidth || 1;
    var opacity = s.strokeOpacity || 1.0;
    var stroke = s.stroke || '#000';
    var ssel = s.$eval('strokesel');
    if (stroke instanceof Array && s.$eval('strokesel') !== undefined)
      stroke = ssel ? stroke[ssel % stroke.length] : stroke[0];

    // Deal with along-stroke interpolation.
    if (stroke instanceof Function) {
      var tmp = new Array(x.length);
      for (var i = 0; i < x.length; ++i) tmp[i] = i / x.length;
      stroke = stroke(tmp);
    }

    // Switch on type of stroke...
    if (!(width instanceof Array || opacity instanceof Array ||
          stroke instanceof Array)) {
      // Normal lines; single path.
      var line = d3.svg.line()
        .x(function (d) { return xs(d[0]); })
        .y(function (d) { return ys(d[1]); });
      svg.append('path').datum(d3.zip(x, y))
        .attr('class', 'line').attr('d', line)
        .style('fill', 'none')
        .style('stroke-width', width)
        .style('stroke-opacity', opacity)
        .style('stroke', stroke);
    } else {
      // Multiple paths to deal with varying characteristics along
      // line.
      var maxsegments = 200;
      var ptsperseg = Math.max(1, Math.floor(x.length / maxsegments));
      var based = d3.zip(x, y), lined = [];
      var widths = [], opacities = [], strokes = [];
      var i0 = 0, i1 = ptsperseg;
      while (i0 < x.length) {
        lined.push(based.slice(i0, i1+1));
        var imid = Math.floor((i0 + i1) / 2);
        widths.push(width instanceof Array ? width[imid] : width);
        opacities.push(opacity instanceof Array ? opacity[imid] : opacity);
        strokes.push(stroke instanceof Array ? stroke[imid] : stroke);
        i0 = i1;
        i1 = i0 + ptsperseg;
      }
      svg.selectAll('path').data(lined).enter().append('path')
        .attr('class', 'line')
        .style('stroke-width', function(d, i) { return widths[i]; })
        .style('stroke-opacity', function(d, i) { return opacities[i]; })
        .style('stroke', function(d, i) { return strokes[i]; })
        .style('fill', 'none')
        .attr('d', d3.svg.line()
              .x(function (d) { return xs(d[0]); })
              .y(function (d) { return ys(d[1]); }));
    }
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
      scope.$on('setupExtra', function() {
        var width = scope.strokeWidth instanceof Array &&
                    scope.strokeWidth.length > 0 ?
          scope.strokeWidth.reduce(function(x,y) {
            return Math.max(Number(x), Number(y));
          }) : (Number(scope.strokeWidth) || 1);
        scope.rangeExtendPixels([width/2, width/2], [width/2, width/2]);
      });
      plotTypeLink(scope, elm, as, draw);
    }
  };
}]);


// Scatter/bubble plots.

radian.directive('points',
 ['plotTypeLink', function(plotTypeLink)
{
  'use strict';

  function draw(svg, x, xs, y, ys, s) {
    var marker = s.marker || "circle";
    var markerSize = s.markerSize || 1;
    var stroke = s.stroke || '#000';
    var strokeWidth = s.strokeWidth || 1.0;
    var strokeOpacity = s.strokeOpacity || 1.0;
    var fill = s.fill || 'none';
    var fillOpacity = s.fillOpacity || 1.0;
    var orientation = s.orientation || 0.0;

    // Plot points: plot attributes are either single values or arrays
    // of values, one per point.
    function sty(v) {
      return (v instanceof Array) ? function(d, i) { return v[i]; } : v;
    };
    var points = d3.svg.symbol().type(sty(marker)).size(sty(markerSize));
    svg.selectAll('path').data(d3.zip(x, y))
      .enter().append('path')
      .attr('transform', function(d) {
        return 'translate(' + xs(d[0]) + ',' + ys(d[1]) + ')';
      })
      .attr('d', points)
      .style('fill', sty(fill))
      .style('fill-opacity', sty(fillOpacity))
      .style('stroke-width', sty(strokeWidth))
      .style('stroke-opacity', sty(strokeOpacity))
      .style('stroke', sty(stroke));
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
      scope.$on('setupExtra', function() {
        var width = scope.strokeWidth instanceof Array &&
                    scope.strokeWidth.length > 0 ?
          scope.strokeWidth.reduce(function(x,y) {
            return Math.max(Number(x), Number(y));
          }) : (Number(scope.strokeWidth) || 1);
        if (scope.stroke == 'none') width = 0;
        var size = scope.markerSize instanceof Array &&
                   scope.markerSize.length > 0 ?
          scope.markerSize.reduce(function(x,y) {
            return Math.max(Number(x), Number(y));
          }) : (Number(scope.markerSize) || 1);
        var delta = (width + Math.sqrt(size)) / 2;
        scope.rangeExtendPixels([delta, delta], [delta, delta]);
      });
      plotTypeLink(scope, elm, as, draw);
    }
  };
}]);


// Bar charts.

radian.directive('bars',
 ['plotTypeLink', function(plotTypeLink)
{
  'use strict';

  function draw(svg, x, xs, y, ys, s, w, h) {
    var strokeWidth   = s.strokeWidth || 1;
    var strokeOpacity = s.strokeOpacity || 1.0;
    var stroke = s.stroke || '#000';
    var fillOpacity = s.fillOpacity || 1.0;
    var fill = s.fill || 'none';
    var barMin = s.barMin || null;
    var barMax = s.barMax || null;
    var barWidth = s.barWidth || 1.0;
    var pxBarWidth, pxWidth = false;
    if (typeof barWidth == 'string' &&
        barWidth.trim().substr(-2,2) == 'px') {
      pxBarWidth =
        Number(barWidth.trim().substr(0, barWidth.trim().length - 2));
      barWidth = xs.invert(pxBarWidth) - xs.invert(0);
      pxWidth = true;
    }
    var barOffset = s.barOffset || 0.0;
    var pxOffset = false;
    if (typeof barOffset == 'string' &&
        barOffset.trim().substr(-2,2) == 'px') {
      var pxoffset =
        Number(barOFfset.trim().substr(0, barOffset.trim().length - 2));
      barOffset = xs.invert(pxoffset) - xs.invert(0);
      pxOffset = true;
    }

    // Plot bars: plot attributes are either single values or arrays
    // of values, one per bar.
    function sty(v) {
      return (v instanceof Array) ? function(d, i) { return v[i]; } : v;
    };
    var dat;
    if (barMin && barMax)
      dat = d3.zip(barMin, barMax, y);
    else
      dat = d3.zip(x, y);
    svg.selectAll('rect').data(dat)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function(d, i) {
        if (d.length == 3)
          return xs(d[0]);
        else return d[0] instanceof Date ?
          xs(new Date(d[0].valueOf() -
                      (pxWidth ? barWidth : s.barWidths[i] * barWidth) / 2.0 +
                      (pxOffset ? barOffset : s.barWidths[i] * barOffset))) :
          xs(d[0] -
             (pxWidth ? barWidth : s.barWidths[i] * barWidth) / 2.0 +
             (pxOffset ? barOffset : s.barWidths[i] * barOffset));
      })
      .attr('y', function(d, i) { return ys(d[d.length-1]); })
      .attr('width', function(d, i) {
        if (pxWidth)
          return pxBarWidth;
        else if (d.length == 3)
          return xs(d[1]) - xs(d[0]);
        else
          return d[0] instanceof Date ?
            xs(new Date(d[0].valueOf() + s.barWidths[i] * barWidth / 2.0)) -
            xs(new Date(d[0].valueOf() - s.barWidths[i] * barWidth / 2.0)) :
            xs(d[0] + s.barWidths[i] * barWidth / 2.0) -
            xs(d[0] - s.barWidths[i] * barWidth / 2.0);
      })
      .attr('height', function(d, i) { return h - ys(d[d.length-1]); })
      .style('fill', sty(fill))
      .style('fill-opacity', sty(fillOpacity))
      .style('stroke-width', sty(strokeWidth))
      .style('stroke-opacity', sty(strokeOpacity))
      .style('stroke', sty(stroke));
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
      scope.$on('setupExtra', function() {
        if (scope.barMin && scope.barMax) {
          scope.barWidths = scope.barMax.map(function(mx, i) {
            return mx - scope.barMin[i];
          });
          var last = scope.x.length - 1;
          scope.rangeXExtend = [scope.x[0] - scope.barMin[0],
                                scope.barMax[last] - scope.x[last]];
        } else {
          scope.barWidths = scope.x.map(function(xval, i) {
            if (i == 0) return scope.x[1] - xval;
            else if (i == scope.x.length - 1)
              return xval - scope.x[scope.x.length - 2];
            else return (scope.x[i+1] - scope.x[i-1]) / 2;
          });
          scope.rangeXExtend = [scope.barWidths[0] / 2,
                                scope.barWidths[scope.x.length - 1] / 2];
        }
        var width = scope.strokeWidth instanceof Array &&
                    scope.strokeWidth.length > 0 ?
          scope.strokeWidth.reduce(function(x,y) {
            return Math.max(Number(x), Number(y));
          }) : (Number(scope.strokeWidth) || 1);
        scope.rangeExtendPixels([2*width, 2*width], null);
      });
      plotTypeLink(scope, elm, as, draw);
    }
  };
}]);


// Area plots.

radian.directive('area',
 ['plotTypeLink', function(plotTypeLink)
{
  'use strict';

  function draw(svg, x, xs, y, ys, s, axis) {
    var opacity = s.fillOpacity || 1.0;
    var fill = s.fill || '#000';
    var yminv = axis == 1 ? 'ymin' : 'y2min';
    var ymin, ymintmp = 0;
    if (s.hasOwnProperty(yminv)) ymintmp = s[yminv];
    if (ymintmp instanceof Array)
      ymin = ymintmp;
    else {
      ymin = new Array(x.length);
      for (var i = 0; i < ymin.length; ++i) ymin[i] = Number(ymintmp);
    }

    // Switch on type of stroke...
    if (!(opacity instanceof Array || fill instanceof Array)) {
      // Normal area; single path.
      var area = d3.svg.area()
        .x(function(d) { return xs(d[0]); })
        .y0(function(d) { return ys(d[1]); })
        .y1(function(d) { return ys(d[2]); });
      svg.append('path').datum(d3.zip(x, ymin, y))
        .attr('class', 'area').attr('d', area)
        .style('fill-opacity', opacity)
        .style('fill', fill);
    } else throw Error("<area> plots require singular paint attributes")
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
      plotTypeLink(scope, elm, as, draw);
    }
  };
}]);


