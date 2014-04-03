describe('Filter: tabledRowSorter', function() {

  var sandbox, sorter, columns, rows, numSort, numSort2, stringSort;

  beforeEach(module('andyperlitch.ngTabled'));

  beforeEach(inject(function(tabledRowSorterFilter) {
    sandbox = sinon.sandbox.create();

    sorter = tabledRowSorterFilter;

    stringSort = sandbox.spy(function(a,b) { return a.key1 < b.key1 ? -1 : a.key1 > b.key1 ? 1 : 0 });
    numSort = sandbox.spy(function(a,b) { return a.key2 - b.key2});
    numSort2 = sandbox.spy(function(a,b) { return a.key3 - b.key3});
    
    columns = [
      { id: 'key1', key: 'key1', sort: stringSort },
      { id: 'key2', key: 'key2', sort: numSort },
      { id: 'key3', key: 'key3', sort: numSort }
    ];
    rows = [
      { key1:'c', key2:2, key3: 4 },
      { key1:'b', key2:1, key3: 4 },
      { key1:'a', key2:3, key3: 2 },
      { key1:'b', key2:3, key3: 3 }
    ];
  }));

  afterEach(function() {
      sandbox.restore();
  });

  it('should be a function', function() {
    expect(sorter).to.be.a('function');
  });

  it('should return all rows if no sorting is active', function() {
    expect(sorter(rows,columns)).to.equal(rows);
  });

  // it('should sort ascending by a column whose "sorting" field is "+"', function() {
  //   columns[0].sorting = '+';
  //   expect(sorter(rows,columns)).to.eql([
  //     rows[2],
  //     rows[1],
  //     rows[0],
  //     rows[3]
  //   ]);
  // });

});