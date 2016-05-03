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

angular.module('apMesa.directives.apMesa', [
  'apMesa.controllers.ApMesaController',
  'apMesa.directives.apMesaRows',
  'apMesa.directives.apMesaDummyRows'
])

.directive('apMesa', ['$log', '$timeout', '$q', function ($log, $timeout, $q) {

  function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = Date.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = $timeout(later, wait - last);
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
        timeout = $timeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  }

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

  function link(scope, element) {

    // Prevent following user input objects from being modified by making deep copies of originals
    scope.columns = angular.copy(scope._columns);

    // Look for built-in filter, sort, and format functions
    if (scope.columns instanceof Array) {
      scope.setColumns(scope.columns);
    } else {
      throw new Error('"columns" array not found in apMesa scope!');
    }

    if (scope.options !== undefined && {}.hasOwnProperty.call(scope.options, 'getter')) {
      if (typeof scope.options.getter !== 'function') {
        throw new Error('"getter" in "options" should be a function!');
      }
    }

    // Check for rows
    // if ( !(scope.rows instanceof Array) ) {
    //   throw new Error('"rows" array not found in apMesa scope!');
    // }

    // Object that holds search terms
    scope.searchTerms = {};

    // Array and Object for sort order+direction
    scope.sortOrder = [];
    scope.sortDirection = {};

    // Holds filtered rows count
    scope.filterState = {
      filterCount: scope.rows ? scope.rows.length : 0
    };

    // Offset and limit
    scope.rowOffset = 0;
    scope.rowLimit = 10;

    // Default Options, extend provided ones
    scope.options = scope.options || {};
    defaults(scope.options, {
      bgSizeMultiplier: 1,
      rowPadding: 10,
      bodyHeight: 300,
      fixedHeight: false,
      defaultRowHeight: 40,
      scrollDebounce: 100,
      scrollDivisor: 1,
      loadingText: 'loading',
      loadingError: false,
      noRowsText: 'no rows',
      trackBy: scope.trackBy,
      sortClasses: [
        'glyphicon glyphicon-sort',
        'glyphicon glyphicon-chevron-up',
        'glyphicon glyphicon-chevron-down'
      ],
      onRegisterApi: function(api) {
        // noop - user overrides and gets a hold of api object
      }
    });

    // Look for initial sort order
    if (scope.options.initialSorts) {
      angular.forEach(scope.options.initialSorts, function(sort) {
        scope.addSort(sort.id, sort.dir);
      });
    }

    // Check for localStorage persistence
    if (scope.options.storage && scope.options.storageKey) {
      // Set the storage object on the scope
      scope.storage = scope.options.storage;
      scope.storageKey = scope.options.storageKey;

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
      //  - when column gets enabled or disabled
      //  TODO
    }

    if (scope.options.fillHeight) {
      // calculate available space
      scope.$on('apMesa:resize', function() {
        scope.options.bodyHeight = element.parent().height() - element.find('.mesa-header-table').outerHeight(true);
      });
      scope.$emit('apMesa:resize');
    }

    //  - row limit
    scope.$watch('options.bodyHeight', function() {
      scope.calculateRowLimit();
      scope.tbodyNgStyle = {};
      scope.tbodyNgStyle[ scope.options.fixedHeight ? 'height' : 'max-height' ] = scope.options.bodyHeight + 'px';
      scope.saveToStorage();
    });
    scope.$watch('filterState.filterCount', function() {
      scope.onScroll();
    });
    scope.$watch('rowHeight', function(size) {
      element.find('tr.ap-mesa-dummy-row').css('background-size','auto ' + size * scope.options.bgSizeMultiplier + 'px');
    });
    scope.$watch('options.loadingPromise', function(promise) {
      if (angular.isObject(promise) && typeof promise.then === 'function') {
        scope.api.setLoading(true);
        promise.then(function () {
          scope.options.loadingError = false;
          scope.api.setLoading(false);
        }, function (reason) {
          scope.options.loadingError = true;
          scope.api.setLoading(false);
          $log.warn('Failed loading table data: ' + reason);
        });
      }
    });

    var scrollDeferred;
    var debouncedScrollHandler = debounce(function() {

      scope.calculateRowLimit();

      var scrollTop = scope.scrollDiv[0].scrollTop;

      var rowHeight = scope.rowHeight;

      if (rowHeight === 0) {
        return false;
      }

      scope.rowOffset = Math.max(0, Math.floor(scrollTop / rowHeight) - scope.options.rowPadding);

      scrollDeferred.resolve();

      scrollDeferred = null;

      scope.options.scrollingPromise = null;

      scope.$digest();

    }, scope.options.scrollDebounce);

    scope.onScroll = function() {
      if (!scrollDeferred) {
        scrollDeferred = $q.defer();
        scope.options.scrollingPromise = scrollDeferred.promise;
      }
      debouncedScrollHandler();
    };

    scope.scrollDiv = element.find('.mesa-rows-table-wrapper');
    scope.scrollDiv.on('scroll', scope.onScroll);

    // Wait for a render
    $timeout(function() {
      // Calculates rowHeight and rowLimit
      scope.calculateRowLimit();

    }, 0);


    scope.api = {
      isSelectedAll: scope.isSelectedAll,
      selectAll: scope.selectAll,
      deselectAll: scope.deselectAll,
      toggleSelectAll: scope.toggleSelectAll,
      setLoading: function(isLoading, triggerDigest) {
        scope.options.loading = isLoading;
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
    compile: function(tElement) {
      var trackBy = tElement.attr('track-by');
      if (trackBy) {
        tElement.find('.ap-mesa-rendered-rows').attr('track-by', trackBy);
      }
      return link;
    }
  };
}]);
