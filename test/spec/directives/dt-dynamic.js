'use strict';

describe('Directive: dt-dynamic', function () {

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
    // scope.checker = false;
    scope.injectedHtml = '<div ng-init="row.foo = \'bar\';"></div>';
    scope.row = {};
    scope.column = {};
    scope.selected = [];

    // Define and compile the element
    element = angular.element('<div dt-dynamic="injectedHtml" row="row" column="column" selected="selected"></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should compile the injected html', function() {
    expect(scope.row.foo).to.equal('bar');
  });

  it('should watch for changes on injected html', function() {
    scope.injectedHtml = '<div ng-init="row.foo = \'baz\';"></div>';
    scope.$digest();
    expect(scope.row.foo).to.equal('baz');
  });

});