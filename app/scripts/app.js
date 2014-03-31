'use strict';

angular.module('andyperlitch.ngTabled.ghPage', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'andyperlitch.ngTabled'
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
