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
      console.log("explicitEntries=" + JSON.stringify(sc.explicitEntries));
      console.log("implicitEntries=" + JSON.stringify(sc.implicitEntries));
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
