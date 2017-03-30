(function() {
  'use strict';

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
    rowsPerPage: 10, // for when pagingStrategy === 'PAGINATE'
    rowsPerPageChoices: [10, 25, 50, 100],
    rowsPerPageMessage: 'rows per page',
    showRowsPerPageCtrls: true,
    maxPageLinks: 8,
    sortClasses: [
      'glyphicon glyphicon-sort',
      'glyphicon glyphicon-chevron-up',
      'glyphicon glyphicon-chevron-down'
    ],
    onRegisterApi: function(api) {
      // noop - user overrides to get a hold of api object
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
  ])
  .provider('apMesa', function ApMesaService() {
    this.setDefaultOptions = function(overrides) {
      defaultOptions = defaults(overrides, defaultOptions);
    }
    this.$get = [function(){
      return {
        getDefaultOptions: function() {
          return defaultOptions;
        },
        setDefaultOptions: function(overrides) {
          defaultOptions = defaults(overrides, defaultOptions);
        }
      }
    }];
  })
  .directive('apMesa', ['$log', '$timeout', '$q', 'apMesa', 'apMesaDebounce', function ($log, $timeout, $q, apMesa, debounce) {

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
        scope.columns.forEach(function(column) {
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
        angular.forEach(scope.options.initialSorts, function(sort) {
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
      scope.$watch('_columns', function(columns, oldColumns) {
        if (columns !== scope.columns) {
          resetColumns(scope);
          initSorts(scope);
        }
      });

      scope.$watch('options', function(newOptions, oldOptions) {
        resetState(scope);
        initOptions(scope);
      });

      scope.$watch('options.storage', function(storage) {
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
          deregStorageWatchers.forEach(function(d) { d(); });
          deregStorageWatchers = [];
        }
      });

      var fillHeightWatcher;
      scope.$watch('options.fillHeight', function(fillHeight) {
        if (scope.options.pagingStrategy !== 'SCROLL') {
          return;
        }
        if (fillHeight) {
          // calculate available space
          fillHeightWatcher = scope.$on('apMesa:resize', function() {
            scope.options.bodyHeight = element.parent().height() - element.find('.mesa-header-table').outerHeight(true);
          });
          scope.$emit('apMesa:resize');
        } else if (fillHeightWatcher) {
          fillHeightWatcher();
        }
      });

      //  - row limit
      scope.$watch('options.bodyHeight', function() {
        if (scope.options.pagingStrategy !== 'SCROLL') {
          return;
        }
        scope.calculateRowLimit();
        scope.tbodyNgStyle = {};
        scope.tbodyNgStyle[ scope.options.fixedHeight ? 'height' : 'max-height' ] = scope.options.bodyHeight + 'px';
        scope.saveToStorage();
      });
      scope.$watch('transientState.filterCount', function() {
        if (scope.options && scope.options.pagingStrategy === 'SCROLL') {
          scope.onScroll();
        }
      });
      scope.$watch('rowHeight', function(size) {
        element.find('tr.ap-mesa-dummy-row').css('background-size','auto ' + size * scope.options.bgSizeMultiplier + 'px');
      });
      scope.$watch('options.loadingPromise', function(promise) {
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
      scope.$watch('options.rowsPerPage', function(count, oldCount) {
        scope.calculateRowLimit();
        if (count !== oldCount) {
          var lastPageOffset = Math.floor(scope.transientState.filterCount / scope.options.rowsPerPage);
          scope.transientState.pageOffset = Math.min(lastPageOffset, scope.transientState.pageOffset);
        }
      });
      scope.$watch('options.pagingStrategy', function(strategy) {
        if (strategy === 'SCROLL') {
          scope.scrollDiv.off('scroll');
          scope.scrollDiv.on('scroll', scope.onScroll);
        } else if (strategy === 'PAGINATE') {

        }
      });
      scope.$watch('persistentState.sortOrder', function(sortOrder) {
        if (sortOrder) {
          scope.sortDirection = {};
          sortOrder.forEach(function(sortItem) {
            scope.sortDirection[sortItem.id] = sortItem.dir;
          });
        }
      }, true);

      var scrollDeferred;
      var debouncedScrollHandler = debounce(function() {

        scope.calculateRowLimit();

        var scrollTop = scope.scrollDiv[0].scrollTop - scope.options.rowPadding;

        var rowHeight = scope.rowHeight;

        if (rowHeight === 0) {
          return false;
        }

        var rowOffset = 0;
        var runningTotalScroll = 0;
        var expandedOffsets = Object.keys(scope.transientState.expandedRows)
          .map(function(i) { return parseInt(i); })
          .sort();

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
            rowOffset += Math.floor((scrollTop - runningTotalScroll)/rowHeight);
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

      scope.onScroll = function() {
        if (!scrollDeferred) {
          scrollDeferred = $q.defer();
          scope.options.scrollingPromise = scrollDeferred.promise;
        }
        debouncedScrollHandler();
      };

      scope.calculateRowLimit = function() {
        var rowHeight = scope.scrollDiv.find('.ap-mesa-rendered-rows tr').height();
        scope.rowHeight = rowHeight || scope.options.defaultRowHeight || 20;
        if (!scope.transientState.rowHeightIsCalculated && rowHeight) {
          scope.transientState.rowHeightIsCalculated = true;
        }
        if (scope.options.pagingStrategy === 'SCROLL') {
          scope.persistentState.rowLimit = Math.ceil((scope.options.bodyHeight + scope.options.rowPadding*2) / scope.rowHeight);
        } else if (scope.options.pagingStrategy === 'PAGINATE') {
          scope.persistentState.rowLimit = scope.options.rowsPerPage;
        }
      };

      scope.resetOffset = function() {
        if (scope.options.pagingStrategy === 'SCROLL') {
          scope.scrollDiv[0].scrollTop = 0;
          scope.transientState.rowOffset = 0;
        } else if (scope.options.pagingStrategy === 'PAGINATE') {
          scope.transientState.pageOffset = 0;
          scope.transientState.rowOffset = 0;
        }
      }

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
      compile: function(tElement) {
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
  }]);

})();
