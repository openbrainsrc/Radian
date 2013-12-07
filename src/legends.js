radian.factory('paintAttrsFromPlotType', [function() {
  return function(t) {
    switch (t) {
    case 'lines':  return ['stroke', 'strokeWidth', 'strokeOpacity' ];
    case 'area':   return ['fill', 'fillOpacity' ];
    case 'points': return ['stroke', 'strokeWidth', 'strokeOpacity',
                           'fill', 'fillOpacity', 'marker' ];
    case 'bars':
    case 'boxes':  return ['stroke', 'strokeWidth', 'strokeOpacity',
                           'fill', 'fillOpacity' ];
    default: throw Error('invalid TYPE in <legend-entry>');
    }
  };
}]);


radian.directive('legend',
 ['processAttrs', 'dft', 'paintAttrsFromPlotType',
  function(processAttrs, dft, paintAttrsFromPlotType)
{
  function legendSizeAndPos(sc) {
    // Get all size and position attributes.
    var position = sc.position || 'left,top';
    var posspl = position.split(/,/);
    sc.posx = posspl[0];
    sc.posy = posspl[1];
    if (sc.posx == 'left') sc.posx = 10;
    else if (sc.posx == 'right') sc.posx = -10;
    if (sc.posy == 'top') sc.posy = 10;
    else if (sc.posy == 'bottom') sc.posy = -10;
    sc.posx = Number(sc.posx);
    sc.posy = Number(sc.posy);
    if (isNaN(sc.posx) || isNaN(sc.posy))
      throw Error("invalid position for legend");
    var orientation = sc.orientation || 'vertical';
    var norientation = 1;
    var orspl = orientation.split(/:/);
    if (orspl.length > 1) {
      orientation = orspl[0];
      norientation = orspl[1];
    }
    sc.rowSpacing = sc.rowSpacing || 2;
    sc.columnSpacing = sc.columnSpacing || 4;
    sc.segmentLength = sc.segmentLength || 30;
    sc.segmentGap = sc.segmentGap || 5;
    sc.margin = sc.margin || 5;
    sc.hmargin = sc.horizontalMargin || sc.margin;
    sc.vmargin = sc.verticalMargin || sc.margin;

    // Determine label text sizes.
    sc.eh = 0;
    sc.ew = 0;
    sc.explicitEntries.forEach(function(e) {
      var sz = sc.getTextSize(e.label);
      e.width = sz.width;    sc.ew = Math.max(sz.width, sc.ew);
      e.height = sz.height;  sc.eh = Math.max(sz.height, sc.eh);
    });
    sc.implicitEntries.forEach(function(e) {
      var sz = sc.getTextSize(e.label);
      e.width = sz.width;    sc.ew = Math.max(sz.width, sc.ew);
      e.height = sz.height;  sc.eh = Math.max(sz.height, sc.eh);
    });
    sc.labelx = sc.segmentLength + sc.segmentGap;
    sc.ew += sc.labelx;

    // Order entries.
    var order = [];
    if (sc.order) order = sc.order.split(/\|/);
    var ex = {}, im = {};
    sc.explicitEntries.forEach(function(e) { ex[e.label] = e; });
    sc.implicitEntries.forEach(function(e) { im[e.label] = e; });
    sc.entries = [];
    order.forEach(function(l) {
      if (ex[l])      { sc.entries.push(ex[l]);  delete ex[l]; }
      else if (im[l]) { sc.entries.push(im[l]);  delete im[l]; }
    });
    sc.implicitEntries.forEach(function(e) {
      if (im[e.label]) sc.entries.push(e);
    });
    sc.explicitEntries.forEach(function(e) {
      if (ex[e.label]) sc.entries.push(e);
    });

    // Allocate entries to rows/columns.
    var major = orientation == 'vertical' ? 'col' : 'row';
    var minor = orientation == 'vertical' ? 'row' : 'col';
    var nentries = sc.entries.length;
    var minorpermajor = Math.ceil(nentries / norientation);
    var ientry = 0;
    for (var imaj = 0; imaj < norientation; ++imaj)
      for (var imin = 0; imin < minorpermajor && ientry < nentries; ++imin) {
        sc.entries[ientry][major] = imaj;
        sc.entries[ientry][minor] = imin;
        ++ientry;
      }
    var ncols = orientation == 'vertical' ? norientation : minorpermajor;
    var nrows = orientation == 'vertical' ? minorpermajor : norientation;
    sc.entries.forEach(function(e) {
      e.inx = sc.hmargin + e.col * (sc.ew + sc.columnSpacing);
      e.iny = sc.vmargin + e.row * (sc.eh + sc.rowSpacing);
    });
    sc.legw = ncols * sc.ew + (ncols - 1) * sc.columnSpacing + 2 * sc.hmargin;
    sc.legh = nrows * sc.eh + (nrows - 1) * sc.rowSpacing + 2 * sc.vmargin;
  };

  function drawLegend(sc, plotgroup) {
    // Remove any existing legend SVG group.
    plotgroup.selectAll('.radian-legend').remove();

    // Set up new legend group.
    var lg = plotgroup.append('g').attr('class', 'radian-legend');

    // Text size calculation function.
    sc.getTextSize = function(t) {
      var g = lg.append('g').attr('visibility', 'hidden');
      var tstel = g.append('text').attr('x', 0).attr('y', 0)
        .style('font-size', sc.fontSize).text(t);
      var bbox = tstel[0][0].getBBox();
      g.remove();
      return bbox;
    };

    // Calculate legend size and position.
    legendSizeAndPos(sc);
    var lx = sc.posx >= 0 ? sc.posx :
      sc.plotScope.views[0].realwidth + sc.posx - sc.legw;
    var ly = sc.posy >= 0 ? sc.posy :
      sc.plotScope.views[0].realheight + sc.posy - sc.legh;
    lg.attr('transform', 'translate(' + lx + ',' + ly + ')');

    // Draw background rectangle.
    var bg = sc.backgroundColor || 'white';
    if (bg != 'none')
      lg.append('rect').
        attr('height', sc.legh).attr('width', sc.legw).
        attr('stroke', 'none').attr('fill', bg);

    // Draw frame.
    if (sc.hasOwnProperty('frameThickness') ||
        sc.hasOwnProperty('frameColor')) {
      var thickness = sc.frameThickness || 1;
      var colour = sc.frameColor || 'black';
      lg.append('rect').
        attr('height', sc.legh).attr('width', sc.legw).
        attr('stroke', colour).attr('stroke-thickness', thickness).
        attr('fill', 'none');
    }

    sc.entries.forEach(function(e) {
      // Make group for entry translated to appropriate position.
      var eg = lg.append('g').attr('class', 'radian-legend-entry').
        attr('transform', 'translate(' + e.inx + ',' + e.iny + ')');

      // Draw entry label.
      // eg.append('rect').attr('x', 0).attr('y', 0).
      //   attr('width', sc.ew).attr('height', sc.eh).attr('fill', '#DDD');
      eg.append('text').attr('x', sc.labelx).attr('y', sc.eh/2).
        style('dominant-baseline', 'middle').
        style('font-size', sc.plotScope.fontSize).text(e.label);

      // Draw entry segment.
      switch (e.type) {
      case 'lines':
        eg.append('path').
          datum([[0, sc.eh/2], [sc.segmentLength, sc.eh/2]]).
          attr('d', d3.svg.line()).
          style('stroke', e.stroke).
          style('stroke-width', e.strokeWidth).
          style('stroke-opacity', e.strokeOpacity || 1);
        break;
      case 'points':
        eg.append('path').
          attr('transform',
               'translate(' + sc.segmentLength / 2 + ',' + sc.eh / 2 + ')').
          attr('d', d3.svg.symbol().type(e.marker).size(0.75 * sc.eh * sc.eh)).
          style('fill', e.fill || 'none').
          style('fill-opacity', e.fillOpacity || 1).
          style('stroke-width', e.strokeWidth || 1).
          style('stroke-opacity', e.strokeOpacity || 1).
          style('stroke', e.stroke || 'none');
        break;
      case 'area':
        eg.append('rect').
          attr('x', 0).attr('y', 0).
          attr('width', sc.segmentLength).attr('height', sc.eh).
          style('fill', e.fill).
          style('fill-opacity', e.fillOpacity || 1);
        break;
      case 'bars':
      case 'boxes':
        eg.append('rect').
          attr('x', sc.segmentLength / 2 - sc.eh / 2).attr('y', 0).
          attr('width', sc.eh).attr('height', sc.eh).
          style('stroke', e.stroke || 'none').
          style('stroke-opacity', e.strokeOpacity || 1).
          style('stroke-width', e.strokeWidth || 1).
          style('fill', e.fill || 'none').
          style('fill-opacity', e.fillOpacity || 1);
        break;
      }
    });
  };

  function preLink(sc, elm, as) {
    sc.explicitEntries = [ ];
  };
  function postLink(sc, elm, as) {
    processAttrs(sc, as);
    sc.colour = function(v) {
      var c = (v.stroke instanceof Array ? v.stroke[0] : v.stroke) || '#000';
      return { color: c };
    };
    sc.$on('setupExtraAfter', function() {
      var psc = sc;
      while (psc.hasOwnProperty('$parent') && !psc.hasOwnProperty('addPlot'))
        psc = psc.$parent;
      sc.plotScope = psc;
      sc.implicitEntries = [ ];
      dft(psc, function(s) {
        if (s.hasOwnProperty('label') && s.hasOwnProperty('plotType')) {
          var attrs = paintAttrsFromPlotType(s.plotType);
          var entry = { label: s.label, type: s.plotType };
          attrs.forEach(function(a) { if (s[a]) entry[a] = s[a]; });
          sc.implicitEntries.push(entry);
        }
      });
      sc.plotScope.views[0].post = function(svg) { drawLegend(sc, svg); };
      var m = sc.views[0].margin;
      elm.css('top', (m.top+3)+'px').css('right', (m.right+3)+'px');
    });
  };

  return {
    restrict: 'E',
    // template:
    // ['<div class="radian-legend">',
    //    '<span ng-style="colour(v)" ng-repeat="v in switchable">',
    //      '{{v.label}}&nbsp;',
    //      '<input type="checkbox" ng-model="v.enabled" ',
    //             'ng-change="$emit(\'paintChange\')">',
    //      '&nbsp;&nbsp;&nbsp;',
    //    '</span>',
    //  '</div>'].join(""),
    scope: true,
    compile: function(elm, as, trans) {
      return { pre: preLink, post: postLink };
    },
  };
}]);


radian.directive('legendEntry',
 ['paintAttrsFromPlotType',
  function(paintAttrsFromPlotType)
{
  'use strict';

  return {
    restrict: 'E',
    scope: false,
    link: function(sc, elm, as) {
      // Identify the legend element.
      if (!elm[0].parentNode || elm[0].parentNode.tagName != 'LEGEND')
        throw Error('<legend-entry> not properly nested inside <legend>');
      var legend = $(elm[0].parentNode);

      // Copy metadata attributes into a new object.
      if (!as.label) throw Error('<legend-entry> without LABEL attribute');
      if (!as.type) throw Error('<legend-entry> without TYPE attribute');
      var attrs = paintAttrsFromPlotType(as.type);
      var entry = { label: as.label, type: as.type };
      attrs.forEach(function(a) {
        if (as.hasOwnProperty(a))
          entry[a] = as[a];
        else if (sc[a])
          entry[a] = sc[a];
      });

      // Set up explicit entry in parent legend.
      sc.explicitEntries.push(entry);
    }
  };
}]);
