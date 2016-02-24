'use strict';

angular.module('apMesa.ghPage')

  // angular filter, to be used with the "ngFilter" option in column definitions below
  .filter('commaGroups', function() {

    // Converts a number like 123456789 to string with appropriate commas: "123,456,789"
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
  .controller('MaxHeightCtrl', function ($scope, $templateCache, $q) {

    // Format functions, used with the "format" option in column definitions below
    // converts number in inches to display string, eg. 69 => 5'9"
    function inches2feet(inches, model){
      var feet = Math.floor(inches/12);
      inches = inches % 12;
      return feet + '\'' + inches + '"';
    }
    // Custom column filtering function:
    //  If the user types "tall", only people who
    //  are taller than 70 inches will be displayed.
    function feet_filter(term, value, formatted, model) {
      if (term === 'tall') { return value > 70; }
      if (term === 'short') { return value < 69; }
      return true;
    }
    feet_filter.title = 'Type in "short" or "tall"';

    // Generates `num` random rows
    function genRows(num){
      var retVal = [];
      for (var i=0; i < num; i++) {
        retVal.push(genRow(i));
      }
      return retVal;
    }

    // Generates a row with random data
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

    // Simulate location of template file
    $templateCache.put('path/to/example/template.html', '<em>{{row[column.key]}}</em>');
        
    // Table column definition objects
    $scope.my_table_columns = [
      { id: 'selected', key: 'id', label: '', width: 30, lockWidth: true, selector: true },
      { id: 'ID', key: 'id', label: 'ID', sort: 'number', filter: 'number' },
      { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like', template: '<strong>{{row[column.key]}}</strong>' },
      { id: 'last_name', key: 'last_name', label: 'Last Name', sort: 'string', filter: 'like', templateUrl: 'path/to/example/template.html' },
      { id: 'age', key: 'age', label: 'Age', sort: 'number', filter: 'number' },
      { id: 'likes', key: 'likes', label: 'likes', ngFilter: 'commaGroups' },
      { id: 'height', key: 'height', label: 'Height', format: inches2feet, filter: feet_filter, sort: 'number' },
      { id: 'weight', key: 'weight', label: 'Weight', filter: 'number', sort: 'number' }
    ];

    // Table data
    $scope.my_table_data = [];


    // Selected rows
    $scope.my_selected_rows = [];

    // table options
    var apiDfd = $q.defer();
    $scope.my_table_options = {
      rowLimit: 10,
      storage: localStorage,
      storageKey: 'gh-page-table',
      loading: true,
      onRegisterApi: function(api) {
        $scope.api = api;
        apiDfd.resolve();
      }
    };

    // kick off interval that updates the dataset
    var id = 1;
    setInterval(function() {
      if (id < 1000) {
        $scope.my_table_data.push(genRow(id++));
        $scope.$apply();
        apiDfd.promise.then(function() {
          $scope.api.setLoading(false);
        });
      }
    }, 1000);

  });
