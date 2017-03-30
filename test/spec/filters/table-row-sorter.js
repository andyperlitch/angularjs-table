'use strict';

describe('Filter: tableRowSorter', function() {

  var sandbox, sorter, columns, rows, numSort, numSort2, stringSort, sortOrder, transientState;

  beforeEach(module('apMesa'));

  beforeEach(inject(function(apMesaRowSorterFilter) {
    sandbox = sinon.sandbox.create();

    sorter = apMesaRowSorterFilter;

    stringSort = sandbox.spy(function(a,b) {
      return a.key1 < b.key1 ? -1 : a.key1 > b.key1 ? 1 : 0 ;
    });
    numSort = sandbox.spy(function(a,b) {
      return a.key2 - b.key2;
    });
    numSort2 = sandbox.spy(function(a,b) {
      return a.key3 - b.key3;
    });
    
    columns = [
      { id: 'key1', key: 'key1', sort: stringSort },
      { id: 'key2', key: 'key2', sort: numSort },
      { id: 'key3', key: 'key3', sort: numSort }
    ];
    rows = [
      { index: 0, key1:'c', key2:2, key3: 4 },
      { index: 1, key1:'b', key2:1, key3: 4 },
      { index: 2, key1:'a', key2:3, key3: 2 },
      { index: 3, key1:'b', key2:3, key3: 3 }
    ];
    transientState = {
      columnLookup: {}
    };
    columns.forEach(function(column) {
      transientState.columnLookup[column.id] = column;
    });
  }));

  afterEach(function() {
    sandbox.restore();
  });

  it('should be a function', function() {
    expect(sorter).to.be.a('function');
  });

  it('should return all rows if no sorting is active', function() {
    expect(sorter(rows,columns,[],{}, transientState)).to.equal(rows);
  });

  it('should sort ascending by a column whose "sorting" field is "+"', function() {
    
    sortOrder = [{id: 'key1', dir: '+'}];

    var result = sorter(rows, columns, sortOrder, {}, transientState);
    var idxs = result.map(function(r){ return r.index; });
    expect(idxs).to.eql([2,1,3,0]);

  });

  it('should sort descending by a column whose "sorting" field is "-"', function() {
    
    sortOrder = [{id:'key1', dir: '-'}];

    var result = sorter(rows,columns,sortOrder, {}, transientState);
    var idxs = result.map(function(r){ return r.index; });
    expect(idxs).to.eql([0,1,3,2]);

  });

  it('should ignore sort columns in sortOrder that do not exist', function() {
    sortOrder = [{id:'not_a_column', dir: '+'},{id:'key1', dir: '-'}];

    var result = sorter(rows,columns,sortOrder, {}, transientState);
    var idxs = result.map(function(r){ return r.index; });
    expect(idxs).to.eql([0,1,3,2]);
  });

});
