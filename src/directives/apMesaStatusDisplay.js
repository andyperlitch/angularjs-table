'use strict';

angular.module('apMesa.directives.apMesaStatusDisplay', [])

.directive('apMesaStatusDisplay', function() {
  return {
    replace: true,
    templateUrl: 'src/templates/apMesaStatusDisplay.tpl.html',
  };
});
