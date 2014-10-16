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
    link: function(scope, element, attrs) {

      var columns = scope.$eval(attrs.columns);
      var cellContent = attrs.cellContent || '...';
      var template = '<tr>';

      for (var i = columns.length - 1; i >= 0; i--) {
        template += '<td>' + cellContent + '</td>';
      }

      template += '</tr>';

      scope.$watch(attrs.mlhrTableDummyRows, function(count) {
        if (count === 0) {
          element.html('');
          return;
        }

        var html = '';

        for (var i = 1; i <= count; i++) {
          html += template;
        }

        element.html(html);
      });

    }
  };

});