describe('Filter: tabledCellFilter', function() {

  var filter, sandbox, mockFormatFunctions, mockLog;

  beforeEach(function() {
      sandbox = sinon.sandbox.create();
  });

  beforeEach(module('andyperlitch.ngTabled', function($provide) {

    mockFormatFunctions = {
      testFormat: sinon.stub().returns('Formatted.')
    };

    mockLog = { warn: sinon.stub() };

    $provide.value('tabledFormatFunctions', mockFormatFunctions);
    $provide.value('$log', mockLog);
  }));

  beforeEach(inject(['tabledCellFilterFilter', function(f){
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

  it('should check for and use predefined format function if column.format is a key on tabledFormatFunctions', function() {
    var row = { a:'a', b:'b', c:'c' };
    var column = { key: 'c', format: 'testFormat' };
    filter(row, column);
    expect(mockFormatFunctions.testFormat).to.have.been.calledWith('c',row,column);
  });

  it('should call $log.warn and return the raw value if a predefined format was not found', function() {
    var row = { a:'a', b:'b', c:'c' };
    var column = { id: 'test', key: 'c', format: 'notRealFormat' };
    expect(filter(row, column)).to.equal('c');
    expect(mockLog.warn).to.have.been.calledOnce;
  });

});