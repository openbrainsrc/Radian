'use strict';

function EgCtrl(plotLib, $http, $scope, $location) {
  plotLib.midMonths = function(ms, y) {
    return ms.map(function(m) { return new Date(y, m, 15); });
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

var negs = 27;
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
                 "Disc. pal. (mark)" ];

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
