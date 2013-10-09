radian.directive('radianUi', ['$timeout', function($timeout)
{
  'use strict';

  return {
    restrict: 'E',
    scope: true,
    template:
    ['<div class="radian-ui" ng-show="uivisible">',
       // '<span class="form-inline">',
         '<input ng-show="axisSwitch" class="axis-switch" ',
                'type="checkbox" ng-model="axisType">',
       //   '<span ng-show="xvs">',
       //     '<span>{{xlab}}</span>',
       //     '<select ng-model="xidx" class="var-select" ',
       //             'ng-options="v[0] as v[1] for v in xvs">',
       //     '</select>',
       //   '</span>',
       //   '<span ng-show="xvs && yvs">',
       //     '&nbsp;&nbsp;vs&nbsp;&nbsp;',
       //   '</span>',
       //   '<span ng-show="yvs">',
       //     '<span>{{ylab}}</span>',
       //     '<select ng-model="yidx" class="var-select" ',
       //             'ng-options="v[0] as v[1] for v in yvs">',
       //     '</select>',
       //   '</span>',
       //   '<span ng-show="yvs && (swbut || swsel)">',
       //     '&nbsp;&nbsp;',
       //   '</span>',
       //   '<span ng-show="swbut">',
       //     '<span>{{swbutlab}}</span>',
       //     '<button class="btn" data-toggle="button" ',
       //             'ng-click="strokesel=1-strokesel">',
       //       '{{swbut}}',
       //     '</button>',
       //   '</span>',
       //   '<span ng-show="swsel">',
       //     '<label>{{swsellab}}&nbsp;</label>',
       //     '<select ng-model="strokesel" .span1 ',
       //             'ng-options="o[0] as o[1] for o in swsel">',
       //     '</select>',
       //   '</span>',
       // '</span>',
     '</div>'].join(""),
    replace: true,
    link: function(scope, elm, as) {
      scope.uivisible = false;
      scope.axisSwitch = true;
      scope.axisType = false;
      scope.$on('uiOn', function() { scope.$apply('uivisible = true'); });
      scope.$on('uiOff', function() { scope.$apply('uivisible = false'); });
      // // Deal with switching between stroke types.
      // if (scope.strokeSwitch !== undefined) {
      //   scope.uivisible = true;
      //   var label = scope.strokeSwitchLabel;
      //   var switches = scope.strokeSwitch.split(';');
      //   if (switches.length == 1) {
      //     // On/off UI.
      //     scope.swbut = switches[0];
      //     scope.swbutlab = label;
      //   } else {
      //     // Selector UI.
      //     scope.swsel = switches.map(function(sw, i) { return [i, sw]; });
      //     scope.swsellab = label;
      //   }
      // }

      // // Deal with selection of X and Y variables.
      // if (scope.selectX !== undefined) {
      //   scope.uivisible = true;
      //   var xvars = scope.selectX.split(',');
      //   if (xvars.length > 1) {
      //     // Selector UI.
      //     scope.xidx = 0;
      //     scope.xvs = xvars.map(function(v, i) { return [i, v]; });
      //     scope.xlab = scope.selectXLabel;
      //     if (scope.selectX == scope.selectY)
      //       scope.$watch('xidx',
      //                    function(n, o) {
      //                      if (n == scope.yidx) scope.yidx = o;
      //                      scope.yvs = [].concat(scope.xvs);
      //                      scope.yvs.splice(n, 1);
      //                    });
      //   }
      // }
      // if (scope.selectY !== undefined) {
      //   scope.uivisible = true;
      //   var yvars = scope.selectY.split(',');
      //   if (yvars.length > 1) {
      //     // Selector UI.
      //     scope.yidx = 0;
      //     scope.yvs = yvars.map(function(v, i) { return [i, v]; });
      //     scope.ylab = scope.selectYLabel;
      //     if (scope.selectX == scope.selectY) {
      //       scope.yvs.splice(1);
      //       scope.yidx = 1;
      //     }
      //   }
      // }
    }
  };
}]);

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


radian.factory('radianAxisSwitch', function()
{
  return function(scope) {
    var v = scope.views[0], g = v.uigroup;
    var state = scope.axisYTransform || 'linear';
    function clickHandler(d, i) {
      state = state == 'linear' ? 'log' : 'linear';
      scope.$emit('axisChange', state);
    };

    var szg = scope.sizeviewgroup.append('g').attr('visibility', 'hidden');
    var tstel = szg.append('text').attr('x', 0).attr('y', 0)
      .style('font-size', '75%').text('LOG/LINEAR');
    var th = tstel[0][0].getBBox().height, tw = tstel[0][0].getBBox().width;
    szg.remove();

    g.selectAll('g.radian-axis-switch').remove();
    var pos = 'translate(' + (+v.margin.left) + ',' + (+v.margin.top) + ')';
    var switchg = g.append('g').attr('class', 'radian-axis-switch')
      .on('click', clickHandler).attr('transform', pos);
    var switchr = switchg.append('rect')
      .attr('width', tw + 4).attr('height', th + 3)
      .attr('stroke-width', 1).attr('stroke', '#000').attr('fill', '#f5f5f5');
    switchg.append('text').attr('x', tw / 2 + 2).attr('y', th - 2)
      .style('font-size', '75%').attr('text-anchor', 'middle')
      .text('LOG/LINEAR');
  };
});
