'use strict';

describe('Directive: apMesa', function () {

  var element,
  scope,
  isoScope,
  compile,
  timeout,
  genRows,
  columns,
  filter_title,
  filter_placeholder,
  data,
  mockLog,
  sandbox,
  createElement;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    mockLog = {
      warn: sandbox.spy()
    };
  });

  // load the directive's module
  beforeEach(module('apMesa', function($provide) {
    $provide.value('$log', mockLog);
  }));

  beforeEach(inject(function ($compile, $rootScope, $timeout) {
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
    timeout = $timeout;

    // Table columns
    scope.my_table_columns = columns = [
      { id: 'selector',   key: 'selected',   label: '',                                            selector: true, width: '30px', lockWidth: true },
      { id: 'ID',         key: 'id',                              sort: 'number', filter: 'number'                                               },
      { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like',  title: 'First names are cool'                 },
      { id: 'last_name',  key: 'last_name',  label: 'Last Name',  sort: 'string', filter: 'like',  filter_placeholder: 'last name'               },
      { id: 'age',        key: 'age',        label: 'Age',        sort: 'number', filter: 'number'                                               },
      { id: 'height',     key: 'height',     label: 'Height',     sort: 'number', filter: feet_filter, format: inches2feet                       },
      { id: 'weight',     key: 'weight',     label: 'Weight',     sort: 'number', filter: 'number'                                               }
    ];

    // Table data
    scope.my_table_data = data = genRows(30);

    createElement = function() {
      element = angular.element('<ap-mesa columns="my_table_columns" rows="my_table_data" class="table" track-by="id"></ap-mesa>');
      element = compile(element)(scope);
      timeout.flush();
      scope.$digest();
      isoScope = element.isolateScope();
      // for (var k in isoScope) {
      //   if (isoScope.hasOwnProperty(k)) {
      //     // console.log('k: ', k, 'scope[k]', isoScope[k]);
      //     console.log(k);
      //   }
      // }
    };

    createElement();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should be okay with a delayed data set', function() {
    scope.my_table_data = undefined;
    // expect(createElement).not.to.throw();
    createElement();
  });

  it('should create two tables', function () {
    expect(element.find('table').length).to.equal(2);
  });

  it('should create an options object if one is not provided', function() {
    expect(isoScope.options).to.be.an('object');
  });

  it('should display the data passed to it', function () {
    var expected = data[0].first_name;
    var actual = element.find('table:eq(1) tbody.ap-mesa-rendered-rows tr:eq(0) td:eq(2)').text();
    actual = $.trim(actual);
    expect(actual).to.equal(expected);
  });

  it('should update displayed values when data has been updated', function() {
    scope.my_table_data = genRows(30);
    timeout.flush();
    scope.$apply();
    var expected = scope.my_table_data[0].first_name;
    var actual = element.find('table:eq(1) tbody.ap-mesa-rendered-rows tr:eq(0) td:eq(2)').text();
    actual = $.trim(actual);
    expect(actual).to.equal(expected);
  });

  it('should not throw if no columns array was found on the scope', inject(function($rootScope) {
    var scope2 = $rootScope.$new();
    scope2.rows = [];
    var el2 = angular.element('<ap-mesa columns="nonexistent_columns" rows="rows" class="table"></ap-mesa>');
    var fn = function() {
      el2 = compile(el2)(scope2);
      scope.$digest();
    };
    expect(fn).not.to.throw();
  }));

  it('should allow an options object to be passed, and should use override default options', inject(function($rootScope) {
    var $scope2 = $rootScope.$new();
    $scope2.columns = [];
    $scope2.rows = [];
    $scope2.options = {
      bgSizeMultiplier: 3
    };
    var el2 = angular.element('<ap-mesa columns="columns" rows="rows" options="options" class="table"></ap-mesa>');
    el2 = compile(el2)($scope2);
    $scope2.$digest();
    isoScope = el2.isolateScope();
    expect(isoScope.options.bgSizeMultiplier).to.equal(3);
  }));

  it('should attach a persistentState.searchTerms object to the scope', function() {
    expect(isoScope.persistentState.searchTerms).to.be.an('object');
  });

  it('should attach a sortOrder array to the scope', function() {
    expect(isoScope.persistentState.sortOrder).to.be.instanceof(Array);
  });

  it('options.getter should be a function', function() {
    // isoScope.options.getter = function() {
    //   return 'valueFromGetter';
    // };
    if (isoScope.options !== undefined && {}.hasOwnProperty.call(isoScope.options, 'getter')) {
      expect(isoScope.options.getter).to.be.an('function');
    }
  });

  it('should set a default trackBy to "id"', function() {
    expect(isoScope.options.trackBy).to.equal('id');
  });

  describe('column header', function() {
    
    it('should have a .column-resizer element if lockWidth is not set', function() {
      expect(element.find('table:eq(0) th:eq(1) .column-resizer').length).to.equal(1);
    });

    it('should not have a .column-resizer element if lockWidth is set to true', function() {
      expect(element.find('table:eq(0) th:eq(0) .column-resizer').length).to.equal(0);
    });

    it('should set the style to column.width if supplied in column definition', function() {
      expect(element.find('table:eq(0) th:eq(0)').css('width')).to.equal(columns[0].width);
    });

    it('should display column.id if column.label is not specified', function() {
      var actual = $.trim(element.find('table:eq(0) th:eq(1) .column-text').text());
      expect(actual).to.equal(columns[1].id);
    });

    it('should display column.label if it is present', function() {
      var actual = $.trim(element.find('table:eq(0) th:eq(2) .column-text').text());
      expect(actual).to.equal(columns[2].label);
    });

    it('should display column.label if it is present, even if it is a falsey value', function() {
      var actual = $.trim(element.find('table:eq(0) th:eq(0) .column-text').text());
      expect(actual).to.equal(columns[0].label);
    });

    it('should attach a title (tooltip) to <th>s where title was specified in column definition', function() {
      var actual = element.find('table:eq(0) th:eq(2)').attr('title');
      var expected = columns[2].title;
      expect(actual).to.equal(expected);
    });

  });

  describe('column filter', function() {
    
    it('should have a placeholder if specified as a property on the filter function', function() {
      var actual = element.find('table:eq(0) tr:eq(1) td:eq(5) input').attr('placeholder');
      var expected = filter_placeholder;
      expect(actual).to.equal(expected);
    });

    it('should have a title if specified as a property on the filter function', function() {
      var actual = element.find('table:eq(0) tr:eq(1) td:eq(5) input').attr('title');
      var expected = filter_title;
      expect(actual).to.equal(expected);
    });

  });


});
