// Line plots.

radian.factory('drawLinesGeneric', function()
{
  'use strict';

  return function(svg, x, xs, y, ys, s, setupPlotXY) {
    function sty(v) {
      return (v instanceof Array) ? function(d, i) { return v[i]; } : v;
    };
    function sty0(v) {
      return (v instanceof Array) ? function(d, i) { return v[0]; } : v;
    };
    function apSc(sc, d, i) {
      var dtmp = d;
      if (sc.oton) dtmp = sc.oton(d);
      return sc(dtmp, i);
    };
    var width   = s.strokeWidth || 1;
    var opacity = s.strokeOpacity || 1.0;
    var stroke = s.stroke || '#000';
    var ssel = s.$eval('strokesel');
    if (stroke instanceof Array && s.$eval('strokesel') !== undefined)
      stroke = ssel ? stroke[ssel % stroke.length] : stroke[0];
    var missing = s.missing || 'interpolate';
    var gapMarker = s.gapMarker || 'circle';
    var gapMarkerSize = s.gapMarkerSize || Math.pow(width * 2, 2);
    var gapMarkerStroke = s.gapMarkerStroke || stroke;
    var gapMarkerStrokeWidth = s.gapMarkerStrokeWidth || width;
    var gapMarkerFill = s.gapMarkerFill || stroke;
    var gapMarkerStrokeOpacity = s.gapMarkerStrokeOpacity || opacity;
    var gapMarkerFillOpacity = s.gapMarkerFillOpacity || opacity;

    // Deal with along-stroke interpolation.
    if (stroke instanceof Function) {
      var tmp = new Array(x.length);
      for (var i = 0; i < x.length; ++i) tmp[i] = i / x.length;
      stroke = stroke(tmp);
    }

    // Plot-type dependent data setup.
    var tmpx = [], tmpy = [];
    setupPlotXY(x, tmpx, y, tmpy);

    // Deal with missing values.
    var plotx = [], ploty = [], plotstr = [], plotwid = [], plotopa = [];
    switch (missing) {
    case 'interpolate': {
      // If we're interpolating over missing values, just elide any
      // missing data points and build a single segment.
      var curx = [], cury = [], curstr = [], curwid = [], curopa = [];
      for (var i = 0; i < tmpx.length; ++i) {
        if (tmpy[i] !== null && !isNaN(tmpy[i])) {
          curx.push(tmpx[i]);
          cury.push(tmpy[i]);
          if (width instanceof Array) curwid.push(width[i]);
          if (opacity instanceof Array) curopa.push(opacity[i]);
          if (stroke instanceof Array) curstr.push(stroke[i]);
        }
      }
      plotx.push(curx); ploty.push(cury);
      plotstr.push(curstr); plotwid.push(curwid); plotopa.push(curopa);
      break;
    }

    case 'gap': {
      // If we're gapping missing values, elide missing data points
      // and build segments for each run of contiguous non-missing
      // points.
      var curx = [], cury = [], curstr = [], curwid = [], curopa = [];
      for (var i = 0; i < tmpx.length; ++i) {
        if (tmpy[i] === null || isNaN(tmpy[i])) {
          // End of segment.
          if (curx.length > 0) {
            plotx.push(curx); ploty.push(cury);
            plotstr.push(curstr); plotwid.push(curwid); plotopa.push(curopa);
            curx = []; cury = []; curstr = []; curwid = []; curopa = [];
          }
        } else {
          curx.push(tmpx[i]);
          cury.push(tmpy[i]);
          if (width instanceof Array) curwid.push(width[i]);
          if (opacity instanceof Array) curopa.push(opacity[i]);
          if (stroke instanceof Array) curstr.push(stroke[i]);
        }
      }
      // Last segment.
      if (curx.length > 0) {
        plotx.push(curx); ploty.push(cury);
        plotstr.push(curstr); plotwid.push(curwid); plotopa.push(curopa);
      }
      break;
    }
    }

    // Switch on type of stroke...
    if (!(width instanceof Array || opacity instanceof Array ||
          stroke instanceof Array)) {
      // Normal lines; one path per segment, potentially with gaps.
      var line = d3.svg.line()
        .x(function (d, i) { return xs.ap(d[0], i); })
        .y(function (d, i) { return apSc(ys, d[1], i); });
      var points =
        d3.svg.symbol().type(sty0(gapMarker)).size(sty0(gapMarkerSize));
      for (var seg = 0; seg < plotx.length; ++seg) {
        var segx = plotx[seg], segy = ploty[seg];
        var segwid = plotwid[seg], segopa = plotopa[seg], segstr = plotstr[seg];
        if (segx.length > 1) {
          svg.append('path').datum(d3.zip(segx, segy))
            .attr('class', 'line').attr('d', line)
            .style('fill', 'none')
            .style('stroke-width', width instanceof Array ? segwid : width)
            .style('stroke-opacity',
                   opacity instanceof Array ? segopa : opacity)
            .style('stroke', stroke instanceof Array ? segstr : stroke);
        } else {
          svg.append('g').selectAll('path').data(d3.zip(segx, segy))
            .enter().append('path')
            .attr('transform', function(d, i) {
              return 'translate(' + xs.ap(d[0], i) + ',' +
                                    apSc(ys, d[1], i) + ')';
            })
            .attr('d', points)
            .style('fill', sty0(gapMarkerFill))
            .style('fill-opacity', sty0(gapMarkerFillOpacity))
            .style('stroke-width', sty0(gapMarkerStrokeWidth))
            .style('stroke-opacity', sty0(gapMarkerStrokeOpacity))
            .style('stroke', sty0(gapMarkerStroke));
        }
      }
    } else {
      // Multiple paths to deal with varying characteristics along
      // line.
      var points =
        d3.svg.symbol().type(sty0(gapMarker)).size(sty0(gapMarkerSize));
      for (var seg = 0; seg < plotx.length; ++seg) {
        var segx = plotx[seg], segy = ploty[seg];
        var segwid = plotwid[seg], segopa = plotopa[seg], segstr = plotstr[seg];
        if (segx.length > 1) {
          var maxsegments = 200;
          var ptsperseg = Math.max(1, Math.floor(x.length / maxsegments));
          var based = d3.zip(segx, segy), lined = [];
          var widths = [], opacities = [], strokes = [];
          var i0 = 0, i1 = ptsperseg;
          while (i0 < segx.length) {
            lined.push(based.slice(i0, i1+1));
            var imid = Math.floor((i0 + i1) / 2);
            widths.push(width instanceof Array ? segwid[imid] : width);
            opacities.push(opacity instanceof Array ? segopa[imid] : opacity);
            strokes.push(stroke instanceof Array ? segstr[imid] : stroke);
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
                  .x(function (d, i) { return xs.ap(d[0], i); })
                  .y(function (d, i) { return apSc(ys, d[1], i); }));
        } else {
          svg.append('g').selectAll('path').data(d3.zip(segx, segy))
            .enter().append('path')
            .attr('transform', function(d, i) {
              return 'translate(' + xs.ap(d[0], i) + ',' +
                                    apSc(ys, d[1], i) + ')';
            })
            .attr('d', points)
            .style('fill', sty0(gapMarkerFill))
            .style('fill-opacity', sty0(gapMarkerFillOpacity))
            .style('stroke-width', sty0(gapMarkerStrokeWidth))
            .style('stroke-opacity', sty0(gapMarkerStrokeOpacity))
            .style('stroke', sty0(gapMarkerStroke));
        }
      }
    }
  };
});

radian.directive('vlines',
 ['plotTypeLink',  'drawLinesGeneric',
  function(plotTypeLink, drawLinesGeneric)
{
  'use strict';

  function draw(svg, x, xs, y, ys, s) {
    function setupPlotXY(x, plotx, y, ploty) {
      x.forEach(function(v) {
        plotx.push(v);  ploty.push(-1000);
        plotx.push(v);  ploty.push(1000);
      });
    };
    drawLinesGeneric(svg, x, xs, y, ys, s, setupPlotXY);
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
      scope.checkPlottable = function(xvar, yvar) { return xvar; };
      plotTypeLink('vlines', scope, elm, as, draw);
    }
  };
}]);

radian.directive('hlines',
 ['plotTypeLink', 'drawLinesGeneric',
  function(plotTypeLink, drawLinesGeneric)
{
  'use strict';

  function draw(svg, x, xs, y, ys, s) {
    function setupPlotXY(x, plotx, y, ploty) {
      y.forEach(function(v) {
        ploty.push(v);  plotx.push(-1000);
        ploty.push(v);  plotx.push(1000);
      });
    };
    drawLinesGeneric(svg, x, xs, y, ys, s, setupPlotXY);
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
      scope.checkPlottable = function(xvar, yvar) { return yvar; };
      plotTypeLink('hlines', scope, elm, as, draw);
    }
  };
}]);

radian.directive('lines',
 ['plotTypeLink', 'drawLinesGeneric',
  function(plotTypeLink, drawLinesGeneric)
{
  'use strict';

  function draw(svg, x, xs, y, ys, s) {
    function setupPlotXY(x, plotx, y, ploty) {
      x.forEach(function(v) { plotx.push(v); });
      y.forEach(function(v) { ploty.push(v); });
    };
    drawLinesGeneric(svg, x, xs, y, ys, s, setupPlotXY);
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
      plotTypeLink('lines', scope, elm, as, draw);
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
    var strokeWidth = s.strokeWidth || 1.0;
    var strokeOpacity = s.strokeOpacity || 1.0;
    var fillOpacity = s.fillOpacity || 1.0;
    var markerSize = s.markerSize || 1;
    var orientation = s.orientation || 0.0;
    var stroke, fill;
    if (marker != 'text') {
      stroke = s.stroke || '#000';
      fill = s.fill || 'none';
    } else {
      stroke = s.stroke || 'none';
      fill = s.fill || '#000';
    }

    // Plot points: plot attributes are either single values or arrays
    // of values, one per point.
    function sty(v) {
      return (v instanceof Array) ? function(d, i) { return v[i]; } : v;
    };
    function fssty(v) {
      return ((v instanceof Array) ? function(d, i) { return v[i]; } : v) +
        'px';
    };
    function apSc(sc, d, i) {
      var dtmp = d;
      if (sc.oton) dtmp = sc.oton(d);
      return sc(dtmp, i);
    };
    var plotx = [], ploty = [];
    var plotmark = marker instanceof Array ? [] : marker;
    var plotsize = markerSize instanceof Array ? [] : markerSize;
    var plotstr = stroke instanceof Array ? [] : stroke;
    var plotfill = fill instanceof Array ? [] : fill;
    var plotwid = strokeWidth instanceof Array ? [] : strokeWidth;
    var plotsopa = strokeOpacity instanceof Array ? [] : strokeOpacity;
    var plotfopa = fillOpacity instanceof Array ? [] : fillOpacity;
    for (var i = 0; i < x.length; ++i) {
      if (y[i] !== null && !isNaN(y[i])) {
        plotx.push(x[i]);
        ploty.push(y[i]);
        if (marker instanceof Array) plotmark.push(marker[i]);
        if (markerSize instanceof Array) plotsize.push(markerSize[i]);
        if (fill instanceof Array) plotfill.push(fill[i]);
        if (fillOpacity instanceof Array) plotfopa.push(fillOpacity[i]);
        if (stroke instanceof Array) plotstr.push(stroke[i]);
        if (strokeWidth instanceof Array) plotwid.push(strokeWidth[i]);
        if (strokeOpacity instanceof Array) plotsopa.push(strokeOpacity[i]);
      }
    }
    if (marker != 'text') {
      var points = d3.svg.symbol().type(sty(plotmark)).size(sty(plotsize));
      svg.selectAll('path').data(d3.zip(plotx, ploty))
        .enter().append('path')
        .attr('transform', function(d, i) {
          return 'translate(' + xs.ap(d[0], i) + ',' +
                                apSc(ys, d[1], i) + ')';
        })
        .attr('d', points)
        .style('fill', sty(plotfill))
        .style('fill-opacity', sty(plotfopa))
        .style('stroke-width', sty(plotwid))
        .style('stroke-opacity', sty(plotsopa))
        .style('stroke', sty(plotstr));
    } else {
      var fontSize = s.markerFontSize || 12;
      var fontFamily = s.markerFontFamily || (s.fontFamily || null);
      var fontStyle = s.markerFontStyle || (s.fontStyle || null);
      var fontWeight = s.markerFontWeight || (s.fontWeight || null);
      var fontVariant = s.markerFontVariant || (s.fontVariant || null);
      var markerText = s.markerText;
      if (marker == 'text' && !markerText) {
        markerText = new Array(x.length);
        for (var i = 0; i < x.length; ++i) markerText[i] = 'X';
      }
      var markerAlignment = s.markerAlignment || 'centre,centre';
      var as = markerAlignment.split(/,/);
      var textAnchor = as[0];
      var baselineShift = as.length > 1 ? as[1] : '0';
      switch (textAnchor) {
      case 'centre': textAnchor = 'middle'; break;
      case 'left':   textAnchor = 'start';  break;
      case 'right':  textAnchor = 'end';    break;
      default:       textAnchor = 'middle'; break;
      }
      switch (baselineShift) {
      case 'centre': baselineShift = '0';    break;
      case 'top':    baselineShift = '-50%'; break;
      case 'bottom': baselineShift = '50%';  break;
      default:       baselineShift = '0';    break;
      }
      var points = d3.svg.symbol().type(sty(plotmark)).size(sty(plotsize));
      svg.selectAll('text').data(d3.zip(plotx, ploty))
        .enter().append('text')
        .attr('transform', function(d, i) {
          return 'translate(' + xs.ap(d[0], i) + ',' +
                                apSc(ys, d[1], i) + ')';
        })
        .text(function(d, i) { return markerText[i]; })
        .attr('text-anchor', textAnchor)
        .style('baseline-shift', baselineShift)
        .style('dominant-baseline', 'middle')
        .style('font-size', fssty(fontSize))
        .style('font-family', sty(fontFamily))
        .style('font-style', sty(fontStyle))
        .style('font-weight', sty(fontWeight))
        .style('font-variant', sty(fontVariant))
        .style('fill', sty(plotfill))
        .style('fill-opacity', sty(plotfopa))
        .style('stroke-width', sty(plotwid))
        .style('stroke-opacity', sty(plotsopa))
        .style('stroke', sty(plotstr));
    }
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(s, elm, as) {
      s.$on('setupExtra', function() {
        if (s.marker != 'text') {
          var width = s.strokeWidth instanceof Array &&
            s.strokeWidth.length > 0 ?
            s.strokeWidth.reduce(function(x,y) {
              return Math.max(Number(x), Number(y));
            }) : (Number(s.strokeWidth) || 1);
          if (s.stroke == 'none') width = 0;
          var size = s.markerSize instanceof Array &&
            s.markerSize.length > 0 ?
            s.markerSize.reduce(function(x,y) {
              return Math.max(Number(x), Number(y));
            }) : (Number(s.markerSize) || 1);
          var delta = (width + Math.sqrt(size)) / 2;
          s.rangeExtendPixels([delta, delta], [delta, delta]);
        } else {
          var markerText = s.markerText;
          if (!markerText) {
            markerText = new Array(x.length);
            for (var i = 0; i < x.length; ++i) markerText[i] = 'X';
          }
          var fattrs = {
            size: s.markerFontSize || 12,
            family: s.markerFontFamily || (s.fontFamily || null),
            style: s.markerFontStyle || (s.fontStyle || null),
            weight: s.markerFontWeight || (s.fontWeight || null),
            variant: s.markerFontVariant || (s.fontVariant || null)
          };
          var maxw = 0, maxh = 0;
          markerText.forEach(function(t) {
            var sz = s.getTextSize(t, fattrs);
            maxw = Math.max(maxw, sz.width);
            maxh = Math.max(maxh, sz.height);
          });
          s.rangeExtendPixels([maxw, maxw], [maxh, maxh]);
        }
      });

      plotTypeLink('points', s, elm, as, draw);
    }
  };
}]);


// Bar charts.

radian.directive('bars',
 ['plotTypeLink', 'plotLib', function(plotTypeLink, lib)
{
  'use strict';

  function draw(svg, xin, xs, yin, ys, s, w, h) {
    var x = xin, y = yin;
    var style = s.style || 'simple';
    var aggregation = s.aggregation || 'none';
    var strokeWidth   = s.strokeWidth || 1;
    var strokeOpacity = s.strokeOpacity || 1.0;
    var stroke = s.stroke || '#000';
    var fillOpacity = s.fillOpacity || 1.0;
    var fill = s.fill || 'none';
    var barMin = s.barMin || null;
    var barMax = s.barMax || null;
    var barWidth = s.barWidth || 1.0;
    var pxBarWidth, pxWidth = false, pxSpacing = false;
    if (typeof barWidth == 'string' &&
        barWidth.trim().substr(-2,2) == 'px') {
      pxBarWidth =
        Number(barWidth.trim().substr(0, barWidth.trim().length - 2));
      if (pxBarWidth < 0) pxSpacing = true;
      barWidth = xs.invert(Math.abs(pxBarWidth)) - xs.invert(0);
      pxBarWidth = Math.abs(pxBarWidth);
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

    // Data aggregation.
    if (aggregation != 'none' || style != 'simple') {
      var aggfn;
      switch (aggregation) {
      case 'mean': aggfn = lib.meanBy; break;
      case 'sum':  aggfn = lib.sumBy;  break;
      case 'max':  aggfn = lib.maxBy;  break;
      case 'min':  aggfn = lib.minBy;  break;
      default: throw Error("Unknown aggregation type: " + aggregation);
      }
      x = lib.unique(xin);
      y = aggfn(yin, xin);
      s.barWidths = lib.firstBy(s.barWidths, xin);
      if (fill instanceof Array)
        fill = lib.firstBy(fill, xin);
      if (fillOpacity instanceof Array)
        fillOpacity = lib.firstBy(fillOpacity, xin);
      if (strokeWidth instanceof Array)
        strokeWidth = lib.firstBy(strokeWidth, xin);
      if (strokeOpacity instanceof Array)
        strokeOpacity = lib.firstBy(strokeOpacity, xin);
      if (stroke instanceof Array)
        stroke = lib.firstBy(stroke, xin);
    }

    // Plot bars: plot attributes are either single values or arrays
    // of values, one per bar.
    function apSc(sc, d, i) {
      var dtmp = d;
      if (sc.oton) dtmp = sc.oton(d);
      return sc(dtmp, i);
    };
    function sty(v) {
      return (v instanceof Array) ? function(d, i) { return v[i]; } : v;
    };
    function bw(i) {
      if (pxWidth) {
        if (pxSpacing)
          return xs.invert(xs(s.barWidths[0]) - pxBarWidth);
        else
          return barWidth;
      } else
        return s.barWidths[i] * barWidth;
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
          return xs(d[0], i);
        else if (pxWidth && pxSpacing && s.axisXTransform == 'log') {
          var xc = s.x[i];
          var xb = i > 0 ? s.x[i-1] : xc / (s.x[i+1] / xc);
          var xd = i < s.x.length - 1 ? s.x[i+1] : xc * (xc / s.x[i-1]);
          var xhi = xc * Math.sqrt(xd / xc), xlo = xc * Math.sqrt(xb / xc);
          var phi = xs(xhi), plo = xs(xlo);
          return plo + pxBarWidth;
        } else {
          return d[0] instanceof Date ?
            xs(new Date(d[0].valueOf() - bw(i) / 2.0 +
                        (pxOffset ? barOffset :
                         s.barWidths[i] * barOffset)), i) :
          xs(xs.oton(d[0]) - bw(i) / 2.0 +
             (pxOffset ? barOffset : s.barWidths[i] * barOffset), i);
        }
      })
      .attr('y', function(d, i) { return ys(d[d.length-1], i); })
      .attr('width', function(d, i) {
        var ret;
        if (pxWidth) {
          if (pxSpacing) {
            if (s.axisXTransform == 'log') {
              var xc = s.x[i];
              var xb = i > 0 ? s.x[i-1] : xc / (s.x[i+1] / xc);
              var xd = i < s.x.length - 1 ? s.x[i+1] : xc * (xc / s.x[i-1]);
              var xhi = xc * Math.sqrt(xd / xc), xlo = xc * Math.sqrt(xb / xc);
              var phi = xs(xhi), plo = xs(xlo);
              ret = phi - plo - pxBarWidth;
            } else
              ret = xs(s.barWidths[i]) - xs(0) - pxBarWidth;
          } else
            ret = pxBarWidth;
        } else if (d.length == 3)
          ret = xs(d[1], i) - xs(d[0], i);
        else
          ret = d[0] instanceof Date ?
            xs(new Date(d[0].valueOf() + s.barWidths[i] * barWidth / 2.0), i) -
            xs(new Date(d[0].valueOf() - s.barWidths[i] * barWidth / 2.0), i) :
            xs(xs.oton(d[0]) + s.barWidths[i] * barWidth / 2.0, i) -
            xs(xs.oton(d[0]) - s.barWidths[i] * barWidth / 2.0, i);
        return ret;
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
        var barx = scope.x || [];
        // Discrete data.
        if (scope.x && scope.x instanceof Array &&
            (typeof scope.x[0] == 'string' ||
             scope.x[0] instanceof Array ||
             scope.discreteX)) {
          barx = [];
          scope.x.forEach(function(x, i) { barx.push(i + 1); });
        }
        if (scope.barMin && scope.barMax) {
          scope.barWidths = scope.barMax.map(function(mx, i) {
            return mx - scope.barMin[i];
          });
          var last = barx.length - 1;
          scope.rangeXExtend = [barx[0] - scope.barMin[0],
                                scope.barMax[last] - barx[last]];
        } else {
          scope.barWidths = barx.map(function(xval, i) {
            if (i == 0) return barx[1] - xval;
            else if (i == barx.length - 1)
              return xval - barx[barx.length - 2];
            else return (barx[i+1] - barx[i-1]) / 2;
          });
          scope.rangeXExtend = [scope.barWidths[0] / 2,
                                scope.barWidths[barx.length - 1] / 2];
        }
        var width = scope.strokeWidth instanceof Array &&
                    scope.strokeWidth.length > 0 ?
          scope.strokeWidth.reduce(function(x,y) {
            return Math.max(Number(x), Number(y));
          }) : (Number(scope.strokeWidth) || 1);
        scope.rangeExtendPixels([2*width, 2*width], null);
      });
      scope.$on('setupRanges', function(e, s) {
        if (s.yrange) s.yrange[0] = 0;
        else          s.yrange = [0, null];
        if (s.y2range) s.y2range[0] = 0;
        else           s.y2range = [0, null];
      });
      plotTypeLink('bars', scope, elm, as, draw);
    }
  };
}]);


// Box and whisker plots.

radian.directive('boxes',
 ['plotTypeLink', 'plotLib', function(plotTypeLink, lib)
{
  'use strict';

  function draw(svg, xin, xs, yin, ys, s, w, h) {
    var x = xin, y = yin;
    var strokeWidth   = s.strokeWidth || 1;
    var strokeOpacity = s.strokeOpacity || 1.0;
    var stroke = s.stroke || '#000';
    var fillOpacity = s.fillOpacity || 1.0;
    var fill = s.fill || 'none';
    var barWidth = s.barWidth || 0.5;
    var pxBarWidth, pxWidth = false;
    if (typeof barWidth == 'string' &&
        barWidth.trim().substr(-2,2) == 'px') {
      pxBarWidth =
        Number(barWidth.trim().substr(0, barWidth.trim().length - 2));
      barWidth = xs.invert(pxBarWidth) - xs.invert(0);
      pxWidth = true;
    }

    // Data aggregation.
    x = lib.unique(xin);
    var q25 = lib.quantileBy(yin, xin, 0.25);
    var q50 = lib.quantileBy(yin, xin, 0.5);
    var q75 = lib.quantileBy(yin, xin, 0.75);
    var qs = d3.zip(q25, q50, q75);
    s.barWidths = lib.firstBy(s.barWidths, xin);
    if (fill instanceof Array)
      fill = lib.firstBy(fill, xin);
    if (fillOpacity instanceof Array)
      fillOpacity = lib.firstBy(fillOpacity, xin);
    if (strokeWidth instanceof Array)
      strokeWidth = lib.firstBy(strokeWidth, xin);
    if (strokeOpacity instanceof Array)
      strokeOpacity = lib.firstBy(strokeOpacity, xin);
    if (stroke instanceof Array)
      stroke = lib.firstBy(stroke, xin);

    // Plot bars: plot attributes are either single values or arrays
    // of values, one per bar.
    function sty(v) {
      return (v instanceof Array) ? function(d, i) { return v[i]; } : v;
    };
    var dat = d3.zip(x, qs);
    svg.selectAll('rect').data(dat)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function(d, i) {
        return xs(xs.oton(d[0]) -
                  (pxWidth ? barWidth : s.barWidths[i] * barWidth) / 2.0, i);
      })
      .attr('y', function(d, i) { return ys(d[1][2], i); })
      .attr('width', function(d, i) {
        if (pxWidth)
          return pxBarWidth;
        else
          return xs(xs.oton(d[0]) + s.barWidths[i] * barWidth / 2.0, i) -
                 xs(xs.oton(d[0]) - s.barWidths[i] * barWidth / 2.0, i);
      })
      .attr('height', function(d, i) {
        return ys(d[1][0], i) - ys(d[1][2], i);
      })
      .style('fill', sty(fill))
      .style('fill-opacity', sty(fillOpacity))
      .style('stroke-width', sty(strokeWidth))
      .style('stroke-opacity', sty(strokeOpacity))
      .style('stroke', sty(stroke));
    svg.selectAll('line.median').data(dat).enter().append('line')
      .attr('class', 'median')
      .style('stroke-width', sty(strokeWidth))
      .style('stroke-opacity', sty(strokeOpacity))
      .style('stroke', sty(stroke))
      .style('fill', 'none')
      .attr('x1', function(d, i) {
        return xs(xs.oton(d[0]) -
                  (pxWidth ? barWidth : s.barWidths[i] * barWidth) / 2.0, i);
      })
      .attr('x2', function(d, i) {
        return xs(xs.oton(d[0]) +
                  (pxWidth ? barWidth : s.barWidths[i] * barWidth) / 2.0, i);
      })
      .attr('y1', function(d, i) { return ys(d[1][1], i); })
      .attr('y2', function(d, i) { return ys(d[1][1], i); });
    svg.selectAll('line.iqr-up').data(dat).enter().append('line')
      .attr('class', 'iqr-up')
      .style('stroke-width', sty(strokeWidth))
      .style('stroke-opacity', sty(strokeOpacity))
      .style('stroke', sty(stroke))
      .style('fill', 'none')
      .attr('x1', function(d, i) { return xs(xs.oton(d[0]), i); })
      .attr('x2', function(d, i) { return xs(xs.oton(d[0]), i); })
      .attr('y1', function(d, i) { return ys(d[1][2], i); })
      .attr('y2', function(d, i) {
        return ys(d[1][2] + 1.5 * (d[1][2] - d[1][0]), i);
      });
    svg.selectAll('line.iqr-up-bar').data(dat).enter().append('line')
      .attr('class', 'iqr-up-bar')
      .style('stroke-width', sty(strokeWidth))
      .style('stroke-opacity', sty(strokeOpacity))
      .style('stroke', sty(stroke))
      .style('fill', 'none')
      .attr('x1', function(d, i) {
        return xs(xs.oton(d[0]) -
                  (pxWidth ? barWidth : s.barWidths[i] * barWidth) / 3.0, i);
      })
      .attr('x2', function(d, i) {
        return xs(xs.oton(d[0]) +
                  (pxWidth ? barWidth : s.barWidths[i] * barWidth) / 3.0, i);
      })
      .attr('y1', function(d, i) {
        return ys(d[1][2] + 1.5 * (d[1][2] - d[1][0]), i);
      })
      .attr('y2', function(d, i) {
        return ys(d[1][2] + 1.5 * (d[1][2] - d[1][0]), i);
      });
    svg.selectAll('line.iqr-down').data(dat).enter().append('line')
      .attr('class', 'iqr-down')
      .style('stroke-width', sty(strokeWidth))
      .style('stroke-opacity', sty(strokeOpacity))
      .style('stroke', sty(stroke))
      .style('fill', 'none')
      .attr('x1', function(d, i) { return xs(xs.oton(d[0]), i); })
      .attr('x2', function(d, i) { return xs(xs.oton(d[0]), i); })
      .attr('y1', function(d, i) { return ys(d[1][0], i); })
      .attr('y2', function(d, i) {
        return ys(d[1][0] - 1.5 * (d[1][2] - d[1][0]), i);
      });
    svg.selectAll('line.iqr-down-bar').data(dat).enter().append('line')
      .attr('class', 'iqr-down-bar')
      .style('stroke-width', sty(strokeWidth))
      .style('stroke-opacity', sty(strokeOpacity))
      .style('stroke', sty(stroke))
      .style('fill', 'none')
      .attr('x1', function(d, i) {
        return xs(xs.oton(d[0]) -
                  (pxWidth ? barWidth : s.barWidths[i] * barWidth) / 3.0, i);
      })
      .attr('x2', function(d, i) {
        return xs(xs.oton(d[0]) +
                  (pxWidth ? barWidth : s.barWidths[i] * barWidth) / 3.0, i);
      })
      .attr('y1', function(d, i) {
        return ys(d[1][0] - 1.5 * (d[1][2] - d[1][0]), i);
      })
      .attr('y2', function(d, i) {
        return ys(d[1][0] - 1.5 * (d[1][2] - d[1][0]), i);
      });
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
      scope.$on('setupExtra', function() {
        var barx = scope.x || [];
        // Discrete data.
        if (scope.x && scope.x instanceof Array &&
            (typeof scope.x[0] == 'string' ||
             scope.x[0] instanceof Array ||
             scope.discreteX)) {
          barx = [];
          scope.x.forEach(function(x, i) { barx.push(i + 1); });
        }
        scope.barWidths = barx.map(function(xval, i) {
          if (i == 0) return barx[1] - xval;
          else if (i == barx.length - 1)
            return xval - barx[barx.length - 2];
          else return (barx[i+1] - barx[i-1]) / 2;
        });
        scope.rangeXExtend = [scope.barWidths[0] / 2,
                              scope.barWidths[barx.length - 1] / 2];
        var width = scope.strokeWidth instanceof Array &&
                    scope.strokeWidth.length > 0 ?
          scope.strokeWidth.reduce(function(x,y) {
            return Math.max(Number(x), Number(y));
          }) : (Number(scope.strokeWidth) || 1);
        scope.rangeExtendPixels([2*width, 2*width], [20, 20]);
      });
      plotTypeLink('boxes', scope, elm, as, draw);
    }
  };
}]);


// Area plots.

radian.directive('area',
 ['plotTypeLink', function(plotTypeLink)
{
  'use strict';

  function draw(svg, x, xs, y, ys, s, w, h, axis) {
    var opacity = s.fillOpacity || 1.0;
    var fill = s.fill || '#000';
    var yminv = axis == 1 ? 'ymin' : 'y2min';
    var xminv = axis == 1 ? 'xmin' : 'x2min';
    var yarea = false, ymin, ymintmp = 0;
    var xarea = false, xmin, xmintmp = 0;
    if (s.hasOwnProperty(yminv)) {
      ymintmp = s[yminv];
      yarea = true;
      if (ymintmp instanceof Array)
        ymin = ymintmp;
      else {
        ymin = new Array(x.length);
        for (var i = 0; i < ymin.length; ++i) ymin[i] = Number(ymintmp);
      }
    }
    if (s.hasOwnProperty(xminv)) {
      xmintmp = s[xminv];
      xarea = true;
      if (xmintmp instanceof Array)
        xmin = xmintmp;
      else {
        xmin = new Array(y.length);
        for (var i = 0; i < xmin.length; ++i) xmin[i] = Number(xmintmp);
      }
    }
    if (!xarea && !yarea) throw Error("No ranges specified for <area>")
    if (xarea && yarea) throw Error("Inconsistent ranges specified for <area>")

    // Switch on type of stroke...
    if (!(opacity instanceof Array || fill instanceof Array)) {
      // Normal area; single path.
      if (yarea) {
        var area = d3.svg.area()
          .x(function(d) { return xs.ap(d[0], i); })
          .y0(function(d) { return ys(d[1], i); })
          .y1(function(d) { return ys(d[2], i); });
        svg.append('path').datum(d3.zip(x, ymin, y))
          .attr('class', 'area').attr('d', area)
          .style('fill-opacity', opacity)
          .style('fill', fill);
      } else {
        var area = d3.svg.area()
          .y(function(d) { return ys(d[2], i); })
          .x0(function(d) { return xs.ap(d[0], i); })
          .x1(function(d) { return xs.ap(d[1], i); });
        svg.append('path').datum(d3.zip(xmin, x, y))
          .attr('class', 'area').attr('d', area)
          .style('fill-opacity', opacity)
          .style('fill', fill);
      }
    } else throw Error("<area> plots require singular paint attributes")
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
      plotTypeLink('area', scope, elm, as, draw);
    }
  };
}]);


// Rug plots.

radian.directive('rug',
 ['plotTypeLink', function(plotTypeLink)
{
  'use strict';

  function draw(svg, x, xs, y, ys, s) {
    var stroke = s.stroke || '#000';
    var strokeWidth = s.strokeWidth || 1.0;
    var strokeOpacity = s.strokeOpacity || 1.0;
    var tickLength = Number(s.tickLength || 5);

    // Plot points: plot attributes are either single values or arrays
    // of values, one per point.
    function sty(v) {
      return (v instanceof Array) ? function(d, i) { return v[i]; } : v;
    };
    var xrugs = [ ], yrugs = [ ], xr = xs.range(), yr = ys.range();
    if (x) {
      var y0 = ys.invert(yr[0]), y1 = ys.invert(yr[0] - tickLength);
      xrugs = x.map(function(xval) { return [[xval, y0], [xval, y1]]; });
    }
    if (y) {
      var x0 = xs.invert(xr[0]), x1 = xs.invert(xr[0] + tickLength);
      yrugs = y.map(function(yval) { return [[x0, yval], [x1, yval]]; });
    }
    var rugs = xrugs.concat(yrugs);
    svg.selectAll('path').data(rugs).enter().append('path')
      .attr('class', 'line')
      .style('stroke-width', sty(strokeWidth))
      .style('stroke-opacity', sty(strokeOpacity))
      .style('stroke', sty(stroke))
      .attr('d', d3.svg.line()
            .x(function (d, i) { return xs(d[0], i); })
            .y(function (d, i) { return ys(d[1], i); }));
  };

  return {
    restrict: 'E',
    scope: true,
    link: function(scope, elm, as) {
      scope.checkPlottable = function(xvar, yvar) { return xvar || yvar; };
      plotTypeLink('rug', scope, elm, as, draw);
    }
  };
}]);
