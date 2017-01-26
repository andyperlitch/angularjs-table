'use strict';

angular.module('apMesa.ghPage', [
  'ngSanitize',
  'ngRoute',
  'apMesa'
])
.config(function ($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix('');
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
    .when('/expandable', {
      templateUrl: 'views/expandable.html',
      controller: 'ExpandableCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});
