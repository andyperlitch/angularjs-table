'use strict';

describe('Directive: apPaginate', function () {

  var element, scope, rootScope, isoScope, compile, sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('andyperlitch.apTable', function($provide) {
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
    scope.filterState = {};
    scope.options = {};

    // Define and compile the element
    element = angular.element('<div ap-paginate="options" filter-state="filterState"></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  // it('should do something', function() {
    
  // });

});