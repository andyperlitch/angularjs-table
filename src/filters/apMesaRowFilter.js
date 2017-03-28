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

angular.module('apMesa.filters.apMesaRowFilter',[
  'apMesa.services.apMesaFilterFunctions'
])

.filter('apMesaRowFilter', ['apMesaFilterFunctions', '$log', function(tableFilterFunctions, $log) {
  return function tableRowFilter(rows, columns, persistentState, transientState, options) {

    var enabledFilterColumns, result = rows;

    // gather enabled filter functions
    enabledFilterColumns = columns.filter(function(column) {
      // check search term
      var term = persistentState.searchTerms[column.id];
      if (typeof term === 'string') {

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
        $log.warn('apMesa: The filter function "'+column.filter+'" ' +
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
          var term = persistentState.searchTerms[col.id];
          var value = (options !== undefined && {}.hasOwnProperty.call(options, 'getter'))? options.getter(col.key, row):row[col.key];
          var computedValue = typeof col.format === 'function' ? col.format(value, row, col, options) : value;
          if (!filter(term, value, computedValue, row, col, options)) {
            return false;
          }
        }
        return true;
      });
    }
    transientState.filterCount = result.length;
    return result;
  };
}]);
