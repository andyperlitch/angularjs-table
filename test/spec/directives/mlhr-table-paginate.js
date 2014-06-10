'use strict';

describe('Directive: mlhrTablePaginate', function () {

  var element, scope, rootScope, isoScope, compile, sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('datatorrent.mlhrTable', function($provide) {
    // Inject dependencies like this:
    // $provide.value('', mockThing);

  }));

  beforeEach(inject(function ($compile, $rootScope) {
    // Cache these for reuse    
    rootScope = $rootScope;
    compile = $compile;

    // Other setup, e.g. helper functions, etc.

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.filterState = {
      filterCount: 30
    };
    scope.options = {
      row_limit: 5,
      rowOffset: 0
    };

    // Define and compile the element
    element = angular.element('<div mlhr-table-paginate="options" filter-state="filterState"></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should set methods: isCurrentPage, goToPage, decrementPage, incrementPage', function() {
    ['isCurrentPage', 'goToPage', 'decrementPage', 'incrementPage'].forEach(function(method) {
      expect(isoScope[method]).to.be.a('function');
    });
  });

  it('should clear out the element html if row_limit is set to <= 0', function() {
    scope.options.row_limit = 0;
    scope.$digest();
    expect(element.html()).to.equal('');
  });

  describe('method: isCurrentPage', function() {
    var fn;
    beforeEach(function() {
      fn = isoScope.isCurrentPage;
    });
    
    it('should return false for any given number if row_limit is <= 0', function() {
      scope.options.row_limit = 0;
      expect(fn(1)).to.equal(false);
      expect(fn(0)).to.equal(false);
      expect(fn(12)).to.equal(false);
    });

    it('should return true if the rowOffset is equal to i * row_limit', function() {
      scope.options.rowOffset = 10;
      expect(fn(2)).to.equal(true);
      scope.options.rowOffset = 15;
      expect(fn(3)).to.equal(true);
    });

    it('should return false if rowOffset is not equal to i * row_limit', function() {
      scope.options.rowOffset = 10;
      expect(fn(3)).to.equal(false);
      scope.options.rowOffset = 15;
      expect(fn(2)).to.equal(false);
    });

  });

  describe('method: goToPage', function() {
    var fn;
    beforeEach(function() {
      fn = isoScope.goToPage;
    });

    it('should set the rowOffset to i * row_limit', function() {
      fn(3);
      expect(scope.options.rowOffset).to.equal(3 * scope.options.row_limit);
    });

    it('should throw if i is negative', function() {
      expect(fn.bind({},-1)).to.throw();
    });
  });

  describe('method: decrementPage', function() {
    var fn;
    beforeEach(function() {
      fn = isoScope.decrementPage;
    });
    it('should subtract row_limit from current rowOffset', function() {
      scope.options.rowOffset = 10;
      fn();
      expect(scope.options.rowOffset).to.equal(10 - scope.options.row_limit);
    });
    it('should never set it to negative offset, even if rowOffset is unexpected value', function() {
      scope.options.rowOffset = 2;
      fn();
      expect(scope.options.rowOffset).to.equal(0);
    });
  });

  describe('method: incrementPage', function() {
    var fn;
    beforeEach(function() {
      fn = isoScope.incrementPage;
    });
    it('should add row_limit to current rowOffset', function() {
      scope.options.rowOffset = 0;
      fn();
      expect(scope.options.rowOffset).to.equal(scope.options.row_limit);
    });
    it('should never set offset to greater than number of filtered rows available minus 1', function() {
      scope.options.rowOffset = 28;
      fn();
      expect(scope.options.rowOffset).to.equal(29);
    });
  });



});