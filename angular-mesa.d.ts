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
    sort?:  ITableSorter | string;
    // or string  no  undefined  If specified, defines row filter function this column uses. See Row Filtering below.
    filter?:  ITableFilterer | string;
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
  }

  interface ITableSorter {
    (rowA: any, rowB: any, options: ITableOptions, column: ITableColumn): number;
  }

  interface ITableFilterer {
    (term: string, value: any, formattedValue: string, row: any, column: ITableColumn, options: ITableOptions): boolean;
  }

  interface ITableFormatter {
    (value: any, row: any, column: ITableColumn, options: ITableOptions): string;
  }

  interface IInitialSort {
    id: string;
    dir: '-' | '+';
  }

  interface ITableStorage {
    setItem: (key: string, value: any) => ng.IPromise<any> | any;
    getItem: (key: string) => ng.IPromise<any> | any;
    removeItem: (key: string) => ng.IPromise<any> | any;
  }

  interface ITableApi {
    isSelectedAll: () => boolean;
    selectAll: () => null;
    deselectAll: () => null;
    toggleSelectAll: ($event: Event) => null;
    setLoading: (isLoading: boolean, triggerDigest: boolean) => null;
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
        activeFilters: { column: ITableColumn; value: string; }[],
        activeSorts: { column: ITableColumn; direction: 'ASC' | 'DESC' }[]
    ) => ng.IPromise<{ total: number; rows: any[]; }>
  }
  interface IRowScope extends ng.IScope {
    toggleRowExpand: Function;
    rowIsExpanded: boolean;
    refreshExpandedHeight: Function;
    row: any;
    column: ITableColumn;
    options: ITableOptions;
  }
}
