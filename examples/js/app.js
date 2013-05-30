'use strict';

function EgCtrl(plotLib, $http, $scope, $location) {
  plotLib.midMonths = function(ms, y) {
    return ms.map(function(m) { return new Date(y, m, 15); });
  };

  // Turn a vector of [[x1,y1], [x2,y2], ..., [xn,yn]] into a vector
  // of y-values interpolated to [f, ..., t].
  plotLib.fillIn = function(d, f, t) {
    var ft = t - f + 1;
    var ys = new Array(ft);
    var x1 = d[0][0], xn = d[d.length-1][0];
    var y1 = d[0][1], yn = d[d.length-1][1];
    if (d.length == 1)
      for (var i = 0; i < ft; ++i) ys[i] = y1;
    else {
      var i = 0;
      if (f < x1) {
        var delta = (d[1][1] - y1) / (d[1][0] - x1);
        var yf = y1 - delta * (x1 - f);
        for (; i < x1-f; ++i) ys[i] = yf + delta * i;
      }
      ys[i] = y1;
      var j = 1;
      while (j < d.length) {
        var ym = d[j-1][1], yp = d[j][1], xm = d[j-1][0], xp = d[j][0];
        var delta = (yp - ym) / (xp - xm);
        for (; x1+i < d[j][0]; ++i) ys[i] = ym + delta * (x1+i - xm);
        if (i < ft) ys[i++] = d[j++][1];
      }
      if (i < ft) {
        var delta = (yn - d[d.length-2][1]) / (xn - d[d.length-2][0]);
        for (var i0 = i; i < ft; ++i) ys[i] = yn + delta * (i-i0+1);
      }
    }
    return ys;
  };

  $scope.$watch('$location.hash', function() {
    var url = "http://" + location.host + "/eg/" +
      location.hash.slice(2) + ".html";
    $http.get(url).success(function(res) {
      res = res.replace(/<h3>(.|\n)*<\/h3>\n\n/m, "");
      $('div.container pre.include-source').remove();
      var ctr = $('div.container');
      ctr.append('<pre class="include-source">' +
                 '<code class="html"></code></pre>');
      var code = $($(ctr.children()[ctr.children().length-1]).children()[0]);
      code.text(res);
      code.highlight();
    });
  });
}
EgCtrl.$inject = ['plotLib', '$http', '$scope', '$location'];

var negs = 42;
var egtitles = [ "Basic plot; CSV data",
                 "Basic plot; JSON data",
                 "Int. legend; fading",
                 "X-axis zoom",
                 "Stroke fade UI",
                 "Stroke colour UI",
                 "X/Y variable UI",
                 "Plot grid with tabs",
                 "Date handling",
                 "Data aggr. funcs.",
                 "Bar charts",
                 "Func. plots",
                 "Func. plots",
                 "Vectorisation",
                 "Data binding",
                 "<plot-options>",
                 "Basic points plot",
                 "Range attributes",
                 "Log axes",
                 "Second axes",
                 "Bar chart",
                 "Test",
                 "Integer pluck",
                 "Tom's data example",
                 "Norm. palette",
                 "Disc. palette",
                 "Disc. pal. (mark)",
                 "Func. + pal.",
                 "Func. + abs. pal.",
                 "Abs. pal. terrain",
                 "Tom's plot-options bug",
                 "Histogram",
                 "Banded pal.",
                 "Data via URL",
                 "Simple area plot",
                 "Comp. pal. #1",
                 "Comp. pal. #2",
                 "Gradient pal.",
                 "Health & wealth",
                 "Pluck expr. test",
                 "Plot titles #1",
                 "Layout #1"];

angular.module('myApp', ['radian']).
  config(['$routeProvider', function($routeProvider) {
    for (var eg = 1; eg <= negs; ++eg) {
      var n = (eg < 10 ? '0' : '') + eg;
      $routeProvider.when('/' + n, { templateUrl: 'eg/' + n + '.html',
                                     controller: EgCtrl });
    }
    $routeProvider.otherwise({ redirectTo: '/01' });
  }]).
  controller('BaseController', ['$rootScope', function($rootScope) {
    $rootScope.egs = [];
    for (var eg = 1; eg <= negs; ++eg) {
      var n = (eg < 10 ? '0' : '') + eg;
      $rootScope.egs.push({ link: "#/" + n, title: egtitles[eg - 1] });
    }
  }]);
