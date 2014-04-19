'use strict';

describe('Directive: dtDynamic', function () {

  // load the directive's module
  beforeEach(module('apTableApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<dt-dynamic></dt-dynamic>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the dtDynamic directive');
  }));
});
