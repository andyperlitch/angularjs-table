malhar-angular-table
====================
A table component built with angular that is catered to real-time data. [View live demo](http://datatorrent.github.io/malhar-angular-table/).

Feature List
------------
- column-specific filtering
- column sorting
- stacked ordering
- column resizing
- column re-ordering
- localStorage state persistance
- pagination

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

|      key      |   type   |   default   |                                                             description                                                              |
| ------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| row_limit     | `number` | 30          | Max number of rows to display at any one time.                                                                                       |
| pagingScheme  | `String` | 'scroll'    | Scheme for navigating lists that extend beyond `row_limit`. Available values: "scroll", "page".                                      |
| sort_classes  | `Array`  | (see below) |                                                                                                                                      |
| storage       | `Object` | undefined   |                                                                                                                                      |
| storage_key   | `String` | undefined   | Used as the key to store and retrieve items from `storage`, if it is specified.                                                      |
| initial_sorts | `Array`  | []          | Array of objects defining an initial sort order. Each object must have `id` and `dir`, can be "+" for ascending, "-" for descending. |

### `sort_classes`
Default Value: `[ 'glyphicon glyphicon-sort', 'glyphicon glyphicon-chevron-up', 'glyphicon glyphicon-chevron-down' ]`
If a column has a `sort` function specified, the column header will contain a `<span>` element with a css class of `sorting-icon`. This `sort_classes` array contains three strings that will be appended to the `<span>` className, one for each state of a sorted column: [classes\_for\_no\_sort, classes\_for\_ascending\_sort, classes\_for\_descending\_sort].

### Storage
If defined, this requires the presence of `storage_key`. This object should follow a subset of the API for `localStorage`; specifically having the methods `setItem`, `getItem`, and `removeItem`. It will use `storage_key` as the key to set. The most common use-case for this is simply to pass `localStorage` to this option.


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
| lock_width   | `boolean`              | no       | false         | If true, column will not be resizable.                                                 |
| ngFilter     | `string`               | no       | undefined     | Name of a registered filter to use on row[column.key]                                  |
| template     | `string`               | no       | undefined     | A string template for the cell contents                                                |
| templateUrl  | `string`               | no       | undefined     | A template url used with ng-include for cell contents                                  |


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

Sorting can be set by the user by clicking the headers of sortable columns, and can be stacked by holding shift and clicking. The initial sort order can be set using the `initial_sorts` option in the Options Object, shown in the table above.

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




Browser Support
---------------
IE 9+
Firefox 4+
Safari 5+
Chrome 5+
