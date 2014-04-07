describe('Filter: tableCellFilter', function() {

  var filter, sandbox, mockFormatFunctions;

  beforeEach(function() {
      sandbox = sinon.sandbox.create();
  });

  beforeEach(module('andyperlitch.apTable', function($provide) {

    mockFormatFunctions = {
      testFormat: sinon.stub().returns('Formatted.')
    };

    $provide.value('tableFormatFunctions', mockFormatFunctions);
  }));

  beforeEach(inject(['tableCellFilterFilter', function(f){
    filter = f;
  }]));

  afterEach(function() {
      sandbox.restore();
  });

  it('should be a function', function() {
    expect(filter).to.be.a('function');
  });

  it('should return the row\'s property specified by the column.key', function() {
    expect(filter(
      { a:'a', b:'b', c:'c' },
      { key: 'a' }
    )).to.equal('a');
  });

  it('should return an empty string if the property is not present on the row', function() {
    expect(filter(
      { a:'a', b:'b', c:'c' },
      { key: 'd' }
    )).to.equal('');
  });

  it('should return the default string defined by column.defaultValue if the property is not present on the row', function() {
    expect(filter(
      { a:'a', b:'b', c:'c' },
      { key: 'd', defaultValue: '-' }
    )).to.equal('-');
  });

  it('should return the formatted string if column.format is a function', function() {
    expect(filter(
      { a:'a', b:'b', c:'c' },
      { key: 'c', format: function(value) {
        return value.toUpperCase();
      } }
    )).to.equal('C');
  });

  it('should pass the row value, row object, and column to a format function', function() {
    var row = { a:'a', b:'b', c:'c' };
    var column = { key: 'c', format: function(value) {
      return value.toUpperCase();
    } };
    sandbox.spy(column, 'format');
    filter(row, column);
    expect(column.format).to.have.been.calledWith('c',row,column);
  });

  it('should return the raw value if a predefined format was not found', function() {
    var row = { a:'a', b:'b', c:'c' };
    var column = { id: 'test', key: 'c', format: 'notRealFormat' };
    expect(filter(row, column)).to.equal('c');
  });

});