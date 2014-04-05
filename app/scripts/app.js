'use strict';

angular.module('andyperlitch.apTable.ghPage', [
  'ngCookies',
  'ngResource',
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
