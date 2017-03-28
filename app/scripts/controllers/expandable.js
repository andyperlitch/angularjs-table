'use strict';

angular.module('apMesa.ghPage')
.controller('ExpandableCtrl', function($scope, $q, phoneData, $templateCache) {

  $scope.my_table_options = {
    expandableTemplateUrl: 'views/expandable-panel.html',
    bodyHeight: 600,
    rowPadding: 600
  };
  $scope.my_selected_rows = [];
  $scope.my_table_columns = [
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
      id: 'tech',
      key: 'technology',
      sort: 'string',
      label: 'Tech'
    }
  ];
  $scope.phoneData = phoneData;

});
