'use strict';
describe('Service: tableFormatFunctions', function() {

  beforeEach(module('andyperlitch.apTable'));

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

  describe('the "selector" formatter', function() {
    
    it('should exist', function() {
      expect(formats.selector).to.be.a('function');
    });

  });

});