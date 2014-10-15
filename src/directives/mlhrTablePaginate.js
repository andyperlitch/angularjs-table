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

angular.module('datatorrent.mlhrTable.directives.mlhrTablePaginate', [])

.directive('mlhrTablePaginate', ['$compile', function($compile) {
  function link(scope, elm) {

    var update = function() {
      var count = scope.filterState.filterCount;
      var limit = scope.options.row_limit;
      if (limit <= 0) {
        elm.html('');
        return;
      }

      var pages = Math.ceil( count / limit );
      // var curPage = Math.floor(scope.options.rowOffset / limit);
      var string = '<button class="mlhr-table-page-link" ng-disabled="isCurrentPage(0)" ng-click="decrementPage()">&laquo;</button>';

      for (var i = 0; i < pages; i++) {
        string += ' <a class="mlhr-table-page-link" ng-show="!isCurrentPage(' + i + ')" ng-click="goToPage(' + i + ')">' + i + '</a><span class="mlhr-table-page-link" ng-show="isCurrentPage(' + i + ')">' + i + '</span>';
      }

      string += '<button class="mlhr-table-page-link" ng-disabled="isCurrentPage(' + (pages - 1) + ')" ng-click="incrementPage()">&raquo;</button>';

      elm.html(string);
      $compile(elm.contents())(scope);

    };

    scope.incrementPage = function() {
      var newOffset = scope.options.rowOffset + scope.options.row_limit*1;
      scope.options.rowOffset = Math.min(scope.filterState.filterCount - 1, newOffset);
    };
    scope.decrementPage = function() {
      var newOffset = scope.options.rowOffset - scope.options.row_limit*1;
      scope.options.rowOffset = Math.max(0, newOffset);
    };
    scope.goToPage = function(i) {
      if (i < 0) {
        throw new Error('Attempted to go to a negative index page!');
      }
      scope.options.rowOffset = scope.options.row_limit*i;
    };
    scope.isCurrentPage = function(i) {
      var limit = scope.options.row_limit;
      if (limit <= 0) {
        return false;
      }
      var pageOffset = i * limit;
      return pageOffset === scope.options.rowOffset*1;
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
}]);