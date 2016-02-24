'use strict';

angular.module('apMesa.ghPage')
  .controller('PerfCtrl', function ($scope) {

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
        weight: Math.round( seed2 * 130 ) + 90
      };
    }
        
    // Table columns
    $scope.my_table_columns = [
      { id: 'selected', key: 'id', label: '', width: 30, lockWidth: true, selector: true },
      { id: 'ID', key: 'id', label: 'ID', sort: 'number', filter: 'number' },
      { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like' },
      { id: 'last_name', key: 'last_name', label: 'Last Name', sort: 'string', filter: 'like' },
      { id: 'age', key: 'age', label: 'Age', sort: 'number', filter: 'number' },
      { id: 'height', key: 'height', label: 'Height', format: inches2feet, filter: feet_filter, sort: 'number' },
      { id: 'weight', key: 'weight', label: 'Weight', filter: 'number', sort: 'number' }
    ];

    // Table data
    $scope.my_table_data = genRows(30);
    $scope.my_table_data2 = genRows(40);
    $scope.my_table_data3 = genRows(50);
    $scope.my_table_data4 = genRows(60);
    $scope.my_table_data5 = genRows(70);
    $scope.my_table_data6 = genRows(80);
    $scope.my_table_data7 = genRows(90);


    // Selected rows
    $scope.my_selected_rows = [];
    $scope.my_selected_rows2 = [];
    $scope.my_selected_rows3 = [];
    $scope.my_selected_rows4 = [];
    $scope.my_selected_rows5 = [];
    $scope.my_selected_rows6 = [];
    $scope.my_selected_rows7 = [];

    // table options
    $scope.my_table_options = {
      rowLimit: 10,
      storage: localStorage,
      storageKey: 'gh-page-table'
    };

    $scope.my_table_options2 = {
      rowLimit: 10,
      storage: localStorage,
      storageKey: 'gh-page-table2'
    };

    $scope.my_table_options3 = {
      rowLimit: 10,
      storage: localStorage,
      storageKey: 'gh-page-table3'
    };

    $scope.my_table_options4 = {
      rowLimit: 10,
      storage: localStorage,
      storageKey: 'gh-page-table4'
    };

    $scope.my_table_options5 = {
      rowLimit: 10,
      storage: localStorage,
      storageKey: 'gh-page-table5'
    };

    $scope.my_table_options6 = {
      rowLimit: 10,
      storage: localStorage,
      storageKey: 'gh-page-table6'
    };

    $scope.my_table_options7 = {
      rowLimit: 10,
      storage: localStorage,
      storageKey: 'gh-page-table7'
    };

    setInterval(function() {
      $scope.my_table_data = genRows(30);
      $scope.my_table_data2 = genRows(40);
      $scope.my_table_data3 = genRows(50);
      $scope.my_table_data4 = genRows(60);
      $scope.my_table_data5 = genRows(70);
      $scope.my_table_data6 = genRows(80);
      $scope.my_table_data7 = genRows(90);
      // $scope.my_table_data = genRows(30);
      $scope.$apply();
    }, 1000);

  });
