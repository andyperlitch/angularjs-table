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

/**
 * @ngdoc directive
 * @name apMesa.directive:apMesaDummyRows
 * @restrict A
 * @description inserts dummy <tr>s for non-rendered rows
 * @element tbody
 * @example <tbody ap-mesa-dummy-rows="[number]" columns="[column array]"></tbody>
**/
angular.module('apMesa.directives.apMesaDummyRows', [])
.directive('apMesaDummyRows', function() {

  return {
    template: '<tr class="ap-mesa-dummy-row" ng-style="{ height: dummyRowHeight + \'px\'}"><td ng-show="dummyRowHeight" ng-attr-colspan="{{columns.length}}"></td></tr>',
    scope: true,
    link: function(scope, element, attrs) {

      scope.$on('angular-mesa:update-dummy-rows', function() {
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
