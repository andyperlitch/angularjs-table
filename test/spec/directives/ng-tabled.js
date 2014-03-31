'use strict';

describe('Directive: ngTabled', function () {

  // load the directive's module
  beforeEach(module('andyperlitch.ngTabled'));

  var element,
  scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.list = [{name: 'tst'},{name:'sae'},{name:'dkos'}]
  }));

  it('should create a table', inject(['$compile', '$rootScope', function ($compile) {
    element = angular.element('<ng-tabled></ng-tabled>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('table').length).to.equal(1);
  }]));

});

describe('Service: tabledFilterFunctions', function() {

  beforeEach(module('andyperlitch.ngTabled'));

  var tff;

  beforeEach(inject(['tabledFilterFunctions', function(tabledFilterFunctions) {
    tff = tabledFilterFunctions;
  }]));

  it('should return an object containing functions', function() {
    expect(tff).to.be.an('object');
    angular.forEach(tff, function(fn, name) {
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
    });

  });

});

// describe('Filter: tabledRowFilter', function() {

//   // load the filter's module
//   beforeEach(module('andyperlitch.ngTabled'));

//   var columns, rows, searchTerms;

//   beforeEach(function() {
//     columns = [
//       { id: 'col1', key: 'col1', filter: 'like' },
//       { id: 'col2', key: 'col2', filter: 'number' }
//     ];
//     rows = [
//       { col1: 'andy', col2: 10 },
//       { col1: 'scott', col2: 20 }
//     ];
//     searchTerms = {

//     };
//   });

//   it('should return all rows if no search terms are set', inject(function(tabledRowFilter){
//     expect(tabledRowFilter(rows, columns, searchTerms)).to.deepEqual(rows);
//   }));

// });