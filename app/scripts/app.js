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
    .otherwise({
      redirectTo: '/'
    });
});