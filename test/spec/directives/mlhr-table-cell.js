'use strict';

describe('Directive: ap-mesa-cell', function () {

  var element, scope, rootScope, isoScope, compile;

  beforeEach(function() {
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('apMesa', function($provide, $filterProvider) {
    // Inject dependencies like this:
    $filterProvider.register('commaGroups', function() {
      function commaGroups(value) {
        if (typeof value === 'undefined') {
          return '-';
        }
        var parts = value.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
      }
      return commaGroups;
    });

  }));

  beforeEach(inject(function ($compile, $rootScope) {
    // Cache these for reuse    
    rootScope = $rootScope;
    compile = $compile;

    // Other setup, e.g. helper functions, etc.

    // Set up the outer scope
    scope = $rootScope.$new();
    scope.column = {
      id: 'id',
      key: 'id'
    };
    scope.row = {
      id: 'hello'
    };
    scope.options = {};

  }));

  afterEach(function() {
    // tear down here
  });

  describe('when a template is specified', function() {
    
    beforeEach(function() {
      scope.column.template = '<strong>{{ row[column.key] }}</strong>';
      // Define and compile the element
      element = angular.element('<div ap-mesa-cell></div>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    });

    it('should recompile the cell with the supplied template', function() {
      var strong = element.find('strong');
      expect(strong.length).to.equal(1);
      expect(strong.text()).to.equal(scope.row.id);
    });

  });

  describe('when a templateUrl is specified', function() {
    beforeEach(inject(function($templateCache) {
      scope.column.templateUrl = 'some/url.html';
      $templateCache.put(scope.column.templateUrl, '<strong>{{ row[column.key] }}</strong>');

      // Define and compile the element
      element = angular.element('<div ap-mesa-cell></div>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    }));

    it('should recompile the cell with the supplied templateUrl', function() {
      var strong = element.find('strong');
      expect(strong.length).to.equal(1);
      expect(strong.text()).to.equal(scope.row.id);
    });
  });

  describe('when an ngFilter is specified', function() {
    beforeEach(inject(function($templateCache) {
      scope.column.ngFilter = 'commaGroups';
      scope.row.id = '1000000';
      $templateCache.put(scope.column.templateUrl, '<strong>{{ row[column.key] }}</strong>');

      // Define and compile the element
      element = angular.element('<div ap-mesa-cell></div>');
      element = compile(element)(scope);
      scope.$digest();
      isoScope = element.isolateScope();
    }));

    it('should recompile the cell with the supplied filter', function() {
      var str = element.text();
      expect(str).to.equal('1,000,000');
    });

    afterEach(function() {
      delete scope.column.ngFilter;
    });
  });

  describe('when a getter is specified on options', function() {
    beforeEach(function() {
      scope.row.data = {
        id: 'hello2 in row.data'
      };
      scope.options.getter = function(key, row) {
        return row.data[key];
      };
      element = angular.element('<div ap-mesa-cell></div>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('should use getter', function() {
      expect(element.text()).to.equal(scope.row.data.id);
    });
  });

});
