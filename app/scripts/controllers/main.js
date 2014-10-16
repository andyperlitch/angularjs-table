'use strict';

angular.module('datatorrent.mlhrTable.ghPage')
  .filter('commaGroups', function() {
    function commaGroups(value) {
      if (typeof value === 'undefined') {
        return '-';
      }
      var parts = value.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    return commaGroups;
  })
  .controller('MainCtrl', function ($scope, $templateCache) {

    // Format functions
    function inches2feet(inches, model){
      var feet = Math.floor(inches/12);
      inches = inches % 12;
      return feet + '\'' + inches + '"';
    }
    function feet_filter(term, value, formatted, model) {
      if (term === 'tall') { return value > 70; }
      if (term === 'short') { return value < 69; }
      return true;
    }
    feet_filter.title = 'Type in "short" or "tall"';

    // Random data generator
    function genRows(num){
      var retVal = [];
      for (var i=0; i < num; i++) {
        retVal.push(genRow(i));
      }
      return retVal;
    }
    function genRow(id){

      var fnames = ['joe','fred','frank','jim','mike','gary','aziz'];
      var lnames = ['sterling','smith','erickson','burke','ansari'];
      var seed = Math.random();
      var seed2 = Math.random();
      var first_name = fnames[ Math.round( seed * (fnames.length -1) ) ];
      var last_name = lnames[ Math.round( seed * (lnames.length -1) ) ];
      
      return {
        id: id,
        selected: false,
        first_name: first_name,
        last_name: last_name,
        age: Math.ceil(seed * 75) + 15,
        height: Math.round( seed2 * 36 ) + 48,
        weight: Math.round( seed2 * 130 ) + 90,
        likes: Math.round(seed2 * seed * 1000000)
      };
    }

    $templateCache.put('path/to/example/template.html', '<em>{{row[column.key]}}</em>');
        
    // Table columns
    $scope.my_table_columns = [
      { id: 'selected', key: 'id', label: '', width: 30, lock_width: true, selector: true },
      { id: 'ID', key: 'id', label: 'ID', sort: 'number', filter: 'number' },
      { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like', template: '<strong>{{row[column.key]}}</strong>' },
      { id: 'last_name', key: 'last_name', label: 'Last Name', sort: 'string', filter: 'like', templateUrl: 'path/to/example/template.html' },
      { id: 'age', key: 'age', label: 'Age', sort: 'number', filter: 'number' },
      { id: 'likes', key: 'likes', label: 'likes', ngFilter: 'commaGroups' },
      { id: 'height', key: 'height', label: 'Height', format: inches2feet, filter: feet_filter, sort: 'number' },
      { id: 'weight', key: 'weight', label: 'Weight', filter: 'number', sort: 'number' }
    ];

    // Table data
    // $scope.my_table_data = genRows(30);
    $scope.my_table_data = [];


    // Selected rows
    $scope.my_selected_rows = [];

    // table options
    $scope.my_table_options = {
      rowLimit: 10,
      storage: localStorage,
      storage_key: 'gh-page-table',
      loading: true
    };

    setInterval(function() {
      $scope.my_table_data = genRows(30);
      $scope.$apply();
      $scope.my_table_options.setLoading(false);
    }, 1000);

  });
