angular.module('apMesa.templates', ['src/templates/apMesa.tpl.html', 'src/templates/apMesaDummyRows.tpl.html', 'src/templates/apMesaPaginationCtrls.tpl.html', 'src/templates/apMesaRows.tpl.html', 'src/templates/apMesaStatusDisplay.tpl.html']);

angular.module("src/templates/apMesa.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/templates/apMesa.tpl.html",
    "<div class=\"ap-mesa-wrapper\" ng-class=\"{\n" +
    "'paging-strategy-paginate': options.pagingStrategy === 'PAGINATE',\n" +
    "'paging-strategy-scroll': options.pagingStrategy === 'SCROLL',\n" +
    "'ap-mesa-loading-error': !!transientState.loadingError,\n" +
    "'ap-mesa-no-data': !transientState.loading && !transientState.loadingError && visible_rows.length === 0\n" +
    "}\">\n" +
    "  <table ng-class=\"classes\" class=\"ap-mesa mesa-header-table\">\n" +
    "    <thead>\n" +
    "      <!-- MAIN ROW OF COLUMN HEADERS -->\n" +
    "      <tr ui-sortable=\"sortableOptions\" ng-model=\"enabledColumnObjects\" class=\"ap-mesa-header-row\">\n" +
    "\n" +
    "        <!-- COLUMN HEADERS -->\n" +
    "        <th\n" +
    "        scope=\"col\"\n" +
    "        ng-repeat=\"column in enabledColumnObjects\"\n" +
    "        ng-click=\"toggleSort($event,column)\"\n" +
    "        ng-class=\"[\n" +
    "          {\n" +
    "            'sortable-column' : column.sort,\n" +
    "            'select-column': column.selector,\n" +
    "            'is-sorting': sortDirection[column.id]\n" +
    "          },\n" +
    "          'table-header-' + column.id,\n" +
    "          column.classes ? column.classes : ''\n" +
    "        ]\"\n" +
    "        ng-attr-title=\"{{ column.title || '' }}\"\n" +
    "        ng-style=\"{ width: column.width, 'min-width': column.width, 'max-width': column.width }\">\n" +
    "\n" +
    "          <!-- COLUMN TEXT -->\n" +
    "          <span class=\"column-text\">\n" +
    "            <input ng-if=\"column.selector\" type=\"checkbox\" ng-checked=\"isSelectedAll()\" ng-click=\"toggleSelectAll($event)\" />\n" +
    "            <span\n" +
    "            class=\"ap-mesa-sort-icon\" \n" +
    "            ng-if=\"column.sort\"\n" +
    "            title=\"This column is sortable. Click to toggle sort order. Hold shift while clicking multiple columns to stack sorting.\">\n" +
    "              <span class=\"sorting-icon {{ getSortClass( sortDirection[column.id] ) }}\"></span>\n" +
    "              <span ng-bind=\"transientState.sortPriority[column.id]\" class=\"sort-priority\" ng-if=\"transientState.sortPriorityShow && transientState.sortPriority[column.id]\"></span>\n" +
    "            </span>\n" +
    "            <span class=\"ap-mesa-th-title\" ap-mesa-th-title></span>\n" +
    "          </span>\n" +
    "\n" +
    "          <!-- COLUMN RESIZER -->\n" +
    "          <span\n" +
    "          ng-if=\"!column.lockWidth\"\n" +
    "          class=\"column-resizer\"\n" +
    "          ng-class=\"{'discreet-width': !!column.width}\"\n" +
    "          title=\"Click and drag to set discreet width. Click once to clear discreet width.\"\n" +
    "          ng-mousedown=\"startColumnResize($event, column)\">\n" +
    "            &nbsp;\n" +
    "          </span>\n" +
    "\n" +
    "        </th>\n" +
    "      </tr>\n" +
    "\n" +
    "      <!-- ROW OF COLUMMN FILTERS -->\n" +
    "      <tr ng-if=\"hasFilterFields()\" class=\"ap-mesa-filter-row\">\n" +
    "\n" +
    "        <!-- COLUMN FILTER CELLS -->\n" +
    "        <td ng-repeat=\"column in enabledColumnObjects\" ng-class=\"'column-' + column.id\">\n" +
    "\n" +
    "          <!-- FILTER INPUT -->\n" +
    "          <input\n" +
    "          type=\"text\"\n" +
    "          ng-if=\"(column.filter)\"\n" +
    "          ng-model=\"persistentState.searchTerms[column.id]\"\n" +
    "          ng-attr-placeholder=\"{{ column.filterPlaceholder ? column.filterPlaceholder : (column.filter.placeholder || 'filter') }}\"\n" +
    "          ng-attr-title=\"{{ column.filter && column.filter.title }}\"\n" +
    "          ng-class=\"{'active': persistentState.searchTerms[column.id] }\">\n" +
    "\n" +
    "          <!-- FILTER CLEAR BUTTON -->\n" +
    "          <button\n" +
    "          ng-if=\"(column.filter)\"\n" +
    "          ng-show=\"persistentState.searchTerms[column.id]\"\n" +
    "          class=\"clear-search-btn\"\n" +
    "          role=\"button\"\n" +
    "          type=\"button\"\n" +
    "          ng-click=\"clearAndFocusSearch(column.id)\">\n" +
    "            &times;\n" +
    "          </button>\n" +
    "\n" +
    "        </td>\n" +
    "      </tr>\n" +
    "    </thead>\n" +
    "  </table>\n" +
    "  <div ap-mesa-status-display></div>\n" +
    "  <div class=\"mesa-rows-table-wrapper\" ng-style=\"tbodyNgStyle\" ng-hide=\"transientState.loadingError\">\n" +
    "    <table ng-class=\"classes\" class=\"ap-mesa mesa-rows-table\">\n" +
    "      <thead>\n" +
    "        <th\n" +
    "            scope=\"col\"\n" +
    "            ng-repeat=\"column in enabledColumnObjects\"\n" +
    "            ng-style=\"{ width: column.width, 'min-width': column.width, 'max-width': column.width }\"\n" +
    "          ></th>\n" +
    "        </tr>\n" +
    "      </thead>\n" +
    "      <tbody ng-if=\"options.pagingStrategy === 'SCROLL'\" ap-mesa-dummy-rows=\"[0,transientState.rowOffset]\" cell-content=\"...\"></tbody>\n" +
    "      <tbody ap-mesa-rows class=\"ap-mesa-rendered-rows\"></tbody>\n" +
    "      <tbody ng-if=\"options.pagingStrategy === 'SCROLL'\" ap-mesa-dummy-rows=\"[transientState.rowOffset + visible_rows.length, transientState.filterCount]\" cell-content=\"...\"></tbody>\n" +
    "    </table>\n" +
    "  </div>\n" +
    "  <div class=\"ap-mesa-pagination\" ng-if=\"options.pagingStrategy === 'PAGINATE'\" ap-mesa-pagination-ctrls></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("src/templates/apMesaDummyRows.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/templates/apMesaDummyRows.tpl.html",
    "");
}]);

angular.module("src/templates/apMesaPaginationCtrls.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/templates/apMesaPaginationCtrls.tpl.html",
    "<ul class=\"pagination\" ng-if=\"lastPage > 0\">\n" +
    "  <li ng-class=\"{ 'disabled': transientState.pageOffset === 0 }\">\n" +
    "    <a ng-click=\"goBack()\" >&laquo;</a>\n" +
    "  </li>\n" +
    "  <li ng-repeat=\"link in pageLinks\" ng-class=\"{ 'active': link.current, 'disabled': link.gap }\">\n" +
    "    <a ng-if=\"!link.gap\" ng-click=\"transientState.pageOffset = link.page\">{{ link.page + 1 }}</a>\n" +
    "    <a ng-if=\"link.gap\" href=\"\">&hellip;</a>\n" +
    "  </li>\n" +
    "  <li ng-class=\"{ 'disabled': transientState.pageOffset === lastPage }\">\n" +
    "    <a ng-click=\"goForward()\" >&raquo;</a>\n" +
    "  </li>\n" +
    "</ul>\n" +
    "<span class=\"rows-per-page-ctrl\" ng-if=\"options.showRowsPerPageCtrls\">\n" +
    "  <span class=\"rows-per-page-msg\">{{ options.rowsPerPageMessage }}</span>\n" +
    "  <ul class=\"pagination\">\n" +
    "    <li ng-repeat=\"limit in options.rowsPerPageChoices\" ng-class=\"{'active': options.rowsPerPage === limit}\">\n" +
    "      <a ng-click=\"options.rowsPerPage = limit\">{{ limit }}</a>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</span>\n" +
    "");
}]);

angular.module("src/templates/apMesaRows.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/templates/apMesaRows.tpl.html",
    "<tr\n" +
    "  ng-repeat-start=\"row in visible_rows\"\n" +
    "  ng-attr-class=\"{{ (transientState.rowOffset + $index) % 2 ? 'odd' : 'even' }}\"\n" +
    "  ap-mesa-row>\n" +
    "</tr>\n" +
    "<tr ng-repeat-end ng-if=\"rowIsExpanded\" class=\"ap-mesa-expand-panel\">\n" +
    "  <td ap-mesa-expandable ng-attr-colspan=\"{{ columns.length }}\"></td>\n" +
    "</tr>\n" +
    "");
}]);

angular.module("src/templates/apMesaStatusDisplay.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("src/templates/apMesaStatusDisplay.tpl.html",
    "<div class=\"ap-mesa-status-display-wrapper\" ng-class=\"{\n" +
    "  'ap-mesa-loading': transientState.loading,\n" +
    "  'ap-mesa-error': transientState.loadingError,\n" +
    "  'has-rows': visible_rows.length && !transientState.loadingError\n" +
    "}\">\n" +
    "\n" +
    "  <!-- LOADING -->\n" +
    "  <div ng-if=\"transientState.loading\" class=\"ap-mesa-loading-display\">\n" +
    "    \n" +
    "    <!-- user-provided -->\n" +
    "    <div ng-if=\"options.loadingTemplateUrl\" ng-include=\"options.loadingTemplateUrl\"></div>\n" +
    "    <div ng-if=\"options.loadingText\">{{ options.loadingText }}</div>\n" +
    "    \n" +
    "    <!-- default -->\n" +
    "    <div ng-if=\"!options.asyncLoadingTemplateUrl && !options.asyncLoadingTemplate\" class=\"ap-mesa-status-display\">\n" +
    "      <div class=\"ap-mesa-status-display-inner\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "  \n" +
    "  <!-- ERROR -->\n" +
    "  <div ng-if=\"transientState.loadingError\" class=\"ap-mesa-error-display\">\n" +
    "    <div ng-if=\"options.loadingErrorTemplateUrl\" ng-include=\"options.loadingErrorTemplateUrl\"></div>\n" +
    "    <div ng-if=\"options.loadingErrorText\">{{ options.loadingErrorText }}</div>\n" +
    "    <div ng-if=\"!options.loadingErrorTemplateUrl && !options.loadingErrorText\" class=\"ap-mesa-error-display-inner\">An error occurred.</div>\n" +
    "  </div>\n" +
    "\n" +
    "  <!-- NO DATA -->\n" +
    "  <div ng-if=\"!transientState.loading && !transientState.loadingError && visible_rows.length === 0\" class=\"ap-mesa-no-data-display\">\n" +
    "    <div ng-if=\"options.noRowsTemplateUrl\" ng-include=\"options.noRowsTemplateUrl\"></div>\n" +
    "    <div ng-if=\"!options.noRowsTemplateUrl\">{{ options.noRowsText }}</div>\n" +
    "  </div>\n" +
    "</div>");
}]);
