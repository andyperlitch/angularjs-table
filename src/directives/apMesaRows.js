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

.directive('apMesaRows', function($filter, $timeout, apMesaDebounce) {

  var tableRowFilter = $filter('apMesaRowFilter');
  var tableRowSorter = $filter('apMesaRowSorter');
  var limitTo = $filter('limitTo');

  function calculateVisibleRows(scope) {

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

    return visible_rows;
  }

  function link(scope) {
    

    var onGetDataSuccess = function(res) {
      var total = res.total;
      var rows = res.rows;
    }
    var onGetDataError = function(err) {
      console.log('an error occurred getting data.');
    }

    var updateHandler = /*apMesaDebounce(*/function(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      if (!scope.options.getData) {
        scope.visible_rows = calculateVisibleRows(scope);  
      } else {
        scope.options.getData().then(onGetDataSuccess, onGetDataError);
      }
      
      scope.transientState.expandedRows = {};
    }/*, 100)*/;

    var updateHandlerWithoutClearingCollapsed = /*apMesaDebounce(*/function(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      if (!scope.options.getData) {
        scope.visible_rows = calculateVisibleRows(scope);  
      } else {
        scope.options.getData().then(onGetDataSuccess, onGetDataError);
      }
      
    }/*, 100)*/;

    scope.$watch('persistentState.searchTerms', updateHandler, true);
    scope.$watch('[transientState.rowOffset, persistentState.rowLimit, transientState.pageOffset]', updateHandlerWithoutClearingCollapsed);
    scope.$watch('transientState.filterCount', updateHandler);
    scope.$watch('persistentState.sortOrder', updateHandler, true);
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
    updateHandler(true, false);
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
});
