declare namespace angular.apMesa {

  type PAGING_STRATEGY = 'PAGINATE' | 'SCROLL' | 'NONE';

  interface ITableProvider {
    setDefaultOptions: (defaults: ITableOptions) => null;
  }

  interface ITableService {
    setDefaultOptions: (defaults: ITableOptions) => null;
    getDefaultOptions: () => ITableOptions;
  }

  interface ITableColumn {
    // Identifies the column.
    id:  string;
    // The field on each row that this column displays or uses in its format function.
    key:  string;
    // The column heading text (or template or templateUrl). If not present, id is used.
    label?:  string;
    labelTemplate?: string;
    labelTemplateUrl?: string;
    // If specified, defines row sort function this column uses. See Row Sorting below.
    sort?:  ITableSorter | string | true;
    // or string  no  undefined  If specified, defines row filter function this column uses. See Row Filtering below.
    filter?:  ITableFilterer | string | true;
    // Defines the placeholder text for the filter input, when filter is enabled
    filterPlaceholder?: string;
    // or string  no  ''  If specified, defines cell format function. See the Cell Formatting section below.
    format?:  ITableFormatter | string;
    // width of column, can include units, e.g. '30px'
    width?:  string | number;
    // If true, column will not be resizable.
    lockWidth?:  boolean;
    // Name of a registered angular filter to use on row[column.key]
    ngFilter?:  string;
    // A string template for the cell contents.
    template?:  string;
    // A template url used with ng-include for cell contents
    templateUrl?:  string;
    // A tooltip for a column header.
    title?:  string;
    // Marks the column as a "selector" column.
    selector?: boolean;
    // CSS classes to be added to the <th> element
    classes?: string;
  }

  interface ITableSorter {
    (rowA: any, rowB: any, options: ITableOptions, column: ITableColumn): number;
  }

  interface ITableFilterer {
    (term: string, value: any, formattedValue: string, row: any, column: ITableColumn, options: ITableOptions): boolean;
  }

  interface ITableFormatter {
    (value: any, row: any, column: ITableColumn, options: ITableOptions): any;
  }

  interface IInitialSort {
    id: string;
    dir: '-' | '+';
  }

  interface IActiveFilter {
    column: ITableColumn;
    value: string;
  }

  interface IActiveSort {
    column: ITableColumn;
    direction: 'ASC' | 'DESC';
  }

  interface IGetDataResponse {
    total: number;
    rows: any[];
  }

  interface ITableStorage {
    setItem: (key: string, value: any) => ng.IPromise<any> | any;
    getItem: (key: string) => ng.IPromise<any> | any;
    removeItem: (key: string) => ng.IPromise<any> | any;
  }

  interface ITableApi {
    isSelectedAll: () => boolean;
    selectAll: () => void;
    deselectAll: () => void;
    toggleSelectAll: () => void;
    setLoading: (isLoading: boolean, triggerDigest?: boolean) => void;
    reset: () => void;
    clearFilters: () => void;
    // Resets rows' sorting order to whatever options.initialSorts. You can also pass an explicit array of IInitialSort objects.
    resetRowSort: (sorts?: IInitialSort[]) => void;
    hasActiveFilters: () => boolean;
    toggleFiltersRow: (showFiltersRow?: boolean) => void;
    isFilterRowEnabled: () => boolean;
    setFilter: (columnId, value) => void;
  }

  interface ITableOptions {
    //  Number of pixels to pre-render before and after the viewport (default: 10)
    rowPadding?:  number;
    //  The classes to use for the sorting icons
    sortClasses?:  [string, string, string];
    //  undefined
    storage?:  ITableStorage;
    //  Arbitrary "version" hash used to identify and compare items in storage.
    storageHash?:  string;
    //  Used as the key to store and retrieve items from storage, if it is specified.
    storageKey?:  string;
    //  Array of objects defining an initial sort order. Each object must have id and dir, can be "+" for ascending, "-" for descending.
    initialSorts?:  IInitialSort[];
    //  String to show when data is loading
    loadingText?:  string;
    //  String to show when no rows are visible
    noRowsText?:  string;
    //  Path to template for td when loading
    loadingTemplateUrl?:  string;
    //  undefined  Promise object for table data loading. Used to resolve loading state when data is available.
    loadingPromise?:  ng.IPromise<any>;
    //  undefined  Path to template for td when there is an error loading table data.
    loadingErrorTemplateUrl?:  string;
    //  'error loading results'  string to show when loading fails
    loadingErrorText?:  string;
    //  undefined  Path to template for td when there are no rows to show.
    noRowsTemplateUrl?:  string;
    //  100  Wait time when debouncing the scroll event. Used when updating rows. Milliseconds.
    scrollDebounce?:  number;
    //  1  The background-size css attribute of the placeholder rows is set to bgSizeMultiplier * rowHeight.
    bgSizeMultiplier?:  number;
    //  40  When there are no rows to calculate the height, this number is used as the fallback
    defaultRowHeight?:  number;
    //  300  The pixel height for the body of the table. Note that unless fixedHeight is set to true, this will behave as a max-height.
    bodyHeight?:  number;
    //  false  If true, the table will fill the calculated height of the parent element. Note that this overrides bodyHeight. The table will listen for 'apMesa:resize' events from the rootScope to recalculate the height.
    fillHeight?:  boolean;
    //  false  If true, the table body will always have a height of bodyHeight, regardless of whether the rows fill up the vertical space.
    fixedHeight?:  boolean;
    //  Provides access to select table controller methods, including selectAll, deselectAll, isSelectedAll, setLoading, etc.
    onRegisterApi?:  (api: ITableApi) => any;
    //  {}  Customize the way to get column value. If not specified, get columen value by row[column.key]
    getter?:  (key: string, row: any) => string;
    //  undefined  A template reference to be used for the expandable row feature. See Expandable Rows below.
    expandableTemplateUrl?:  string;
    expandableTemplate?: string;
    // SCROLL 
    pagingStrategy?: PAGING_STRATEGY;
    rowsPerPage?: number;
    rowsPerPageChoices?: number[];
    rowsPerPageMessage?: string;
    showRowsPerPageCtrls?: boolean;
    maxPageLinks?: number;
    // Async server-side interaction support
    getData?: (
        offset: number,
        limit: number,
        activeFilters: IActiveFilter[],
        activeSorts: IActiveSort[]
    ) => ng.IPromise<IGetDataResponse>;
    // If true, will show a number indicating stacked sort priority of each column being sorted.
    showSortPriority?: boolean;
    // If true, a column's filter state will be removed when that column is hidden.
    clearFilterOnColumnHide?: boolean;
    // If true, a column's sort state will be removed when that column is hidden.
    clearSortOnColumnHide?: boolean;
  }
  interface IRowScope extends ng.IScope {
    toggleRowExpand: Function;
    rowIsExpanded: boolean;
    refreshExpandedHeight: Function;
    row: any;
    options: ITableOptions;
  }
  interface ICellScope extends ng.IScope {
    toggleRowExpand: Function;
    rowIsExpanded: boolean;
    refreshExpandedHeight: Function;
    row: any;
    column: ITableColumn;
    options: ITableOptions;
  }
}
