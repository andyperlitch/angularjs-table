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
<mlhr-table options="options" table-class="table" columns="columns" rows="rows"></mlhr-table>
```

Attributes
----------
| attribute | type | required | description |
|-----------|------|---------|-------------|
| `options`   | object | no  | An object containing various options for the table. See *Options Object* below for details|
| `columns` | Array | yes | An array of column definition objects. See *Column Definitions* below. |
| `rows`    | Array | yes | An array of data to be displayed. See the note on maintaining $$hashKeys in order to allow for more performant data updates |
| `table-class` | String | no | A string of classes to be attached to the actual `<table>` element that gets created |
| `selected` | Array | no | This should be provided when using the `selector` built-in format. When rows are selected with their checkbox column, this array is populated with the `key` specified by the column definition with the `selector` format. |


Options Object
--------------
The options object should be available on the parent scope of the `<mlhr-table>` element. It is optional (defaults are used) and has the following keys:

| key | type | default | description |
|-----|------|---------|-------------|
| row_limit | `number` | 30 | Max number of rows to display at any one time.
| pagingScheme | `String` | 'scroll' | Scheme for navigating lists that extend beyond `row_limit`. Available values: "scroll", "page".
| sort_classes | `Array` | `[ 'glyphicon glyphicon-sort', 'glyphicon glyphicon-chevron-up', 'glyphicon glyphicon-chevron-down' ]` | If a column has a `sort` function specified, the column header will contain a `<span>` element with a css class of `sorting-icon`. This `sort_classes` array contains three strings that will be appended to the `<span>` className, one for each state of a sorted column: [classes\_for\_no\_sort, classes\_for\_ascending\_sort, classes\_for\_descending\_sort].
| storage | `Object` | undefined | If defined, this requires the presence of `storage_key`. This object should follow a subset of the API for `localStorage`; specifically having the methods `setItem`, `getItem`, and `removeItem`. It will use `storage_key` as the key to set. The most common use-case for this is simply to pass `localStorage` to this option. |
| storage_key | `String` | undefined | Used as the key to store and retrieve items from `storage`, if it is specified. |
| initial_sorts | `Array` | [] | Array of objects defining initial sorting order. Sort order is stackable. Keys on objects should be `id` to specify the column and `dir` to specify direction ("+" or "-") |



Column Definitions
-----------------
The columns should be an array of Column Definition Objects. The order in which they appear in this array dictates the order they will appear by default. Column Definition Objects have the following properties:

| property key | type | required | default value | description |
|--------------|------|----------|---------------|-------------|
| id | `string` | yes | undefined | Identifies the column. |
| key | `string` | yes | undefined | The field on each row that this column displays or uses in its format function. |
| label | `string` | no | `id` | The column heading text. If not present, `id` is used. |
| sort | `function` or `string` | no | undefined | If specified, defines the row sorting function this column should use. See the *Row Sorting* section below. |
| filter | `function` or `string` | no | undefined | If specified, defines the row filter function this column should use. See the *Row Filtering* section below. |
| format | `function` or `string` | no | '' | If specified, defines a function used to format the contents of each cell in the column. See the *Cell Formatting* section below. |
| trustFormat | boolean | no | false | If true, will trust that the format function returns html |
| width | `string` or `number` | no | 'auto' | width of column, can include units, e.g. '30px' |
| lock_width | `boolean` | no | false | If true, column will not be resizable. |

### Row Sorting
The rows of the table can be sortable based on a column by setting the `sort` attribute of a Column Definition Object to a function with the following signature:

    /**
     * Defines sort function for ascending order.
     * @param {Object} rowA     First row being compared
     * @param {Object} rowB     Second row being compared
     * @return {Number}         Result of comparison. 
     */
    function MySortFunction(rowA, rowB) {
        return rowA.propertyKey - rowB.propertyKey;
    }

The returned value should mirror how `Array.prototype.sort` works: If the returned value is negative, rowA will be placed above rowB in the ascending sort order. If it is negative, rowB will be placed above rowA in the ascending sort order. If it is zero, the two rows will be considered the same in terms of sorting precedence.

There are two built-in sort functions availablewhich handle the two most common use-cases: `"string"` and `"number"`. To use these, simply set the `sort` attribute to one of these strings.

Sorting can be set by the user by clicking the headers of sortable columns, and can be stacked by holding shift and clicking. The initial sort order can be set using the `initial_sorts` option in the Options Object, shown in the table above.

### Row Filtering

this is the function that the filter field at the top of the column should use to determine if a row is a match. This can be a string from the built-in filter functions ("like", "likeFormatted", "number", "numberFormatted", or "date"), or it can be a function with the following signature: 

### Cell Formatting



Browser Support
---------------
IE 9+
Firefox 4+
Safari 5+
Chrome 5+
