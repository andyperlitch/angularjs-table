describe('Controller: TabledController', function() {

  var $scope;

  beforeEach(module('andyperlitch.ngTabled'));

  beforeEach(inject(function($rootScope, $controller){
    $scope = $rootScope.$new();
    $controller('TabledController', {$scope: $scope})
  }));

  it('should attach a searchTerms object to the scope', function() {
    expect($scope.searchTerms).to.be.an('object');
  });

  it('should attach a sortOrder array to the scope', function() {
    expect($scope.sortOrder).to.be.instanceof(Array);
  });

  it('should attach a sortDirection object to the scope', function() {
    expect($scope.sortDirection).to.be.an('object');
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
        expect($scope.sortOrder).to.eql(['k1']);
        expect($scope.sortDirection.k1).to.equal('+');
      });

      it('should set sortDirection[column.id] to "-" if "+" is the current value', function() {
        $scope.sortOrder = ['k1'];
        $scope.sortDirection.k1 = '+';
        $scope.toggleSort( $event, col1 );
        expect($scope.sortOrder).to.eql(['k1']);
        expect($scope.sortDirection.k1).to.equal('-');
      });

      it('should clear out sortDirection[column.id] attribute on all other columns', function() {
        $scope.sortOrder = ['k1','k3'];
        $scope.sortDirection.k1 = '+';
        $scope.sortDirection.k3 = '-';
        $scope.toggleSort( $event, col2 );

        expect($scope.sortOrder).to.eql(['k2']);
        expect($scope.sortDirection.k2).to.equal('+');
        expect($scope.sortDirection).not.to.have.property('k1');
        expect($scope.sortDirection).not.to.have.property('k3');
      });

      it('should do nothing if the column has no "sort" attribute', function() {
        delete col1.sort;
        $scope.toggleSort($event, col1);
        expect($scope.sortOrder).not.to.include('k1');
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
        expect($scope.sortDirection).not.to.have.property('k1');
      });

      it('should not clear out sorting on all other columns', function() {
        $scope.sortOrder = ['k1','k2'];
        $scope.sortDirection = { k1: '-', k2: '+' };
        $scope.toggleSort($event, col3);
        expect($scope.sortDirection.k1).to.equal('-');
        expect($scope.sortDirection.k2).to.equal('+');
      });

      it('should toggle sorting of column between three states: "+", "-", undefined', function() {
        $scope.toggleSort($event, col1);
        expect($scope.sortDirection.k1).to.equal('+');
        expect($scope.sortOrder.indexOf('k1')).to.not.equal(-1);

        $scope.toggleSort($event, col1);
        expect($scope.sortDirection.k1).to.equal('-');
        expect($scope.sortOrder.indexOf('k1')).to.not.equal(-1);

        $scope.toggleSort($event, col1);
        expect($scope.sortDirection.k1).to.be.undefined;
        expect($scope.sortOrder.indexOf('k1')).to.equal(-1);
      });

    });

  });

  describe('method: getSortClass', function() {
    
    var fn;

    beforeEach(function() {
      $scope.options.sort_classes = ['idle_class', 'asc_class', 'desc_class'];
      fn = $scope.getSortClass;
    });

    it('should be a function', function() {
      expect(fn).to.be.a('function');
    });

    it('should return the first element of sort_classes if no arg or arg is undefined/falsey', function() {
      expect(fn()).to.equal('idle_class');
      expect(fn(undefined)).to.equal('idle_class');
      expect(fn(false)).to.equal('idle_class');
      expect(fn('')).to.equal('idle_class');
    });

    it('should return the second element of sort_classes if arg is "+"', function() {
      expect(fn('+')).to.equal('asc_class');
    });

    it('should return the third element of sort_classes if arg is "-"', function() {
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
  });

});