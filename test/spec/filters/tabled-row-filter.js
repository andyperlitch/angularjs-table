describe('Filter: tabledRowFilter', function() {

  // load the filter's module
  beforeEach(module('andyperlitch.ngTabled'));

  var columns, rows, searchTerms, filter, fakeSearchFn1, fakeSearchFn2, sandbox;

  beforeEach(inject(['tabledRowFilterFilter', function(f){
    filter = f;

    sandbox = sinon.sandbox.create();

    fakeSearchFn1 = function(term, value, computedValue, row) {
      return value === term;
    }

    fakeSearchFn2 = function(term, value, computedValue, row) {
      return value === 20;
    }

    columns = [
      { id: 'fname', key: 'fname', filter: fakeSearchFn1, format: sandbox.stub().returns('FORMATTED') },
      { id: 'col2', key: 'col2', filter: fakeSearchFn2 },
      { id: 'col3', key: 'col3', filter: 'like' },
      { id: 'col4', key: 'col4', filter: 'invalidFilterName' }
    ];
    rows = [
      { fname: 'phu', col2: 10, col3: 'foo' },
      { fname: 'amol', col2: 20, col3: 'foobar' },
      { fname: 'henry', col2: 30, col3: 'bar' }
    ];
    searchTerms = {};
  }]));

  afterEach(function() {
      sandbox.restore();
  });

  it('should return all rows if no search terms are set', function() {
    expect(filter(rows, columns, searchTerms)).to.equal(rows);
  });

  it('should ignore search terms that are empty strings or only whitespace', function() {
    ['', ' ', '  '].forEach(function(val) {
      searchTerms.fname = val;
      expect(filter(rows, columns, searchTerms)).to.equal(rows); 
    });
  });

  it('should turn on a search function when a value is present in searchTerms', function() {
    searchTerms.fname = 'phu';
    var results = filter(rows, columns, searchTerms);
    expect( results.length ).to.equal(1);
    expect( results[0] ).to.equal(rows[0]);

    searchTerms.fname = '';
    searchTerms.col2 = 'some search';
    var results2 = filter(rows, columns, searchTerms);
    expect( results2.length ).to.equal(1);
    expect( results2[0] ).to.equal(rows[1]);    
  });

  it('should ignore invalid predefined filter names', function() {
    searchTerms.col4 = 'some search';
    var results = filter(rows, columns, searchTerms);
    expect(results).to.equal(rows);
  });

  it('should replace string references to built-in filter functions with actual functions', function() {
    searchTerms.col3 = 'foo';
    filter(rows, columns, searchTerms);
    expect(columns[2].filter).to.be.a('function');
  });

  it('should call the filter function with term, value, computedValue, and the row in that order', function() {
    // spy on filter fn
    sandbox.spy(columns[0], 'filter');
    searchTerms.fname = 'test search';
    filter(rows, columns, searchTerms);
    expect(columns[0].filter).to.have.been.calledWith('test search','phu','FORMATTED',rows[0]);
    expect(columns[0].filter).to.have.been.calledWith('test search','amol','FORMATTED',rows[1]);
    expect(columns[0].filter).to.have.been.calledWith('test search','henry','FORMATTED',rows[2]);
  });

});