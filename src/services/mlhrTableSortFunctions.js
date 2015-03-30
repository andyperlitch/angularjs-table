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

angular.module('datatorrent.mlhrTable.services.mlhrTableSortFunctions',[])

.service('mlhrTableSortFunctions', function() {
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
        if ( val1.toString().toLowerCase() === val2.toString().toLowerCase() ) {
          return 0;
        }
        return val1.toString().toLowerCase() > val2.toString().toLowerCase() ? 1 : -1 ;
      };
    }
  };
});