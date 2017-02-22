'use strict';

angular.module('apMesa.directives.apMesaThTitle', [])
.directive('apMesaThTitle', function($compile) {
  function link(scope, element) {
    var column = scope.column;
    var template = '<span>{{ column.id }}</span>';
    if (angular.isString(column.labelTemplateUrl)) {
      template = '<span ng-include="\'' + column.labelTemplateUrl + '\'"></span>';
    } else if (angular.isString(column.labelTemplate)) {
      template = '<span>' + column.labelTemplate + '</span>';
    } else if (angular.isString(column.label)) {
      template = '<span>{{ column.label }}</span>';
    }
    element.html(template);
    $compile(element.contents())(scope);
  }
  return { link: link };
});
