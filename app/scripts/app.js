'use strict';

angular.module('apMesa.ghPage', [
  'ngSanitize',
  'ngRoute',
  'apMesa'
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
