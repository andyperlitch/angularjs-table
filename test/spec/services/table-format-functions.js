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

  describe('the "selector" formatter', function() {

    var row, column;

    beforeEach(function() {
      row = { test: 'here', id: '1' };
      column = { key: 'id' };        
    });
    
    it('should exist', function() {
      expect(formats.selector).to.be.a('function');
    });

    it('should have trustAsHtml set to true', function() {
      expect(formats.selector.trustAsHtml).to.equal(true);
    });

    it('should return a string', function() {
      var result = formats.selector('1', row, column);
      expect(result).to.be.a('string');
    });

    it('should throw if column.key was not found in the row', function() {
      delete row.id;
      var fn = function() {
        formats.selector('1', row, column);
      }
      expect(fn).to.throw();
    });

  });

});