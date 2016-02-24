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

angular.module('apMesa.directives.apMesaSelector', [])

.directive('apMesaSelector', function() {
  return {
    restrict: 'A',
    scope: false,
    link: function postLink(scope, element) {
      var selected = scope.selected;
      var row = scope.row;
      var column = scope.column;
      element.on('click', function() {

        // Retrieve position in selected list
        var idx = selected.indexOf(column.selectObject ? row : row[column.key]);

        // it is selected, deselect it:
        if (idx >= 0) {
          selected.splice(idx,1);
        } 

        // it is not selected, push to list
        else { 
          selected.push(column.selectObject ? row : row[column.key]);
        }
        scope.$apply();
      });
    }
  };
});
