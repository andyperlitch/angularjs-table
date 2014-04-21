'use strict';

angular.module('andyperlitch.apTable', [
  'andyperlitch.apTable.templates',
  'ui.sortable',
  'ngSanitize'
])

.service('tableFilterFunctions', function() {

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
    return like(term,computedValue,computedValue, row);
  }
  like.placeholder = likeFormatted.placeholder = 'string search';
  like.title = likeFormatted.title = 'Search by text, eg. "foo". Use "!" to exclude and "=" to match exact text, e.g. "!bar" or "=baz".';

  function number(term, value) {
    value = parseFloat(value);
    term = term.trim();
    var first_two = term.substr(0,2);
    var first_char = term[0];
    var against_1 = term.substr(1)*1;
    var against_2 = term.substr(2)*1;
    if ( first_two === '<=' ) {
      return value <= against_2 ;
    }
    if ( first_two === '>=' ) {
      return value >= against_2 ;
    }
    if ( first_char === '<' ) {
      return value < against_1 ;
    }
    if ( first_char === '>' ) {
      return value > against_1 ;
    }
    if ( first_char === '~' ) {
      return Math.round(value) === against_1 ;
    }
    if ( first_char === '=' ) {
      return against_1 === value ;
    }
    return value.toString().indexOf(term.toString()) > -1 ;
  }
  function numberFormatted(term, value, computedValue) {
    return number(term, computedValue);
  }
  number.placeholder = numberFormatted.placeholder = 'number search';
  number.title = numberFormatted.title = 'Search by number, e.g. "123". Optionally use comparator expressions like ">=10" or "<1000". Use "~" for approx. int values, eg. "~3" will match "3.2"';


  var unitmap = {};
  unitmap.second = unitmap.sec = unitmap.s = 1000;
  unitmap.minute = unitmap.min = unitmap.m = unitmap.second * 60;
  unitmap.hour = unitmap.hr = unitmap.h    = unitmap.minute * 60;
  unitmap.day = unitmap.d                  = unitmap.hour * 24;
  unitmap.week = unitmap.wk = unitmap.w    = unitmap.day * 7;
  unitmap.month                            = unitmap.week * 4;
  unitmap.year = unitmap.yr = unitmap.y    = unitmap.day * 365;

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
      var count = terms[1]*1;
      var unit = terms[2].replace(/s$/, '');
      if (! unitmap.hasOwnProperty(unit) ) {
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
    var now = (+nowDate);
    var first_char = term[0];
    var other_chars = (term.substr(1)).trim();
    var lowerbound, upperbound;
    if ( first_char === '<' ) {
      lowerbound = now - parseDateFilter(other_chars);
      return value > lowerbound;
    }
    if ( first_char === '>' ) {
      upperbound = now - parseDateFilter(other_chars);
      return value < upperbound;
    }
    
    if ( term === 'today') {
      return new Date(value).toDateString() === nowDate.toDateString();
    }

    if ( term === 'yesterday') {
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
})

.service('tableFormatFunctions', function() {

  function selector(value, row) {
    return '<input type="checkbox" ng-checked="selected.indexOf(row) >= 0" ap-table-selector />';
  }
  selector.trustAsHtml = true;

  return {
    selector: selector
  };
})

.service('tableSortFunctions', function() {
  return {
    number: function(field){
      return function(row1,row2) {
        return row1[field] - row2[field];
      };
    },
    string: function(field){
      return function(row1,row2) {
        if ( row1[field].toString().toLowerCase() === row2[field].toString().toLowerCase() ) {
          return 0;
        }
        return row1[field].toString().toLowerCase() > row2[field].toString().toLowerCase() ? 1 : -1 ;
      };
    }
  };
})

.filter('tableRowFilter', ['tableFilterFunctions', '$log', function(tableFilterFunctions, $log) {
  return function tableRowFilter(rows, columns, searchTerms) {

    var enabledFilterColumns, result = rows;

    // gather enabled filter functions
    enabledFilterColumns = columns.filter(function(column) {
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
        $log.warn('apTable: The filter function "'+column.filter+'" ' +
          'specified by column(id='+column.id+').filter ' +
          'was not found in predefined tableFilterFunctions. ' +
          'Available filters: "'+Object.keys(tableFilterFunctions).join('","')+'"');
      }
      return false;
    });

    // loop through rows and filter on every enabled function
    if (enabledFilterColumns.length) {
      result = rows.filter(function(row) {
        for (var i = enabledFilterColumns.length - 1; i >= 0; i--) {
          var col = enabledFilterColumns[i];
          var filter = col.filter;
          var term = searchTerms[col.id];
          var value = row[col.key];
          var computedValue = typeof col.format === 'function' ? col.format(value) : value;
          if (!filter(term, value, computedValue, row)) {
            return false;
          }
        }
        return true;
      });
    }

    return result;
  };
}])

.filter('tableCellFilter', ['$sce', '$sanitize', function($sce, $sanitize) {
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
}])

.filter('tableRowSorter', function() {
  var column_cache = {};
  function getColumn(columns,id) {
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
    for ( var i = 0; i < rows.length; i++) { arrayCopy.push(rows[i]); }
    return arrayCopy.sort(function(a,b) {
      for (var i = 0; i < sortOrder.length; i++) {
        var id = sortOrder[i];
        var column = getColumn(columns,id);
        var dir = sortDirection[id];
        if (column && column.sort) {
          
          var fn = column.sort;
          var result = dir === '+' ? fn(a,b) : fn(b,a);
          if (result !== 0) {
            return result;
          }

        }
      }
      return 0;
    });
  };
})

.controller(
  'TableController',
  ['$scope','tableFormatFunctions','tableSortFunctions','tableFilterFunctions','$log', '$window', function($scope, formats, sorts, filters, $log, $window) {

  // SCOPE FUNCTIONS
  $scope.addSort = function(id, dir) {
    var idx = $scope.sortOrder.indexOf(id);
    if (idx === -1) {
      $scope.sortOrder.push(id);
    }
    $scope.sortDirection[id] = dir;
  };
  $scope.removeSort = function(id) {
    var idx = $scope.sortOrder.indexOf(id);
    if (idx !== -1) {
      $scope.sortOrder.splice(idx, 1);
    }
    delete $scope.sortDirection[id];
  };
  $scope.clearSort = function() {
    $scope.sortOrder = [];
    $scope.sortDirection = {};
  };
  // Checks if columns have any filter fileds
  $scope.hasFilterFields = function() {
    for (var i = $scope.columns.length - 1; i >= 0; i--) {
      if (typeof $scope.columns[i].filter !== 'undefined') {
        return true;
      }
    }
    return false;
  };
  // Toggles column sorting
  $scope.toggleSort = function($event, column) {

    // check if even sortable
    if (!column.sort) {
      return;
    }

    if ( $event.shiftKey ) {
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
      }
      else {
        $scope.addSort(column.id, '+');
      }
      
    }
  };
  // Retrieve className for given sorting state
  $scope.getSortClass = function(sorting) {
    var classes = $scope.options.sort_classes;
    if (sorting === '+') {
      return classes[1];
    }
    if (sorting === '-') {
      return classes[2];
    }
    return classes[0];
  };
  $scope.setColumns = function(columns) {
    $scope.columns = columns;
    var column_lookups = { format: formats, sort: sorts, filter: filters };
    $scope.columns.forEach(function(column) {
      angular.forEach(column_lookups, function(builtins, key) {
        var attr = column[key];
        if (typeof attr === 'function') {
          return;
        }
        if (typeof attr === 'string') {
          if (typeof builtins[attr] === 'function') {
            column[key] = key === 'sort' ? builtins[attr](column.key) : builtins[attr];
          }
          else {
            delete column[key];
            $log.warn(key + ' function reference in column(id=' + column.id + ') ' +
                  'was not found in built-in ' + key + ' functions. ' +
                  key + ' function given: "' + attr + '". ' +
                  'Available built-ins: ' + Object.keys(builtins).join(','));
          }
          
        } else {
          delete column[key];
        }
      });
    });
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
        delete column.width;
      } else {
        column.width = Math.max(new_width, 0);
      }
      
      $scope.$apply();
    });
  };
  $scope.sortableOptions = {
    axis: 'x',
    handle: '.column-text'
  };

  $scope.getActiveColCount = function() {
    var count = 0;
    $scope.columns.forEach(function(col) {
      if (!col.disabled) {
        count++;
      }
    });
    return count;
  }

}])

.directive('dtDynamic', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      dynamic: '=dtDynamic',
      row: '=',
      column: '=',
      selected: '='
    },
    link: function postLink(scope, element, attrs) {
      scope.$watch( 'dynamic' , function(html){
        element.html(html);
        $compile(element.contents())(scope);
      });
    }
  };
})

.directive('apTableSelector', function() {
  return {
    restrict: 'A',
    scope: false,
    link: function postLink(scope, element, attrs) {
      var selected = scope.selected;
      var row = scope.row;
      element.on('click', function() {

        // Retrieve position in selected list
        var idx = selected.indexOf(row);

        // it is selected, deselect it:
        if (idx >= 0) {
          selected.splice(idx,1);
        } 

        // it is not selected, push to list
        else { 
          selected.push(row);
        }
        scope.$apply();
      });
    }
  }
})

.directive('apTable', function () {

  function link(scope, elem, attrs) {

    // Look for built-in filter, sort, and format functions
    if (scope.columns instanceof Array) {
      scope.setColumns(scope.columns);
    } else {
      $log.warn('"columns" array not found in apTable scope!');
    }

    // Check for rows
    if ( !(scope.rows instanceof Array) ) {
      $log.warn('"rows" array not found in apTable scope!');
    }

    // Object that holds search terms
    scope.searchTerms = {};

    // Array and Object for sort order+direction
    scope.sortOrder = [];
    scope.sortDirection = {};

    scope.options = angular.extend({}, {
      rowLimit: 50,
      pagingScheme: 'page',
      sort_classes: [
        'glyphicon glyphicon-sort',
        'glyphicon glyphicon-chevron-up',
        'glyphicon glyphicon-chevron-down'
      ]
    }, scope.options);
  }

  return {
    templateUrl: 'src/ap-table.tpl.html',
    restrict: 'EA',
    scope: {
      columns: '=',
      rows: '=',
      classes: '@tableClass',
      selected: '=',
      options: '=?'
    },
    controller: 'TableController',
    link: link
  };
});
