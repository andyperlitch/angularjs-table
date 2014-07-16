'use strict';
describe('Service: tableFormatFunctions', function() {

  beforeEach(module('datatorrent.mlhrTable'));

  var formats;

  beforeEach(inject(['tableFormatFunctions', function(tableFormats) {
    formats = tableFormats;
  }]));

  it('should return an object containing functions', function() {
    expect(formats).to.be.an('object');
    angular.forEach(formats, function(fn) {
      expect(fn).to.be.a('function');
    });
  });

});