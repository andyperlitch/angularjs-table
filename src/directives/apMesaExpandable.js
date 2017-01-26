'use strict';

angular.module('apMesa.directives.apMesaExpandable', [])
.directive('apMesaExpandable', ['$compile', function($compile) {
  return {
    scope: false,
    link: function(scope, element, attrs) {
      scope.$watch('row', function() {
        var innerEl;
        if (scope.options.expandableTemplateUrl) {
          innerEl = angular.element('<div ng-include="options.expandableTemplateUrl" onload="refreshExpandedHeight(true)"></div>');
        } else if (scope.options.expandableTemplate) {
          innerEl = angular.element(scope.options.expandableTemplate);
        } else {
          return;
        }
        $compile(innerEl)(scope);
        element.html('');
        element.append(innerEl);
      });
    }
  };
}]);
