radian.directive('legend', ['processAttrs', function(processAttrs)
{
  function preLink(sc, elm, as) {
    sc.explicitEntries = [ ];
    console.log("legend preLink...");
  };
  function postLink(sc, elm, as) {
    processAttrs(sc, as);
    console.log("legend postLink...");
    console.log("explicitEntries=" + JSON.stringify(sc.explicitEntries));
    sc.colour = function(v) {
      var c = (v.stroke instanceof Array ? v.stroke[0] : v.stroke) || '#000';
      return { color: c };
    };
    sc.$on('setupExtraAfter', function() {
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


radian.directive('legendEntry', [function()
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
      var attrs;
      switch (as.type) {
      case 'lines':
        attrs = ['stroke', 'strokeWidth', 'strokeOpacity' ];
        break;
      case 'area':
        attrs = ['fill', 'fillOpacity' ];
        break;
      case 'points':
        attrs = ['stroke', 'strokeWidth', 'strokeOpacity',
                 'fill', 'fillOpacity', 'marker' ];
        break;
      case 'bars':
      case 'boxes':
        attrs = ['stroke', 'strokeWidth', 'strokeOpacity',
                 'fill', 'fillOpacity' ];
        break;
      default:
        throw Error('invalid TYPE in <legend-entry>');
      }
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
