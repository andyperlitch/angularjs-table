/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
'use strict';

angular.module('datatorrent.mlhrTable.directives.mlhrTableRows',[
  'datatorrent.mlhrTable.directives.mlhrTableCell',
  'datatorrent.mlhrTable.filters.mlhrTableRowFilter',
  'datatorrent.mlhrTable.filters.mlhrTableRowSorter'
])

.directive('mlhrTableRows', function($filter) {

  var tableRowFilter = $filter('mlhrTableRowFilter');
  var tableRowSorter = $filter('mlhrTableRowSorter');
  var limitTo = $filter('limitTo');

  function calculateVisibleRows(scope) {
    // scope.rows
    var visible_rows;
    
    // | tableRowFilter:columns:searchTerms:filterState 
    visible_rows = tableRowFilter(scope.rows, scope.columns, scope.searchTerms, scope.filterState, scope.options);
    
    // | tableRowSorter:columns:sortOrder:sortDirection 
    visible_rows = tableRowSorter(visible_rows, scope.columns, scope.sortOrder, scope.sortDirection, scope.options);

    // | limitTo:rowOffset - filterState.filterCount 
    visible_rows = limitTo(visible_rows, Math.floor(scope.rowOffset) - scope.filterState.filterCount);

    // | limitTo:rowLimit
    visible_rows = limitTo(visible_rows, scope.rowLimit + Math.ceil(scope.rowOffset % 1));

    return visible_rows;
  }

  function link(scope) {

      var updateHandler = function() {
        if (scope.rows) {
          scope.visible_rows = calculateVisibleRows(scope);
        }
      };

      scope.$watch('searchTerms', updateHandler, true);

      scope.$watchGroup([
        'filterState.filterCount',
        'rowOffset',
        'rowLimit'
      ], updateHandler);

      scope.$watch('sortOrder', updateHandler, true);
      scope.$watch('sortDirection', updateHandler, true);
      scope.$watch('rows', updateHandler, true);
    }

  return {
    restrict: 'A',
    templateUrl: 'src/templates/mlhrTableRows.tpl.html',
    compile: function(tElement, tAttrs) {
      var tr = tElement.find('tr');
      var repeatString = tr.attr('ng-repeat');
      repeatString += tAttrs.trackBy ? ' track by row[options.trackBy]' : ' track by $index';
      tr.attr('ng-repeat', repeatString);
      return link;
    }
  };
});
