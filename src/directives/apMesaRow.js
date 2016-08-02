'use strict';

angular.module('apMesa.directives.apMesaRow', ['apMesa.directives.apMesaCell'])
.directive('apMesaRow', function($timeout) {
  return {
    template: '<td ng-repeat="column in columns track by column.id" class="ap-mesa-cell" ap-mesa-cell></td>',
    scope: true,
    link: function(scope, element) {
      var index = scope.$index + scope.rowOffset;
      scope.rowIsExpanded = scope.expandedRows[index];
      var expandPanel = element.next('tr.ap-mesa-expand-panel');
      scope.toggleRowExpand = function() {
        scope.expandedRows[index] = !scope.expandedRows[index];
        scope.rowIsExpanded = scope.expandedRows[index];
        $timeout(function() {
          var newHeight = expandPanel.height();
          if (newHeight === 0) {
            delete scope.expandedRows[index];
          } else {
            scope.expandedRows[index] = newHeight;
          }
        });
      };
      scope.$watch('rowOffset', function(rowOffset) {
        index = scope.$index + scope.rowOffset;
        scope.rowIsExpanded = !!scope.expandedRows[index];
      });
    }
  };
});
