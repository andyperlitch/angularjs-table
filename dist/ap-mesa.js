'use strict';
// Source: dist/ap-mesa.js
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
angular.module('apMesa', [
  'apMesa.templates',
  'ui.sortable',
  'ngSanitize',
  'apMesa.directives.apMesa'
]);
// Source: dist/controllers/ApMesaController.js
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
angular.module('apMesa.controllers.ApMesaController', [
  'apMesa.services.apMesaSortFunctions',
  'apMesa.services.apMesaFilterFunctions',
  'apMesa.services.apMesaFormatFunctions'
]).controller('ApMesaController', [
  '$scope',
  '$element',
  'apMesaFormatFunctions',
  'apMesaSortFunctions',
  'apMesaFilterFunctions',
  '$log',
  '$window',
  '$filter',
  '$timeout',
  function ($scope, $element, formats, sorts, filters, $log, $window, $filter, $timeout) {
    // SCOPE FUNCTIONS
    $scope.getSelectableRows = function () {
      var tableRowFilter = $filter('apMesaRowFilter');
      return angular.isArray($scope.rows) ? tableRowFilter($scope.rows, $scope.columns, $scope.persistentState, $scope.transientState) : [];
    };
    $scope.isSelectedAll = function () {
      if (!angular.isArray($scope.rows) || !angular.isArray($scope.selected)) {
        return false;
      }
      var rows = $scope.getSelectableRows();
      return rows.length > 0 && rows.length === $scope.selected.length;
    };
    $scope.selectAll = function () {
      $scope.deselectAll();
      // Get a list of filtered rows
      var rows = $scope.getSelectableRows();
      if (rows.length <= 0)
        return;
      var columns = $scope.columns;
      var selectorKey = null;
      var selectObject = null;
      // Search for selector key in selector column
      for (var i = 0; i < columns.length; i++) {
        if (columns[i].selector) {
          selectorKey = columns[i].key;
          selectObject = columns[i].selectObject;
          break;
        }
      }
      // Verify that selectorKey was found
      if (!selectorKey) {
        throw new Error('Unable to find selector column key for selectAll');
      }
      //select key or entire object from all rows
      for (var i = 0; i < rows.length; i++) {
        $scope.selected.push(selectObject ? rows[i] : rows[i][selectorKey]);
      }
    };
    $scope.deselectAll = function () {
      while ($scope.selected.length > 0) {
        $scope.selected.pop();
      }
    };
    $scope.toggleSelectAll = function ($event) {
      var checkbox = $event.target;
      if (checkbox.checked) {
        $scope.selectAll();
      } else {
        $scope.deselectAll();
      }
    };
    function findSortItemIndex(id) {
      var sortLen = $scope.persistentState.sortOrder.length;
      for (var i = 0; i < sortLen; i++) {
        if ($scope.persistentState.sortOrder[i].id === id) {
          return i;
        }
      }
    }
    function findSortItem(id) {
      var index = findSortItemIndex(id);
      if (index > -1) {
        return $scope.persistentState.sortOrder[index];
      }
    }
    $scope.addSort = function (id, dir) {
      var sortItem = findSortItem(id);
      if (sortItem) {
        sortItem.dir = dir;
      } else {
        $scope.persistentState.sortOrder.push({
          id: id,
          dir: dir
        });
      }
    };
    $scope.removeSort = function (id) {
      var idx = findSortItemIndex(id);
      if (idx !== -1) {
        $scope.persistentState.sortOrder.splice(idx, 1);
      }
    };
    $scope.clearSort = function () {
      $scope.persistentState.sortOrder = [];
    };
    // Checks if columns have any filter fileds
    $scope.hasFilterFields = function () {
      if (!$scope.columns) {
        return false;
      }
      for (var i = $scope.columns.length - 1; i >= 0; i--) {
        if (typeof $scope.columns[i].filter !== 'undefined') {
          return true;
        }
      }
      return false;
    };
    // Clears search field for column, focus on input
    $scope.clearAndFocusSearch = function (columnId) {
      $scope.persistentState.searchTerms[columnId] = '';
      $element.find('tr.ap-mesa-filter-row th.column-' + columnId + ' input').focus();
    };
    // Toggles column sorting
    $scope.toggleSort = function ($event, column) {
      // check if even sortable
      if (!column.sort) {
        return;
      }
      // check for existing sort on this column
      var sortItem = findSortItem(column.id);
      if ($event.shiftKey) {
        // shift is down, ignore other columns
        // but toggle between three states
        if (sortItem) {
          if (sortItem.dir === '+') {
            sortItem.dir = '-';
          } else if (sortItem.dir === '-') {
            $scope.removeSort(column.id);
          }
        } else {
          // Make ascending
          $scope.addSort(column.id, '+');
        }
      } else {
        // shift is not down, disable other
        // columns but toggle two states
        var lastState = sortItem ? sortItem.dir : '';
        $scope.clearSort();
        if (lastState === '+') {
          $scope.addSort(column.id, '-');
        } else {
          $scope.addSort(column.id, '+');
        }
      }
      $scope.saveToStorage();
    };
    // Retrieve className for given sorting state
    $scope.getSortClass = function (sorting) {
      var classes = $scope.options.sortClasses;
      if (sorting === '+') {
        return classes[1];
      }
      if (sorting === '-') {
        return classes[2];
      }
      return classes[0];
    };
    $scope.setColumns = function (columns) {
      try {
        $scope.columns = columns;
        $scope.columns.forEach(function (column) {
          // formats
          var format = column.format;
          if (typeof format !== 'function') {
            if (typeof format === 'string') {
              if (typeof formats[format] === 'function') {
                column.format = formats[format];
              } else {
                try {
                  column.format = $filter(format);
                } catch (e) {
                  delete column.format;
                  $log.warn('format function reference in column(id=' + column.id + ') ' + 'was not found in built-in format functions or $filters. ' + 'format function given: "' + format + '". ' + 'Available built-ins: ' + Object.keys(formats).join(',') + '. ' + 'If you supplied a $filter, ensure it is available on this module');
                }
              }
            } else {
              delete column.format;
            }
          }
          if (!$scope.options.getData) {
            // sort
            var sort = column.sort;
            if (typeof sort !== 'function') {
              if (typeof sort === 'string') {
                if (typeof sorts[sort] === 'function') {
                  column.sort = sorts[sort](column.key);
                } else {
                  delete column.sort;
                  $log.warn('sort function reference in column(id=' + column.id + ') ' + 'was not found in built-in sort functions. ' + 'sort function given: "' + sort + '". ' + 'Available built-ins: ' + Object.keys(sorts).join(',') + '. ');
                }
              } else {
                delete column.sort;
              }
            }
            // filter
            var filter = column.filter;
            if (typeof filter !== 'function') {
              if (typeof filter === 'string') {
                if (typeof filters[filter] === 'function') {
                  column.filter = filters[filter];
                } else {
                  delete column.filter;
                  $log.warn('filter function reference in column(id=' + column.id + ') ' + 'was not found in built-in filter functions. ' + 'filter function given: "' + filter + '". ' + 'Available built-ins: ' + Object.keys(filters).join(',') + '. ');
                }
              } else {
                delete column.filter;
              }
            }
          }
        });
      } catch (e) {
        console.log(e.message);
      }
    };
    $scope.startColumnResize = function ($event, column) {
      // Stop default so text does not get selected
      $event.preventDefault();
      $event.originalEvent.preventDefault();
      $event.stopPropagation();
      // init variable for new width
      var new_width = false;
      // store initial mouse position
      var initial_x = $event.pageX;
      // create marquee element
      var $m = $('<div class="column-resizer-marquee"></div>');
      // append to th
      var $th = $($event.target).parent('th');
      $th.append($m);
      // set initial marquee dimensions
      var initial_width = $th.outerWidth();
      function mousemove(e) {
        // calculate changed width
        var current_x = e.pageX;
        var diff = current_x - initial_x;
        new_width = initial_width + diff;
        // update marquee dimensions
        $m.css('width', new_width + 'px');
      }
      $m.css({
        width: initial_width + 'px',
        height: $th.outerHeight() + 'px'
      });
      // set mousemove listener
      $($window).on('mousemove', mousemove);
      // set mouseup/mouseout listeners
      $($window).one('mouseup', function (e) {
        e.stopPropagation();
        // remove marquee, remove window mousemove listener
        $m.remove();
        $($window).off('mousemove', mousemove);
        // set new width on th
        // if a new width was set
        if (new_width === false) {
          delete column.width;
        } else {
          column.width = Math.max(new_width, 0);
        }
        $scope.$apply();
      });
    };
    $scope.sortableOptions = {
      axis: 'x',
      handle: '.column-text',
      helper: 'clone',
      placeholder: 'ap-mesa-column-placeholder',
      distance: 5
    };
    $scope.getActiveColCount = function () {
      var count = 0;
      $scope.columns.forEach(function (col) {
        if (!col.disabled) {
          count++;
        }
      });
      return count;
    };
    $scope.saveToStorage = function () {
      if (!$scope.storage) {
        return;
      }
      // init object to stringify/save
      var state = {};
      // save state objects
      [
        'sortOrder',
        'searchTerms'
      ].forEach(function (prop) {
        state[prop] = $scope.persistentState[prop];
      });
      // serialize columns
      state.columns = $scope.columns.map(function (col) {
        return {
          id: col.id,
          disabled: !!col.disabled
        };
      });
      // save non-transient options
      state.options = {};
      [
        'rowLimit',
        'pagingScheme',
        'storageHash'
      ].forEach(function (prop) {
        state.options[prop] = $scope.options[prop];
      });
      // Save to storage
      $scope.storage.setItem($scope.storageKey, JSON.stringify(state));
    };
    $scope.loadFromStorage = function () {
      if (!$scope.storage) {
        return;
      }
      // Attempt to parse the storage
      var stateString = $scope.storage.getItem($scope.storageKey);
      // Was it there?
      if (!stateString) {
        return;
      }
      // Try to parse it
      var state;
      try {
        state = JSON.parse(stateString);
        // if mimatched storage hash, stop loading from storage
        if (state.options.storageHash !== $scope.options.storageHash) {
          return;
        }
        // load state objects
        [
          'sortOrder',
          'searchTerms'
        ].forEach(function (prop) {
          $scope.persistentState[prop] = state[prop];
        });
        // validate (compare ids)
        // reorder columns and merge
        var column_ids = state.columns.map(function (col) {
            return col.id;
          });
        $scope.columns.sort(function (a, b) {
          var aNotThere = column_ids.indexOf(a.id) === -1;
          var bNotThere = column_ids.indexOf(b.id) === -1;
          if (aNotThere && bNotThere) {
            return 0;
          }
          if (aNotThere) {
            return 1;
          }
          if (bNotThere) {
            return -1;
          }
          return column_ids.indexOf(a.id) - column_ids.indexOf(b.id);
        });
        $scope.columns.forEach(function (col, i) {
          ['disabled'].forEach(function (prop) {
            col[prop] = state.columns[i][prop];
          });
        });
        // load options
        [
          'rowLimit',
          'pagingScheme',
          'storageHash'
        ].forEach(function (prop) {
          $scope.options[prop] = state.options[prop];
        });
      } catch (e) {
        $log.warn('Loading from storage failed!');
      }
    };
  }
]);
// Source: dist/directives/apMesa.js
(function () {
  var defaultOptions = {
      bgSizeMultiplier: 1,
      rowPadding: 300,
      bodyHeight: 300,
      fixedHeight: false,
      defaultRowHeight: 40,
      scrollDebounce: 100,
      scrollDivisor: 1,
      loadingText: undefined,
      noRowsText: 'No data.',
      pagingStrategy: 'SCROLL',
      rowsPerPage: 10,
      rowsPerPageChoices: [
        10,
        25,
        50,
        100
      ],
      rowsPerPageMessage: 'rows per page',
      showRowsPerPageCtrls: true,
      maxPageLinks: 8,
      sortClasses: [
        'glyphicon glyphicon-sort',
        'glyphicon glyphicon-chevron-up',
        'glyphicon glyphicon-chevron-down'
      ],
      onRegisterApi: function (api) {
      }
    };
  function defaults(obj) {
    if (typeof obj !== 'object') {
      return obj;
    }
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) {
          obj[prop] = source[prop];
        }
      }
    }
    return obj;
  }
  angular.module('apMesa.directives.apMesa', [
    'apMesa.controllers.ApMesaController',
    'apMesa.directives.apMesaRows',
    'apMesa.directives.apMesaDummyRows',
    'apMesa.directives.apMesaExpandable',
    'apMesa.directives.apMesaPaginationCtrls',
    'apMesa.directives.apMesaStatusDisplay',
    'apMesa.directives.apMesaThTitle',
    'apMesa.services.apMesaDebounce'
  ]).provider('apMesa', function ApMesaService() {
    this.setDefaultOptions = function (overrides) {
      defaultOptions = defaults(overrides, defaultOptions);
    };
    this.$get = [function () {
        return {
          getDefaultOptions: function () {
            return defaultOptions;
          },
          setDefaultOptions: function (overrides) {
            defaultOptions = defaults(overrides, defaultOptions);
          }
        };
      }];
  }).directive('apMesa', [
    '$log',
    '$timeout',
    '$q',
    'apMesa',
    'apMesaDebounce',
    function ($log, $timeout, $q, apMesa, debounce) {
      function resetState(scope) {
        var rowLimit = defaultOptions.rowsPerPage;
        if (scope.options && scope.options.rowsPerPage) {
          rowLimit = scope.options.rowsPerPage;
        }
        scope.persistentState = {
          rowLimit: rowLimit,
          searchTerms: {},
          sortOrder: []
        };
        scope.transientState = {
          rowHeightIsCalculated: false,
          filterCount: scope.rows ? scope.rows.length : 0,
          rowOffset: 0,
          pageOffset: 0,
          expandedRows: {},
          expandedRowHeights: {},
          columnLookup: {},
          loadingError: null,
          loading: false
        };
        if (scope.columns.length) {
          var lookup = scope.transientState.columnLookup;
          scope.columns.forEach(function (column) {
            lookup[column.id] = column;
          });
        }
        scope.$broadcast('apMesa:stateReset');
      }
      function initOptions(scope) {
        // Sanity check for getter
        if (scope.options !== undefined && scope.options.hasOwnProperty('getter')) {
          if (typeof scope.options.getter !== 'function') {
            throw new Error('"getter" in "options" should be a function!');
          }
        }
        // Default Options, extend provided ones
        scope.options = scope.options || {};
        var trackByOverride = scope.trackBy ? { trackBy: scope.trackBy } : {};
        defaults(scope.options, trackByOverride, apMesa.getDefaultOptions());
        initSorts(scope);
      }
      function initSorts(scope) {
        // Look for initial sort order
        if (scope.options.initialSorts) {
          angular.forEach(scope.options.initialSorts, function (sort) {
            scope.addSort(sort.id, sort.dir);
          });
        }
      }
      function resetColumns(scope) {
        if (scope._columns && scope._columns.length) {
          scope.columns = angular.copy(scope._columns);
          scope.setColumns(scope.columns);
          resetState(scope);
        }
      }
      function preLink(scope) {
        initOptions(scope);
        resetColumns(scope);
        resetState(scope);
      }
      function postLink(scope, element) {
        var deregStorageWatchers = [];
        scope.scrollDiv = element.find('.mesa-rows-table-wrapper');
        scope.$watch('_columns', function (columns, oldColumns) {
          if (columns !== scope.columns) {
            resetColumns(scope);
            initSorts(scope);
          }
        });
        scope.$watch('options', function (newOptions, oldOptions) {
          resetState(scope);
          initOptions(scope);
        });
        scope.$watch('options.storage', function (storage) {
          if (storage) {
            if (!scope.options.storageKey) {
              throw new Error('apMesa: the storage option requires the storageKey option as well. See the README.');
            }
            // Set the storage object on the scope
            scope.storage = scope.options.storage;
            scope.storageKey = scope.options.storageKey;
            // Try loading from storage
            scope.loadFromStorage();
            // Watch various things to save state
            //  Save state on the following action:
            //  - sort change
            //  occurs in scope.toggleSort
            //  - column order change
            deregStorageWatchers.push(scope.$watchCollection('columns', scope.saveToStorage));
            //  - search terms change
            deregStorageWatchers.push(scope.$watchCollection('persistentState.searchTerms', scope.saveToStorage));
          } else if (deregStorageWatchers.length) {
            deregStorageWatchers.forEach(function (d) {
              d();
            });
            deregStorageWatchers = [];
          }
        });
        var fillHeightWatcher;
        scope.$watch('options.fillHeight', function (fillHeight) {
          if (scope.options.pagingStrategy !== 'SCROLL') {
            return;
          }
          if (fillHeight) {
            // calculate available space
            fillHeightWatcher = scope.$on('apMesa:resize', function () {
              scope.options.bodyHeight = element.parent().height() - element.find('.mesa-header-table').outerHeight(true);
            });
            scope.$emit('apMesa:resize');
          } else if (fillHeightWatcher) {
            fillHeightWatcher();
          }
        });
        //  - row limit
        scope.$watch('options.bodyHeight', function () {
          if (scope.options.pagingStrategy !== 'SCROLL') {
            return;
          }
          scope.calculateRowLimit();
          scope.tbodyNgStyle = {};
          scope.tbodyNgStyle[scope.options.fixedHeight ? 'height' : 'max-height'] = scope.options.bodyHeight + 'px';
          scope.saveToStorage();
        });
        scope.$watch('transientState.filterCount', function () {
          if (scope.options && scope.options.pagingStrategy === 'SCROLL') {
            scope.onScroll();
          }
        });
        scope.$watch('rowHeight', function (size) {
          element.find('tr.ap-mesa-dummy-row').css('background-size', 'auto ' + size * scope.options.bgSizeMultiplier + 'px');
        });
        scope.$watch('options.loadingPromise', function (promise) {
          if (angular.isObject(promise) && typeof promise.then === 'function') {
            scope.api.setLoading(true);
            promise.then(function (data) {
              scope.transientState.loadingError = false;
              scope.api.setLoading(false);
              if (angular.isArray(data)) {
                scope.rows = data;
              }
            }, function (reason) {
              scope.transientState.loadingError = true;
              scope.api.setLoading(false);
              $log.warn('Failed loading table data: ' + reason);
            });
          }
        });
        scope.$watch('options.rowsPerPage', function (count, oldCount) {
          scope.calculateRowLimit();
          if (count !== oldCount) {
            var lastPageOffset = Math.floor(scope.transientState.filterCount / scope.options.rowsPerPage);
            scope.transientState.pageOffset = Math.min(lastPageOffset, scope.transientState.pageOffset);
          }
        });
        scope.$watch('options.pagingStrategy', function (strategy) {
          if (strategy === 'SCROLL') {
            scope.scrollDiv.off('scroll');
            scope.scrollDiv.on('scroll', scope.onScroll);
          } else if (strategy === 'PAGINATE') {
          }
        });
        scope.$watch('persistentState.sortOrder', function (sortOrder) {
          if (sortOrder) {
            scope.sortDirection = {};
            sortOrder.forEach(function (sortItem) {
              scope.sortDirection[sortItem.id] = sortItem.dir;
            });
          }
        }, true);
        var scrollDeferred;
        var debouncedScrollHandler = debounce(function () {
            scope.calculateRowLimit();
            var scrollTop = scope.scrollDiv[0].scrollTop - scope.options.rowPadding;
            var rowHeight = scope.rowHeight;
            if (rowHeight === 0) {
              return false;
            }
            var rowOffset = 0;
            var runningTotalScroll = 0;
            var expandedOffsets = Object.keys(scope.transientState.expandedRows).map(function (i) {
                return parseInt(i);
              }).sort();
            // push the max offset so this works in constant time
            // when no expanded rows are present
            expandedOffsets.push(scope.transientState.filterCount);
            // a counter that holds the last offset of an expanded row
            for (var i = 0; i <= expandedOffsets.length; i++) {
              // the offset of the expanded row
              var expandedOffset = expandedOffsets[i];
              // the height of the collapsed rows before this expanded row
              // and after the previous expanded row
              var rowsHeight = (expandedOffset - rowOffset) * rowHeight;
              // check if the previous rows is more than enough
              if (runningTotalScroll + rowsHeight >= scrollTop) {
                rowOffset += Math.floor((scrollTop - runningTotalScroll) / rowHeight);
                break;
              }
              // otherwise add it to the running total
              runningTotalScroll += rowsHeight;
              // the pixels that this row's expanded panel displaces
              var expandedPixels = scope.transientState.expandedRowHeights[expandedOffset];
              runningTotalScroll += expandedPixels;
              rowOffset = expandedOffset;
              // Check if the expanded panel put us over the edge
              if (runningTotalScroll >= scrollTop) {
                rowOffset--;
                break;
              }
            }
            scope.transientState.rowOffset = Math.max(0, rowOffset);
            scrollDeferred.resolve();
            scrollDeferred = null;
            scope.options.scrollingPromise = null;
            scope.$digest();
          }, scope.options.scrollDebounce);
        scope.onScroll = function () {
          if (!scrollDeferred) {
            scrollDeferred = $q.defer();
            scope.options.scrollingPromise = scrollDeferred.promise;
          }
          debouncedScrollHandler();
        };
        scope.calculateRowLimit = function () {
          var rowHeight = scope.scrollDiv.find('.ap-mesa-rendered-rows tr').height();
          scope.rowHeight = rowHeight || scope.options.defaultRowHeight || 20;
          if (!scope.transientState.rowHeightIsCalculated && rowHeight) {
            scope.transientState.rowHeightIsCalculated = true;
          }
          if (scope.options.pagingStrategy === 'SCROLL') {
            scope.persistentState.rowLimit = Math.ceil((scope.options.bodyHeight + scope.options.rowPadding * 2) / scope.rowHeight);
          } else if (scope.options.pagingStrategy === 'PAGINATE') {
            scope.persistentState.rowLimit = scope.options.rowsPerPage;
          }
        };
        scope.resetOffset = function () {
          if (scope.options.pagingStrategy === 'SCROLL') {
            scope.scrollDiv[0].scrollTop = 0;
            scope.transientState.rowOffset = 0;
          } else if (scope.options.pagingStrategy === 'PAGINATE') {
            scope.transientState.pageOffset = 0;
            scope.transientState.rowOffset = 0;
          }
        };
        // Wait for a render
        $timeout(function () {
          // Calculates rowHeight and rowLimit
          scope.calculateRowLimit();
        }, 0);
        scope.api = {
          isSelectedAll: scope.isSelectedAll,
          selectAll: scope.selectAll,
          deselectAll: scope.deselectAll,
          toggleSelectAll: scope.toggleSelectAll,
          setLoading: function (isLoading, triggerDigest) {
            scope.transientState.loading = isLoading;
            if (triggerDigest) {
              scope.$digest();
            }
          }
        };
        // Register API
        scope.options.onRegisterApi(scope.api);
      }
      return {
        templateUrl: 'src/templates/apMesa.tpl.html',
        restrict: 'EA',
        replace: true,
        scope: {
          _columns: '=columns',
          rows: '=',
          classes: '@tableClass',
          selected: '=',
          options: '=?',
          trackBy: '@?'
        },
        controller: 'ApMesaController',
        compile: function (tElement) {
          var trackBy = tElement.attr('track-by');
          if (trackBy) {
            tElement.find('.ap-mesa-rendered-rows').attr('track-by', trackBy);
          }
          return {
            pre: preLink,
            post: postLink
          };
        }
      };
    }
  ]);
}());
// Source: dist/directives/apMesaCell.js
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
angular.module('apMesa.directives.apMesaCell', ['apMesa.directives.apMesaSelector']).directive('apMesaCell', [
  '$compile',
  function ($compile) {
    function link(scope, element) {
      scope.$watch('column', function (column) {
        var cellMarkup = '';
        if (column.template) {
          cellMarkup = column.template;
        } else if (column.templateUrl) {
          cellMarkup = '<div ng-include="\'' + column.templateUrl + '\'"></div>';
        } else if (column.selector === true) {
          cellMarkup = '<input type="checkbox" ng-checked="selected.indexOf(column.selectObject ? row : row[column.key]) >= 0" ap-mesa-selector class="ap-mesa-selector" />';
        } else if (column.ngFilter) {
          cellMarkup = '{{ row[column.key] | ' + column.ngFilter + ':row }}';
        } else if (column.format) {
          var valueExpr = scope.options !== undefined && {}.hasOwnProperty.call(scope.options, 'getter') ? 'options.getter(column.key, row)' : 'row[column.key]';
          cellMarkup = '{{ column.format(' + valueExpr + ', row, column, options) }}';
        } else if (scope.options !== undefined && {}.hasOwnProperty.call(scope.options, 'getter')) {
          cellMarkup = '{{ options.getter(column.key, row) }}';
        } else {
          cellMarkup = '{{ row[column.key] }}';
        }
        element.html(cellMarkup);
        $compile(element.contents())(scope);
      });
    }
    return {
      scope: true,
      link: link
    };
  }
]);
// Source: dist/directives/apMesaDummyRows.js
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
/**
 * @ngdoc directive
 * @name apMesa.directive:apMesaDummyRows
 * @restrict A
 * @description inserts dummy <tr>s for non-rendered rows
 * @element tbody
 * @example <tbody ap-mesa-dummy-rows="[number]" columns="[column array]"></tbody>
**/
angular.module('apMesa.directives.apMesaDummyRows', []).directive('apMesaDummyRows', function () {
  return {
    template: '<tr class="ap-mesa-dummy-row" ng-style="{ height: dummyRowHeight + \'px\'}"><td ng-show="dummyRowHeight" ng-attr-colspan="{{columns.length}}"></td></tr>',
    scope: true,
    link: function (scope, element, attrs) {
      scope.$on('angular-mesa:update-dummy-rows', function () {
        var offsetRange = scope.$eval(attrs.apMesaDummyRows);
        var rowsHeight = (offsetRange[1] - offsetRange[0]) * scope.rowHeight;
        for (var k in scope.transientState.expandedRows) {
          var kInt = parseInt(k);
          if (kInt >= offsetRange[0] && kInt < offsetRange[1]) {
            rowsHeight += scope.transientState.expandedRowHeights[k];
          }
        }
        scope.dummyRowHeight = rowsHeight;
      });
    }
  };
});
// Source: dist/directives/apMesaExpandable.js
angular.module('apMesa.directives.apMesaExpandable', []).directive('apMesaExpandable', [
  '$compile',
  function ($compile) {
    return {
      scope: false,
      link: function (scope, element, attrs) {
        scope.$watch('row', function () {
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
  }
]);
// Source: dist/directives/apMesaPaginationCtrls.js
angular.module('apMesa.directives.apMesaPaginationCtrls', []).directive('apMesaPaginationCtrls', [
  '$timeout',
  function ($timeout) {
    return {
      templateUrl: 'src/templates/apMesaPaginationCtrls.tpl.html',
      scope: true,
      link: function (scope, element) {
        function updatePageLinks() {
          var pageLinks = [];
          var numPages = Math.ceil(scope.transientState.filterCount / scope.options.rowsPerPage);
          var currentPage = scope.transientState.pageOffset;
          var maxPageLinks = Math.max(5, scope.options.maxPageLinks);
          // must be a minimum of 5 max page links
          if (numPages <= maxPageLinks) {
            for (var i = 0; i < numPages; i++) {
              pageLinks.push({
                gap: false,
                page: i,
                current: currentPage === i
              });
            }
          } else if (currentPage < maxPageLinks - 2) {
            for (var i = 0; i < maxPageLinks - 2; i++) {
              pageLinks.push({
                gap: false,
                page: i,
                current: currentPage === i
              });
            }
            pageLinks.push({
              gap: true,
              page: -1,
              current: false
            }, {
              gap: false,
              page: numPages - 1,
              current: false
            });
          } else if (numPages - currentPage <= maxPageLinks - 2) {
            pageLinks.push({
              gap: false,
              page: 0,
              current: false
            }, {
              gap: true,
              page: -1,
              current: false
            });
            var startingPage = numPages - (maxPageLinks - 2);
            for (var i = startingPage; i < numPages; i++) {
              pageLinks.push({
                gap: false,
                page: i,
                current: currentPage === i
              });
            }
          } else {
            pageLinks.push({
              gap: false,
              page: 0,
              current: false
            }, {
              gap: true,
              page: -1,
              current: false
            });
            var remainingLinkCount = maxPageLinks - 4;
            for (var i = 0; remainingLinkCount > 0; i++) {
              var distance = i % 2 ? (i + 1) / 2 : -(i / 2);
              var page = currentPage + distance;
              if (distance >= 0) {
                pageLinks.push({
                  gap: false,
                  page: page,
                  current: distance === 0
                });
              } else {
                pageLinks.splice(2, 0, {
                  gap: false,
                  page: page,
                  current: false
                });
              }
              --remainingLinkCount;
            }
            pageLinks.push({
              gap: true,
              page: -1,
              current: false
            }, {
              gap: false,
              page: numPages - 1,
              current: false
            });
          }
          scope.pageLinks = pageLinks;
          scope.lastPage = numPages - 1;
        }
        scope.$watch('transientState.filterCount', updatePageLinks);
        scope.$watch('options.rowsPerPage', updatePageLinks);
        scope.$watch('transientState.pageOffset', updatePageLinks);
        scope.goBack = function () {
          if (scope.transientState.pageOffset === 0) {
            return;
          }
          scope.transientState.pageOffset--;
        };
        scope.goForward = function () {
          if (scope.transientState.pageOffset === scope.lastPage) {
            return;
          }
          scope.transientState.pageOffset++;
        };
      }
    };
  }
]);
// Source: dist/directives/apMesaRow.js
angular.module('apMesa.directives.apMesaRow', ['apMesa.directives.apMesaCell']).directive('apMesaRow', [
  '$timeout',
  function ($timeout) {
    return {
      template: '<td ng-repeat="column in columns track by column.id" class="ap-mesa-cell col-{{column.id}}" ap-mesa-cell></td>',
      scope: false,
      link: function (scope, element) {
        var index = scope.$index + scope.transientState.rowOffset;
        scope.rowIsExpanded = !!scope.transientState.expandedRows[index];
        scope.toggleRowExpand = function () {
          scope.transientState.expandedRows[index] = scope.rowIsExpanded = !scope.transientState.expandedRows[index];
          if (!scope.transientState.expandedRows[index]) {
            delete scope.transientState.expandedRows[index];
            delete scope.transientState.expandedRowHeights[index];
          } else {
            scope.refreshExpandedHeight(false);
          }
        };
        scope.refreshExpandedHeight = function (fromTemplate) {
          $timeout(function () {
            var newHeight = element.next('tr.ap-mesa-expand-panel').height();
            scope.transientState.expandedRowHeights[index] = newHeight;
          });
        };
        scope.$watch('transientState.expandedRows', function (nv, ov) {
          if (nv !== ov) {
            scope.rowIsExpanded = false;
          }
        });
      }
    };
  }
]);
// Source: dist/directives/apMesaRows.js
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
angular.module('apMesa.directives.apMesaRows', [
  'apMesa.directives.apMesaRow',
  'apMesa.filters.apMesaRowFilter',
  'apMesa.filters.apMesaRowSorter',
  'apMesa.services.apMesaDebounce'
]).directive('apMesaRows', [
  '$filter',
  '$timeout',
  'apMesaDebounce',
  '$rootScope',
  function ($filter, $timeout, debounce, $rootScope) {
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
      visible_rows.forEach(function (row) {
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
    var updateVisibleRowsAsync = debounce(function (scope) {
        // get offset
        var offset;
        if (scope.options.pagingStrategy === 'SCROLL') {
          offset = scope.transientState.rowOffset;
        } else if (scope.options.pagingStrategy === 'PAGINATE') {
          offset = scope.transientState.pageOffset * scope.persistentState.rowLimit;
        }
        // get active filter
        var searchTerms = scope.persistentState.searchTerms;
        var activeFilters = scope.columns.filter(function (column) {
            return !!searchTerms[column.id];
          }).map(function (column) {
            return {
              column: column,
              value: searchTerms[column.id]
            };
          });
        // get active sorts
        var activeSorts = scope.persistentState.sortOrder.map(function (sortItem) {
            return {
              column: scope.transientState.columnLookup[sortItem.id],
              direction: sortItem.dir === '+' ? 'ASC' : 'DESC'
            };
          });
        scope.transientState.loadingError = false;
        scope.api.setLoading(true);
        var getDataPromise = scope.transientState.getDataPromise = scope.options.getData(offset, scope.persistentState.rowLimit, activeFilters, activeSorts).then(function (res) {
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
            rows.forEach(function (row) {
              row.$$$index = i++;
            });
            scope.transientState.getDataPromise = null;
            scope.api.setLoading(false);
            $rootScope.$broadcast('angular-mesa:update-dummy-rows');
          }, function (e) {
            scope.transientState.getDataPromise = null;
            scope.transientState.loadingError = true;
            scope.api.setLoading(false);
          });
      }, 200, {
        leading: false,
        trailing: true
      });
    function link(scope) {
      var updateHandler = function (newValue, oldValue) {
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
      var updateHandlerWithoutClearingCollapsed = function (newValue, oldValue) {
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
      scope.$watch('persistentState.searchTerms', function (nv, ov) {
        if (!angular.equals(nv, ov)) {
          scope.resetOffset();
        }
        updateHandler(nv, ov);
      }, true);
      scope.$watch('persistentState.sortOrder', function (nv, ov) {
        if (!angular.equals(nv, ov)) {
          scope.resetOffset();
        }
        updateHandler(nv, ov);
      }, true);
      scope.$watch('transientState.rowOffset', function (nv, ov) {
        if (scope.options.pagingStrategy === 'SCROLL') {
          updateHandlerWithoutClearingCollapsed(nv, ov);
        }
      });
      scope.$watch('persistentState.rowLimit', function (nv, ov) {
        if (scope.options.getData && scope.transientState.rowHeightIsCalculated) {
          return;
        }
        updateHandlerWithoutClearingCollapsed(nv, ov);
      });
      scope.$watch('transientState.pageOffset', function (nv, ov) {
        updateHandlerWithoutClearingCollapsed(nv, ov);
      });
      scope.$watch('transientState.filterCount', function (nv, ov) {
        if (!scope.options.getData) {
          updateHandler(nv, ov);
        }
      });
      scope.$watch('rows', function (newRows) {
        if (angular.isArray(newRows)) {
          updateHandler(true, false);
        }
      });
      scope.$watch('options.getData', function (getData) {
        if (angular.isFunction(getData)) {
          updateHandler(true, false);
        }
      });
    }
    return {
      restrict: 'A',
      templateUrl: 'src/templates/apMesaRows.tpl.html',
      compile: function (tElement, tAttrs) {
        var tr = tElement.find('tr[ng-repeat-start]');
        var repeatString = tr.attr('ng-repeat-start');
        repeatString += tAttrs.trackBy ? ' track by row[options.trackBy]' : ' track by row.$$$index';
        tr.attr('ng-repeat-start', repeatString);
        return link;
      }
    };
  }
]);
// Source: dist/directives/apMesaSelector.js
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
angular.module('apMesa.directives.apMesaSelector', []).directive('apMesaSelector', function () {
  return {
    restrict: 'A',
    scope: false,
    link: function postLink(scope, element) {
      var selected = scope.selected;
      var row = scope.row;
      var column = scope.column;
      element.on('click', function () {
        // Retrieve position in selected list
        var idx = selected.indexOf(column.selectObject ? row : row[column.key]);
        // it is selected, deselect it:
        if (idx >= 0) {
          selected.splice(idx, 1);
        }  // it is not selected, push to list
        else {
          selected.push(column.selectObject ? row : row[column.key]);
        }
        scope.$apply();
      });
    }
  };
});
// Source: dist/directives/apMesaStatusDisplay.js
angular.module('apMesa.directives.apMesaStatusDisplay', []).directive('apMesaStatusDisplay', function () {
  return {
    replace: true,
    templateUrl: 'src/templates/apMesaStatusDisplay.tpl.html'
  };
});
// Source: dist/directives/apMesaThTitle.js
angular.module('apMesa.directives.apMesaThTitle', []).directive('apMesaThTitle', [
  '$compile',
  function ($compile) {
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
  }
]);
// Source: dist/filters/apMesaRowFilter.js
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
angular.module('apMesa.filters.apMesaRowFilter', ['apMesa.services.apMesaFilterFunctions']).filter('apMesaRowFilter', [
  'apMesaFilterFunctions',
  '$log',
  function (tableFilterFunctions, $log) {
    return function tableRowFilter(rows, columns, persistentState, transientState, options) {
      var enabledFilterColumns, result = rows;
      // gather enabled filter functions
      enabledFilterColumns = columns.filter(function (column) {
        // check search term
        var term = persistentState.searchTerms[column.id];
        if (typeof term === 'string') {
          // filter empty strings and whitespace
          if (!term.trim()) {
            return false;
          }
          // check search filter function
          if (typeof column.filter === 'function') {
            return true;
          }
          // not a function, check for predefined filter function
          var predefined = tableFilterFunctions[column.filter];
          if (typeof predefined === 'function') {
            column.filter = predefined;
            return true;
          }
          $log.warn('apMesa: The filter function "' + column.filter + '" ' + 'specified by column(id=' + column.id + ').filter ' + 'was not found in predefined tableFilterFunctions. ' + 'Available filters: "' + Object.keys(tableFilterFunctions).join('","') + '"');
        }
        return false;
      });
      // loop through rows and filter on every enabled function
      if (enabledFilterColumns.length) {
        result = rows.filter(function (row) {
          for (var i = enabledFilterColumns.length - 1; i >= 0; i--) {
            var col = enabledFilterColumns[i];
            var filter = col.filter;
            var term = persistentState.searchTerms[col.id];
            var value = options !== undefined && {}.hasOwnProperty.call(options, 'getter') ? options.getter(col.key, row) : row[col.key];
            var computedValue = typeof col.format === 'function' ? col.format(value, row, col, options) : value;
            if (!filter(term, value, computedValue, row, col, options)) {
              return false;
            }
          }
          return true;
        });
      }
      transientState.filterCount = result.length;
      return result;
    };
  }
]);
// Source: dist/filters/apMesaRowSorter.js
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
angular.module('apMesa.filters.apMesaRowSorter', []).filter('apMesaRowSorter', function () {
  return function tableRowSorter(rows, columns, sortOrder, options, transientState) {
    if (!sortOrder.length) {
      return rows;
    }
    var arrayCopy = [];
    for (var i = 0; i < rows.length; i++) {
      arrayCopy.push(rows[i]);
    }
    return arrayCopy.sort(function (a, b) {
      for (var i = 0; i < sortOrder.length; i++) {
        var sortItem = sortOrder[i];
        var column = transientState.columnLookup[sortItem.id];
        var dir = sortItem.dir;
        if (column && column.sort) {
          var fn = column.sort;
          var result = dir === '+' ? fn(a, b, options, column) : fn(b, a, options, column);
          if (result !== 0) {
            return result;
          }
        }
      }
      return 0;
    });
  };
});
// Source: dist/services/apMesaDebounce.js
/** _.debounce, modified to use $timeout instead of setTimeout */
angular.module('apMesa.services.apMesaDebounce', []).factory('apMesaDebounce', [
  '$timeout',
  function ($timeout) {
    /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */
    /** Used as the `TypeError` message for "Functions" methods. */
    var FUNC_ERROR_TEXT = 'Expected a function';
    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;
    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';
    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g;
    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;
    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;
    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;
    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();
    /** Used for built-in method references. */
    var objectProto = Object.prototype;
    /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
    var objectToString = objectProto.toString;
    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max, nativeMin = Math.min;
    /**
   * Gets the timestamp of the number of milliseconds that have elapsed since
   * the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Date
   * @returns {number} Returns the timestamp.
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => Logs the number of milliseconds it took for the deferred invocation.
   */
    var now = function () {
      return root.Date.now();
    };
    /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed `func` invocations and a `flush` method to immediately invoke them.
   * Provide `options` to indicate whether `func` should be invoked on the
   * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
   * with the last arguments provided to the debounced function. Subsequent
   * calls to the debounced function return the result of the last `func`
   * invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the debounced function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `$timeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=false]
   *  Specify invoking on the leading edge of the timeout.
   * @param {number} [options.maxWait]
   *  The maximum time `func` is allowed to be delayed before it's invoked.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // Avoid costly calculations while the window size is in flux.
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // Invoke `sendMail` when clicked, debouncing subsequent calls.
   * jQuery(element).on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
   * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', debounced);
   *
   * // Cancel the trailing debounced invocation.
   * jQuery(window).on('popstate', debounced.cancel);
   */
    function debounce(func, wait, options) {
      var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }
      function invokeFunc(time) {
        var args = lastArgs, thisArg = lastThis;
        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }
      function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = $timeout(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
      }
      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result = wait - timeSinceLastCall;
        return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
      }
      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        // Restart the timer.
        timerId = $timeout(timerExpired, remainingWait(time));
      }
      function trailingEdge(time) {
        timerId = undefined;
        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
      }
      function cancel() {
        if (timerId !== undefined) {
          $timeout.cancel(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
      }
      function flush() {
        return timerId === undefined ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === undefined) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            // Handle invocations in a tight loop.
            timerId = $timeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === undefined) {
          timerId = $timeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }
    /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == 'object' || type == 'function');
    }
    /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
    function isObjectLike(value) {
      return !!value && typeof value == 'object';
    }
    /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
    function isSymbol(value) {
      return typeof value == 'symbol' || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject(other) ? other + '' : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    return debounce;
  }
]);
// Source: dist/services/apMesaFilterFunctions.js
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
angular.module('apMesa.services.apMesaFilterFunctions', []).service('apMesaFilterFunctions', function () {
  function like(term, value) {
    term = term.toLowerCase().trim();
    value = String(value).toLowerCase();
    var first = term[0];
    // negate
    if (first === '!') {
      term = term.substr(1);
      if (term === '') {
        return true;
      }
      return value.indexOf(term) === -1;
    }
    // strict
    if (first === '=') {
      term = term.substr(1);
      return term === value.trim();
    }
    // remove escaping backslashes
    term = term.replace('\\!', '!');
    term = term.replace('\\=', '=');
    return value.indexOf(term) !== -1;
  }
  function likeFormatted(term, value, computedValue, row) {
    return like(term, computedValue, computedValue, row);
  }
  like.placeholder = likeFormatted.placeholder = 'string search';
  like.title = likeFormatted.title = 'Search by text, eg. "foo". Use "!" to exclude and "=" to match exact text, e.g. "!bar" or "=baz".';
  function number(term, value) {
    value = parseFloat(value);
    term = term.trim();
    var first_two = term.substr(0, 2);
    var first_char = term[0];
    var against_1 = term.substr(1) * 1;
    var against_2 = term.substr(2) * 1;
    if (first_two === '<=') {
      return value <= against_2;
    }
    if (first_two === '>=') {
      return value >= against_2;
    }
    if (first_char === '<') {
      return value < against_1;
    }
    if (first_char === '>') {
      return value > against_1;
    }
    if (first_char === '~') {
      return Math.round(value) === against_1;
    }
    if (first_char === '=') {
      return against_1 === value;
    }
    return value.toString().indexOf(term.toString()) > -1;
  }
  function numberFormatted(term, value, computedValue) {
    return number(term, computedValue);
  }
  number.placeholder = numberFormatted.placeholder = 'number search';
  number.title = numberFormatted.title = 'Search by number, e.g. "123". Optionally use comparator expressions like ">=10" or "<1000". Use "~" for approx. int values, eg. "~3" will match "3.2"';
  var unitmap = {};
  unitmap.second = unitmap.sec = unitmap.s = 1000;
  unitmap.minute = unitmap.min = unitmap.m = unitmap.second * 60;
  unitmap.hour = unitmap.hr = unitmap.h = unitmap.minute * 60;
  unitmap.day = unitmap.d = unitmap.hour * 24;
  unitmap.week = unitmap.wk = unitmap.w = unitmap.day * 7;
  unitmap.month = unitmap.week * 4;
  unitmap.year = unitmap.yr = unitmap.y = unitmap.day * 365;
  var clauseExp = /(\d+(?:\.\d+)?)\s*([a-z]+)/;
  function parseDateFilter(string) {
    // split on clauses (if any)
    var clauses = string.trim().split(',');
    var total = 0;
    // parse each clause
    for (var i = 0; i < clauses.length; i++) {
      var clause = clauses[i].trim();
      var terms = clauseExp.exec(clause);
      if (!terms) {
        continue;
      }
      var count = terms[1] * 1;
      var unit = terms[2].replace(/s$/, '');
      if (!unitmap.hasOwnProperty(unit)) {
        continue;
      }
      total += count * unitmap[unit];
    }
    return total;
  }
  function date(term, value) {
    // today
    // yesterday
    // 1 day ago
    // 2 days ago
    // < 1 day ago
    // < 10 minutes ago
    // < 10 min ago
    // < 10 minutes, 50 seconds ago
    // > 10 min, 30 sec ago
    // > 2 days ago
    // >= 1 day ago
    term = term.trim();
    if (!term) {
      return true;
    }
    value *= 1;
    var nowDate = new Date();
    var now = +nowDate;
    var first_char = term[0];
    var other_chars = term.substr(1).trim();
    var lowerbound, upperbound;
    if (first_char === '<') {
      lowerbound = now - parseDateFilter(other_chars);
      return value > lowerbound;
    }
    if (first_char === '>') {
      upperbound = now - parseDateFilter(other_chars);
      return value < upperbound;
    }
    if (term === 'today') {
      return new Date(value).toDateString() === nowDate.toDateString();
    }
    if (term === 'yesterday') {
      return new Date(value).toDateString() === new Date(now - unitmap.d).toDateString();
    }
    var supposedDate = new Date(term);
    if (!isNaN(supposedDate)) {
      return new Date(value).toDateString() === supposedDate.toDateString();
    }
    return false;
  }
  date.placeholder = 'date search';
  date.title = 'Search by date. Enter a date string (RFC2822 or ISO 8601 date). You can also type "today", "yesterday", "> 2 days ago", "< 1 day 2 hours ago", etc.';
  return {
    like: like,
    likeFormatted: likeFormatted,
    number: number,
    numberFormatted: numberFormatted,
    date: date
  };
});
// Source: dist/services/apMesaFormatFunctions.js
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
angular.module('apMesa.services.apMesaFormatFunctions', []).service('apMesaFormatFunctions', function () {
  // TODO: add some default format functions
  return {};
});
// Source: dist/services/apMesaSortFunctions.js
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
angular.module('apMesa.services.apMesaSortFunctions', []).service('apMesaSortFunctions', function () {
  return {
    number: function (field) {
      return function (row1, row2, options) {
        var val1, val2;
        if (options !== undefined && {}.hasOwnProperty.call(options, 'getter')) {
          val1 = options.getter(field, row1);
          val2 = options.getter(field, row2);
        } else {
          val1 = row1[field];
          val2 = row2[field];
        }
        return val1 * 1 - val2 * 1;
      };
    },
    string: function (field) {
      return function (row1, row2, options) {
        var val1, val2;
        if (options !== undefined && {}.hasOwnProperty.call(options, 'getter')) {
          val1 = options.getter(field, row1);
          val2 = options.getter(field, row2);
        } else {
          val1 = row1[field];
          val2 = row2[field];
        }
        return val1.toString().toLowerCase().localeCompare(val2.toString().toLowerCase());
      };
    },
    stringFormatted: function (field) {
      return function (row1, row2, options, column) {
        var val1, val2;
        if (options !== undefined && {}.hasOwnProperty.call(options, 'getter')) {
          val1 = options.getter(field, row1);
          val2 = options.getter(field, row2);
        } else {
          val1 = row1[field];
          val2 = row2[field];
        }
        val1 = column.format(val1, row1, column);
        val2 = column.format(val2, row2, column);
        return val1.toString().toLowerCase().localeCompare(val2.toString().toLowerCase());
      };
    },
    numberFormatted: function (field) {
      return function (row1, row2, options, column) {
        var val1, val2;
        if (options !== undefined && {}.hasOwnProperty.call(options, 'getter')) {
          val1 = options.getter(field, row1);
          val2 = options.getter(field, row2);
        } else {
          val1 = row1[field];
          val2 = row2[field];
        }
        val1 = column.format(val1, row1, column);
        val2 = column.format(val2, row2, column);
        return val1 * 1 - val2 * 1;
      };
    }
  };
});
// Source: dist/templates.js
angular.module('apMesa.templates', [
  'src/templates/apMesa.tpl.html',
  'src/templates/apMesaDummyRows.tpl.html',
  'src/templates/apMesaPaginationCtrls.tpl.html',
  'src/templates/apMesaRows.tpl.html',
  'src/templates/apMesaStatusDisplay.tpl.html'
]);
angular.module('src/templates/apMesa.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('src/templates/apMesa.tpl.html', '<div class="ap-mesa-wrapper" ng-class="{\n' + '\'paging-strategy-paginate\': options.pagingStrategy === \'PAGINATE\',\n' + '\'paging-strategy-scroll\': options.pagingStrategy === \'SCROLL\'\n' + '}">\n' + '  <table ng-class="classes" class="ap-mesa mesa-header-table">\n' + '    <thead>\n' + '      <tr ui-sortable="sortableOptions" ng-model="columns">\n' + '        <th\n' + '          scope="col"\n' + '          ng-repeat="column in columns"\n' + '          ng-click="toggleSort($event,column)"\n' + '          ng-class="{\'sortable-column\' : column.sort, \'select-column\': column.selector, \'is-sorting\': sortDirection[column.id] }"\n' + '          ng-attr-title="{{ column.title || \'\' }}"\n' + '          ng-style="{ width: column.width, \'min-width\': column.width, \'max-width\': column.width }"\n' + '        >\n' + '          <span class="column-text">\n' + '            <input ng-if="column.selector" type="checkbox" ng-checked="isSelectedAll()" ng-click="toggleSelectAll($event)" />\n' + '            <span\n' + '              ng-if="column.sort"\n' + '              title="This column is sortable. Click to toggle sort order. Hold shift while clicking multiple columns to stack sorting."\n' + '              class="sorting-icon {{ getSortClass( sortDirection[column.id] ) }}"\n' + '            ></span>\n' + '            <span ap-mesa-th-title></span>\n' + '          </span>\n' + '          <span\n' + '            ng-if="!column.lockWidth"\n' + '            ng-class="{\'discreet-width\': !!column.width, \'column-resizer\': true}"\n' + '            title="Click and drag to set discreet width. Click once to clear discreet width."\n' + '            ng-mousedown="startColumnResize($event, column)"\n' + '          >\n' + '            &nbsp;\n' + '          </span>\n' + '        </th>\n' + '      </tr>\n' + '      <tr ng-if="hasFilterFields()" class="ap-mesa-filter-row">\n' + '        <td ng-repeat="column in columns" ng-class="\'column-\' + column.id">\n' + '          <input\n' + '            type="text"\n' + '            ng-if="(column.filter)"\n' + '            ng-model="persistentState.searchTerms[column.id]"\n' + '            ng-attr-placeholder="{{ column.filterPlaceholder ? column.filterPlaceholder : (column.filter.placeholder || \'filter\') }}"\n' + '            ng-attr-title="{{ column.filter && column.filter.title }}"\n' + '            ng-class="{\'active\': persistentState.searchTerms[column.id] }"\n' + '          >\n' + '          <button\n' + '            ng-if="(column.filter)"\n' + '            ng-show="persistentState.searchTerms[column.id]"\n' + '            class="clear-search-btn"\n' + '            role="button"\n' + '            type="button"\n' + '            ng-click="clearAndFocusSearch(column.id)"\n' + '          >\n' + '            &times;\n' + '          </button>\n' + '\n' + '        </td>\n' + '      </tr>\n' + '    </thead>\n' + '  </table>\n' + '  <div ap-mesa-status-display></div>\n' + '  <div class="mesa-rows-table-wrapper" ng-style="tbodyNgStyle" ng-hide="transientState.loadingError">\n' + '    <table ng-class="classes" class="ap-mesa mesa-rows-table">\n' + '      <thead>\n' + '        <th\n' + '            scope="col"\n' + '            ng-repeat="column in columns"\n' + '            ng-style="{ width: column.width, \'min-width\': column.width, \'max-width\': column.width }"\n' + '          ></th>\n' + '        </tr>\n' + '      </thead>\n' + '      <tbody ng-if="options.pagingStrategy === \'SCROLL\'" ap-mesa-dummy-rows="[0,transientState.rowOffset]" columns="columns" cell-content="..."></tbody>\n' + '      <tbody ap-mesa-rows class="ap-mesa-rendered-rows"></tbody>\n' + '      <tbody ng-if="options.pagingStrategy === \'SCROLL\'" ap-mesa-dummy-rows="[transientState.rowOffset + visible_rows.length, transientState.filterCount]" columns="columns" cell-content="..."></tbody>\n' + '    </table>\n' + '  </div>\n' + '  <div class="ap-mesa-pagination" ng-if="options.pagingStrategy === \'PAGINATE\'" ap-mesa-pagination-ctrls></div>\n' + '</div>\n' + '');
  }
]);
angular.module('src/templates/apMesaDummyRows.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('src/templates/apMesaDummyRows.tpl.html', '');
  }
]);
angular.module('src/templates/apMesaPaginationCtrls.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('src/templates/apMesaPaginationCtrls.tpl.html', '<ul class="pagination" ng-if="lastPage > 0">\n' + '  <li ng-class="{ \'disabled\': transientState.pageOffset === 0 }">\n' + '    <a ng-click="goBack()" >&laquo;</a>\n' + '  </li>\n' + '  <li ng-repeat="link in pageLinks" ng-class="{ \'active\': link.current, \'disabled\': link.gap }">\n' + '    <a ng-if="!link.gap" ng-click="transientState.pageOffset = link.page">{{ link.page + 1 }}</a>\n' + '    <a ng-if="link.gap" href="">&hellip;</a>\n' + '  </li>\n' + '  <li ng-class="{ \'disabled\': transientState.pageOffset === lastPage }">\n' + '    <a ng-click="goForward()" >&raquo;</a>\n' + '  </li>\n' + '</ul>\n' + '<span class="rows-per-page-ctrl">\n' + '  <span class="rows-per-page-msg">{{ options.rowsPerPageMessage }}</span>\n' + '  <ul class="pagination" ng-if="options.showRowsPerPageCtrls">\n' + '    <li ng-repeat="limit in options.rowsPerPageChoices" ng-class="{\'active\': options.rowsPerPage === limit}">\n' + '      <a ng-click="options.rowsPerPage = limit">{{ limit }}</a>\n' + '    </li>\n' + '  </ul>\n' + '</span>\n' + '');
  }
]);
angular.module('src/templates/apMesaRows.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('src/templates/apMesaRows.tpl.html', '<tr ng-repeat-start="row in visible_rows" ng-attr-class="{{ (transientState.rowOffset + $index) % 2 ? \'odd\' : \'even\' }}" ap-mesa-row></tr>\n' + '<tr ng-repeat-end ng-if="rowIsExpanded" class="ap-mesa-expand-panel">\n' + '  <td ap-mesa-expandable ng-attr-colspan="{{ columns.length }}"></td>\n' + '</tr>\n' + '');
  }
]);
angular.module('src/templates/apMesaStatusDisplay.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('src/templates/apMesaStatusDisplay.tpl.html', '<div class="ap-mesa-status-display-wrapper" ng-class="{\n' + '  loading: transientState.loading,\n' + '  error: transientState.loadingError,\n' + '  \'has-rows\': visible_rows.length && !transientState.loadingError\n' + '}">\n' + '\n' + '  <!-- LOADING -->\n' + '  <div ng-if="transientState.loading" class="ap-mesa-loading-display">\n' + '    \n' + '    <!-- user-provided -->\n' + '    <div ng-if="options.loadingTemplateUrl" ng-include="options.loadingTemplateUrl"></div>\n' + '    <div ng-if="options.loadingText">{{ options.loadingText }}</div>\n' + '    \n' + '    <!-- default -->\n' + '    <div ng-if="!options.asyncLoadingTemplateUrl && !options.asyncLoadingTemplate" class="ap-mesa-status-display">\n' + '      <div class="ap-mesa-status-display-inner"></div>\n' + '    </div>\n' + '\n' + '  </div>\n' + '  \n' + '  <!-- ERROR -->\n' + '  <div ng-if="transientState.loadingError" class="ap-mesa-error-display">\n' + '    <div ng-if="options.loadingErrorTemplateUrl" ng-include="options.loadingErrorTemplateUrl"></div>\n' + '    <div ng-if="options.loadingErrorText">{{ options.loadingErrorText }}</div>\n' + '    <div ng-if="!options.loadingErrorTemplateUrl && !options.loadingErrorText" class="ap-mesa-error-display-inner">An error occurred.</div>\n' + '  </div>\n' + '\n' + '  <!-- NO DATA -->\n' + '  <div ng-if="!transientState.loading && !transientState.loadingError && visible_rows.length === 0" class="ap-mesa-no-data-display">\n' + '    <div ng-if="options.noRowsTemplateUrl" ng-include="options.noRowsTemplateUrl"></div>\n' + '    <div ng-if="!options.noRowsTemplateUrl">{{ options.noRowsText }}</div>\n' + '  </div>\n' + '</div>');
  }
]);