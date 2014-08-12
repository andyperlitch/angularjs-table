'use strict';
angular.module('datatorrent.mlhrTable', [
  'datatorrent.mlhrTable.templates',
  'ui.sortable',
  'ngSanitize',
  'monospaced.mousewheel'
]).service('tableFilterFunctions', function () {
  function like(term, value) {
    term = term.toLowerCase().trim();
    value = value.toLowerCase();
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
}).service('tableFormatFunctions', function () {
  // TODO: add some default format functions
  return {};
}).service('tableSortFunctions', function () {
  return {
    number: function (field) {
      return function (row1, row2) {
        return row1[field] - row2[field];
      };
    },
    string: function (field) {
      return function (row1, row2) {
        if (row1[field].toString().toLowerCase() === row2[field].toString().toLowerCase()) {
          return 0;
        }
        return row1[field].toString().toLowerCase() > row2[field].toString().toLowerCase() ? 1 : -1;
      };
    }
  };
}).filter('tableRowFilter', [
  'tableFilterFunctions',
  '$log',
  function (tableFilterFunctions, $log) {
    return function tableRowFilter(rows, columns, searchTerms, filterState) {
      var enabledFilterColumns, result = rows;
      // gather enabled filter functions
      enabledFilterColumns = columns.filter(function (column) {
        // check search term
        var term = searchTerms[column.id];
        if (searchTerms.hasOwnProperty(column.id) && typeof term === 'string') {
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
          $log.warn('mlhrTable: The filter function "' + column.filter + '" ' + 'specified by column(id=' + column.id + ').filter ' + 'was not found in predefined tableFilterFunctions. ' + 'Available filters: "' + Object.keys(tableFilterFunctions).join('","') + '"');
        }
        return false;
      });
      // loop through rows and filter on every enabled function
      if (enabledFilterColumns.length) {
        result = rows.filter(function (row) {
          for (var i = enabledFilterColumns.length - 1; i >= 0; i--) {
            var col = enabledFilterColumns[i];
            var filter = col.filter;
            var term = searchTerms[col.id];
            var value = row[col.key];
            var computedValue = typeof col.format === 'function' ? col.format(value, row) : value;
            if (!filter(term, value, computedValue, row)) {
              return false;
            }
          }
          return true;
        });
      }
      filterState.filterCount = result.length;
      return result;
    };
  }
]).filter('tableCellFilter', function () {
  return function tableCellFilter(row, column) {
    // check if property is available on the row    
    var hasProp = row.hasOwnProperty(column.key);
    if (!hasProp) {
      return column.defaultValue || '';
    }
    // cache raw data value
    var value = row[column.key];
    // check for format
    var format = column.format;
    if (typeof format === 'function') {
      return format(value, row, column);
    }
    return value;
  };
}).filter('tableRowSorter', function () {
  var column_cache = {};
  function getColumn(columns, id) {
    if (column_cache.hasOwnProperty(id)) {
      return column_cache[id];
    }
    for (var i = columns.length - 1; i >= 0; i--) {
      if (columns[i].id === id) {
        column_cache[id] = columns[i];
        return columns[i];
      }
    }
  }
  return function tableRowSorter(rows, columns, sortOrder, sortDirection) {
    if (!sortOrder.length) {
      return rows;
    }
    var arrayCopy = [];
    for (var i = 0; i < rows.length; i++) {
      arrayCopy.push(rows[i]);
    }
    return arrayCopy.sort(function (a, b) {
      for (var i = 0; i < sortOrder.length; i++) {
        var id = sortOrder[i];
        var column = getColumn(columns, id);
        var dir = sortDirection[id];
        if (column && column.sort) {
          var fn = column.sort;
          var result = dir === '+' ? fn(a, b) : fn(b, a);
          if (result !== 0) {
            return result;
          }
        }
      }
      return 0;
    });
  };
}).controller('TableController', [
  '$scope',
  'tableFormatFunctions',
  'tableSortFunctions',
  'tableFilterFunctions',
  '$log',
  '$window',
  '$filter',
  function ($scope, formats, sorts, filters, $log, $window, $filter) {
    // SCOPE FUNCTIONS
    $scope.addSort = function (id, dir) {
      var idx = $scope.sortOrder.indexOf(id);
      if (idx === -1) {
        $scope.sortOrder.push(id);
      }
      $scope.sortDirection[id] = dir;
    };
    $scope.removeSort = function (id) {
      var idx = $scope.sortOrder.indexOf(id);
      if (idx !== -1) {
        $scope.sortOrder.splice(idx, 1);
      }
      delete $scope.sortDirection[id];
    };
    $scope.clearSort = function () {
      $scope.sortOrder = [];
      $scope.sortDirection = {};
    };
    // Checks if columns have any filter fileds
    $scope.hasFilterFields = function () {
      for (var i = $scope.columns.length - 1; i >= 0; i--) {
        if (typeof $scope.columns[i].filter !== 'undefined') {
          return true;
        }
      }
      return false;
    };
    // Toggles column sorting
    $scope.toggleSort = function ($event, column) {
      // check if even sortable
      if (!column.sort) {
        return;
      }
      if ($event.shiftKey) {
        // shift is down, ignore other columns
        // but toggle between three states
        switch ($scope.sortDirection[column.id]) {
        case '+':
          // Make descending
          $scope.sortDirection[column.id] = '-';
          break;
        case '-':
          // Remove from sortOrder and direction
          $scope.removeSort(column.id);
          break;
        default:
          // Make ascending
          $scope.addSort(column.id, '+');
          break;
        }
      } else {
        // shift is not down, disable other
        // columns but toggle two states
        var lastState = $scope.sortDirection[column.id];
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
      var classes = $scope.options.sort_classes;
      if (sorting === '+') {
        return classes[1];
      }
      if (sorting === '-') {
        return classes[2];
      }
      return classes[0];
    };
    $scope.setColumns = function (columns) {
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
      });
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
      placeholder: 'mlhr-table-column-placeholder'
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
    $scope.onScroll = function ($event, $delta, $deltaX, $deltaY) {
      if ($scope.options.pagingScheme !== 'scroll') {
        return;
      }
      if ($scope.options.row_limit >= $scope.filterState.filterCount) {
        return;
      }
      var curOffset, newOffset;
      curOffset = newOffset = $scope.options.rowOffset;
      newOffset -= $deltaY / $scope.options.scrollDivisor;
      newOffset = Math.max(newOffset, 0);
      newOffset = Math.min($scope.filterState.filterCount - $scope.options.row_limit, newOffset);
      if (newOffset !== curOffset) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.options.rowOffset = newOffset;
        $scope.updateScrollerPosition();
      }
    };
    $scope.updateScrollerPosition = function () {
      var height = $scope.tbody.height();
      var offset = $scope.options.rowOffset;
      var limit = $scope.options.row_limit;
      var numFilteredRows = $scope.filterState.filterCount;
      var heightRatio = height / numFilteredRows;
      var newTop = heightRatio * offset;
      var newHeight = heightRatio * limit;
      if (newHeight >= height || numFilteredRows <= limit) {
        $scope.scroller.css({
          display: 'none',
          top: '0px'
        });
        $scope.scrollerWrapper.css({ display: 'none' });
        return;
      }
      // If the calculated height of the scroll bar turns
      // out to be less than the min-height css property...
      var extraScrollPixels = $scope._scrollerMinHeight_ - newHeight;
      if (extraScrollPixels > 0) {
        // Do not include the extra pixels in the height calculation, and
        // recalculate the ratio and top values
        heightRatio = (height - extraScrollPixels) / numFilteredRows;
        newTop = heightRatio * offset;
      }
      // Update the scroller position and height,
      // also ensure that it shows up
      $scope.scroller.css({
        display: 'block',
        top: newTop,
        height: newHeight + 'px'
      });
      // Update the height of the scroller-container
      $scope.scrollerWrapper.css({
        display: 'block',
        height: height + 'px'
      });
    };
    // Inverse of updateScrollerPosition, meaning it looks at a
    // top value of the scroller (can be passed as arg), then 
    // updates the offset according to this value
    $scope.updateOffsetByScroller = function (top) {
      // When no top is supplied, look at the css value
      if (typeof top !== 'number') {
        top = parseInt($scope.scroller.css('top'));
      }
      var height = $scope.tbody.height();
      var numFilteredRows = $scope.filterState.filterCount;
      var limit = $scope.options.row_limit;
      var scrollerHeight = limit / numFilteredRows * height;
      var extraScrollPixels = $scope._scrollerMinHeight_ - scrollerHeight;
      if (extraScrollPixels > 0) {
        height -= extraScrollPixels;
      }
      // calculate corresponding offset
      var newOffset = Math.round(top / height * numFilteredRows);
      $scope.options.rowOffset = newOffset;
      $scope.$digest();
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
        'sortDirection',
        'searchTerms'
      ].forEach(function (prop) {
        state[prop] = $scope[prop];
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
        'row_limit',
        'pagingScheme'
      ].forEach(function (prop) {
        state.options[prop] = $scope.options[prop];
      });
      // Save to storage
      $scope.storage.setItem($scope.storage_key, JSON.stringify(state));
    };
    $scope.loadFromStorage = function () {
      if (!$scope.storage) {
        return;
      }
      // Attempt to parse the storage
      var stateString = $scope.storage.getItem($scope.storage_key);
      // Was it there?
      if (!stateString) {
        return;
      }
      // Try to parse it
      var state;
      try {
        state = JSON.parse(stateString);
        // load state objects
        [
          'sortOrder',
          'sortDirection',
          'searchTerms'
        ].forEach(function (prop) {
          $scope[prop] = state[prop];
        });
        // validate (compare ids)
        // reorder columns and merge
        var column_ids = state.columns.map(function (col) {
            return col.id;
          });
        $scope.columns.sort(function (a, b) {
          return column_ids.indexOf(a.id) - column_ids.indexOf(b.id);
        });
        $scope.columns.forEach(function (col, i) {
          ['disabled'].forEach(function (prop) {
            col[prop] = state.columns[i][prop];
          });
        });
        // load options
        [
          'row_limit',
          'pagingScheme'
        ].forEach(function (prop) {
          $scope.options[prop] = state.options[prop];
        });
      } catch (e) {
        $log.warn('Loading from storage failed!');
      }
    };
  }
]).directive('mlhrTableDynamic', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      dynamic: '=mlhrTableDynamic',
      row: '=',
      column: '=',
      selected: '='
    },
    link: function postLink(scope, element) {
      scope.$watch('dynamic', function (html) {
        element.html(html);
        $compile(element.contents())(scope);
      });
    }
  };
}).directive('mlhrTableSelector', function () {
  return {
    restrict: 'A',
    scope: false,
    link: function postLink(scope, element) {
      var selected = scope.selected;
      var row = scope.row;
      var column = scope.column;
      element.on('click', function () {
        // Retrieve position in selected list
        var idx = selected.indexOf(row[column.key]);
        // it is selected, deselect it:
        if (idx >= 0) {
          selected.splice(idx, 1);
        }  // it is not selected, push to list
        else {
          selected.push(row[column.key]);
        }
        scope.$apply();
      });
    }
  };
}).directive('mlhrTablePaginate', [
  '$compile',
  function ($compile) {
    function link(scope, elm, attrs) {
      var update = function (oldValue, newValue) {
        var count = scope.filterState.filterCount;
        var limit = scope.options.row_limit;
        if (limit <= 0) {
          elm.html('');
          return;
        }
        var pages = Math.ceil(count / limit);
        var curPage = Math.floor(scope.options.rowOffset / limit);
        var string = '<button class="mlhr-table-page-link" ng-disabled="isCurrentPage(0)" ng-click="decrementPage()">&laquo;</button>';
        for (var i = 0; i < pages; i++) {
          string += ' <a class="mlhr-table-page-link" ng-show="!isCurrentPage(' + i + ')" ng-click="goToPage(' + i + ')">' + i + '</a><span class="mlhr-table-page-link" ng-show="isCurrentPage(' + i + ')">' + i + '</span>';
        }
        string += '<button class="mlhr-table-page-link" ng-disabled="isCurrentPage(' + (pages - 1) + ')" ng-click="incrementPage()">&raquo;</button>';
        elm.html(string);
        $compile(elm.contents())(scope);
      };
      scope.incrementPage = function () {
        var newOffset = scope.options.rowOffset + scope.options.row_limit * 1;
        scope.options.rowOffset = Math.min(scope.filterState.filterCount - 1, newOffset);
      };
      scope.decrementPage = function () {
        var newOffset = scope.options.rowOffset - scope.options.row_limit * 1;
        scope.options.rowOffset = Math.max(0, newOffset);
      };
      scope.goToPage = function (i) {
        if (i < 0) {
          throw new Error('Attempted to go to a negative index page!');
        }
        scope.options.rowOffset = scope.options.row_limit * i;
      };
      scope.isCurrentPage = function (i) {
        var limit = scope.options.row_limit;
        if (limit <= 0) {
          return false;
        }
        var pageOffset = i * limit;
        return pageOffset === scope.options.rowOffset * 1;
      };
      scope.$watch('options.row_limit', update);
      scope.$watch('filterState.filterCount', update);
    }
    return {
      scope: {
        options: '=mlhrTablePaginate',
        filterState: '='
      },
      link: link
    };
  }
]).directive('mlhrTableCell', function ($compile) {
  function link(scope, element, attrs) {
    var column = scope.column;
    var cellMarkup = '';
    if (column.template) {
      cellMarkup = column.template;
    } else if (column.templateUrl) {
      cellMarkup = '<div ng-include="\'' + column.templateUrl + '\'"></div>';
    } else if (column.selector === true) {
      cellMarkup = '<input type="checkbox" ng-checked="selected.indexOf(row[column.key]) >= 0" mlhr-table-selector class="mlhr-table-selector" />';
    } else if (column.ngFilter) {
      cellMarkup = '{{ row[column.key] | ' + column.ngFilter + ':row }}';
    } else if (column.format) {
      cellMarkup = '{{ column.format(row[column.key], row, column) }}';
    } else {
      cellMarkup = '{{ row[column.key] }}';
    }
    element.html(cellMarkup);
    $compile(element.contents())(scope);
  }
  return {
    scope: true,
    link: link
  };
}).directive('mlhrTable', [
  '$log',
  '$timeout',
  function ($log, $timeout) {
    function link(scope, elem, attrs) {
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
      if (!(scope.rows instanceof Array)) {
        throw new Error('"rows" array not found in mlhrTable scope!');
      }
      // Object that holds search terms
      scope.searchTerms = {};
      // Array and Object for sort order+direction
      scope.sortOrder = [];
      scope.sortDirection = {};
      // Holds filtered rows count
      scope.filterState = { filterCount: scope.rows.length };
      // Default Options, extend provided ones
      scope.options = angular.extend({}, {
        scrollDivisor: 4,
        row_limit: 30,
        rowOffset: 0,
        trackBy: scope.trackBy,
        pagingScheme: 'scroll',
        sort_classes: [
          'glyphicon glyphicon-sort',
          'glyphicon glyphicon-chevron-up',
          'glyphicon glyphicon-chevron-down'
        ]
      }, scope.options);
      // Cache elements
      scope.thead = elem.find('thead');
      scope.tbody = elem.find('tbody');
      scope.scroller = elem.find('.mlhr-table-scroller');
      scope.scrollerWrapper = elem.find('.mlhr-table-scroller-wrapper');
      scope._scrollerMinHeight_ = parseInt(scope.scroller.css('min-height'));
      // Some setup of the scroller wrapper must occur after the DOM 
      // has been painted.
      $timeout(function () {
        // Set a margin top equal to the thead
        scope.scrollerWrapper.css({ 'margin-top': scope.thead.height() + 'px' });
        // Allow the scroller to be draggable
        scope.scroller.draggable({
          axis: 'y',
          containment: scope.scrollerWrapper,
          drag: function (event, ui) {
            scope.updateOffsetByScroller(ui.position.top);
          }
        });
      }, 0);
      // Look for initial sort order
      if (scope.options.initial_sorts) {
        angular.forEach(scope.options.initial_sorts, function (sort) {
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
        scope.$watch('options.row_limit', scope.saveToStorage);  //  - when column gets enabled or disabled
                                                                 //  TODO
      }
      // Watch for changes to update scroll position
      scope.$watch('filterState.filterCount', function () {
        var minOffset;
        var row_limit = scope.options.row_limit * 1;
        if (scope.options.pagingScheme === 'page') {
          if (row_limit <= 0) {
            minOffset = 0;
          } else {
            minOffset = Math.floor(scope.filterState.filterCount / row_limit) * row_limit;
          }
        } else {
          minOffset = scope.filterState.filterCount - row_limit;
        }
        scope.options.rowOffset = Math.max(0, Math.min(scope.options.rowOffset, minOffset));
        $timeout(scope.updateScrollerPosition, 0);
      });
      scope.$watch('options.row_limit', function () {
        $timeout(scope.updateScrollerPosition, 0);
      });
      scope.$watch('options.pagingScheme', function () {
        scope.options.rowOffset = 0;
        $timeout(scope.updateScrollerPosition, 0);
      });
    }
    return {
      templateUrl: 'src/mlhr-table.tpl.html',
      restrict: 'EA',
      scope: {
        columns: '=',
        rows: '=',
        classes: '@tableClass',
        selected: '=',
        options: '=?',
        trackBy: '@?'
      },
      controller: 'TableController',
      compile: function (tElement, tAttrs) {
        if (!tElement.attr('track-by')) {
          tElement.attr('track-by', 'id');
        }
        return link;
      }
    };
  }
]);
angular.module('datatorrent.mlhrTable.templates', ['src/mlhr-table.tpl.html']);
angular.module('src/mlhr-table.tpl.html', []).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('src/mlhr-table.tpl.html', '<div class="mlhr-table-wrapper">\n' + '  <table ng-class="classes" class="mlhr-table">\n' + '    <thead>\n' + '      <tr ui-sortable="sortableOptions" ng-model="columns">\n' + '        <th \n' + '          scope="col" \n' + '          ng-repeat="column in columns" \n' + '          ng-click="toggleSort($event,column)" \n' + '          ng-class="{\'sortable-column\' : column.sort}" \n' + '          ng-attr-title="{{ column.title || \'\' }}"\n' + '          ng-style="{ width: column.width, \'min-width\': column.width, \'max-width\': column.width }"\n' + '        >\n' + '          <span class="column-text">\n' + '            {{column.hasOwnProperty(\'label\') ? column.label : column.id }}\n' + '            <span \n' + '              ng-if="column.sort" \n' + '              title="This column is sortable. Click to toggle sort order. Hold shift while clicking multiple columns to stack sorting."\n' + '              class="sorting-icon {{ getSortClass( sortDirection[column.id] ) }}"\n' + '            ></span>\n' + '          </span>\n' + '          <span \n' + '            ng-if="!column.lock_width"\n' + '            ng-class="{\'discreet-width\': !!column.width, \'column-resizer\': true}"\n' + '            title="Click and drag to set discreet width. Click once to clear discreet width."\n' + '            ng-mousedown="startColumnResize($event, column)"\n' + '          >\n' + '            &nbsp;\n' + '          </span>\n' + '        </th>\n' + '      </tr>\n' + '      <tr ng-if="hasFilterFields()" class="mlhr-table-filter-row">\n' + '        <th ng-repeat="column in columns">\n' + '          <input \n' + '            type="search"\n' + '            ng-if="(column.filter)"\n' + '            ng-model="searchTerms[column.id]"\n' + '            ng-attr-placeholder="{{ column.filter && column.filter.placeholder }}"\n' + '            ng-attr-title="{{ column.filter && column.filter.title }}"\n' + '            ng-class="{\'active\': searchTerms[column.id] }"\n' + '          >\n' + '        </th>\n' + '      </tr>\n' + '    </thead>\n' + '    <tfoot>\n' + '      <tr>\n' + '        <td ng-attr-colspan="{{ getActiveColCount() }}">\n' + '          <form novalidate>\n' + '            <label>row limit:</label> <input type="text" ng-model="options.row_limit" value="{{ options.row_limit }}">&nbsp;&nbsp;\n' + '            <input type="radio" ng-model="options.pagingScheme" value="scroll" name="paging-scroll"> <label for="paging-scroll">scroll</label>&nbsp;&nbsp;\n' + '            <input type="radio" ng-model="options.pagingScheme" value="page" name="paging-page"> <label for="paging-page">paginate</label>&nbsp;&nbsp;\n' + '            <span ng-if="options.pagingScheme === \'page\'" mlhr-table-paginate="options" filter-state="filterState"></span>\n' + '          </form>\n' + '        </td>\n' + '      </tr>\n' + '    </tfoot>\n' + '    <tbody msd-wheel="onScroll($event, $delta, $deltaX, $deltaY)" ng-class="options.rowOffset % 2 ? \'offset-odd\' : \'offset-even\'">\n' + '      <tr ng-repeat="\n' + '        row in rows \n' + '          | tableRowFilter:columns:searchTerms:filterState \n' + '          | tableRowSorter:columns:sortOrder:sortDirection \n' + '          | limitTo:options.rowOffset - filterState.filterCount \n' + '          | limitTo:options.row_limit\n' + '        track by row[options.trackBy]">\n' + '        <td ng-repeat="\n' + '          column in columns \n' + '          track by column.id" class="mlhr-table-cell" mlhr-table-cell></td>\n' + '      </tr>\n' + '    </tbody>\n' + '  </table>\n' + '  <div ng-show="options.pagingScheme === \'scroll\'" class="mlhr-table-scroller-wrapper">\n' + '    <div class="mlhr-table-scroller"></div>\n' + '  </div>\n' + '</div>');
  }
]);