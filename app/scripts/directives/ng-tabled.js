'use strict';

angular.module('andyperlitch.ngTabled', [])

.service('tabledFilterFunctions', function() {

  function like(term, value, computedValue, row) {
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
  var unitmap = {
    second: 1000,
    minute: 60000,
    hour: 3600000,
    day: 86400000,
    week: 86400000*7,
    month: 86400000*31,
    year: 86400000*365
  };
  function parseDateFilter(string) {

    // split on clauses (if any)
    var clauses = string.split(',');
    var total = 0;
    
    // parse each clause
    for (var i = 0; i < clauses.length; i++) {
      var clause = clauses[i].trim();
      var terms = clause.split(' ');
      if (terms.length < 2) {
        continue;
      }
      var count = terms[0]*1;
      var unit = terms[1].replace(/s$/, '');
      if (! unitmap.hasOwnProperty(unit) ) {
        continue;
      }
      total += count * unitmap[unit];
    }
    
    return total;
    
  }
  function date(term, value) {
    // < 1 day ago
    // < 10 minutes ago
    // < 10 minutes, 50 seconds ago
    // > 2 days ago
    // >= 1 day ago
    
    value *= 1;
    var now = (+new Date());
    var first_two = term.substr(0,2);
    var first_char = term[0];
    var against_1 = (term.substr(1)).trim();
    var against_2 = (term.substr(2)).trim();
    var lowerbound, upperbound;
    if ( first_two === '<=' ) {
      lowerbound = now - parseDateFilter(against_2);
      return value >= lowerbound;
    }
    else if ( first_two === '>=' ) {
      upperbound = now - parseDateFilter(against_2);
      return value <= upperbound;
    }
    else if ( first_char === '<' ) {
      lowerbound = now - parseDateFilter(against_1);
      return value > lowerbound;
    }
    else if ( first_char === '>' ) {
      upperbound = now - parseDateFilter(against_1);
      return value < upperbound;
    } else {
      // no comparative signs found
      return false;
    }
  }

  return {
    like: like,
    likeFormatted: likeFormatted,
    number: number,
    numberFormatted: numberFormatted,
    date: date
  };
})

.filter('tabledRowFilter', ['tabledFilterFunctions', function(tabledFilterFunctions) {
  return function(rows, columns, searchTerms) {
    // var fns = columns
    // .filter(function(column) {
    //   if (searchTerms.hasOwnProperty(column.id)) {
    //     return true;
    //   }
    //   return false;
    // })
    // .map(function(column) {
    //   return column.filter;
    // });
    return rows;
  };
}])

.directive('ngTabled', function () {
  return {
    // templateUrl: 'views/ng-tabled.html',
    template:  '<table class="{{classes}}">' +
                  '<thead>' +
                      '<tr>' +
                          '<th scope="col" ng-repeat="column in columns">' +
                              '{{column.label || column.id}}' +
                              '<div class="column-resizer"></div>' +
                          '</th>' +
                      '</tr>' +
                      '<tr>' +
                          '<th ng-if="hasFilterFields()" ng-repeat="column in columns">' +
                              '<input type="search" ng-if="(column.filter)" ng-model="searchTerms[column.id]">' +
                          '</th>' +
                      '</tr>' +
                  '</thead>' +
                  '<tbody>' +
                      '<tr ng-repeat="row in rows | tabledRowFilter:columns:searchTerms">' +
                          '<td ng-repeat="column in columns">' +
                              '{{ row[column.key] }}' +
                          '</td>' +
                      '</tr>' +
                  '</tbody>' +
              '</table>',
    restrict: 'E',
    scope: {
      columns: '=',
      rows: '=',
      classes: '@class'
    },
    controller: function($scope) {

        // Object that holds search terms
        $scope.searchTerms = {};

        // Checks if columns have any filter fileds
        $scope.hasFilterFields = function() {
          for (var i = $scope.columns.length - 1; i >= 0; i--) {
            if (typeof $scope.columns[i].filter === 'function') {
              return true;
            }
          }
        };

      },
    link: function postLink(scope, element, attrs) {
      // element.text('cool')
    }
  };
});
