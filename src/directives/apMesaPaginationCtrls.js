'use strict';

angular.module('apMesa.directives.apMesaPaginationCtrls', [])
.directive('apMesaPaginationCtrls', function($timeout) {

  return {
    templateUrl: 'src/templates/apMesaPaginationCtrls.tpl.html',
    scope: true,
    link: function(scope, element) {
      function updatePageLinks() {
        var pageLinks = [];
        var numPages = Math.ceil(scope.transientState.filterCount / scope.options.rowsPerPage);
        var currentPage = scope.transientState.pageOffset;
        var maxPageLinks = Math.max(5, scope.options.maxPageLinks); // must be a minimum of 5 max page links

        if (numPages <= maxPageLinks) {
          for (var i = 0; i < numPages; i++) {
            pageLinks.push({
              gap: false,
              page: i,
              current: currentPage === i
            });
          }
        } else if (currentPage < (maxPageLinks - 2)) {
          for (var i = 0; i < maxPageLinks - 2; i++) {
            pageLinks.push({
              gap: false,
              page: i,
              current: currentPage === i
            });
          }
          pageLinks.push({
            gap: true,
            page: -1,
            current: false
          }, {
            gap: false,
            page: numPages - 1,
            current: false
          });
        } else if (numPages - currentPage <= (maxPageLinks - 2)) {
          pageLinks.push({
            gap: false,
            page: 0,
            current: false
          }, {
            gap: true,
            page: -1,
            current: false
          });
          var startingPage = numPages - (maxPageLinks - 2);
          for (var i = startingPage; i < numPages; i++) {
            pageLinks.push({
              gap: false,
              page: i,
              current: currentPage === i
            });
          }
        } else {
          pageLinks.push({
            gap: false,
            page: 0,
            current: false
          }, {
            gap: true,
            page: -1,
            current: false
          });
          var remainingLinkCount = maxPageLinks - 4;
          for (var i = 0; remainingLinkCount > 0; i++) {
            var distance = i % 2 ? (i + 1)/2 : -(i / 2);
            var page = currentPage + distance;
            if (distance >= 0) {
              pageLinks.push({
                gap: false,
                page: page,
                current: distance === 0
              });
            } else {
              pageLinks.splice(2, 0, {
                gap: false,
                page: page,
                current: false
              });
            }
            --remainingLinkCount;
          }
          pageLinks.push({
            gap: true,
            page: -1,
            current: false
          }, {
            gap: false,
            page: numPages - 1,
            current: false
          });
        }
        scope.pageLinks = pageLinks;
        scope.lastPage = numPages -1;
      }
      scope.$watch('transientState.filterCount', updatePageLinks);
      scope.$watch('options.rowsPerPage', updatePageLinks);
      scope.$watch('transientState.pageOffset', updatePageLinks);

      scope.goBack = function() {
        if (scope.transientState.pageOffset === 0) {
          return;
        }
        scope.transientState.pageOffset--;
      }

      scope.goForward = function() {
        if (scope.transientState.pageOffset === scope.lastPage) {
          return;
        }
        scope.transientState.pageOffset++;
      }
    }
  };
});
