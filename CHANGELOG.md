CHANGELOG
=======================================================

Note that patch versions might not show up here, but always use the latest patch version under a particular minor version.
As per semver specs, major versions are not backwards-compatible, minor versions are backwards compatible but with new features,
and patch versions are just bug fixes.

## `v2.18.0`

- Added support for `enabled-columns` input. This allows you to programmatically and dynamically control what columns are currently being shown.

## `v2.17.0`

- Add sort order indicator to angularjs-table (#10)
- Edge number on pagination cases not to show data (#11)
- min-width added to column

## `v2.16.0`

- `clearFilters` function added to table API (#9)
- column is resized improperly (#8)

## `v2.15.0`

- Added ap-mesa-no-data class to wrapper when no data

## `v2.14.0`

- Added ap-mesa-loading-error class to wrapper when error

## `v2.13.0`

- Added `reset` method to the table API.
- Updated classes for loading element


## `v2.12.0`

- added "table-header-{column.id}" class to all <th> elements

## `v2.11.0`

- Added support for the `on-row-click` attribute.

## `v2.10.0`

- Added server-side interaction support with `options.getData`
- Improved loading/error/no-data message display with the apMesaStatusDisplay directive
- added the `filterPlaceholder` option to column definition objects

## `v2.9.0`

- Added support for `labelTemplate` and `labelTemplateUrl`


## `v2.8.0`

- Added pagination support


## `v2.7.0`

- Added typescript definitions
- Added `options` to the filter and format function signatures


## `v2.6.0`

- Added provider to define global table option defaults
