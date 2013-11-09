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

  $scope.loadStockData = function() {
    $http.get('/data/stocks/' + $scope.dset + '.csv').
      success(function(data) {
        $scope.datavalues = data;
      });
  };
  $scope.stockInit = function() {
    $scope.dset = 'CSCO';
    $scope.loadStockData($scope.dset);
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

var negs = 76;

var eggrps = [ { title: "Plot types",
                 items: [["Basic plot; CSV data",   1],
                         ["Basic plot; JSON data",  2],
                         ["Bar charts",            11],
                         ["Func. plots",           12],
                         ["Func. plots",           13],
                         ["Basic points plot",     17],
                         ["Range attributes",      18],
                         ["Log axes",              19],
                         ["Second axes",           20],
                         ["Bar chart",             21],
                         ["Bar chart (px width)",  51],
                         ["Test",                  22],
                         ["Histogram #1",          32],
                         ["Histogram #2",          53],
                         ["Histogram #3",          54],
                         ["Histogram #4",          74],
                         ["Simple area plot",      35],
                         ["Rug plots",             73],
                         ["Simple heatmap",        52]] },

               { title: "UI examples",
                 items: [["Int. legend; fading",    3],
                         ["X-axis zoom",            4],
                         ["Stroke fade UI",         5],
                         ["Stroke colour UI",       6],
                         ["X/Y variable UI",        7],
                         ["UI in layout #1",       69],
                         ["UI in layout #2",       70],
                         ["UI in layout #3",       71],
                         ["Axis transformations",  76]] },

               { title: "Data access",
                 items: [["Date handling",            9],
                         ["JSON date handling",      65],
                         ["Hierarchical JSON data",  66],
                         ["Data aggr. funcs.",       10],
                         ["Vectorisation",           14],
                         ["Data binding",            15],
                         ["Integer pluck",           23],
                         ["Pluck expr. test",        40],
                         ["Data via URL",            34],
                         ["Data via URL (binding)",  67],
                         ["Data via URL (ng-model)", 68]] },

               { title: "Layout",
                 items: [["Layout #1",             42],
                         ["Layout #2",             43],
                         ["Layout #3",             44],
                         ["Layout #4",             45],
                         ["Layout #5",             46],
                         ["Layout #6",             47],
                         ["Simple plot stack",      8],
                         ["Complex plot stack",    63],
                         ["Nested plot stacks",    64]] },

               { title: "Palettes",
                 items: [["Norm. palette",         25],
                         ["Disc. palette",         26],
                         ["Disc. pal. (mark)",     27],
                         ["Func. + pal.",          28],
                         ["Func. + abs. pal.",     29],
                         ["Abs. pal. terrain",     30],
                         ["Banded pal.",           33],
                         ["Comp. pal. #1",         36],
                         ["Comp. pal. #2",         37],
                         ["Gradient pal.",         38],
                         ["Categorical palettes",  50]] },

               { title: "Discrete data",
                 items: [["Categorical points",    59],
                         ["Categorical bars #1",   60],
                         ["Categorical bars #2",   61],
                         ["Categorical bars #3",   62]] },

               { title: "Formatting",
                 items: [["<plot-options>",        16],
                         ["Plot titles #1",        41],
                         ["Font selection #1",     49],
                         ["Font selection #2",     72],
                         ["Scientific notation",   55],
                         ["Date axis formatting",  56],
                         ["Explicit ticks",        57],
                         ["Tick sizes/padding",    58]] },

               { title: "Bigger examples",
                 items: [["Health & wealth",       39]] },

               { title: "Bugs",
                 items: [["Tom's data example",    24],
                         ["Test",                  22],
                         ["plot-options bug",      31],
                         ["Palettes & ng-repeat",  48],
                         ["Histogram nonsense",    75]] } ];


angular.module('myApp', ['radian']).
  config(['$routeProvider', function($routeProvider) {
    for (var eg = 1; eg <= negs; ++eg) {
      var n = (eg < 10 ? '0' : '') + eg;
      $routeProvider.when('/' + n, { templateUrl: 'eg/' + n + '.html',
                                     controller: EgCtrl });
    }
    $routeProvider.otherwise({ redirectTo: '/01' });
  }]).
  controller('BaseController',
  ['$rootScope', function($rootScope) {
    $rootScope.egs = [];
    for (var grp = 0; grp < eggrps.length; ++grp) {
      var grpitems = [];
      for (var i = 0; i < eggrps[grp].items.length; ++i) {
        var egtitle = eggrps[grp].items[i][0];
        var eg = eggrps[grp].items[i][1];
        var n = (eg < 10 ? '0' : '') + eg;
        grpitems.push({ title: egtitle, link: "#/" + n });
      }
      $rootScope.egs.push({ title: eggrps[grp].title, items: grpitems,
                            id: "grp" + grp, idhash: "#grp" + grp });
    }

    $rootScope.pals = { bgr: '0 blue; 0.5 grey; 1 red',
                        gyo: '0 green; 0.5 yellow; 1 orange' };
  }]);
