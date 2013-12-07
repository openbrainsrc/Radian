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
        elm.css('top', (m.top+3)+'px').css('right', (m.right+3)+'px');
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
