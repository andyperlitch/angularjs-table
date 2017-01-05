/* expr: false */
'use strict';
describe('Controller: TableController', function() {

  var sandbox, $scope, mockTableFormatFunctions, mockTableSortFunctions, mockTableFilterFunctions, mockLog, mockWindow;

  beforeEach(module('apMesa.controllers.ApMesaController'));

  beforeEach(inject(function($rootScope, $controller, $filter){
    sandbox = sinon.sandbox.create();
    $scope = $rootScope.$new();
    $scope.columns = [];
    $scope.rows = [];
    $scope.selected = [];
    mockTableFormatFunctions = {
      test: sandbox.spy(function(value) {
        return value.toString().toUpperCase();
      })
    };
    mockTableSortFunctions = {
      test: sandbox.spy(function(key) {
        return function(a,b) {
          return a[key] - b[key];
        };
      })
    };
    mockTableFilterFunctions = {
      test: sandbox.spy(function(searchTerm, value) {
        return value.indexOf(searchTerm) !== -1;
      })
    };
    mockLog = {
      warn: sandbox.spy()
    };
    mockWindow = angular.element('<div></div')[0];

    $scope.persistentState = {
      sortOrder: [],
      searchTerms: {}
    };

    // Holds filtered rows count
    $scope.transientState = {
      filterCount: $scope.rows.length
    };

    // Default Options, extend provided ones
    $scope.options = angular.extend({}, {
      sortClasses: [
        'glyphicon glyphicon-sort',
        'glyphicon glyphicon-chevron-up',
        'glyphicon glyphicon-chevron-down'
      ],
      storageHash: 'testhash123'
    });

    $controller('ApMesaController', {
      $scope: $scope,
      $element: {
        find: sandbox.spy(function() {
          return {
            focus: sandbox.spy()
          };
        })
      },
      apMesaFormatFunctions: mockTableFormatFunctions,
      apMesaSortFunctions: mockTableSortFunctions,
      apMesaFilterFunctions: mockTableFilterFunctions,
      $log: mockLog,
      $window: mockWindow,
      $filter: function(arg){
        if (arg === 'apMesaRowFilter') {
          return function(rows,columns,persistentState,transientState) {
            return persistentState.searchTerms.first_name === 'John' ? rows.slice(1,2) : rows;
          };
        } else {
          return $filter(arg);
        }
      }
    });
  }));

  afterEach(function() {
    sandbox.restore();
  });

  describe('method: getSelectableRows', function() {
    var rowIds = [];
    beforeEach(function() {
      $scope.columns = [
        { id: 'selected', key: 'id', label: '', width: 30, lockWidth: true, selector: true },
        { id: 'ID', key: 'id', label: 'ID', sort: 'number', filter: 'number' },
        { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like'},
        { id: 'last_name', key: 'last_name', label: 'Last Name', sort: 'string', filter: 'like', templateUrl: 'path/to/example/template.html' },
        { id: 'age', key: 'age', label: 'Age', sort: 'number', filter: 'number' }
      ];
      $scope.rows = [
        {id: 1, first_name: 'Bob', last_name: 'Jones', age: 40},
        {id: 3, first_name: 'John', last_name: 'Smith', age: 30},
        {id: 2, first_name: 'John', last_name: 'Smith', age: 20},
      ];
      rowIds = $scope.rows.map(function(e){return e.id;});
    });

    it('should return empty array if $scope.rows is an array', function() {
      $scope.rows = [];
      expect($scope.getSelectableRows()).to.eql([]);
    });

    it('should return matching array if $scope.rows is not empty', function() {
      expect($scope.getSelectableRows()).to.eql($scope.rows);
    });

    it('should return filtered array if $scope.rows has filter applied', function() {
      $scope.persistentState.searchTerms = {first_name: 'John'};
      $scope.transientState = {filterCount: 2};
      expect($scope.getSelectableRows()).to.deep.equal($scope.rows.slice(1,2));
    });

  });

  describe('method: isSelectedAll', function() {

    it('should return false if $scope.rows is not an array', function() {
      $scope.rows = undefined;
      expect($scope.isSelectedAll()).to.equal(false);
    });

    it('should return false if $scope.selected is not an array', function() {
      $scope.selected = undefined;
      expect($scope.isSelectedAll()).to.equal(false);
    });

    it('should return false if $scope.rows is an empty array', function() {
      $scope.rows = [];
      expect($scope.isSelectedAll()).to.equal(false);
    });

    it('should return false if $scope.selected is an empty array', function() {
      $scope.selected = [];
      expect($scope.isSelectedAll()).to.equal(false);
    });

    it('should return true if $scope.rows and $scope.selected are arrays of equal length', function() {
      $scope.rows = [{id: 1}, {id: 2}, {id: 3}];
      $scope.selected = [1, 2, 3];
      expect($scope.isSelectedAll()).to.equal(true);
    });

  });

  describe('method: selectAll', function() {

    var rowIds = [];
    beforeEach(function() {
      $scope.columns = [
        { id: 'selected', key: 'id', label: '', width: 30, lockWidth: true, selector: true },
        { id: 'ID', key: 'id', label: 'ID', sort: 'number', filter: 'number' },
        { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like'},
        { id: 'last_name', key: 'last_name', label: 'Last Name', sort: 'string', filter: 'like', templateUrl: 'path/to/example/template.html' },
        { id: 'age', key: 'age', label: 'Age', sort: 'number', filter: 'number' }
      ];
      $scope.rows = [
        {id: 1, first_name: 'Bob', last_name: 'Jones', age: 40},
        {id: 3, first_name: 'John', last_name: 'Smith', age: 30},
        {id: 2, first_name: 'John', last_name: 'Smith', age: 20},
      ];
      rowIds = $scope.rows.map(function(e){return e.id;});
    });


    it('should empty $scope.selected if $scope.rows is empty', function() {
      $scope.rows = [];
      $scope.selected = [1, 2, 3, 4, 5];
      $scope.selectAll();
      expect($scope.selected).to.deep.equal([]);
    });

    it('should set $scope.selected to array of $scope.rows id\'s', function() {
      $scope.selectAll();
      expect($scope.selected).to.deep.equal(rowIds);
    });

    it('should be idempotent', function() {
      $scope.selectAll();
      $scope.selectAll();
      expect($scope.selected).to.deep.equal(rowIds);
    });

    it('should remove any previous values from $scope.selected and set it to array of $scope.rows id\'s', function() {
      $scope.selected = [9, 8, 7];
      $scope.selectAll();
      expect($scope.selected).to.deep.equal(rowIds);
    });

    it('should throw error if selector column is missing', function() {
      $scope.columns[0] = {};
      expect($scope.selectAll).to.throw(Error);
    });

    it('should set $scope.selected to undefined values if selector key is missing in $scope.rows', function() {
      $scope.columns[0].key = 'invalid';
      $scope.selectAll();
      expect($scope.selected).to.deep.equal([undefined,undefined,undefined]);
    });

  });

  describe('method: toggleSelectAll', function() {

    var rowIds = [];
    beforeEach(function() {
      $scope.columns = [
        { id: 'selected', key: 'id', label: '', width: 30, lockWidth: true, selector: true },
        { id: 'ID', key: 'id', label: 'ID', sort: 'number', filter: 'number' },
        { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like'},
        { id: 'last_name', key: 'last_name', label: 'Last Name', sort: 'string', filter: 'like', templateUrl: 'path/to/example/template.html' },
        { id: 'age', key: 'age', label: 'Age', sort: 'number', filter: 'number' }
      ];
      $scope.rows = [
        {id: 1, first_name: 'Bob', last_name: 'Jones', age: 40},
        {id: 3, first_name: 'John', last_name: 'Smith', age: 30},
        {id: 2, first_name: 'John', last_name: 'Smith', age: 20},
      ];
      rowIds = $scope.rows.map(function(e){return e.id;});
    });

    it('should populate $scope.selected with $scope.rows id\'s if checkbox is checked', function() {
      var $event = {target: {checked: true}};
      $scope.toggleSelectAll($event);
      expect($scope.selected).to.deep.equal(rowIds);
    });

    it('should empty all $scope.selected is checkbox is unchecked', function() {
      var $event = {target: {checked: false}};
      $scope.toggleSelectAll($event);
      expect($scope.selected).to.deep.equal([]);
    });
    
  });

  describe('method: deselectAll', function() {

    it('should empty $scope.selected when invoked', function() {
      $scope.selected = [1, 2, 3, 4, 5];
      $scope.deselectAll();
      expect($scope.selected).to.deep.equal([]);
    });

  });


  describe('method: addSort', function() {

    it('should add the column id to $scope.persistentState.sortOrder and sort direction to $scope.sortDirection', function() {
      $scope.addSort('myId', '+');
      expect($scope.persistentState.sortOrder).to.contain({id: 'myId', dir: '+'});
    });

    it('should only add the direction to sortDirection if it already exists in the sortOrder array', function() {
      $scope.persistentState.sortOrder = [{id: 'myId', dir: '+'}];
      $scope.addSort('myId', '-');
      expect($scope.persistentState.sortOrder[0].dir).to.equal('-');
    });

    it('should add the id to the end of the sortOrder array', function() {
      $scope.persistentState.sortOrder = [{id: 'otherId', dir: '+'}];
      $scope.addSort('myId', '+');
      expect($scope.persistentState.sortOrder.map(function(i) { return i.id; })).to.eql(['otherId', 'myId']);
    });

  });
  
  describe('method: removeSort', function() {

    it('should remove the id from the sortOrder array and delete it from sortDirection', function() {
      $scope.persistentState.sortOrder = [{id: 'myId', dir: '+'}];
      $scope.removeSort('myId');
      expect($scope.persistentState.sortOrder.map(function(i) { return i.id; })).not.to.contain('myId');
    });

  });
  
  describe('method: clearSort', function() {

    it('should clear sortOrder and sortDirection', function() {
      $scope.persistentState.sortOrder = [{id: 'testing', dir: '+'}];
      $scope.clearSort();
      expect($scope.persistentState.sortOrder).to.eql([]);
    });

  });

  describe('method: hasFilterFields', function() {

    it('should be a function', function() {
      expect($scope.hasFilterFields).to.be.a('function');
    });

    it('should return true if one or more columns have a search filter field', function() {
      $scope.columns = [
        { id: 'k1', key: 'k1', filter: 'like' },
        { id: 'k2', key: 'k2' }
      ];
      expect($scope.hasFilterFields()).to.equal(true);

      $scope.columns = [
        { id: 'k1', key: 'k1', filter: 'like' },
        { id: 'k2', key: 'k2', filter: 'like' }
      ];
      expect($scope.hasFilterFields()).to.equal(true);
    });

    it('should return false if no columns have a search filter field', function() {
      $scope.columns = [
        { id: 'k1', key: 'k1' },
        { id: 'k2', key: 'k2' }
      ];
      expect($scope.hasFilterFields()).to.equal(false);
    });

  });

  describe('method: toggleSort', function() {

    var col1, col2, col3, $event;

    beforeEach(function() {
      $scope.columns = [
        col1 = { id: 'k1', key: 'k1', sort: 'string' },
        col2 = { id: 'k2', key: 'k2', sort: 'string' },
        col3 = { id: 'k3', key: 'k3', sort: 'string' }
      ];
    });
    
    it('should be a function', function() {
      expect($scope.toggleSort).to.be.a('function');
    });

    describe('when the shift key is up', function() {

      beforeEach(function() {
        $event = {
          shiftKey: false
        };
      });

      it('should add the column to sortOrder and sortDirection as "+" if it was not being sorted', function() {
        $scope.toggleSort( $event, col1 );
        expect($scope.persistentState.sortOrder).to.eql([{id: 'k1', dir: '+'}]);
      });

      it('should set sortDirection[column.id] to "-" if "+" is the current value', function() {
        $scope.persistentState.sortOrder = [{id: 'k1', dir: '+'}];
        $scope.toggleSort( $event, col1 );
        expect($scope.persistentState.sortOrder).to.eql([{id: 'k1', dir: '-'}]);
      });

      it('should clear out sortDirection[column.id] attribute on all other columns', function() {
        $scope.persistentState.sortOrder = [{ id: 'k1', dir: '+' },{ id: 'k3', dir: '-' }];
        $scope.toggleSort( $event, col2 );
        expect($scope.persistentState.sortOrder).to.eql([{id: 'k2', dir: '+'}]);
      });

      it('should do nothing if the column has no "sort" attribute', function() {
        delete col1.sort;
        $scope.toggleSort($event, col1);
        expect($scope.persistentState.sortOrder.map(function(i) { return i.id; })).not.to.include('k1');
      });

    });

    describe('when the shift key is down', function() {
      
      beforeEach(function() {
        $event = {
          shiftKey: true
        };
      });

      it('should do nothing if the column has no "sort" attribute', function() {
        delete col1.sort;
        $scope.toggleSort($event, col1);
        expect($scope.persistentState.sortOrder).to.eql([]);
      });

      it('should not clear out sorting on all other columns', function() {
        $scope.persistentState.sortOrder = ['k1','k2'];
        $scope.sortDirection = { k1: '-', k2: '+' };
        $scope.toggleSort($event, col3);
        expect($scope.sortDirection.k1).to.equal('-');
        expect($scope.sortDirection.k2).to.equal('+');
      });

      it('should toggle sorting of column between three states: "+", "-", undefined', function() {
        $scope.toggleSort($event, col1);
        expect($scope.persistentState.sortOrder.map(function(i) { return i.id; }).indexOf('k1')).to.not.equal(-1);

        $scope.toggleSort($event, col1);
        expect($scope.persistentState.sortOrder.map(function(i) { return i.id; }).indexOf('k1')).to.not.equal(-1);

        $scope.toggleSort($event, col1);
        expect($scope.persistentState.sortOrder.map(function(i) { return i.id; }).indexOf('k1')).to.equal(-1);
      });

    });

  });

  describe('method: getSortClass', function() {
    
    var fn;

    beforeEach(function() {
      $scope.options.sortClasses = ['idle_class', 'asc_class', 'desc_class'];
      fn = $scope.getSortClass;
    });

    it('should be a function', function() {
      expect(fn).to.be.a('function');
    });

    it('should return the first element of sortClasses if no arg or arg is undefined/falsey', function() {
      expect(fn()).to.equal('idle_class');
      expect(fn(undefined)).to.equal('idle_class');
      expect(fn(false)).to.equal('idle_class');
      expect(fn('')).to.equal('idle_class');
    });

    it('should return the second element of sortClasses if arg is "+"', function() {
      expect(fn('+')).to.equal('asc_class');
    });

    it('should return the third element of sortClasses if arg is "-"', function() {
      expect(fn('-')).to.equal('desc_class');
    });

  });

  describe('method: setColumns', function() {

    var fn;

    beforeEach(function() {
      fn = $scope.setColumns;
    });

    it('should be a function', function() {
      expect(fn).to.be.a('function');
    });

    it('should set the passed columns as $scope.columns', function() {
      var columns = [];
      $scope.setColumns(columns);
      expect($scope.columns).to.equal(columns);
    });

    it('should replace all filter, format, and sort strings on each column with the built-in functions', function() {
      var col;
      var columns = [
        col = { id: 'k1', key: 'k1', sort: 'test', filter: 'test', format: 'test'}
      ];
      $scope.setColumns(columns);
      expect(col.sort).to.be.a('function');
      expect(col.filter).to.equal(mockTableFilterFunctions.test);
      expect(col.format).to.equal(mockTableFormatFunctions.test);
    });

    it('should delete references to invalid built-in functions and call $log.warn', function() {
      var col;
      var columns = [
        col = { id: 'k1', key: 'k1', sort: 'not_a_real_fn', filter: 'not_a_real_fn', format: 'not_a_real_fn'}
      ];
      $scope.setColumns(columns);
      expect(mockLog.warn).to.have.been.calledThrice;
      expect(col.sort).to.be.undefined;
      expect(col.filter).to.be.undefined;
      expect(col.format).to.be.undefined;
    });

  });

  describe('method: startColumnResize', function() {
    var fn, $event, $markup, $el;

    beforeEach(function() {
      fn = $scope.startColumnResize;
      $markup = angular.element('<th><span></span></th>');
      $el = $markup.find('span');

      $event = {
        target: $el[0],
        preventDefault: sandbox.spy(),
        originalEvent: {
          preventDefault: sandbox.spy()
        },
        stopPropagation: sandbox.spy()
      };

      fn($event);

    });

    it('should call preventDefault, originalEvent.preventDefault, and stopPropagation on the $event object', function() {
      
      expect($event.preventDefault).to.have.been.calledOnce;
      expect($event.originalEvent.preventDefault).to.have.been.calledOnce;
      expect($event.stopPropagation).to.have.been.calledOnce;
    });

    it('should add a marquee element to the $th', function() {
      expect($markup.find('.column-resizer-marquee').length).to.equal(1);
    });

  });


  describe('method: saveToStorage', function() {
    beforeEach(function() {
      $scope.storage = {
        setItem : function() {
          return 'testVal';
        }
      };
      sandbox.spy($scope.storage, 'setItem');
    });

    it('should be a function', function() {
      expect($scope.saveToStorage).to.be.a('function');
    });

    describe('storage getItem', function() {
      beforeEach(function() {
        $scope.storageKey = 'testKey1';
      });
      it('should be called with correct storage key', function() {
        $scope.saveToStorage();
        expect($scope.storage.setItem).to.have.been.calledWith('testKey1');
      });
    });
  });



  describe('method: loadFromStorage', function() {

    describe('with same hash', function() {

      var rowIds = [];

      var stateStr = {
        'sortOrder': [],
        'sortDirection': {},
        'searchTerms': {},
        'columns': [
          {
            'id': 'selected',
            'disabled': false
          },
          {
            'id': 'ID',
            'disabled': false
          },
          {
            'id': 'first_name',
            'disabled': false
          },
          {
            'id': 'last_name',
            'disabled': false
          },
          {
            'id': 'height',
            'disabled': false
          },
          {
            'id': 'weight',
            'disabled': false
          },
          {
            'id': 'age',
            'disabled': false
          },
          {
            'id': 'likes',
            'disabled': false
          }
        ],
        'options': {
          'rowLimit': 10,
          'storageHash': 'testhash123'
        }
      };

      stateStr = JSON.stringify(stateStr);

      beforeEach(function() {
        $scope.columns = [
          { id: 'selected', key: 'id', label: '', width: 30, lockWidth: true, selector: true },
          { id: 'ID', key: 'id', label: 'ID', sort: 'number', filter: 'number' },
          { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like'},
          { id: 'last_name', key: 'last_name', label: 'Last Name', sort: 'string', filter: 'like', templateUrl: 'path/to/example/template.html' },
          { id: 'age', key: 'age', label: 'Age', sort: 'number', filter: 'number' }
        ];
        $scope.rows = [
          {id: 1, first_name: 'Bob', last_name: 'Jones', age: 40},
          {id: 3, first_name: 'John', last_name: 'Smith', age: 30},
          {id: 2, first_name: 'John', last_name: 'Smith', age: 20},
        ];
        rowIds = $scope.rows.map(function(e){return e.id;});

        $scope.storage = {
          getItem : function() {
            return 'testVal';
          }
        };

        sandbox.stub($scope.storage, 'getItem').returns(stateStr);
        sandbox.spy($scope.columns, 'sort');
      });


      it('should be a function', function() {
        expect($scope.loadFromStorage).to.be.a('function');
      });


      describe('getItem', function() {
        beforeEach(function() {
          $scope.storageKey = 'testKey';
        });
        it('is called with \'testKey\'', function() {
          $scope.loadFromStorage();
          expect($scope.storage.getItem).to.have.been.calledWith('testKey');
        });
      });


      describe('reordering columns', function() {
        beforeEach(function() {
          $scope.loadFromStorage();
          $scope.columns[0] = { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like'};
          $scope.columns[2] = { id: 'selected', key: 'id', label: '', width: 30, lockWidth: true, selector: true };
        });

        it('sort should be called', function() {
          expect($scope.columns.sort).to.have.been.called;
        });

        it('new row should be at the end', function() {
          expect($scope.columns[1].id).to.equal('ID');
        });
      });


      describe('inserting a new columns at the beginning', function() {
        beforeEach(function() {
          $scope.columns.splice(0, 0, { id: 'new_row', key: 'new_row', label: 'New Row', sort: 'string', filter: 'like'});
        });

        it('sort should be called', function() {
          $scope.loadFromStorage();
          expect($scope.columns.sort).to.have.been.called;
        });

        it('new row should be last now', function() {
          $scope.loadFromStorage();
          expect($scope.columns[5].id).to.equal('new_row');
        });
      });

    });


    describe('with different hash', function() {

      var rowIds = [];

      var stateStr = {
        'sortOrder': [],
        'sortDirection': {},
        'searchTerms': {},
        'columns': [
          {
            'id': 'selected',
            'disabled': false
          },
          {
            'id': 'ID',
            'disabled': false
          },
          {
            'id': 'first_name',
            'disabled': false
          },
          {
            'id': 'last_name',
            'disabled': false
          },
          {
            'id': 'height',
            'disabled': false
          },
          {
            'id': 'weight',
            'disabled': false
          },
          {
            'id': 'age',
            'disabled': false
          },
          {
            'id': 'likes',
            'disabled': false
          }
        ],
        'options': {
          'rowLimit': 10,
          'storageHash': 'differentHash456'
        }
      };

      stateStr = JSON.stringify(stateStr);

      beforeEach(function() {
        $scope.columns = [
          { id: 'selected', key: 'id', label: '', width: 30, lockWidth: true, selector: true },
          { id: 'ID', key: 'id', label: 'ID', sort: 'number', filter: 'number' },
          { id: 'first_name', key: 'first_name', label: 'First Name', sort: 'string', filter: 'like'},
          { id: 'last_name', key: 'last_name', label: 'Last Name', sort: 'string', filter: 'like', templateUrl: 'path/to/example/template.html' },
          { id: 'age', key: 'age', label: 'Age', sort: 'number', filter: 'number' }
        ];
        $scope.rows = [
          {id: 1, first_name: 'Bob', last_name: 'Jones', age: 40},
          {id: 3, first_name: 'John', last_name: 'Smith', age: 30},
          {id: 2, first_name: 'John', last_name: 'Smith', age: 20},
        ];
        rowIds = $scope.rows.map(function(e){return e.id;});

        $scope.storage = {
          getItem : function() {
            return 'testVal';
          }
        };

        sandbox.stub($scope.storage, 'getItem').returns(stateStr);
        sandbox.spy($scope.columns, 'sort');
      });

      describe('calling loadFromStorage', function() {
        beforeEach(function() {
          $scope.loadFromStorage();
        });

        it('sort should not be called', function() {
          expect($scope.columns.sort).not.to.have.been.called;
        });
      });

    });

  });

});
