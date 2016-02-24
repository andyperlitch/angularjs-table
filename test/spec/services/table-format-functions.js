'use strict';
describe('Service: apMesaFormatFunctions', function() {

  beforeEach(module('apMesa'));

  var formats;

  beforeEach(inject(['apMesaFormatFunctions', function(tableFormats) {
    formats = tableFormats;
  }]));

  it('should return an object containing functions', function() {
    expect(formats).to.be.an('object');
    angular.forEach(formats, function(fn) {
      expect(fn).to.be.a('function');
    });
  });

});
