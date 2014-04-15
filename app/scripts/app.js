'use strict';

angular.module('andyperlitch.apTable.ghPage', [
  'ngSanitize',
  'ngRoute',
  'andyperlitch.apTable'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
