radian.directive('radianUi', ['$timeout', function($timeout)
{
  'use strict';

  return {
    restrict: 'E',
    scope: false,
    template:
    ['<div class="radian-ui" ng-show="uivisible">',
       '<span class="form-inline">',
         '<span ng-show="xvs">',
           '<span>{{xlab}}</span>',
           '<select ng-model="xidx" class="var-select" ',
                   'ng-options="v[0] as v[1] for v in xvs">',
           '</select>',
         '</span>',
         '<span ng-show="xvs && yvs">',
           '&nbsp;&nbsp;vs&nbsp;&nbsp;',
         '</span>',
         '<span ng-show="yvs">',
           '<span>{{ylab}}</span>',
           '<select ng-model="yidx" class="var-select" ',
                   'ng-options="v[0] as v[1] for v in yvs">',
           '</select>',
         '</span>',
         '<span ng-show="yvs && (swbut || swsel)">',
           '&nbsp;&nbsp;',
         '</span>',
         '<span ng-show="swbut">',
           '<span>{{swbutlab}}</span>',
           '<button class="btn" data-toggle="button" ',
                   'ng-click="strokesel=1-strokesel">',
             '{{swbut}}',
           '</button>',
         '</span>',
         '<span ng-show="swsel">',
           '<label>{{swsellab}}&nbsp;</label>',
           '<select ng-model="strokesel" .span1 ',
                   'ng-options="o[0] as o[1] for o in swsel">',
           '</select>',
         '</span>',
       '</span>',
     '</div>'].join(""),
    replace: true,
    link: function(scope, elm, as) {
      scope.uivisible = false;
      // Deal with switching between stroke types.
      if (scope.strokeSwitch !== undefined) {
        scope.uivisible = true;
        var label = scope.strokeSwitchLabel;
        var switches = scope.strokeSwitch.split(';');
        if (switches.length == 1) {
          // On/off UI.
          scope.swbut = switches[0];
          scope.swbutlab = label;
        } else {
          // Selector UI.
          scope.swsel = switches.map(function(sw, i) { return [i, sw]; });
          scope.swsellab = label;
        }
      }

      // Deal with selection of X and Y variables.
      if (scope.selectX !== undefined) {
        scope.uivisible = true;
        var xvars = scope.selectX.split(',');
        if (xvars.length > 1) {
          // Selector UI.
          scope.xidx = 0;
          scope.xvs = xvars.map(function(v, i) { return [i, v]; });
          scope.xlab = scope.selectXLabel;
          if (scope.selectX == scope.selectY)
            scope.$watch('xidx',
                         function(n, o) {
                           if (n == scope.yidx) scope.yidx = o;
                           scope.yvs = [].concat(scope.xvs);
                           scope.yvs.splice(n, 1);
                         });
        }
      }
      if (scope.selectY !== undefined) {
        scope.uivisible = true;
        var yvars = scope.selectY.split(',');
        if (yvars.length > 1) {
          // Selector UI.
          scope.yidx = 0;
          scope.yvs = yvars.map(function(v, i) { return [i, v]; });
          scope.ylab = scope.selectYLabel;
          if (scope.selectX == scope.selectY) {
            scope.yvs.splice(1);
            scope.yidx = 1;
          }
        }
      }
    }
  };
}]);

radian.factory('radianLegend', function()
{
  return function(svgelm, scope) {
    // Render interactive legend.
    var nswitch = scope.switchable.length;
    if (nswitch > 1) {
      var legendps = scope.switchable;
      var leggs = svgelm.append('g').selectAll('g')
        .data(legendps).enter().append('g');
      var legcs = leggs.append('circle').style('stroke-width', 1).attr('r', 5)
        .attr('fill', function(d,i) {
          return (d.stroke instanceof Array ? d.stroke[0] : d.stroke) || '#000';
        })
        .attr('stroke', function(d,i) {
          return (d.stroke instanceof Array ? d.stroke[0] : d.stroke) || '#000';
        });
      var clickHandler = function(d,i) {
        d.enabled = !d.enabled;
        d3.select(this).select('circle')
          .attr('fill', d.enabled ?
                (d.stroke || '#000') : '#f5f5f5');
        scope.$emit('paintChange');
      };
      leggs.on('click', clickHandler);
      var legts = leggs.append('text')
        .attr('text-anchor', 'start').attr('dy', '.32em').attr('dx', '8')
        .text(function(d,i) {
          return d.label || ('data' + i);
        });
      var widths = [];
      legts.each(function(d,i) { widths.push(d3.select(this).node().
                                             getComputedTextLength() + 10); });
      var mwidth = d3.max(widths), spacing = 15;
      var sep = mwidth + spacing;
      var len = nswitch * mwidth + (nswitch - 1) * spacing;
      leggs.attr('transform', function(d,i) {
        return 'translate(' + (scope.width - len + sep*i - 10) + ',10)';
      });
    }
  };
});
