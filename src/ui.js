// radian.directive('radianUi', ['$timeout', function($timeout)
// {
//   'use strict';

//   return {
//     restrict: 'E',
//     scope: true,
//     template:
//     ['<div class="radian-ui" ng-show="uivisible">',
//        // '<span class="form-inline">',
//        //   '<span ng-show="xvs">',
//        //     '<span>{{xlab}}</span>',
//        //     '<select ng-model="xidx" class="var-select" ',
//        //             'ng-options="v[0] as v[1] for v in xvs">',
//        //     '</select>',
//        //   '</span>',
//        //   '<span ng-show="xvs && yvs">',
//        //     '&nbsp;&nbsp;vs&nbsp;&nbsp;',
//        //   '</span>',
//        //   '<span ng-show="yvs">',
//        //     '<span>{{ylab}}</span>',
//        //     '<select ng-model="yidx" class="var-select" ',
//        //             'ng-options="v[0] as v[1] for v in yvs">',
//        //     '</select>',
//        //   '</span>',
//        //   '<span ng-show="yvs && (swbut || swsel)">',
//        //     '&nbsp;&nbsp;',
//        //   '</span>',
//        //   '<span ng-show="swbut">',
//        //     '<span>{{swbutlab}}</span>',
//        //     '<button class="btn" data-toggle="button" ',
//        //             'ng-click="strokesel=1-strokesel">',
//        //       '{{swbut}}',
//        //     '</button>',
//        //   '</span>',
//        //   '<span ng-show="swsel">',
//        //     '<label>{{swsellab}}&nbsp;</label>',
//        //     '<select ng-model="strokesel" .span1 ',
//        //             'ng-options="o[0] as o[1] for o in swsel">',
//        //     '</select>',
//        //   '</span>',
//        // '</span>',
//      '</div>'].join(""),
//     replace: true,
//     link: function(scope, elm, as) {
//       // // Deal with switching between stroke types.
//       // if (scope.strokeSwitch !== undefined) {
//       //   scope.uivisible = true;
//       //   var label = scope.strokeSwitchLabel;
//       //   var switches = scope.strokeSwitch.split(';');
//       //   if (switches.length == 1) {
//       //     // On/off UI.
//       //     scope.swbut = switches[0];
//       //     scope.swbutlab = label;
//       //   } else {
//       //     // Selector UI.
//       //     scope.swsel = switches.map(function(sw, i) { return [i, sw]; });
//       //     scope.swsellab = label;
//       //   }
//       // }

//       // // Deal with selection of X and Y variables.
//       // if (scope.selectX !== undefined) {
//       //   scope.uivisible = true;
//       //   var xvars = scope.selectX.split(',');
//       //   if (xvars.length > 1) {
//       //     // Selector UI.
//       //     scope.xidx = 0;
//       //     scope.xvs = xvars.map(function(v, i) { return [i, v]; });
//       //     scope.xlab = scope.selectXLabel;
//       //     if (scope.selectX == scope.selectY)
//       //       scope.$watch('xidx',
//       //                    function(n, o) {
//       //                      if (n == scope.yidx) scope.yidx = o;
//       //                      scope.yvs = [].concat(scope.xvs);
//       //                      scope.yvs.splice(n, 1);
//       //                    });
//       //   }
//       // }
//       // if (scope.selectY !== undefined) {
//       //   scope.uivisible = true;
//       //   var yvars = scope.selectY.split(',');
//       //   if (yvars.length > 1) {
//       //     // Selector UI.
//       //     scope.yidx = 0;
//       //     scope.yvs = yvars.map(function(v, i) { return [i, v]; });
//       //     scope.ylab = scope.selectYLabel;
//       //     if (scope.selectX == scope.selectY) {
//       //       scope.yvs.splice(1);
//       //       scope.yidx = 1;
//       //     }
//       //   }
//       // }
//     }
//   };
// }]);

radian.factory('radianLegend', function()
{
  return function(scope) {
    var v = scope.views[0], g = v.group;
    var nswitch = scope.switchable.length;
    g.selectAll('g.radian-legend').remove();
    if (nswitch > 1) {
      function colour(d) {
        return d.enabled ? ((d.stroke instanceof Array ?
                             d.stroke[0] : d.stroke) || '#000') : '#f5f5f5';
      };
      function clickHandler(d, i) {
        d.enabled = !d.enabled;
        d3.select(legcs[0][i]).attr('fill', colour(d));
        scope.$emit('paintChange');
      };
      var legendps = scope.switchable;
      var leggs = g.append('g')
        .attr('class', 'radian-legend').selectAll('g')
        .data(legendps).enter().append('g').on('click', clickHandler);
      var legcs = leggs.append('circle').style('stroke-width', 1).attr('r', 5)
        .attr('fill', colour)
        .attr('stroke', function(d,i) {
          return (d.stroke instanceof Array ? d.stroke[0] : d.stroke) || '#000';
        });
      var legts = leggs.append('text')
        .attr('text-anchor', 'start').attr('dy', '.32em').attr('dx', '8')
        .text(function(d,i) { return d.label || ('data' + i); });
      var widths = [];
      legts.each(function(d,i) { widths.push(d3.select(this).node().
                                             getComputedTextLength() + 10); });
      var mwidth = d3.max(widths), spacing = 15;
      var sep = mwidth + spacing;
      var len = nswitch * mwidth + (nswitch - 1) * spacing;
      leggs.attr('transform', function(d,i) {
        return 'translate(' + (scope.width - len + sep*i - 10) + ',' +
          (+v.margin.top + 10) + ')';
      });
    }
  };
});


radian.directive('radianAxisSwitch', function()
{
  return {
    restrict: 'E',
    template:
    ['<div class="radian-axis-switch">',
       '<button class="btn btn-mini" ng-click="switchState()">',
         '{{axisName}} axis &rArr; {{buttonState}}',
       '</button>',
    '</div>'].join(''),
    replace: true,
    scope: true,
    link: function(scope, elm, as) {
      var axis = as.axis || 'y';
      var state = scope.axisYTransform || 'linear';
      scope.axisName = axis == 'y' ? 'Y' : 'X';
      scope.buttonState = state == 'linear' ? 'Log' : 'Linear';
      if (axis == 'y')
        elm.css('top', '10px').css('left', '10px');
      else
        elm.css('bottom', '10px').css('right', '10px');
      scope.switchState = function() {
        state = state == 'linear' ? 'log' : 'linear';
        scope.buttonState = state == 'linear' ? 'Log' : 'Linear';
        scope.$emit(axis == 'y' ? 'yAxisChange' : 'xAxisChange', state);
      };
    }
  };
});


radian.directive('radianStrokeSwitch', function()
{
  return {
    restrict: 'E',
    template:
    ['<div class="radian-stroke-switch">',
       '<div ng-show="swbut">',
         '<span>{{swbutlab}}</span>',
         '<button class="btn btn-mini" data-toggle="button" ',
                 'ng-click="$parent.strokesel=1-$parent.strokesel">',
           '{{swbut}}',
         '</button>',
       '</div>',
       '<div class="btn-group" ng-show="swsel">',
         '<button class="btn btn-mini" ng-click="stepStroke()">',
           '{{swsel[$parent.strokesel]}} &nbsp;&nbsp;&nbsp;&nbsp;&rArr;',
         '</button>',
       '</div>',
     '</div>'].join(""),
    replace: true,
    scope: true,
    link: function(scope, elm, as) {
      if (!scope.strokeSwitch) return;
      elm.css('top', '10px').css('right', '10px');
      scope.switches = scope.strokeSwitch.split(';');
      scope.stepStroke = function() {
        scope.$parent.strokesel =
          (scope.$parent.strokesel + 1) % scope.switches.length;
      };
      var label = scope.strokeSwitchLabel;
      if (scope.switches.length == 1) {
        // On/off UI.
        scope.swbut = scope.switches[0];
        scope.swbutlab = label;
      } else {
        // Selector UI.
        scope.swsel = scope.switches;
      }
    }
  };
});
