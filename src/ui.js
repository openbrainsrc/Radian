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
//        // '</span>',
//      '</div>'].join(""),
//     replace: true,
//     link: function(scope, elm, as) {
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


radian.directive('radianLegend', function()
{
  return {
    restrict: 'E',
    template:
    ['<div class="radian-legend">',
       '<span ng-style="colour(v)" ng-repeat="v in switchable">',
         '{{v.label}}&nbsp;',
         '<input type="checkbox" ng-model="v.enabled" ',
                'ng-change="$emit(\'paintChange\')">',
         '&nbsp;&nbsp;&nbsp;',
       '</span>',
     '</div>'].join(""),
    replace: true,
    scope: true,
    link: function(scope, elm, as) {
      scope.colour = function(v) {
        var c = (v.stroke instanceof Array ? v.stroke[0] : v.stroke) || '#000';
        return { color: c };
      };
      scope.$on('setupExtraAfter', function() {
        var m = scope.views[0].margin;
        elm.css('top', (m.top+3)+'px').css('right', (m.right+3)+'px');
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
         '{{axisName}} axis &rArr; {{label}}',
       '</button>',
    '</div>'].join(''),
    replace: true,
    scope: true,
    link: function(scope, elm, as) {
      var axis = as.axis || 'y';
      scope.axisName = axis == 'y' ? 'Y' : 'X';
      var uiattr = axis == 'y' ? 'uiAxisYTransform' : 'uiAxisXTransform';
      var attr = axis == 'y' ? 'axisYTransform' : 'axisXTransform';
      var type = scope[uiattr] || 'log';
      scope.states = type.split(/,/);
      if (scope.states.length == 1 && scope.states[0] != 'linear')
        scope.states.unshift('linear');
      for (var i = 0; i < scope.states.length; ++i)
        if (['linear', 'log', 'linear-0'].indexOf(scope.states[i]) < 0)
          throw Error("invalid UI axis switch type");
      function setLabel() {
        switch (scope.states[(scope.idx + 1) % scope.states.length]) {
        case 'linear':   scope.label = 'Linear';           break;
        case 'log':      scope.label = 'Log';              break;
        case 'linear-0': scope.label = 'Linear (from 0)';  break;
        }
      };
      scope.state = scope[attr] || scope.states[0];
      scope.idx = Math.max(0, scope.states.indexOf(scope.state));
      setLabel();
      scope.$on('setupExtraAfter', function() {
        var m = scope.views[0].margin;
        if (axis == 'y')
          elm.css('top', (m.top+3)+'px').css('left', (m.left+3)+'px');
        else
          elm.css('bottom', (m.bottom+3)+'px').css('right', (m.right+3)+'px');
      });
      scope.switchState = function() {
        scope.idx = (scope.idx + 1) % scope.states.length;
        scope.state = scope.states[scope.idx];
        setLabel();
        scope.$emit(axis == 'y' ? 'yAxisChange' : 'xAxisChange', scope.state);
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
      scope.$on('setupExtraAfter', function() {
        var m = scope.views[0].margin;
        var dt = scope.legendEnabled ? 25 : 0;
        elm.css('top', (m.top+dt+3)+'px').css('right', (m.right+3)+'px');
      });
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


radian.directive('radianHistogramSwitch', function()
{
  return {
    restrict: 'E',
    template:
    ['<div class="radian-histogram-switch btn-group">',
       '<button class="btn btn-mini">',
         'Bins: {{uiNBins}}',
       '</button>',
       '<button class="btn btn-mini" ng-click="dn(5)">',
         '<strong>-5</strong>',
       '</button>',
       '<button class="btn btn-mini" ng-click="dn(1)">',
         '-1',
       '</button>',
       '<button class="btn btn-mini" ng-click="up(1)">',
         '+1',
       '</button>',
       '<button class="btn btn-mini" ng-click="up(5)">',
         '<strong>+5</strong>',
       '</button>',
     '</div>'].join(""),
    replace: true,
    scope: true,
    link: function(scope, elm, as) {
      if (!scope.uiHistogramBins) return;
      scope.$on('setupExtraAfter', function() {
        var m = scope.views[0].margin;
        elm.css('bottom', (m.bottom+3)+'px').css('left', (m.left+3)+'px');
      });
      scope.uiNBins = scope[scope.histogramBinsVar];
      scope.$watch('histogramBinsVar', function(n, o) {
        scope.uiNBins = scope[scope.histogramBinsVar];
      });
      scope.up = function(n) {
        scope.uiNBins += n;
        scope.$parent[scope.histogramBinsVar] = scope.uiNBins;
      };
      scope.dn = function(n) {
        scope.uiNBins = Math.max(scope.uiNBins - n, 1);
        scope.$parent[scope.histogramBinsVar] = scope.uiNBins;
      };
    }
  };
});
