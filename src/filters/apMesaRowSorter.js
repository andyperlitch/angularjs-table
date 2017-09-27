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

angular.module('apMesa.filters.apMesaRowSorter', [])

.filter('apMesaRowSorter', function() {
  return function tableRowSorter(rows, columns, sortOrder, options, transientState) {
    if (!sortOrder.length) {
      return rows;
    }
    var arrayCopy = rows.slice();
    var enabledColumns = {};
    columns.forEach(function(column) {
      enabledColumns[column.id] = true;
    });
   // js sort doesn't work as expected because it rearranges the equal elements
    // so we will arrange elements only if they are different, based on the element index
    var sortArray = arrayCopy.map(function (data, index) {
      return { index: index, data: data };
    });

    sortArray.sort(function (a, b) {
      for (var i = 0; i < sortOrder.length; i++) {
        var sortItem = sortOrder[i];
        if (!enabledColumns[sortItem.id]) {
          continue;
        }
        var column = transientState.columnLookup[sortItem.id];
        var dir = sortItem.dir;
        if (column && column.sort) {
          var fn = column.sort;
          var result = dir === '+' ? fn(a.data, b.data, options, column) : fn(b.data, a.data, options, column);
          if (result !== 0) {
            return result;
          }
        }
      }
      return a.index - b.index;
    });

    return sortArray.map(function (value) {
      return value.data;
    });
  };
});
