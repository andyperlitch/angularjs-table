'use strict';

angular.module('apMesa.directives.apMesaAsyncLoader', [])

.directive('apMesaAsyncLoader', ['$timeout', function($timeout) {

  var TIME_TO_WAIT = 400;

  function link(scope, element) {

    // A bit hacky, but figures out the height of the header table in order to
    // correctly position below the <th> rows
    $timeout(function() {
      element.css('top', element.parents('.ap-mesa-wrapper').find('.mesa-header-table').outerHeight(true));
    });

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
    });
  }

  return {
    scope: false,
    link: link,
    replace: true,
    templateUrl: 'src/templates/apMesaAsyncLoader.tpl.html',
  };
}]);
