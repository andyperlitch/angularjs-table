apTable
========
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

Getting Started
---------------

First, include ap-table.js and ap-table.css in your project. Then, in your markup, instantiate table instances with an `<ap-table>` tag:

```HTML
<ap-table columns="columns" rows="rows"></ap-table>
```

The `columns` and `rows` in the above markup should be arrays that are available in the current scope. Below are the various options for them:


Column Definitions
-----------------
The columns should be an array of objects, where each object must have (or can have) the following properties:

| key | required | default value |  


Browser Support
---------------
IE 9+
Firefox 4+
Safari 5+
Chrome 5+
