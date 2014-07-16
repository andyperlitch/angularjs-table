'use strict';

describe('Directive: mlhrTable', function () {

  var element,
  scope,
  isoScope,
  compile,
  genRows,
  columns,
  filter_title,
  filter_placeholder,
  data,
  mockLog,
  sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    mockLog = {
      warn: sandbox.spy()
    };
  });

  // load the directive's module
  beforeEach(module('datatorrent.mlhrTable', function($provide) {
    $provide.value('$log', mockLog);
  }));

  beforeEach(inject(function ($compile, $rootScope) {
    // Format functions
    function inches2feet(inches){
      var feet = Math.floor(inches/12);
      inches = inches % 12;
      return feet + '\'' + inches + '"';
    }
    function feet_filter(term, value) {
      if (term === 'tall') { return value >= 69; }
      if (term === 'short') { return value < 69; }
      return true;
    }
    feet_filter.title = filter_title = 'Type in "short" or "tall"';
    feet_filter.placeholder = filter_placeholder = '"short", "tall"';

    // Random data generator
    genRows = function(num){
      var retVal = [];
      for (var i=0; i < num; i++) {
        retVal.push(genRow(i));
      }
      return retVal;
    };
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
    
    scope = $rootScope.$new();
    compile = $compile;

    // Table columns
    scope.my_table_columns = columns = [
      { id: 'selector',   key: 'selected',   label: '',                                            selector: true, width: '30px', lock_width: true },
      { id: 'ID',         key: 'id',                              sort: 'number', filter: 'number'                                               },
      { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like',  title: 'First names are cool'                 },
      { id: 'last_name',  key: 'last_name',  label: 'Last Name',  sort: 'string', filter: 'like',  filter_placeholder: 'last name'               },
      { id: 'age',        key: 'age',        label: 'Age',        sort: 'number', filter: 'number'                                               },
      { id: 'height',     key: 'height',     label: 'Height',     sort: 'number', filter: feet_filter, format: inches2feet                       },
      { id: 'weight',     key: 'weight',     label: 'Weight',     sort: 'number', filter: 'number'                                               }
    ];

    // Table data
    scope.my_table_data = data = genRows(30);

    element = angular.element('<mlhr-table columns="my_table_columns" rows="my_table_data" class="table"></mlhr-table>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should create a table', function () {
    expect(element.find('table').length).to.equal(1);
  });

  it('should display the data passed to it', function () {
    var expected = data[0].first_name;
    var actual = element.find('table tbody tr:eq(0) td:eq(2)').text();
    actual = $.trim(actual);
    expect(actual).to.equal(expected);
  });

  it('should update displayed values when data has been updated', function() {
    scope.my_table_data = genRows(30);
    scope.$apply();
    var expected = scope.my_table_data[0].first_name;
    var actual = element.find('table tbody tr:eq(0) td:eq(2)').text();
    actual = $.trim(actual);
    expect(actual).to.equal(expected);
  });

  it('should throw if no columns array was found on the scope', inject(function($rootScope, $controller) {
    var scope2 = $rootScope.$new();
    scope2.rows = [];
    var el2 = angular.element('<mlhr-table columns="nonexistent_columns" rows="rows" class="table"></mlhr-table>');
    var fn = function() {
      el2 = compile(el2)(scope2);
      scope.$digest();
    };
    expect(fn).to.throw();
  }));

  it('should throw if no rows array was found on the scope', inject(function($rootScope, $controller) {
    var $scope2 = $rootScope.$new();
    $scope2.columns = [];
    var el2 = angular.element('<mlhr-table columns="columns" rows="nonexistent_rows" class="table"></mlhr-table>');
    var fn = function() {
      el2 = compile(el2)($scope2);
      scope.$digest();
    };
    expect(fn).to.throw();
  }));

  it('should attach a searchTerms object to the scope', function() {
    expect(isoScope.searchTerms).to.be.an('object');
  });

  it('should attach a sortOrder array to the scope', function() {
    expect(isoScope.sortOrder).to.be.instanceof(Array);
  });

  it('should attach a sortDirection object to the scope', function() {
    expect(isoScope.sortDirection).to.be.an('object');
  });

  it('should set a default trackBy to "id"', function() {
    expect(isoScope.options.trackBy).to.equal('id');
  });

  describe('column header', function() {
    
    it('should have a .column-resizer element if lock_width is not set', function() {
      expect(element.find('table th:eq(1) .column-resizer').length).to.equal(1);
    });

    it('should not have a .column-resizer element if lock_width is set to true', function() {
      expect(element.find('table th:eq(0) .column-resizer').length).to.equal(0);
    });

    it('should set the style to column.width if supplied in column definition', function() {
      expect(element.find('table th:eq(0)').css('width')).to.equal(columns[0].width);
    });

    it('should display column.id if column.label is not specified', function() {
      var actual = $.trim(element.find('table th:eq(1) .column-text').text());
      expect(actual).to.equal(columns[1].id);
    });

    it('should display column.label if it is present', function() {
      var actual = $.trim(element.find('table th:eq(2) .column-text').text());
      expect(actual).to.equal(columns[2].label);
    });

    it('should display column.label if it is present, even if it is a falsey value', function() {
      var actual = $.trim(element.find('table th:eq(0) .column-text').text());
      expect(actual).to.equal(columns[0].label);
    });

    it('should attach a title (tooltip) to <th>s where title was specified in column definition', function() {
      var actual = element.find('table th:eq(2)').attr('title');
      var expected = columns[2].title;
      expect(actual).to.equal(expected);
    });

  });

  describe('column filter', function() {
    
    it('should have a placeholder if specified as a property on the filter function', function() {
      var actual = element.find('table tr:eq(1) th:eq(5) input').attr('placeholder');
      var expected = filter_placeholder;
      expect(actual).to.equal(expected);
    });

    it('should have a title if specified as a property on the filter function', function() {
      var actual = element.find('table tr:eq(1) th:eq(5) input').attr('title');
      var expected = filter_title;
      expect(actual).to.equal(expected);
    });

  });

  describe('when filterCount changes', function() {
    var filterState, options;
    beforeEach(function() {
      filterState = isoScope.filterState;
      options = isoScope.options;
    });
    it('should set rowOffset to filterCount - row_limit when paging scheme is scroll', function() {
      options.rowOffset = 25;
      options.row_limit = 10;
      options.pagingScheme = 'scroll';
      
      // drop the last 10 elements
      data.splice(20,10);
      scope.$digest();

      expect(options.rowOffset).to.equal(10);
    });
    it('should set rowOffset to the offset of the last page when paging scheme is paginate', function() {
      options.pagingScheme = 'page';
      scope.$digest();
      options.rowOffset = 24;
      options.row_limit = 8;
      

      // drop last 10 elements
      data.splice(20,10);
      scope.$digest();
      expect(options.rowOffset).to.equal(16);
    });
  });

});