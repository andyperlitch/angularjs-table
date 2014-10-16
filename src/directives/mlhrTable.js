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

angular.module('datatorrent.mlhrTable.directives.mlhrTable', [
  'datatorrent.mlhrTable.controllers.MlhrTableController',
  'datatorrent.mlhrTable.directives.mlhrTableRows',
  'datatorrent.mlhrTable.directives.mlhrTablePaginate'
])

.directive('mlhrTable', ['$log', '$timeout', function ($log, $timeout) {

  function link(scope, elem) {

    // Specify default track by
    if (typeof scope.trackBy === 'undefined') {
      scope.trackBy = 'id';
    }

    // Look for built-in filter, sort, and format functions
    if (scope.columns instanceof Array) {
      scope.setColumns(scope.columns);
    } else {
      throw new Error('"columns" array not found in mlhrTable scope!');
    }

    // Check for rows
    if ( !(scope.rows instanceof Array) ) {
      throw new Error('"rows" array not found in mlhrTable scope!');
    }

    // Object that holds search terms
    scope.searchTerms = {};

    // Array and Object for sort order+direction
    scope.sortOrder = [];
    scope.sortDirection = {};

    // Holds filtered rows count
    scope.filterState = {
      filterCount: scope.rows.length
    };

    // Default Options, extend provided ones
    scope.options = scope.options || {};
    scope.options = angular.extend(scope.options, {
      bodyHeight: 300,
      scrollDivisor: 1,
      row_limit: 30,
      rowOffset: 0,
      loadingText: 'loading',
      noRowsText: 'no rows',
      setLoading: function(isLoading) {
        this.loading = isLoading;
        scope.$digest();
      },
      trackBy: scope.trackBy,
      pagingScheme: 'scroll',
      sort_classes: [
        'glyphicon glyphicon-sort',
        'glyphicon glyphicon-chevron-up',
        'glyphicon glyphicon-chevron-down'
      ]
    }, scope.options);

    // Look for initial sort order
    if (scope.options.initial_sorts) {
      angular.forEach(scope.options.initial_sorts, function(sort) {
        scope.addSort(sort.id, sort.dir);
      });
    }

    // Check for localStorage persistence
    if (scope.options.storage && scope.options.storage_key) {
      // Set the storage object on the scope
      scope.storage = scope.options.storage;
      scope.storage_key = scope.options.storage_key;

      // Try loading from storage
      scope.loadFromStorage();

      // Watch various things to save state
      //  Save state on the following action:
      //  - sort change
      //  occurs in $scope.toggleSort
      //  - column order change 
      scope.$watchCollection('columns', scope.saveToStorage);
      //  - search terms change
      scope.$watchCollection('searchTerms', scope.saveToStorage);
      //  - paging scheme
      scope.$watch('options.pagingScheme', scope.saveToStorage);
      //  - row limit
      scope.$watch('options.row_limit', scope.saveToStorage);
      //  - when column gets enabled or disabled
      //  TODO
    }

    // Watch for changes to update scroll position
    scope.$watch('filterState.filterCount', function() {
      var minOffset;
      var row_limit = scope.options.row_limit*1;
      if (scope.options.pagingScheme === 'page') {
        if ( row_limit <= 0) {
          minOffset = 0;
        } else {
          minOffset = Math.floor(scope.filterState.filterCount / row_limit) * row_limit;
        }
        
      } else {
        minOffset = scope.filterState.filterCount - row_limit;
      }
      scope.options.rowOffset = Math.max(0, Math.min(scope.options.rowOffset, minOffset));
    });
    scope.$watch('options.pagingScheme', function() {
      scope.options.rowOffset = 0;
    });
  }

  return {
    templateUrl: 'src/templates/mlhr-table.tpl.html',
    restrict: 'EA',
    scope: {
      columns: '=',
      rows: '=',
      classes: '@tableClass',
      selected: '=',
      options: '=?',
      trackBy: '@?'
    },
    controller: 'MlhrTableController',
    compile: function(tElement) {
      if (!tElement.attr('track-by')) {
        tElement.attr('track-by', 'id');
      }
      return link;
    }
  };
}]);