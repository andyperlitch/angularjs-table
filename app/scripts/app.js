'use strict';

angular.module('datatorrent.mlhrTable.ghPage', [
  'ngSanitize',
  'ngRoute',
  'datatorrent.mlhrTable'
])
.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/perf', {
      templateUrl: 'views/perf.html',
      controller: 'PerfCtrl'
    })
    .when('/max-height', {
      templateUrl: 'views/max-height.html',
      controller: 'MaxHeightCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});