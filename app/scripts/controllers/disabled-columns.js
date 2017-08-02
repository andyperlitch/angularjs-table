'use strict';

angular.module('apMesa.ghPage')
.controller('DisabledColumnsCtrl', function($scope, $q, phoneData, $templateCache) {

  this.my_table_options = {
    bodyHeight: 600,
    rowPadding: 600,
    storage: localStorage,
    storageKey: 'example'
  };
  this.my_table_options_paginated = angular.extend({ pagingStrategy: 'PAGINATE' }, this.my_table_options);
  this.my_selected_rows = [];
  this.my_table_columns = [
    {
      id: 'name',
      key: 'DeviceName',
      label: 'Phone',
      sort: 'string',
      filter: 'like',
      template: '<a href="" ng-click="toggleRowExpand()">' +
                  '<i class="glyphicon glyphicon-triangle-right" ng-if="!rowIsExpanded"></i>' +
                  '<i class="glyphicon glyphicon-triangle-bottom" ng-if="rowIsExpanded"></i>' +
                  '{{ row.DeviceName }}' +
                '</a>'
    },
    {
      id: 'brand',
      key: 'Brand',
      sort: 'string',
      label: 'Brand'
    },
    {
      id: 'edge',
      key: 'edge',
      label: 'Edge',
      sort: 'string',
      filter: 'like'
    },
    {
      id: 'tech',
      key: 'technology',
      sort: 'string',
      label: 'Tech'
    }
  ];
  this.my_enabled_columns = this.my_table_columns.map(function(c) { return c.id; });
  this.phoneData = phoneData;
  var _this = this;

  this.toggleColumn = function(id) {
    var curIndexOfColumnId = _this.my_enabled_columns.indexOf(id);
    if (curIndexOfColumnId > -1) {
      _this.my_enabled_columns.splice(curIndexOfColumnId, 1);
    } else {
      _this.my_enabled_columns.push(id);
      var enabled = _this.my_enabled_columns;
      // Do this to preserve original order for this demo. Do whatever you want in your own use-case
      _this.my_enabled_columns = _this.my_table_columns
        .filter(function(c) { return enabled.indexOf(c.id) > -1; })
        .map(function(c) { return c.id; });
    }
  };

});
