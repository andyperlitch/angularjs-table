describe('Controller: TabledController', function() {

  var $scope;

  beforeEach(module('andyperlitch.ngTabled'));

  beforeEach(inject(function($rootScope, $controller){
    $scope = $rootScope.$new();
    $controller('TabledController', {$scope: $scope})
  }));

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

      it('should set a "sorting" attribute on the column to "+" if no value is present', function() {
        $scope.toggleSort( $event, col1 );
        expect(col1.sorting).to.equal('+');
      });

      it('should set "sorting" to "-" if "+" is the current value', function() {
        col1.sorting = '+';
        $scope.toggleSort( $event, col1 );
        expect(col1.sorting).to.equal('-');
      });

      it('should clear out the "sorting" attribute on all other columns', function() {
        col1.sorting = '-';
        col3.sorting = '+';
        $scope.toggleSort( $event, col2 );
        expect(col2.sorting).to.equal('+');
        expect(col1).not.to.have.property('sorting');
        expect(col3).not.to.have.property('sorting');
      });

      it('should do nothing if the column has no "sort" attribute', function() {
        delete col1.sort;
        $scope.toggleSort($event, col1);
        expect(col1).not.to.have.property('sorting');
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
        expect(col1).not.to.have.property('sorting');
      });

      it('should ignore sorting attributes on all other columns', function() {
        col1.sorting = '-';
        col2.sorting = '+';
        $scope.toggleSort($event, col3);
        expect(col1.sorting).to.equal('-');
        expect(col2.sorting).to.equal('+');
      });

      it('should toggle sorting of column between three states: "+", "-", undefined', function() {
        $scope.toggleSort($event, col1);
        expect(col1.sorting).to.equal('+');

        $scope.toggleSort($event, col1);
        expect(col1.sorting).to.equal('-');

        $scope.toggleSort($event, col1);
        expect(col1).not.to.have.property('sorting');
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

});