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
    var posx = posspl[0], posy = posspl[1];
    if (posx == 'left') posx = 10; else if (posx == 'right') posx = -10;
    if (posy == 'top') posy = 10; else if (posy == 'bottom') posy = -10;
    var orientation = sc.orientation || 'vertical';
    var norientation = 1;
    var orspl = orientation.split(/:/);
    if (orspl.length > 1) {
      orientation = orspl[0];
      norientation = orspl[1];
    }
    var rowSpacing = sc.rowSpacing || 10;
    var columnSpacing = sc.columnSpacing || 10;
    var segmentLength = sc.segmentLength || 30;
    var margin = sc.margin || 10;
    var hmargin = sc.horizontalMargin || margin;
    var vmargin = sc.verticalMargin || margin;
    // console.log("posx=" + posx + " posy=" + posy);
    // console.log("orientation=" + orientation + " n=" + norientation);
    // console.log("rowSpacing=" + rowSpacing + " colSpacing=" + columnSpacing);
    // console.log("segmentLength=" + segmentLength);
    // console.log("hmargin=" + hmargin + " vmargin=" + vmargin);

    // Determine label text sizes.
    var lh = 0, lw = 0;
    sc.explicitEntries.forEach(function(e) {
      var sz = sc.plotScope.getTextSize(e.label);
      e.width = sz.width;    lw = Math.max(sz.width, lw);
      e.height = sz.height;  lh = Math.max(sz.height, lh);
    });
    sc.implicitEntries.forEach(function(e) {
      var sz = sc.plotScope.getTextSize(e.label);
      e.width = sz.width;    lw = Math.max(sz.width, lw);
      e.height = sz.height;  lh = Math.max(sz.height, lh);
    });
    // console.log("lw=" + lw + " lh=" + lh);

    // Order entries.
    var order = [];
    if (sc.order) order = sc.order.split(/;/);
    var ex = {}, im = {};
    sc.explicitEntries.forEach(function(e) { ex[e.label] = e; });
    sc.implicitEntries.forEach(function(e) { im[e.label] = e; });
    var entries = [];
    order.forEach(function(l) {
      if (ex[l])      { entries.push(ex[l]);  delete ex[l]; }
      else if (im[l]) { entries.push(im[l]);  delete im[l]; }
    });
    sc.implicitEntries.forEach(function(e) {
      if (im[e.label]) entries.push(e);
    });
    sc.explicitEntries.forEach(function(e) {
      if (ex[e.label]) entries.push(e);
    });
    console.log("entries=" + JSON.stringify(entries));
  };

  function preLink(sc, elm, as) {
    console.log("legend preLink...");
    sc.explicitEntries = [ ];
    sc.implicitEntries = [ ];
  };
  function postLink(sc, elm, as) {
    console.log("legend postLink...");
    processAttrs(sc, as);
    sc.colour = function(v) {
      var c = (v.stroke instanceof Array ? v.stroke[0] : v.stroke) || '#000';
      return { color: c };
    };
    sc.$on('setupExtraAfter', function() {
      console.log("legend setupExtraAfter");
      var psc = sc;
      while (psc.hasOwnProperty('$parent') && !psc.hasOwnProperty('addPlot'))
        psc = psc.$parent;
      sc.plotScope = psc;
      dft(psc, function(s) {
        if (s.hasOwnProperty('label') && s.hasOwnProperty('plotType')) {
          var attrs = paintAttrsFromPlotType(s.plotType);
          var entry = { label: s.label, type: s.plotType };
          attrs.forEach(function(a) {
            if (s.hasOwnProperty(a)) entry[a] = s[a];
          });
          sc.implicitEntries.push(entry);
        }
      });
      legendSizeAndPos(sc);
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
      console.log("legend-entry link...");
      // Identify the legend element.
      if (!elm[0].parentNode || elm[0].parentNode.tagName != 'LEGEND')
        throw Error('<legend-entry> not properly nested inside <legend>');
      var legend = $(elm[0].parentNode);

      // Copy metadata attributes into a new object.
      if (!as.label) throw Error('<legend-entry> without LABEL attribute');
      if (!as.type) throw Error('<legend-entry> without TYPE attribute');
      var attrs = paintAttrsFromPlotType(as.type);
      var entry = { label: as.label, type: as.type };
      Object.keys(as).forEach(function(a) {
        if (a.charAt(0) != '$') {
          if (attrs.indexOf(a) != -1)
            entry[a] = as[a];
          else if (a != 'label' && a != 'type')
            throw Error('invalid attribute "' + a + '" in <legend-entry>');
        }
      });

      // Set up explicit entry in parent legend.
      sc.explicitEntries.push(entry);
    }
  };
}]);
