'use strict';

describe('Directive: apMesaSelector', function () {

  var element, scope, rootScope, isoScope, compile, sandbox, selected, row, column;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    
    // define mock objects here
  });

  // load the directive's module
  beforeEach(module('apMesa', function($provide) {
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
    scope.selected = selected = [];
    scope.row = row = { id: 1 };
    scope.column = column = { key: 'id' };

    // Define and compile the element
    element = angular.element('<div ap-mesa-selector></div>');
    element = compile(element)(scope);
    scope.$digest();
    isoScope = element.isolateScope();
  }));

  afterEach(function() {
    sandbox.restore();
  });

  describe('the click event', function() {
    var e;
    beforeEach(function() {
      e = $.Event('click');
    });

    it('should add row[column.key] to the selected array if it is not present already', function() {
      $(element).trigger(e);
      scope.$digest();
      expect(selected).to.contain(row[column.key]);
    });

    it('when "selectObject: true" is specified in column, should add the entire row(an object instead of a number/string) to the selected array if it is not present already', function() {
      column.selectObject = true;
      $(element).trigger(e);
      scope.$digest();
      for(var i = 0; i<selected.length; i++) {
        expect(typeof selected[i]).to.equal('object');
      }
      expect(selected).to.contain(row);
    });

    it('should remove row[column.key] from the selected array if it is present', function() {
      selected.push(row[column.key]);
      $(element).trigger(e);
      scope.$digest();
      expect(selected).not.to.contain(row[column.key]);
    });

  });

});
