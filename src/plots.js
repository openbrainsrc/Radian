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
    var sopts = [], str = '';
    if (typeof stroke == "string") {
      sopts = stroke.split(';');
      str = (sopts.length == 1 || !s.strokesel) ?
        sopts[0] : sopts[s.strokesel % sopts.length];
    }

    // Switch on type of stroke...
    if (typeof stroke != "string" || str.indexOf(':') == -1) {
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
        var based = d3.zip(x, y);
        var lined = d3.zip(based, based.slice(1));
        svg.selectAll('path').data(lined).enter().append('path')
          .attr('class', 'line')
          .style('stroke-width', sty(width))
          .style('stroke-opacity', sty(opacity))
          .style('stroke', sty(stroke))
          .attr('d', d3.svg.line()
                .x(function (d) { return xs(d[0]); })
                .y(function (d) { return ys(d[1]); }));
      }
    } else {
      // Special for fading stroke (temporary).
      var strokes = str.split(':');
      var interp = function(dx) { return 1 - Math.exp(-20*dx/(3*x.length)); };
      var ihsl = d3.interpolateHsl(strokes[0], strokes[1]);
      var based = d3.zip(x, y);
      var lined = d3.zip(based, based.slice(1));
      svg.selectAll('path').data(lined).enter().append('path')
        .attr('class', 'line')
        .style('stroke-width', width)
        .style('stroke-opacity', opacity)
        .style('stroke', function(d,i) { return ihsl(interp(i)); })
        .attr('d', d3.svg.line()
              .x(function (d) { return xs(d[0]); })
              .y(function (d) { return ys(d[1]); }));
    }
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
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
      .style('fillOpacity', sty(fillOpacity))
      .style('stroke-width', sty(strokeWidth))
      .style('stroke-opacity', sty(strokeOpacity))
      .style('stroke', sty(stroke));
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
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
    var barWidth = s.barWidth || 1.0;
    var barOffset = s.barOffset || 0.0;

    // Single-colour bars.
    d3.zip(x, y).forEach(function(d, i) {
      svg.append('rect')
        .attr('class', 'bar')
        .attr('x', d[0] instanceof Date ?
              xs(new Date(d[0].valueOf() -
                          s.barWidths[i] * (barWidth / 2.0 + barOffset))) :
              xs(d[0] - s.barWidths[i] * (barWidth / 2.0 + barOffset)))
        .attr('y', ys(d[1]))
        .attr('width', d[0] instanceof Date ?
              xs(new Date(d[0].valueOf() + s.barWidths[i] * barWidth / 2.0)) -
              xs(new Date(d[0].valueOf() - s.barWidths[i] * barWidth / 2.0)) :
              xs(d[0] + s.barWidths[i] * barWidth / 2.0) -
              xs(d[0] - s.barWidths[i] * barWidth / 2.0))
        .attr('height', h - ys(d[1]))
        .style('fill', fill)
        .style('fillOpacity', fillOpacity)
        .style('stroke-width', strokeWidth)
        .style('stroke-opacity', strokeOpacity)
        .style('stroke', stroke);
    });
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
      plotTypeLink(scope, elm, as, draw);
      scope.$watch('x', function() {
        scope.barWidths = scope.x.map(function(xval, i) {
          if (i == 0) return scope.x[1] - xval;
          else if (i == scope.x.length - 1)
            return xval - scope.x[scope.x.length - 2];
          else return (scope.x[i+1] - scope.x[i-1]) / 2;
        });
        scope.rangeXExtend = [scope.barWidths[0] / 2,
                              scope.barWidths[scope.x.length - 1] / 2];
      });
    }
  };
}]);
