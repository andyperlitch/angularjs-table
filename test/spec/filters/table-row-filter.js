'use strict';

describe('Filter: apMesaRowFilter', function() {

  var columns, rows, persistentState, filter, fakeSearchFn1, fakeSearchFn2, sandbox, mockLog;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  // load the filter's module
  beforeEach(module('apMesa', function($provide) {
    mockLog = { warn: sandbox.spy() };
    $provide.value('$log', mockLog);
  }));

  beforeEach(inject(function($filter){
    filter = $filter('apMesaRowFilter');

    fakeSearchFn1 = function(term, value) {
      return value === term;
    };

    fakeSearchFn2 = function(term, value) {
      return value === 20;
    };

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
    persistentState = {
      searchTerms: {},
      sortOrder: []
    };
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should return all rows if no search terms are set', function() {
    expect(filter(rows, columns, persistentState, {})).to.equal(rows);
  });

  it('should ignore search terms that are empty strings or only whitespace', function() {
    ['', ' ', '  '].forEach(function(val) {
      persistentState.searchTerms.fname = val;
      expect(filter(rows, columns, persistentState, {})).to.equal(rows);
    });
  });

  it('should turn on a search function when a value is present in searchTerms', function() {
    persistentState.searchTerms.fname = 'phu';
    var results = filter(rows, columns, persistentState, {});
    expect( results.length ).to.equal(1);
    expect( results[0] ).to.equal(rows[0]);

    persistentState.searchTerms.fname = '';
    persistentState.searchTerms.col2 = 'some search';
    var results2 = filter(rows, columns, persistentState, {});
    expect( results2.length ).to.equal(1);
    expect( results2[0] ).to.equal(rows[1]);
  });

  it('should ignore invalid predefined filter names and call $log.warn', function() {
    persistentState.searchTerms.col4 = 'some search';
    var results = filter(rows, columns, persistentState, {});
    expect(results).to.equal(rows);
    expect(mockLog.warn).to.have.been.calledOnce;
  });

  it('should replace string references to built-in filter functions with actual functions', function() {
    persistentState.searchTerms.col3 = 'foo';
    filter(rows, columns, persistentState, {});
    expect(columns[2].filter).to.be.a('function');
  });

  it('should call the filter function with term, value, computedValue, and the row in that order', function() {
    // spy on filter fn
    sandbox.spy(columns[0], 'filter');
    persistentState.searchTerms.fname = 'test search';
    filter(rows, columns, persistentState, {});
    expect(columns[0].filter).to.have.been.calledWith('test search','phu','FORMATTED',rows[0]);
    expect(columns[0].filter).to.have.been.calledWith('test search','amol','FORMATTED',rows[1]);
    expect(columns[0].filter).to.have.been.calledWith('test search','henry','FORMATTED',rows[2]);
  });

});
