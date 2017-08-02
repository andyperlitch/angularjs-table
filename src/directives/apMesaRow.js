'use strict';

angular.module('apMesa.directives.apMesaRow', ['apMesa.directives.apMesaCell'])
.directive('apMesaRow', function($timeout) {
  return {
    template: '<td ng-repeat="column in enabledColumnObjects track by column.id" class="ap-mesa-cell col-{{column.id}}" ap-mesa-cell></td>',
    scope: false,
    link: function(scope, element) {
      var index;

      if (scope.options.pagingStrategy === 'SCROLL') {
        index = scope.$index + scope.transientState.rowOffset;
        scope.rowIsExpanded = !!scope.transientState.expandedRows[index];
      } else if (scope.options.pagingStrategy === 'PAGINATE') {
        scope.$watch('options.rowsPerPage', function(rowsPerPage) {
          index = scope.$index + (scope.transientState.pageOffset * rowsPerPage);
          scope.rowIsExpanded = !!scope.transientState.expandedRows[index];
        });
      }
      
      scope.$watch('transientState.expandedRows', function(nv, ov) {
        if (nv !== ov) {
          scope.rowIsExpanded = false;
        }
      });
      
      scope.toggleRowExpand = function() {
        scope.transientState.expandedRows[index] = scope.rowIsExpanded = !scope.transientState.expandedRows[index];
        if (!scope.transientState.expandedRows[index]) {
          delete scope.transientState.expandedRows[index];
          delete scope.transientState.expandedRowHeights[index];
        } else {
          scope.refreshExpandedHeight(false);
        }
      };
      scope.refreshExpandedHeight = function(fromTemplate) {
        $timeout(function() {
          var newHeight = element.next('tr.ap-mesa-expand-panel').height();
          scope.transientState.expandedRowHeights[index] = newHeight;
        });
      };
    }
  };
});
