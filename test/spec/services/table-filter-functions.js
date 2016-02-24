'use strict';
describe('Service: apMesaFilterFunctions', function() {

  beforeEach(module('apMesa'));

  var tff;

  beforeEach(inject(['apMesaFilterFunctions', function(apMesaFilterFunctions) {
    tff = apMesaFilterFunctions;
  }]));

  it('should return an object containing functions', function() {
    expect(tff).to.be.an('object');
    angular.forEach(tff, function(fn) {
      expect(fn).to.be.a('function');
    });
  });

  describe('the like filter', function() {

    var fn;

    beforeEach(function() {
      fn = tff.like;
    });

    it('should be on the service', function() {
      expect(fn).to.be.a('function');
    });

    it('should return true if the search term appears in the value', function() {
      expect( fn('tea', 'team') ).to.equal(true);
    });

    it('should return false if the search term does not appear in the value', function() {
      expect( fn('i', 'team') ).to.equal(false);
    });

    it('should be case-insensitive', function() {
      expect( fn('tea', 'Team') ).to.equal(true);
    });

    it('should trim the input', function() {
      expect( fn('tea ', 'Team') ).to.equal(true);
    });

    describe('when term is negated', function() {

      it('should return false if the term appears in the value', function() {
        expect( fn('!tea', 'team') ).to.equal(false);
      });

      it('should return true if the term does not appear in the value', function() {
        expect( fn('!i', 'team') ).to.equal(true);
      });

      it('should allow whitespace before the !', function() {
        expect( fn(' !tea', 'team') ).to.equal(false);
        expect( fn('  !i', 'team') ).to.equal(true);
      });

      it('should ignore escaped characters', function() {
        expect( fn('\\!test', '!testing')).to.equal(true);
      });

      it('should return true if nothing comes after the !', function() {
        expect( fn('!', 'anything')).to.equal(true);
      });

    });

    describe('when term is set to strict equal', function() {
      it('should return true only if the term matches the value', function() {
        expect( fn('=me', 'me') ).to.equal(true);
      });
      it('should return false if term does not perfectly match value', function() {
        expect( fn('=me', 'mel') ).to.equal(false);
      });
      it('should ignore escaped characters', function() {
        expect( fn('\\=test', '=testing') ).to.equal(true);
      });
    });
    
  });

  describe('the likeFormatted filter', function() {

    var fn;

    beforeEach(function() {
      fn = tff.likeFormatted;
    });

    it('should be on the service', function() {
      expect(fn).to.be.a('function');
    });

    it('should return true if the search term appears in the formatted value', function() {
      expect( fn('tea', 't', 'team') ).to.equal(true);
    });

    it('should return false if the search term does not appear in the formatted value', function() {
      expect( fn('i', 'iiii', 'team') ).to.equal(false);
    });

    it('should be case-insensitive', function() {
      expect( fn('tea', 't', 'Team') ).to.equal(true);
    });

    it('should trim the input', function() {
      expect( fn('tea ', 't', 'Team') ).to.equal(true);
    });

    describe('when term is negated', function() {

      it('should return false if the term appears in the value', function() {
        expect( fn('!tea', 'ae', 'team') ).to.equal(false);
      });

      it('should return true if the term does not appear in the value', function() {
        expect( fn('!i', 'iii', 'team') ).to.equal(true);
      });

    });

    describe('when term is set to strict equal', function() {
      it('should return true only if the term matches the value', function() {
        expect( fn('=me', 'um', 'me') ).to.equal(true);
      });
      it('should return false if term does not perfectly match value', function() {
        expect( fn('=me', 'bale', 'mel') ).to.equal(false);
      });
    });

  });

  describe('the number filter', function() {

    var fn;

    beforeEach(function() {
      fn = tff.number;
    });

    afterEach(function() {
      fn = null;
    });

    it('should behave like the "like" filter when no expressions are present', function() {
      expect( fn('10','100') ).to.equal(true);
      expect( fn(' 10','100') ).to.equal(true);
      expect( fn('-10', '-101') ).to.equal(true);
    });

    it('should allow strict comparison', function() {
      expect( fn('=10','10') ).to.equal(true);
      expect( fn(' =10','10') ).to.equal(true);
      expect( fn('=10','100') ).to.equal(false);
      expect( fn('=-10','-10') ).to.equal(true);
    });

    it('should use parseFloat for strict comparison', function() {
      expect( fn('=1.1','1.1em') ).to.equal(true);
      expect( fn('=-1.1','-1.1em') ).to.equal(true);
    });

    it('should round the value for approximate comparison', function() {
      expect( fn('~10', '10.2') ).to.equal(true);
      expect( fn(' ~10', '10.1') ).to.equal(true);
      expect( fn(' ~10', '10.9') ).to.equal(false);
      expect( fn('~-5', '-5.1') ).to.equal(true);
    });

    describe('less than or equal to', function() {

      it('should return true for a lesser value', function() {
        expect( fn('<=10', '8')).to.equal(true);
      });

      it('should return true for an equal value', function() {
        expect( fn('<=30', '30')).to.equal(true);
      });

      it('should return false for greater value', function() {
        expect( fn('<=3', '5')).to.equal(false);
      });

      it('should work for values with units in them', function() {
        expect( fn('<=4', '3px')).to.equal(true);
        expect( fn('<=4', '5px')).to.equal(false);
        expect( fn('<=4', '4px')).to.equal(true);
      });

      it('should work for negative numbers', function() {
        expect( fn('<=-2', '-5')).to.equal(true);
        expect( fn('<=-2', '-1')).to.equal(false);
        expect( fn('<=-2', '-2')).to.equal(true);
      });

    });

    describe('greater than or equal', function() {

      it('should return true for a greater value', function() {
        expect( fn('>=3', '12')).to.equal(true);
      });

      it('should return true for an equal value', function() {
        expect( fn('>=42', '42')).to.equal(true);
      });

      it('should return false for lesser values', function() {
        expect( fn('>=10', '9')).to.equal(false);
      });

      it('should work for values with units in them', function() {
        expect( fn('>=4', '3px')).to.equal(false);
        expect( fn('>=4', '5px')).to.equal(true);
        expect( fn('>=4', '4px')).to.equal(true);
      });

      it('should work for negative numbers', function() {
        expect( fn('>=-2', '-5')).to.equal(false);
        expect( fn('>=-2', '-1')).to.equal(true);
        expect( fn('>=-2', '-2')).to.equal(true);
      });

    });

    describe('less than', function() {

      it('should return true for a lesser value', function() {
        expect( fn('<10', '8')).to.equal(true);
      });

      it('should return false for an equal value', function() {
        expect( fn('<30', '30')).to.equal(false);
      });

      it('should return false for greater value', function() {
        expect( fn('<3', '5')).to.equal(false);
      });

      it('should work for values with units in them', function() {
        expect( fn('<4', '3px')).to.equal(true);
        expect( fn('<4', '5px')).to.equal(false);
        expect( fn('<4', '4px')).to.equal(false);
      });

      it('should work for negative numbers', function() {
        expect( fn('<-2', '-5')).to.equal(true);
        expect( fn('<-2', '-1')).to.equal(false);
        expect( fn('<-2', '-2')).to.equal(false);
      });

    });

    describe('greater than', function() {

      it('should return true for a greater value', function() {
        expect( fn('>3', '12')).to.equal(true);
      });

      it('should return false for an equal value', function() {
        expect( fn('>42', '42')).to.equal(false);
      });

      it('should return false for lesser values', function() {
        expect( fn('>10', '9')).to.equal(false);
      });

      it('should work for values with units in them', function() {
        expect( fn('>4', '3px')).to.equal(false);
        expect( fn('>4', '5px')).to.equal(true);
        expect( fn('>4', '4px')).to.equal(false);
      });

      it('should work for negative numbers', function() {
        expect( fn('>-2', '-5')).to.equal(false);
        expect( fn('>-2', '-1')).to.equal(true);
        expect( fn('>-2', '-2')).to.equal(false);
      });

    });

  });

  describe('the numberFormatted filter', function() {
    var fn;

    beforeEach(function() {
      fn = tff.numberFormatted;
    });

    afterEach(function() {
      fn = null;
    });

    it('should be on the service', function() {
      expect(fn).to.be.a('function');
    });

    it('should behave like the regular number filter, but for the formatted value', function() {
      expect( fn('10', '90178','100') ).to.equal(true);
      expect( fn(' 10', '90178','100') ).to.equal(true);
      expect( fn('-10', '90178', '-101') ).to.equal(true);
      expect( fn('=10', '90178','10') ).to.equal(true);
      expect( fn(' =10', '90178','10') ).to.equal(true);
      expect( fn('=10', '90178','100') ).to.equal(false);
      expect( fn('=-10', '90178','-10') ).to.equal(true);
      expect( fn('=1.1', '90178','1.1em') ).to.equal(true);
      expect( fn('=-1.1', '90178','-1.1em') ).to.equal(true);
      expect( fn('~10', '90178', '10.2') ).to.equal(true);
      expect( fn(' ~10', '90178', '10.1') ).to.equal(true);
      expect( fn(' ~10', '90178', '10.9') ).to.equal(false);
      expect( fn('~-5', '90178', '-5.1') ).to.equal(true);
      expect( fn('<=10', '90178', '8')).to.equal(true);
      expect( fn('<=30', '90178', '30')).to.equal(true);
      expect( fn('<=3', '90178', '5')).to.equal(false);
      expect( fn('<=4', '90178', '3px')).to.equal(true);
      expect( fn('<=4', '90178', '5px')).to.equal(false);
      expect( fn('<=4', '90178', '4px')).to.equal(true);
      expect( fn('<=-2', '90178', '-5')).to.equal(true);
      expect( fn('<=-2', '90178', '-1')).to.equal(false);
      expect( fn('<=-2', '90178', '-2')).to.equal(true);
      expect( fn('>=3', '90178', '12')).to.equal(true);
      expect( fn('>=42', '90178', '42')).to.equal(true);
      expect( fn('>=10', '90178', '9')).to.equal(false);
      expect( fn('>=4', '90178', '3px')).to.equal(false);
      expect( fn('>=4', '90178', '5px')).to.equal(true);
      expect( fn('>=4', '90178', '4px')).to.equal(true);
      expect( fn('>=-2', '90178', '-5')).to.equal(false);
      expect( fn('>=-2', '90178', '-1')).to.equal(true);
      expect( fn('>=-2', '90178', '-2')).to.equal(true);
      expect( fn('<10', '90178', '8')).to.equal(true);
      expect( fn('<30', '90178', '30')).to.equal(false);
      expect( fn('<3', '90178', '5')).to.equal(false);
      expect( fn('<4', '90178', '3px')).to.equal(true);
      expect( fn('<4', '90178', '5px')).to.equal(false);
      expect( fn('<4', '90178', '4px')).to.equal(false);
      expect( fn('<-2', '90178', '-5')).to.equal(true);
      expect( fn('<-2', '90178', '-1')).to.equal(false);
      expect( fn('<-2', '90178', '-2')).to.equal(false);
      expect( fn('>3', '90178', '12')).to.equal(true);
      expect( fn('>42', '90178', '42')).to.equal(false);
      expect( fn('>10', '90178', '9')).to.equal(false);
      expect( fn('>4', '90178', '3px')).to.equal(false);
      expect( fn('>4', '90178', '5px')).to.equal(true);
      expect( fn('>4', '90178', '4px')).to.equal(false);
      expect( fn('>-2', '90178', '-5')).to.equal(false);
      expect( fn('>-2', '90178', '-1')).to.equal(true);
      expect( fn('>-2', '90178', '-2')).to.equal(false);
    });

  });

  describe('the date filter', function() {

    // < 1 day ago
    // < 10 minutes ago
    // < 10 min ago
    // < 10 minutes, 50 seconds ago
    // > 10 min, 30 sec ago
    // > 2 days ago
    
    var fn, units = {
      second: {
        ms: 1000,
        alias: ['s','sec']
      },
      minute: {
        ms: 1000*60,
        alias: ['min','m']
      },
      hour: {
        ms: 1000*60*60,
        alias: ['h','hr']
      },
      day: {
        ms: 1000*60*60*24,
        alias: ['d']
      },
      week: {
        ms: 1000*60*60*24*7,
        alias: ['w','wk']
      },
      month: {
        ms: 1000*60*60*24*7*4,
        alias: []
      },
      year: {
        ms: 1000*60*60*24*365,
        alias: ['y','yr']
      }
    };

    beforeEach(function() {
      fn = tff.date;
    });

    afterEach(function() {
      fn = null;
    });

    it('should be a function', function() {
      expect(fn).to.be.a('function');
    });

    it('should return true if only spaces are entered', function() {
      expect( fn(' ', +new Date() )).to.equal(true);
    });

    describe('< [TIME] expressions', function() {

      it('should return true if value is greater than search clause', function() {
        angular.forEach(units, function(obj, unit) {
          var now = +new Date();
          expect( fn('< 1 ' + unit + ' ago', now - obj.ms + 2)).to.equal(true);
          expect( fn('< 1 ' + unit + ' ago', now - obj.ms + 1000)).to.equal(true);
        });
      });

      it('should return false if value is less than search clause', function() {
        angular.forEach(units, function(obj, unit) {
          var now = +new Date();
          expect( fn('< 1 ' + unit + ' ago', now - obj.ms - 2)).to.equal(false);
          expect( fn('< 1 ' + unit + ' ago', now - obj.ms - 1000)).to.equal(false);
        });
      });

    });

    describe('> [TIME] expressions', function() {

      it('should return true if value is less than search clause', function() {
        angular.forEach(units, function(obj, unit) {
          var now = +new Date();
          expect( fn('> 1 ' + unit + ' ago', now - obj.ms - 2)).to.equal(true);
          expect( fn('> 1 ' + unit + ' ago', now - obj.ms - 1000)).to.equal(true);
        });
      });

      it('should return false if value is greater than search clause', function() {
        angular.forEach(units, function(obj, unit) {
          var now = +new Date();
          expect( fn('> 1 ' + unit + ' ago', now - obj.ms + 2)).to.equal(false);
          expect( fn('> 1 ' + unit + ' ago', now - obj.ms + 1000)).to.equal(false);
        });
      });

    });

    it('should support multi-clause search terms', function() {
      var now = +new Date();
      expect( fn('> 1 day, 1 hour ago', now - units.day.ms - units.hour.ms - 100)).to.equal(true);
      expect( fn('> 1 day, 1 hour ago', now - units.day.ms - units.hour.ms + 100)).to.equal(false);
      expect( fn('< 1 day, 1 hour ago', now - units.day.ms - units.hour.ms - 100)).to.equal(false);
      expect( fn('< 1 day, 1 hour ago', now - units.day.ms - units.hour.ms + 100)).to.equal(true);
    });

    it('should work without "ago"', function() {
      var now = +new Date();
      expect( fn('> 1 day, 1 hour', now - units.day.ms - units.hour.ms - 100)).to.equal(true);
      expect( fn('> 1 day, 1 hour', now - units.day.ms - units.hour.ms + 100)).to.equal(false);
      expect( fn('< 1 day, 1 hour', now - units.day.ms - units.hour.ms - 100)).to.equal(false);
      expect( fn('< 1 day, 1 hour', now - units.day.ms - units.hour.ms + 100)).to.equal(true);
    });

    it('should work without spaces', function() {
      var now = +new Date();
      expect( fn('>1day,1hour', now - units.day.ms - units.hour.ms - 100)).to.equal(true);
      expect( fn('>1d,1hr', now - units.day.ms - units.hour.ms - 100)).to.equal(true);
      expect( fn('>1day,1hour', now - units.day.ms - units.hour.ms + 100)).to.equal(false);
      expect( fn('>1d,1hr', now - units.day.ms - units.hour.ms + 100)).to.equal(false);
      expect( fn('<1day,1hour', now - units.day.ms - units.hour.ms - 100)).to.equal(false);
      expect( fn('<1d,1hr', now - units.day.ms - units.hour.ms - 100)).to.equal(false);
      expect( fn('<1day,1hour', now - units.day.ms - units.hour.ms + 100)).to.equal(true);
      expect( fn('<1d,1hr', now - units.day.ms - units.hour.ms + 100)).to.equal(true);
    });

    it('should ignore leading spaces', function() {
      var now = +new Date();
      expect( fn(' >1day,1hour', now - units.day.ms - units.hour.ms - 100)).to.equal(true);
      expect( fn(' >1d,1hr', now - units.day.ms - units.hour.ms - 100)).to.equal(true);
      expect( fn(' >1day,1hour', now - units.day.ms - units.hour.ms + 100)).to.equal(false);
      expect( fn(' >1d,1hr', now - units.day.ms - units.hour.ms + 100)).to.equal(false);
      expect( fn(' <1day,1hour', now - units.day.ms - units.hour.ms - 100)).to.equal(false);
      expect( fn(' <1d,1hr', now - units.day.ms - units.hour.ms - 100)).to.equal(false);
      expect( fn(' <1day,1hour', now - units.day.ms - units.hour.ms + 100)).to.equal(true);
      expect( fn(' <1d,1hr', now - units.day.ms - units.hour.ms + 100)).to.equal(true);
    });

    it('should ignore invalid clauses', function() {
      var now = +new Date();
      expect( fn('>1day,awesome widget,1hour', now - units.day.ms - units.hour.ms - 100)).to.equal(true);
      expect( fn('<1day,awesome widget,1hour', now - units.day.ms - units.hour.ms - 100)).to.equal(false);
    });

    it('should ignore clauses with invalid units', function() {
      var now = +new Date();
      expect( fn('>1day,1widget,1hour', now - units.day.ms - units.hour.ms - 100)).to.equal(true);
      expect( fn('<1day,1widget,1hour', now - units.day.ms - units.hour.ms - 100)).to.equal(false);
    });

    describe('[DATE] expression', function() {

      it('should return true for values that land on search day', function() {
        var mar_31_14 = 1396304704216;
        var mar_8_14  = 1394304704216;
        // Test is ignored due to Date('YYYY-MM-DD') creation issues in PhantomJS. Waiting for PhantomJS 2.0 to be available as NPM module.  Ref: https://github.com/ariya/phantomjs/issues/10187 
        //expect( fn('2014-3-31', mar_31_14)).to.equal(true);
        //expect( fn('2014-3-31', mar_8_14)).to.equal(false);
      });

      it('should allow "today" as a valid search', function() {
        expect( fn('today', +new Date())).to.equal(true);
        expect( fn('today', +new Date() - units.day.ms )).to.equal(false);
      });

      it('should allow "yesterday" as a valid search', function() {
        expect( fn('yesterday', +new Date() - units.day.ms )).to.equal(true);
        expect( fn('yesterday', +new Date())).to.equal(false);
      });

      it('should return false if it is an invalid date string', function() {
        expect( fn('last monday', +new Date() - units.day.ms )).to.equal(false);
      });

    });

  });

});
