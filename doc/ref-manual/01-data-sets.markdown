---
layout: default
title: Reference manual - Data sets
---

# 1. Data sets

Data sets can be included in HTML pages and named using the
`<plot-data>` directive, and AngularJS data binding can be used to
access arbitrary values from page UI elements or other sources.

<hr>
## The `<plot-data>` directive

### Attributes

|Name       |&nbsp;&nbsp;&nbsp;|Description|
|-----------|-|----------------------------|
|`NAME`     | |Data set name (mandatory)|
|`SUBNAME`  | |Data set sub-name|
|`FORMAT`   | |One of `csv` or `json` (default)|
|`COLS`     | |Column names for CSV data|
|`SEPARATOR`| |Separator character for columns in CSV data (defaults to ",")|
|`SRC`      | |URL for data source|
|`NG-MODEL` | |Angular data binding attribute|

### Body

Optionally, `metadata` directives describing the data values.  If no
`SRC` attribute is used to specify the data source, then the data
values are included in the body of the directive in the given format.

### Interpretation

The `<plot-data>` directive forms an association between the name
given as the `NAME` attribute of the directive and the given data set.
The data set name can then be used to create data paths to access
components of the data set in plotting directives
([see here](#data-accessors)).  The data set name is installed as an
Angular variable in the Angular scope of the containing HTML element.
If the `SUBNAME` attribute is supplied as well, then the data is
installed as the `SUBNAME` field of an Angular scope variable whose
name is `NAME` (this is useful for using `<plot-data>` in conjunction
with `ng-repeat`).  The `<plot-data>` element does not create a scope
of its own.  For CSV data, if no `COLS` attribute is given, the column
names are taken from the first line of the data.

When data is loaded from a URL using the `SRC` attribute, the
semantics of the `<plot-data>` directive are identical to the case
where the data is included directly in the directive body (except for
possible rendering issues if the data download takes a long time: you
may see warnings from the `radianEval` function in the browser console
when Radian attempts to plot the empty data set before the data has
arrived -- these warnings are harmless, and the plots are re-rendered
when the data download is complete).  Replotting is triggered if the
`SRC` attribute changes, so that an expression can be used to load
data from different sources specified by an expression.

Alternatively, the data for plotting can be bound directly to an
Angular scope variable by using the `NG-MODEL` attribute.  This works
as it does for other Angular directives.

### Examples

#### Temperature data by date with error information

~~~~ {.html}
<plot-data id="globaltemp" format="csv" cols="date,temp,error">
  <metadata name="date" format="date"></metadata>
  <metadata name="temp" label="Global mean temperature" units="&deg;C">
  </metadata>
  <metadata name="error" error-for="temp"></metadata>
"1970-01-15", 17.352, 0.100
"1970-02-14", 16.936, 0.090
"1970-03-15", 17.029, 0.095
"1970-04-15", 17.550, 0.087
...
</plot-data>
~~~~

#### JSON location data

~~~~ {.html}
<plot-data id="pumps">
  [ { "name": "Broad Street", "lat": 51.02345, "lon": 0.02345 },
    { "name": "Other",        "lat": 51.05445, "lon": 0.04538 } ]
</plot-data>
~~~~


<hr>
## The `<metadata>` directive

The `<metadata>` directive that may appear inside `<plot-data>`
directives provides additional information about `<plot-data>` data
fields that may be useful for plotting.  Multiple `<metadata>` items
may appear within a `<plot-data>` directive, up to one per data field.

### Attributes

|Name               |Description |
|-------------------|------------|
|`NAME`             |Refers to a data field name in the enclosing`<plot-data>` directive (mandatory)|
|`FORMAT`           |Absent or `date` (specifies dates either using flexible parsing or in restricted format given by the `DATE-PARSE-FORMAT` attribute)|
|`DATE-PARSE-FORMAT`|`strftime()`-like date parsing format (or `isodate` to specify dates in strict ISO 8601 format)|
|`DATE-FORMAT`      |Date output format for plot axes|
|`LABEL`            |Axis/legend label for the named data field|
|`UNITS`            |Units for the named field|
|`ERROR-FOR`        |Names another data field for which this field is an uncertainty/error value|
|`CATEGORY-ORDER`   |Semicolon-separated list of categorical values, specifying an ordering to be used for plotting.|

### Body

None

### Interpretation

A `<metadata>` directive specifies metadata for a single field of an
associated containing `<plot-data>` directive.  This metadata either
gives label and units information for axis and legend labels, marks
data fields as having special formats (currently only dates, but this
could be used for other things as well) and allows fields to be marked
up as providing uncertainty values for other fields (this information
can be used to plot error bars or uncertainty ranges).

The data field that the metadata corresponds to is specified using the
`NAME` attribute, which is a period-separated list of field names
giving a path to the field of interest.

### Examples

~~~~ {.html}
<metadata name="date" format="date" date-parse-format="isodate"
          date-format="%e %b %Y"></metadata>
<metadata name="date.doy" label="Day of year"></metadata>
<metadata name="temp" label="Mean temperature" units="&deg;C"></metadata>
<metadata name="error" error-for="temp"></metadata>
~~~~
