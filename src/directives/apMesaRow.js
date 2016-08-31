'use strict';

angular.module('apMesa.directives.apMesaRow', ['apMesa.directives.apMesaCell'])
.directive('apMesaRow', function($timeout) {
  return {
    template: '<td ng-repeat="column in columns track by column.id" class="ap-mesa-cell col-{{column.id}}" ap-mesa-cell></td>',
    scope: true,
    link: function(scope, element) {
      scope.toggleRowExpand = function() {
        var index = scope.$index + scope.rowOffset;
        scope.expandedRows[index] = !scope.expandedRows[index];
        $timeout(function() {
          if (!scope.expandedRows[index]) {
            delete scope.expandedRows[index];
          } else {
            scope.refreshExpandedHeight();
          }
        });
      };
      scope.refreshExpandedHeight = function() {
        var index = scope.$index + scope.rowOffset;
        var newHeight = element.next('tr.ap-mesa-expand-panel').height();
        scope.expandedRows[index] = newHeight;
      };
      scope.$watch('rowOffset', function(rowOffset) {
        var index = scope.$index + scope.rowOffset;
        scope.rowIsExpanded = !!scope.expandedRows[index];
      });
      scope.$watch('expandedRows[$index + rowOffset]', function(isExpanded) {
        scope.rowIsExpanded = !!isExpanded;
      });
    }
  };
});
