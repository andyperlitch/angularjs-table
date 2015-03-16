malhar-angular-table
====================
A table component built with angular that is catered to real-time data.

Feature List
------------
- column-specific filtering
- column sorting
- stacked ordering
- column resizing
- column re-ordering
- localStorage state persistance
- pagination

Installation
------------
```bash
$ git clone git@github.com:DataTorrent/malhar-angular-table.git
$ cd malhar-angular-table
$ npm install .
$ bower install
```

Running the Demo
----------------
```bash
$ grunt serve
```

Getting Started
---------------

First, include mlhr-table.js and mlhr-table.css in your project. Then, in your markup, instantiate table instances with an `<mlhr-table>` tag:

```HTML
<mlhr-table 
    options="options" 
    columns="columns" 
    rows="rows"
    table-class="table"
    selected="array_of_selected">
</mlhr-table>
```

Attributes
----------
The `mlhr-table` tag can have the following attributes:

|  attribute  |  type  | required |                                                         description                                                         |
| ----------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| options     | object | no       | An object containing various options for the table. See *Options Object* below for details                                  |
| columns     | Array  | yes      | An array of column definition objects. See *Column Definitions* below.                                                      |
| rows        | Array  | yes      | An array of data to be displayed. See the note on maintaining $$hashKeys in order to allow for more performant data updates |
| table-class | String | no       | A string of classes to be attached to the actual `<table>` element that gets created                                        |
| selected    | Array  | no       | This should be provided when using the `selector` built-in format. See the *Row Selection* section below.                   |
| track-by    | String | yes      | This string should be the unique key on data objects that ng-repeat should use to keep track of rows in the table           |


Options Object
--------------
The options object should be available on the parent scope of the `<mlhr-table>` element. It is optional (defaults are used) and has the following keys:

|        key         |    type   |   default   |                                                             description                                                              |
| ------------------ | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| rowPadding         | `number`  | 10          | Number of rows to add before and after the viewport                                                                                  |
| sortClasses        | `Array`   | (see below) |                                                                                                                                      |
| storage            | `Object`  | undefined   |                                                                                                                                      |
| storageKey         | `String`  | undefined   | Used as the key to store and retrieve items from `storage`, if it is specified.                                                      |
| initialSorts       | `Array`   | []          | Array of objects defining an initial sort order. Each object must have `id` and `dir`, can be "+" for ascending, "-" for descending. |
| loadingText        | `String`  | 'loading'   | String to show when data is loading                                                                                                  |
| noRowsText         | `String`  | 'no rows'   | String to show when no rows are visible                                                                                              |
| loadingTemplateUrl | `String`  | undefined   | Path to template for td when loading                                                                                                 |
| loadingPromise     | `Object`  | undefined   | Promise object for table data loading.  Used to resolve loading state when data is available. | 
| noRowsTemplateUrl  | `String`  | undefined   | Path to template for td when there are no rows to show.                                                                              |
| scrollDebounce     | `number`  | 100         | Wait time when debouncing the scroll event. Used when updating rows. Milliseconds.                                                   |
| bgSizeMultiplier   | `number`  | 1           | The background-size css attribute of the placeholder rows is set to bgSizeMultiplier * rowHeight.                                    |
| defaultRowHeight   | `number`  | 40          | When there are no rows to calculate the height, this number is used as the fallback                                                  |
| bodyHeight         | `number`  | 300         | The pixel height for the body of the table. Note that unless `fixedHeight` is set to true, this will behave as a max-height.         |
| fixedHeight        | `boolean` | false       | If true, the table body will always have a height of `bodyHeight`, regardless of whether the rows fill up the vertical space.        |
| onRegisterApi      | `function` | {}         | Provides a access to select table controller methods, including selectAll, deselectAll, isSelectedAll, setLoading, etc.              | 
| getter             | `function` | {}         | Customize the way to get column value. If not specified, get columen value by row[column.key]                                        | 


### Loading
A common requirement for tables showing dynamically loaded data is to show loading feedback. There are several options pertaining to this: `loading`, `loadingText`, and `loadingTemplateUrl`.  To disable loading text, a promise object from data loading can be provided, so that `setLoading(false)` can be attached to `promise.then()`.  Optionally, `onRegisterApi` function can be specified, which provides direct access to `setLoading` and other table controller methods.  This function specifies a single argument, which is the api object provided by the table.  Example: `onRegisterApi: function(api) { $scope.tableAPI = api; }`.

### No Visible Rows
Similar to loading state, there are two options for visual representation of when there are no rows: `noRowsText` and `noRowsTemplateUrl`.

### `sortClasses`
Default Value: `[ 'glyphicon glyphicon-sort', 'glyphicon glyphicon-chevron-up', 'glyphicon glyphicon-chevron-down' ]`
If a column has a `sort` function specified, the column header will contain a `<span>` element with a css class of `sorting-icon`. This `sortClasses` array contains three strings that will be appended to the `<span>` className, one for each state of a sorted column: [classes\_for\_no\_sort, classes\_for\_ascending\_sort, classes\_for\_descending\_sort].

### Storage
If defined, this requires the presence of `storageKey`. This object should follow a subset of the API for `localStorage`; specifically having the methods `setItem`, `getItem`, and `removeItem`. It will use `storageKey` as the key to set. The most common use-case for this is simply to pass `localStorage` to this option.

### `options` decoration
An advantage of providing an options object is that mlhrTable decorates it with a few things for greater control. Below are the things mlhrTable adds.

#### `options.scrollingPromise`
When the user is scrolling, this property will be a promise that gets resolved when the user has stopped scrolling. If the user is not scrolling, this will have a value of `null`. This can be useful if the table has a lot of columns and you want to optimize performance by deferring updates to when the user stops scrolling.


Column Definitions
-----------------
The columns should be an array of Column Definition Objects. The order in which they appear in this array dictates the order they will appear by default. Column Definition Objects have the following properties:

| property key |          type          | required | default value |                                      description                                       |
| ------------ | ---------------------- | -------- | ------------- | -------------------------------------------------------------------------------------- |
| id           | `string`               | yes      | undefined     | Identifies the column.                                                                 |
| key          | `string`               | yes      | undefined     | The field on each row that this column displays or uses in its format function.        |
| label        | `string`               | no       | `id`          | The column heading text. If not present, `id` is used.                                 |
| sort         | `function` or `string` | no       | undefined     | If specified, defines row sort function this column uses. See *Row Sorting* below.     |
| filter       | `function` or `string` | no       | undefined     | If specified, defines row filter function this column uses. See *Row Filtering* below. |
| format       | `function` or `string` | no       | ''            | If specified, defines cell format function. See the *Cell Formatting* section below.   |
| width        | `string` or `number`   | no       | 'auto'        | width of column, can include units, e.g. '30px'                                        |
| lockWidth   | `boolean`              | no       | false         | If true, column will not be resizable.                                                 |
| ngFilter     | `string`               | no       | undefined     | Name of a registered filter to use on row[column.key]                                  |
| template     | `string`               | no       | undefined     | A string template for the cell contents                                                |
| templateUrl  | `string`               | no       | undefined     | A template url used with ng-include for cell contents                                  |
| title        | `string`               | no       | undefined     | A tooltip for a column header.                                                         |


Row Sorting
-----------
The rows of the table can be sortable based on a column by setting the `sort` attribute of a Column Definition Object to a function with the following signature:

    /**
     * Defines sort function for ascending order.
     * @param {Object} rowA     First row being compared
     * @param {Object} rowB     Second row being compared
     * @return {Number}         Result of comparison. 
     */
    function MySortFunction(rowA, rowB) {
        // Assuming propertyKey is numeric, 
        // this would work as a number sorter:
        return rowA.propertyKey - rowB.propertyKey;
    }

The returned value should mirror how `Array.prototype.sort` works: If the returned value is negative, rowA will be placed above rowB in the ascending sort order. If it is negative, rowB will be placed above rowA in the ascending sort order. If it is zero, the two rows will be considered the same in terms of sorting precedence.

There are two built-in sort functions availablewhich handle the two most common use-cases: `"string"` and `"number"`. To use these, simply set the `sort` attribute to one of these strings.

Sorting can be set by the user by clicking the headers of sortable columns, and can be stacked by holding shift and clicking. The initial sort order can be set using the `initialSorts` option in the Options Object, shown in the table above.

Row Filtering
-------------

If a `filter` function is set on a Column Definition Object, that column will contain an input field below the main column header where the user can type in a value and the rows will be filtered based on what they type and the behavior of the function. This function should have the following signature:

    /**
     * Defines a filtering function
     * @param {String} term          The term entered by the user into the filter field.
     * @param {Mixed} value          The value of row[column.key]
     * @param {Mixed} computedValue  The value of column.format(row[column.key], row). Will be the same as `value` if there is no format function for the column.
     * @param {Object} row            The actual row of data
     * @return {Boolean}
     */
    function MyFilterFunction(term, value, computedValue, row) {
        // Assuming row[column.key] is a string,
        // this would work as a simple matching filter:
        return value.indexOf(term) >= 0;
    }

When there is a value provided by the user in the filter field, every row in the dataset is passed through this function. If the function returns true, the row will be included in the resulting rows that get displayed. Otherwise it is left out.

There are several common filter functions that are built-in. Use them by passing one of the following strings instead of a function:

| string | description |
|--------|-------------|
| like   | Search by simple substring, eg. "foo" matches "foobar" but not "fobar". Use "!" to exclude and "=" to match exact text, e.g. "!bar" or "=baz". | 
| likeFormatted | Same as "like", but looks at formatted cell value instead of raw. |
| number | Search by number, e.g. "123". Optionally use comparator expressions like ">=10" or "<1000". Use "~" for approx. int values, eg. "~3" will match "3.2". |
| numberFormatted | Same as number, but looks at formatted cell value instead of raw |
| date | Search by date. Enter a date string (RFC2822 or ISO 8601 date). You can also type "today", "yesterday", "> 2 days ago", "< 1 day 2 hours ago", etc. |

Cell Formatting
---------------


Row Selection
-------------
There is a special type of column called a selector, which will render as a checkbox that, when clicked, will populate a `selected` array that is provided through an attribute of the `mlhr-table` element. The following is an example column definition for a selector (Usually this column appears first):

    $scope.myColumns = [
        {
            id: 'selector',
            key: 'idKeyOfObjects',   // used to populate the selected array
            label: '',               // no label for checkbox column
            selector: true,
            width: '40px',           // Fixed width of 40px
            lockWidth: true,         // to keep it narrow
            selectObject: true       // Optional: by default, selecting a row puts the value of 
                                     // row[idKeyOfObjects] into the selected array. If this option
                                     // is set to true, the entire object will be placed into the 
                                     // selected array.
        }
    ]



Browser Support
---------------
IE 9+
Firefox 4+
Safari 5+
Chrome 5+
