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

angular.module('apMesa.directives.apMesaRows',[
  'apMesa.directives.apMesaRow',
  'apMesa.filters.apMesaRowFilter',
  'apMesa.filters.apMesaRowSorter',
  'apMesa.services.apMesaDebounce'
])

.directive('apMesaRows', ['$filter', '$timeout', 'apMesaDebounce', '$rootScope', function($filter, $timeout, debounce, $rootScope) {

  var tableRowFilter = $filter('apMesaRowFilter');
  var tableRowSorter = $filter('apMesaRowSorter');
  var limitTo = $filter('limitTo');

  /**
   * Updates the visible_rows array on the scope synchronously.
   * @param  {ng.IScope} scope The scope of the particular apMesaRows instance.
   * @return {void}
   */
  function updateVisibleRows(scope) {

    // sanity check
    if (!scope.rows || !scope.columns) {
      return [];
    }

    // scope.rows
    var visible_rows, idx;

    // filter rows
    visible_rows = tableRowFilter(scope.rows, scope.columns, scope.persistentState, scope.transientState, scope.options);

    // sort rows
    visible_rows = tableRowSorter(visible_rows, scope.columns, scope.persistentState.sortOrder, scope.options, scope.transientState);

    // limit rows
    if (scope.options.pagingStrategy === 'SCROLL') {
      visible_rows = limitTo(visible_rows, Math.floor(scope.transientState.rowOffset) - scope.transientState.filterCount);
      visible_rows = limitTo(visible_rows, scope.persistentState.rowLimit + Math.ceil(scope.transientState.rowOffset % 1));
      idx = scope.transientState.rowOffset;
    } else if (scope.options.pagingStrategy === 'PAGINATE') {
      var pagedRowOffset = scope.transientState.pageOffset * scope.persistentState.rowLimit;
      visible_rows = visible_rows.slice(pagedRowOffset, pagedRowOffset + scope.persistentState.rowLimit);
      idx = pagedRowOffset;
    }

    // add index to each row
    visible_rows.forEach(function(row) {
      row.$$$index = idx++;
    });

    scope.visible_rows = visible_rows;
    $rootScope.$broadcast('angular-mesa:update-dummy-rows');
  }

  /**
   * Updates the visible_rows array on the scope asynchronously, using the options.getData function (when present).
   * @param  {ng.IScope} scope The scope of the particular apMesaRows instance
   * @return {ng.IPromise}       Returns the promise of the request
   */
  var updateVisibleRowsAsync = debounce(function(scope) {
    // get offset
    var offset;
    if (scope.options.pagingStrategy === 'SCROLL') {
      offset = scope.transientState.rowOffset;
    } else if (scope.options.pagingStrategy === 'PAGINATE') {
      offset = scope.transientState.pageOffset * scope.persistentState.rowLimit;
    }

    // get active filter
    var searchTerms = scope.persistentState.searchTerms;
    var activeFilters = scope.columns
      .filter(function(column) {
        return !! searchTerms[column.id];
      })
      .map(function(column) {
        return { column: column, value: searchTerms[column.id] };
      });

    // get active sorts
    var activeSorts = scope.persistentState.sortOrder.map(function(sortItem) {
      return {
        column: scope.transientState.columnLookup[sortItem.id],
        direction: sortItem.dir === '+' ? 'ASC' : 'DESC'
      };
    });

    scope.transientState.loadingError = false;
    scope.api.setLoading(true);
    var getDataPromise = scope.transientState.getDataPromise = scope.options.getData(
      offset,
      scope.persistentState.rowLimit,
      activeFilters,
      activeSorts
    ).then(function(res) {
      if (getDataPromise !== scope.transientState.getDataPromise) {
        // new request made, cancelling this one
        return;
      }
      var total = res.total;
      var rows = res.rows;
      var i = offset;
      scope.transientState.rowOffset = offset;
      scope.transientState.filterCount = total;
      scope.visible_rows = rows;
      rows.forEach(function(row) {
        row.$$$index = i++;
      });
      scope.transientState.getDataPromise = null;
      scope.api.setLoading(false);
      $rootScope.$broadcast('angular-mesa:update-dummy-rows');
    }, function(e) {
      scope.transientState.getDataPromise = null;
      scope.transientState.loadingError = true;
      scope.api.setLoading(false);
    });
  }, 200, { leading: false, trailing: true });

  function link(scope) {

    var updateHandler = function(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      if (!scope.options.getData) {
        updateVisibleRows(scope);
      } else {
        updateVisibleRowsAsync(scope);
      }
      
      scope.transientState.expandedRows = {};
    };

    var updateHandlerWithoutClearingCollapsed = function(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      if (!scope.options.getData) {
        updateVisibleRows(scope);
      } else {
        updateVisibleRowsAsync(scope);
      }
      
    };

    // Watchers that trigger updates to visible rows
    scope.$watch('persistentState.searchTerms', function(nv, ov) {
      if (!angular.equals(nv, ov)) {
        scope.resetOffset();
      }
      updateHandler(nv, ov);
    }, true);
    scope.$watch('persistentState.sortOrder', function(nv, ov) {
      if (!angular.equals(nv, ov)) {
        scope.resetOffset();
      }
      updateHandler(nv, ov);
    }, true);
    scope.$watch('transientState.rowOffset', function(nv, ov) {
      if (scope.options.pagingStrategy === 'SCROLL') {
        updateHandlerWithoutClearingCollapsed(nv, ov);
      }
    });
    scope.$watch('persistentState.rowLimit', function(nv, ov) {
      if (scope.options.getData && scope.transientState.rowHeightIsCalculated) {
        return;
      }
      updateHandlerWithoutClearingCollapsed(nv, ov);
    });
    scope.$watch('transientState.pageOffset', function(nv, ov) {
      updateHandlerWithoutClearingCollapsed(nv, ov);
    });
    scope.$watch('transientState.filterCount', function(nv, ov) {
      if (!scope.options.getData) {
        updateHandler(nv, ov);
      }
    });
    scope.$watch('rows', function(newRows) {
      if (angular.isArray(newRows)) {
        updateHandler(true, false);
      }
    });
    scope.$watch('options.getData', function(getData) {
      if (angular.isFunction(getData)) {
        updateHandler(true, false);
      }
    });
  }

  return {
    restrict: 'A',
    templateUrl: 'src/templates/apMesaRows.tpl.html',
    compile: function(tElement, tAttrs) {
      var tr = tElement.find('tr[ng-repeat-start]');
      var repeatString = tr.attr('ng-repeat-start');
      repeatString += tAttrs.trackBy ? ' track by row[options.trackBy]' : ' track by row.$$$index';
      tr.attr('ng-repeat-start', repeatString);
      return link;
    }
  };
}]);
