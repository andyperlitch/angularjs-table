'use strict';

describe('Service: tableSortFunctions', function() {

  var sandbox, sorts;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  beforeEach(module('apMesa'));

  beforeEach(inject(['apMesaSortFunctions', function(s) {
    sorts = s;
  }]));

  afterEach(function() {
    sandbox.restore();
  });

  it('should be an object', function() {
    expect(sorts).to.be.an('object');
  });

  describe('number sorting', function() {
    
    var factory, sorter;

    beforeEach(function() {
      factory = sorts.number;
      sorter = factory('fieldname');
    });

    it('should be a function', function() {
      expect(factory).to.be.a('function');
    });

    it('should return a function', function() {
      expect(sorter).to.be.a('function');
    });

    it('should return less than 0 if the value in first object is less than that of second', function() {
      expect( sorter( { fieldname: 1 }, { fieldname: 3 } ) ).to.be.below(0);
    });

    it('should return greater than 0 if the value in first object is more than that of second', function() {
      expect( sorter( { fieldname: 3 }, { fieldname: 1 } ) ).to.be.above(0);
    });

    it('should return 0 if values on both objects are the same', function() {
      expect( sorter( { fieldname: 5 }, { fieldname: 5 } ) ).to.equal(0);
    });

    it('should try and convert strings', function() {
      expect( sorter( { fieldname: '1' }, { fieldname: '3' } ) ).to.be.below(0);
      expect( sorter( { fieldname: '3' }, { fieldname: '1' } ) ).to.be.above(0);
      expect( sorter( { fieldname: '5' }, { fieldname: '5' } ) ).to.equal(0);
    });

  });

  describe('number formatted sorting', function() {
    
    var factory, sorter, pseudoColumn, lookup;

    beforeEach(function() {
      factory = sorts.numberFormatted;
      sorter = factory('fieldname');
      lookup = {
        1: 10,
        2: 9,
        3: 8,
        5: 11,
        7: 11,
        9: '1',
        10: '2',
        11: '3'
      };
      pseudoColumn = {
        format: function(raw) {
          return lookup[raw];
        }
      };
    });

    it('should be a function', function() {
      expect(factory).to.be.a('function');
    });

    it('should return a function', function() {
      expect(sorter).to.be.a('function');
    });

    it('should return less than 0 if the value in first object is less than that of second', function() {
      expect( sorter( { fieldname: 3 }, { fieldname: 1 }, {}, pseudoColumn ) ).to.be.below(0);
      expect( sorter( { fieldname: 3 }, { fieldname: 2 }, {}, pseudoColumn ) ).to.be.below(0);
    });

    it('should return greater than 0 if the value in first object is more than that of second', function() {
      expect( sorter( { fieldname: 1 }, { fieldname: 2 }, {}, pseudoColumn ) ).to.be.above(0);
      expect( sorter( { fieldname: 1 }, { fieldname: 3 }, {}, pseudoColumn ) ).to.be.above(0);
    });

    it('should return 0 if values on both objects are the same', function() {
      expect( sorter( { fieldname: 5 }, { fieldname: 7 }, {}, pseudoColumn ) ).to.equal(0);
    });

    it('should try and convert strings', function() {
      expect( sorter( { fieldname: '9' }, { fieldname: '10' }, {}, pseudoColumn ) ).to.be.below(0);
      expect( sorter( { fieldname: '11' }, { fieldname: '10' }, {}, pseudoColumn ) ).to.be.above(0);
      expect( sorter( { fieldname: '11' }, { fieldname: '11' }, {}, pseudoColumn ) ).to.equal(0);
    });

  });

  describe('string sorting', function() {

    var factory, sorter;

    beforeEach(function() {
      factory = sorts.string;
      sorter = factory('fieldname');
    });

    it('should be a function', function() {
      expect(factory).to.be.a('function');
    });

    it('should return a function', function() {
      expect(sorter).to.be.a('function');
    });

    it('should return less than 0 if the first value is alphabetically before the second value', function() {
      expect(sorter({fieldname: 'a'},{fieldname: 'b'})).to.be.below(0);
    });

    it('should return greater than 0 if the first value is alphabetically after the second value', function() {
      expect(sorter({fieldname: 'c'},{fieldname: 'b'})).to.be.above(0);
    });

    it('should return 0 if both are the same', function() {
      expect(sorter({fieldname: 'c'},{fieldname: 'c'})).to.equal(0);
    });

    it('should ignore case when comparing', function() {
      expect(sorter({fieldname: 'c'},{fieldname: 'C'})).to.equal(0);
    });

  });

  describe('string formatted sorting', function() {

    var factory, sorter, pseudoColumn, lookup;

    beforeEach(function() {
      factory = sorts.stringFormatted;
      sorter = factory('fieldname');
      lookup = {
        a: 'z',
        b: 'x',
        c: 'y',
        d: 'y'
      };
      pseudoColumn = {
        format: function(raw) {
          return lookup[raw];
        }
      };
    });

    it('should be a function', function() {
      expect(factory).to.be.a('function');
    });

    it('should return a function', function() {
      expect(sorter).to.be.a('function');
    });

    it('should return less than 0 if the first formatted value is alphabetically before the second formatted value', function() {
      expect(sorter({fieldname: 'b'},{fieldname: 'a'}, {}, pseudoColumn)).to.be.below(0);
    });

    it('should return greater than 0 if the first formatted value is alphabetically after the second formatted value', function() {
      expect(sorter({fieldname: 'a'},{fieldname: 'b'}, {}, pseudoColumn)).to.be.above(0);
    });

    it('should return 0 if both are the same', function() {
      expect(sorter({fieldname: 'c'},{fieldname: 'c'}, {}, pseudoColumn)).to.equal(0);
    });

    it('should ignore case when comparing', function() {
      expect(sorter({fieldname: 'c'},{fieldname: 'd'}, {}, pseudoColumn)).to.equal(0);
    });

  });

});
