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
    if (s.strokeSwitch)
      stroke = s.strokesel ? stroke[s.strokesel % stroke.length] : stroke[0];

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
      var ptsperseg = 50, maxsegments = Math.floor(x.length / ptsperseg);
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

    // Plot bars: plot attributes are either single values or arrays
    // of values, one per bar.
    function sty(v) {
      return (v instanceof Array) ? function(d, i) { return v[i]; } : v;
    };
    svg.selectAll('rect').data(d3.zip(x, y))
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function(d, i) {
        return d[0] instanceof Date ?
          xs(new Date(d[0].valueOf() -
                      s.barWidths[i] * (barWidth / 2.0 + barOffset))) :
          xs(d[0] - s.barWidths[i] * (barWidth / 2.0 + barOffset));
      })
      .attr('y', function(d, i) { return ys(d[1]); })
      .attr('width', function(d, i) {
        return d[0] instanceof Date ?
          xs(new Date(d[0].valueOf() + s.barWidths[i] * barWidth / 2.0)) -
          xs(new Date(d[0].valueOf() - s.barWidths[i] * barWidth / 2.0)) :
          xs(d[0] + s.barWidths[i] * barWidth / 2.0) -
          xs(d[0] - s.barWidths[i] * barWidth / 2.0);
      })
      .attr('height', function(d, i) { return h - ys(d[1]); })
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
        scope.barWidths = scope.x.map(function(xval, i) {
          if (i == 0) return scope.x[1] - xval;
          else if (i == scope.x.length - 1)
            return xval - scope.x[scope.x.length - 2];
          else return (scope.x[i+1] - scope.x[i-1]) / 2;
        });
        scope.rangeXExtend = [scope.barWidths[0] / 2,
                              scope.barWidths[scope.x.length - 1] / 2];
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

  function draw(svg, x, xs, y, ys, s, rw, rh, axis) {
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


// Background plots.

radian.directive('background',
 ['processAttrs', '$http', '$timeout',
  function(processAttrs, $http, $timeout)
{
  'use strict';

  function draw(svg, s) {
    console.log("<background> got a draw...");
    console.log($(svg));
    $(svg).text('<rect x="80" y="90" width="30" height="30">');
//    svg.append('g').datum(0).html('<rect x="80" y="90" width="30" height="30">');
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
      processAttrs(scope, as);
      elm.hide();
      scope.noData = true;
      scope.draw = draw;
      scope.$parent.addPlot(scope);
      console.log(scope);

      if (!scope.src) throw Error("<background> element needs SRC");
      $timeout(function () {
        $http.get(scope.src)
          .success(function(data) {
            scope.bg = data;
            scope.$emit('dataChange');
          })
          .error(function() {
            throw Error("failed to read data from " + scope.src);
          });
      });
    }
  };
}]);


