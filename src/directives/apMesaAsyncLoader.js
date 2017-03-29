'use strict';

angular.module('apMesa.directives.apMesaAsyncLoader', [])

.directive('apMesaAsyncLoader', ['$timeout', function($timeout) {

  var TIME_TO_WAIT = 400;

  function link(scope, element) {
    var fadeInPromise;
    var fadeIn = function() {
      element.fadeIn();
      fadeInPromise = null;
    };
    var fadeOut = function() {
      $timeout.cancel(fadeInPromise);
      element.hide();
    }
    scope.$watch('transientState.getDataPromise', function(dataPromise) {
      if (dataPromise) {
        fadeInPromise = $timeout(fadeIn, scope.options.getData ? 0 : TIME_TO_WAIT);
        dataPromise.finally(fadeOut);
      } else {
        if (fadeInPromise) {
          $timeout.cancel(fadeInPromise);
        }
      }
    })
  }

  return {
    scope: false,
    link: link,
    replace: true,
    templateUrl: 'src/templates/apMesaAsyncLoader.tpl.html',
  };
}]);
