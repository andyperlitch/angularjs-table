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

angular.module('apMesa.services.apMesaSortFunctions',[])

.service('apMesaSortFunctions', function() {
  return {
    number: function(field){
      return function(row1,row2,options) {
        var val1, val2;
        if (options !== undefined && {}.hasOwnProperty.call(options, 'getter')) {
          val1 = options.getter(field, row1);
          val2 = options.getter(field, row2);
        }
        else {
          val1 = row1[field];
          val2 = row2[field];
        }
        return val1*1 - val2*1;
      };
    },
    string: function(field){
      return function(row1,row2,options) {
        var val1, val2;
        if (options !== undefined && {}.hasOwnProperty.call(options, 'getter')) {
          val1 = options.getter(field, row1);
          val2 = options.getter(field, row2);
        }
        else {
          val1 = row1[field];
          val2 = row2[field];
        }
        return val1.toString().toLowerCase().localeCompare(val2.toString().toLowerCase());
      };
    },
    stringFormatted: function(field){
      return function(row1,row2,options,column) {
        var val1, val2;
        if (options !== undefined && {}.hasOwnProperty.call(options, 'getter')) {
          val1 = options.getter(field, row1);
          val2 = options.getter(field, row2);
        }
        else {
          val1 = row1[field];
          val2 = row2[field];
        }
        val1 = column.format(val1, row1, column);
        val2 = column.format(val2, row2, column);

        return val1.toString().toLowerCase().localeCompare(val2.toString().toLowerCase());
      };
    },
    numberFormatted: function(field){
      return function(row1,row2,options,column) {
        var val1, val2;
        if (options !== undefined && {}.hasOwnProperty.call(options, 'getter')) {
          val1 = options.getter(field, row1);
          val2 = options.getter(field, row2);
        }
        else {
          val1 = row1[field];
          val2 = row2[field];
        }
        val1 = column.format(val1, row1, column);
        val2 = column.format(val2, row2, column);

        return val1*1 - val2*1;
      };
    },
  };
});
