'use strict';

var EgCtrl = ['plotLib', '$http', '$scope', '$timeout', '$location',
              function(plotLib, $http, $scope, $timeout, $location)
{
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
    var url = "http://" + location.host + "/gallery/eg/" +
      location.hash.slice(2) + ".html";
    $timeout(function() {
      $http.get(url).success(function(res) {
        res = res.replace(/<h3>(.|\n)*<\/h3>\n\n/m, "");
        res = res.replace(/<p>(.|\n)*<\/p>/m, "");
        $('div#gallery pre.include-source').remove();
        var ctr = $('div#gallery');
        ctr.append('<pre class="include-source">' +
                   '<code class="html"></code></pre>');
        var code = $($(ctr.children()[ctr.children().length-1]).children()[0]);
        code.text(res);
        code.highlight();
      });
    });
  });
}];

var negs = 54;

var eggrps = [ { title: "Basic",
                 items: [["Basic line plot; CSV data access",   1],
                         ["Basic line plot; JSON data access",  2],
                         ["Function plots #1",                 12],
                         ["Function plots #2",                 13],
                         ["Basic points plot",                 17],
                         ["Basic bar chart",                   21],
                         ["Area plot",                         35]] },

               { title: "Complex",
                 items: [["Bar charts",                        11],
                         ["Range attributes",                  18],
                         ["Log axes",                          19],
                         ["Using <plot-options>",              31],
                         ["Histograms #1",                     32],
                         ["Histograms #2",                     53],
                         ["Histograms #3",                     54],
                         ["Health & Wealth of Nations",        39]] },

               { title: "Data access",
                 items: [["Date handling",                      9],
                         ["Expression vectorisation",          14],
                         ["Data binding",                      15],
                         ["Data via URL",                      34]] },

               { title: "Layout & formatting",
                 items: [["Row layout",                        42],
                         ["Column layout",                     43],
                         ["Hierarchical layout",               46],
                         ["Grid layout",                       47],
                         ["Plot titles",                       41],
                         ["Font selection",                    49]] },

               { title: "Palettes",
                 items: [["Discrete palette",                  26],
                         ["Discrete marker palette",           27],
                         ["Normalised palette",                25],
                         ["Functions with palettes",           28],
                         ["Banded palettes",                   33],
                         ["Stroke gradient palette",           38],
                         ["Categorical palettes",  50]] },


               { title: "UI examples",
                 items: [["Interactive legend; stroke fading",  3],
                         ["X-axis zoom",                        4],
                         ["Stroke fade UI",                     5],
                         ["Stroke colour UI",                   6],
                         ["X/Y variable UI",                    7]] }];


angular.module('radianDocs', ['radian']).
  config(['$routeProvider', function($routeProvider) {
    for (var eg = 1; eg <= negs; ++eg) {
      var n = (eg < 10 ? '0' : '') + eg;
      $routeProvider.when('/' + n, { templateUrl: 'eg/' + n + '.html',
                                     controller: EgCtrl });
    }
    $routeProvider.otherwise({ redirectTo: '/01' });
  }]).
  controller('GalleryController',
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
      $rootScope.egs.push({ title: eggrps[grp].title, items: grpitems });
    }

    $rootScope.pals = { bgr: '0 blue; 0.5 grey; 1 red',
                        gyo: '0 green; 0.5 yellow; 1 orange' };
  }]);

function DummyCtrl() { };
