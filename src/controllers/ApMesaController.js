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

angular.module('apMesa.controllers.ApMesaController', [
  'apMesa.services.apMesaSortFunctions',
  'apMesa.services.apMesaFilterFunctions',
  'apMesa.services.apMesaFormatFunctions'
])

.controller('ApMesaController',
  ['$scope','$element','apMesaFormatFunctions','apMesaSortFunctions','apMesaFilterFunctions','$log', '$window', '$filter', '$timeout', '$q', function($scope, $element, formats, sorts, filters, $log, $window, $filter, $timeout, $q) {
  var CONSTANTS = {
    minWidth: 40
  };
  // SCOPE FUNCTIONS
  $scope.getSelectableRows = function() {
    var tableRowFilter = $filter('apMesaRowFilter');
    return angular.isArray($scope.rows) ? tableRowFilter($scope.rows, $scope.columns, $scope.persistentState, $scope.transientState) : [];
  };

  $scope.isSelectedAll = function() {
    if (!angular.isArray($scope.rows) || ! angular.isArray($scope.selected)) {
      return false;
    }
    var rows = $scope.getSelectableRows();
    return (rows.length > 0 && rows.length === $scope.selected.length );
  };

  $scope.selectAll = function() {
    $scope.deselectAll();
    // Get a list of filtered rows
    var rows = $scope.getSelectableRows();
    if (rows.length <= 0) return;
    var columns = $scope.columns;
    var selectorKey = null;
    var selectObject = null;
    // Search for selector key in selector column
    for (var i=0; i< columns.length; i++) {
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
    for ( var i = 0; i < rows.length; i++) {
      $scope.selected.push(selectObject ? rows[i] : rows[i][selectorKey]);
    }
  };

  $scope.deselectAll = function() {
    while($scope.selected.length > 0) {
      $scope.selected.pop();
    }
  };

  $scope.toggleSelectAll = function($event) {
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

  $scope.addSort = function(id, dir) {
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
  $scope.removeSort = function(id) {
    var idx = findSortItemIndex(id);
    if (idx !== -1) {
      $scope.persistentState.sortOrder.splice(idx, 1);
    }
  };
  $scope.clearSort = function() {
    $scope.persistentState.sortOrder = [];
  };
  // Checks if columns have any filter fileds
  $scope.hasFilterFields = function() {
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
  $scope.clearAndFocusSearch = function(columnId) {
    $scope.persistentState.searchTerms[columnId] = '';
    $element.find('tr.ap-mesa-filter-row th.column-' + columnId + ' input').focus();
  };
  // Toggles column sorting
  $scope.toggleSort = function($event, column) {

    // check if even sortable
    if (!column.sort) {
      return;
    }

    // check for existing sort on this column
    var sortItem = findSortItem(column.id);

    if ( $event.shiftKey ) {
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
      }
      else {
        $scope.addSort(column.id, '+');
      }

    }

    $scope.saveToStorage();
  };
  // Retrieve className for given sorting state
  $scope.getSortClass = function(sorting) {
    var classes = $scope.options.sortClasses;
    if (sorting === '+') {
      return classes[1];
    }
    if (sorting === '-') {
      return classes[2];
    }
    return classes[0];
  };
  $scope.setColumns = function(columns) {
    try {
      $scope.columns = columns;
      var lookup = $scope.transientState.columnLookup = {};
      $scope.columns.forEach(function(column) {
        // formats
        var format = column.format;
        if (typeof format !== 'function') {
          if (typeof format === 'string') {
            if (typeof formats[format] === 'function') {
              column.format = formats[format];
            }
            else {

              try {
                column.format = $filter(format);
              } catch (e) {
                delete column.format;
                $log.warn('format function reference in column(id=' + column.id + ') ' +
                      'was not found in built-in format functions or $filters. ' +
                      'format function given: "' + format + '". ' +
                      'Available built-ins: ' + Object.keys(formats).join(',') + '. ' +
                      'If you supplied a $filter, ensure it is available on this module');
              }

            }
          } else {
            delete column.format;
          }
        }

        // async get
        if (!$scope.options.getData) {
          // sort
          var sort = column.sort;
          if (typeof sort !== 'function') {
            if (typeof sort === 'string') {
              if (typeof sorts[sort] === 'function') {
                column.sort = sorts[sort](column.key);
              }
              else {
                delete column.sort;
                $log.warn('sort function reference in column(id=' + column.id + ') ' +
                      'was not found in built-in sort functions. ' +
                      'sort function given: "' + sort + '". ' +
                      'Available built-ins: ' + Object.keys(sorts).join(',') + '. ');
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
              }
              else {
                delete column.filter;
                $log.warn('filter function reference in column(id=' + column.id + ') ' +
                      'was not found in built-in filter functions. ' +
                      'filter function given: "' + filter + '". ' +
                      'Available built-ins: ' + Object.keys(filters).join(',') + '. ');
              }
            } else {
              delete column.filter;
            }
          }
        }

        // populate lookup
        lookup[column.id] = column;

      });

      // check enabledColumns for validity
      if (angular.isArray($scope.enabledColumns)) {
        // if any of the ids in enabledColumns do not map to a column in the new column set...
        if ($scope.enabledColumns.some(function(columnId) {
          return !lookup[columnId];
        })) {
          // ...unset the enabled columns
          $scope.enabledColumns = undefined;
        }
      } else {
        $scope.enabledColumns = $scope.columns.map(function(column) {
          return column.id;
        });
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  $scope.startColumnResize = function($event, column) {

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
    $($window).one('mouseup', function(e) {
      e.stopPropagation();
      // remove marquee, remove window mousemove listener
      $m.remove();
      $($window).off('mousemove', mousemove);

      // set new width on th
      // if a new width was set
      if (new_width === false) {
        column.width = Math.max(initial_width, 0);
      } else {
        column.width = Math.max(new_width, CONSTANTS.minWidth);
      }

      $scope.$apply();
    });
  };
  $scope.sortableOptions = {
    axis: 'x',
    handle: '.column-text',
    helper: 'clone',
    placeholder: 'ap-mesa-column-placeholder',
    distance: 5,
    update: function() {
      // use of $timeout req'd for this because the update event comes before
      // the model is updated!
      $timeout(function() {
        $scope.enabledColumns = $scope.enabledColumnObjects.map(function(column) { return column.id; });
      });
    }
  };

  $scope.getActiveColCount = function() {
    var count = 0;
    $scope.columns.forEach(function(col) {
      if (!col.disabled) {
        count++;
      }
    });
    return count;
  };

  $scope.saveToStorage = function() {
    if (!$scope.storage) {
      return;
    }
    // init object to stringify/save
    var state = {};

    // save state objects
    ['sortOrder', 'searchTerms'].forEach(function(prop) {
      state[prop] = $scope.persistentState[prop];
    });

    // save enabled columns (can't be in persistent state because it is a directive @Input)
    state.enabledColumns = $scope.enabledColumns;

    // save non-transient options
    state.options = {};
    ['rowLimit', 'pagingScheme', 'storageHash'].forEach(function(prop){
      state.options[prop] = $scope.options[prop];
    });

    // Save to storage
    var valueToStore = $scope.options.stringifyStorage ? JSON.stringify(state) : state;
    $scope.storage.setItem($scope.storageKey, valueToStore);
  };

  $scope.loadFromStorage = function() {

    var options = $scope.options;

    if (!$scope.storage) {
      return;
    }

    // Attempt to parse the storage
    var stateValue = $scope.storage.getItem($scope.storageKey);

    $q.when(stateValue).then(function(stateStringOrObject) {

      if (!stateStringOrObject) {
        console.warn('angularjs-table: loading from storage failed because storage.getItem did not return anything.');
        return;
      }

      try {

        var state;
        if (options.stringifyStorage) {
          if (typeof stateStringOrObject !== 'string') {
            throw new TypeError('storage.getItem is expected to return a string if options.stringifyStorage is true.');
          }
          state = JSON.parse(stateStringOrObject);
        } else if (angular.isObject(stateStringOrObject)) {
          state = stateStringOrObject;
        } else {
          throw new TypeError('storage.getItem is expected to return an object if options.stringifyStorage is false.');
        }

        // if mimatched storage hash, stop loading from storage
        if (state.options.storageHash !== $scope.options.storageHash) {
          return;
        }

        // load state objects
        ['sortOrder', 'searchTerms'].forEach(function(prop){
          $scope.persistentState[prop] = state[prop];
        });

        // load enabled columns list
        $scope.enabledColumns = state.enabledColumns;

        // load options
        ['rowLimit', 'pagingScheme', 'storageHash'].forEach(function(prop) {
          $scope.options[prop] = state.options[prop];
        });

      } catch (e) {
        console.warn('angularjs-table: failed to load state from storage. ', e);
      }
    }, function(e) {
      console.warn('angularjs-table: storage.getItem failed: ', e);
    });
  };

}]);
