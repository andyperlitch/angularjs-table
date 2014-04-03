describe('Filter: tabledRowSorter', function() {

  var sandbox, sorter, columns, rows;

  beforeEach(module('andyperlitch.ngTabled'));

  beforeEach(inject(function(tabledRowSorterFilter) {
    sorter = tabledRowSorterFilter;
    columns = [
      { id: 'key1', key: 'key1', sort: 'string' },
      { id: 'key2', key: 'key2', sort: 'number' },
      { id: 'key3', key: 'key3', sort: 'number' }
    ];
    rows = [
      { key1:'a', key2:1, key3: 4 },
      { key1:'b', key2:2, key3: 4 },
      { key1:'b', key2:3, key3: 3 },
      { key1:'c', key2:3, key3: 3 }
    ];
  }));

  it('should be a function', function() {
    expect(sorter).to.be.a('function');
  });

  it('should return all rows if no sorting is active', function() {
    expect(sorter(rows,columns)).to.equal(rows);
  });

});