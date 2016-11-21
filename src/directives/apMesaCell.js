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

angular.module('apMesa.directives.apMesaCell', [
  'apMesa.directives.apMesaSelector'
])

.directive('apMesaCell', function($compile) {

  function link(scope, element) {
    scope.$watch('column', function(column) {
      var cellMarkup = '';
      if (column.template) {
        cellMarkup = column.template;
      }
      else if (column.templateUrl) {
        cellMarkup = '<div ng-include="\'' + column.templateUrl + '\'"></div>';
      }
      else if (column.selector === true) {
        cellMarkup = '<input type="checkbox" ng-checked="selected.indexOf(column.selectObject ? row : row[column.key]) >= 0" ap-mesa-selector class="ap-mesa-selector" />';
      }
      else if (column.ngFilter) {
        cellMarkup = '{{ row[column.key] | ' + column.ngFilter + ':row }}';
      }
      else if (column.format) {
        var valueExpr = (scope.options !== undefined && {}.hasOwnProperty.call(scope.options, 'getter')) ? 'options.getter(column.key, row)' : 'row[column.key]';
        cellMarkup = '{{ column.format(' + valueExpr + ', row, column, options) }}';
      }
      else if(scope.options !== undefined && {}.hasOwnProperty.call(scope.options, 'getter')) {

        cellMarkup = '{{ options.getter(column.key, row) }}';
      }
      else {
        cellMarkup = '{{ row[column.key] }}';
      }
      element.html(cellMarkup);
      $compile(element.contents())(scope);
    });
  }

  return {
    scope: true,
    link: link
  };
});
