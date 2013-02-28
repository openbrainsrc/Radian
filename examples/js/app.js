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


angular.module('myApp', ['radian']).
  config(['$routeProvider', function($routeProvider) {
    for (var eg = 1; eg <= 19; ++eg) {
      var n = (eg < 10 ? '0' : '') + eg;
      $routeProvider.when('/'+n, {templateUrl: 'eg/'+n+'.html',
                                  controller: EgCtrl});
    }
    $routeProvider.otherwise({redirectTo: '/01'});
  }]);
