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
  'datatorrent.mlhrTable.directives.mlhrTableDummyRows'
])

.directive('mlhrTable', ['$log', '$timeout', function () {

  function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = Date.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) {
            context = args = null;
          }
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = Date.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  }

  function link(scope, element) {

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

    // Offset and limit
    scope.rowOffset = 0;
    scope.rowLimit = 10;

    // Default Options, extend provided ones
    scope.options = scope.options || {};
    scope.options = angular.extend(scope.options, {
      rowPadding: 10,
      bodyHeight: 300,
      defaultRowLimit: 15,
      scrollDebounce: 100,
      scrollDivisor: 1,
      loadingText: 'loading',
      noRowsText: 'no rows',
      setLoading: function(isLoading) {
        this.loading = isLoading;
        scope.$digest();
      },
      trackBy: scope.trackBy,
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
      scope.$watch('options.bodyHeight', function() {
        scope.calculateRowLimit();
        scope.saveToStorage();
      });
      scope.$watch('filterState.filterCount', function() {
        scope.onScroll();
      });
      scope.$watch('rowHeight', function(size) {
        element.find('tr.mlhr-table-dummy-row').css('background-size','auto ' + size + 'px');
      });
      //  - when column gets enabled or disabled
      //  TODO
    }

    scope.onScroll = debounce(function() {

      var scrollTop = scope.scrollDiv[0].scrollTop;

      var rowHeight = scope.rowHeight;

      if (rowHeight === 0) {
        return false;
      }

      scope.rowOffset = Math.max(0, Math.floor(scrollTop / rowHeight) - scope.options.rowPadding);

      scope.$digest();

    }, scope.options.scrollDebounce);

    scope.scrollDiv = element.find('.mlhr-rows-table-wrapper');
    scope.scrollDiv.on('scroll', scope.onScroll);

    // Wait for a render
    setTimeout(function() {
      scope.calculateRowLimit();
    }, 0);
  }

  return {
    templateUrl: 'src/templates/mlhrTable.tpl.html',
    restrict: 'EA',
    replace: true,
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
