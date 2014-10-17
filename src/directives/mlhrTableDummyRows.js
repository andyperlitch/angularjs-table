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
 * @name datatorrent.mlhrTable.directive:mlhrTableDummyRows
 * @restrict A
 * @description inserts dummy <tr>s for non-rendered rows
 * @element tbody
 * @example <tbody mlhr-table-dummy-rows="[number]" columns="[column array]"></tbody>
**/
angular.module('datatorrent.mlhrTable.directives.mlhrTableDummyRows', [])
.directive('mlhrTableDummyRows', function() {

  return {
    template: '<tr class="mlhr-table-dummy-row" ng-style="{ height: dummyRowHeight + \'px\'}"><td ng-show="dummyRowHeight" ng-attr-colspan="{{columns.length}}"></td></tr>',
    scope: true,
    link: function(scope, element, attrs) {

      scope.$watch(attrs.mlhrTableDummyRows, function(count) {
        scope.dummyRowHeight = count * scope.rowHeight;
      });

    }
  };

});