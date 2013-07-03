---
layout: default
title: Reference manual
---

**Note that throughout this page, in running text Radian expressions
are represented as `[ [expr]]`.  That space between the leading square
brackets shouldn't be there, but it's needed to stop GitHub's Markdown
parser from interpreting Radian expressions as links (even within code
backticks...).**

### 12 February 2013

## Introduction

The *Radian* plotting library provides a convenient approach to
embedding SVG plots in HTML documents.  Plots are specified using
custom HTML-like elements (e.g. `<plot>`, `<lines>`, `<plot-data>`,
etc.) whose attributes and contents are used to control plot
appearance and plot data.  A flexible expression syntax is provided to
make the access of compound JSON datasets simple, and to allow for
grouping and simple processing of data for plotting.

*Radian* works by combining the benefits of the AngularJS JavaScript
framework with the data visualisation capabilities of the D3.js
library.  A Haskell combinator library is provided for easy
server-side rendering of plots.

#### Caveat

Because of the way that browsers parse HTML pages, it is, in general,
not possible to use XML's compact tag syntax `<tag a="abc"/>` for
custom tags that are not part of the HTML standard even if these tags
do not have any content.  This means that all custom tags must be
closed by an explicit close tag, even if there is no content within
the tag.  For example, `<metadata>` tags must always be immediately
closed by a `</metadata>`.



## JavaScript data access

The HTML side of the plotting API uses a slight extension of the
JavaScript expression syntax to express values to be plotted.  Data
sets can be included in HTML pages and named using the `<plot-data>`
directive, and AngularJS data binding can be used to access arbitrary
values from page UI elements or other sources.

### The `<plot-data>` directive

**Not done: load from URL**

###### Attributes

|Name       |Description                                                  |
|-----------|-------------------------------------------------------------|
|`NAME`     |Data set name (mandatory)                                    |
|`FORMAT`   |One of `csv` or `json` (default)                             |
|`COLS`     |Column names for CSV data                                    |
|`SEPARATOR`|Separator character for columns in CSV data (defaults to ",")|
|`SRC`      |URL for data source                                          |

###### Body

Optionally, `metadata` directives describing the data values.  If no
`SRC` attribute is used to specify the data source, then the data
values are included in the body of the directive in the given format.

###### Interpretation

The `<plot-data>` directive forms an association between the name
given as the `ID` attribute of the directive and the given data set.
The data set name can then be used to create data paths to access
components of the data set in plotting directives
([see here](#data-accessors)).

When data is loaded from a URL, the semantics of the `<plot-data>`
directive are identical to the case where the data is included
directly in the directive body (except for possible rendering issues
if the data download takes a long time...).

###### Examples

Temperature data by date with error information:
```html
<plot-data id="globaltemp" format="csv" cols="date,temp,error">
  <metadata name="date" format="date"/>
  <metadata name="temp" label="Global mean temperature" units="&deg;C"/>
  <metadata name="error" error-for="temp"/>
"1970-01-15", 17.352, 0.100
"1970-02-14", 16.936, 0.090
"1970-03-15", 17.029, 0.095
"1970-04-15", 17.550, 0.087
...
</plot-data>
```

JSON location data:
```html
<plot-data id="pumps">
  [ { "name": "Broad Street", "lat": 51.02345, "lon": 0.02345 },
    { "name": "Other",        "lat": 51.05445, "lon": 0.04538 } ]
</plot-data>
```


### The `<metadata>` directive

The `<metadata>` directive that may appear inside `<plot-data>`
directives provides additional information about `<plot-data>` data
fields that may be useful for plotting.  Multiple `<metadata>` items
may appear within a `<plot-data>` directive, up to one per data field.

###### Attributes

|Name               |Description                                                                                                                        |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------|
|`NAME`             |Refers to a data field name in the enclosing`<plot-data>` directive (mandatory)                                                    |
|`FORMAT`           |Absent or `date` (specifies dates either using flexible parsing or in restricted format given by the `DATE-PARSE-FORMAT` attribute)|
|`DATE-PARSE-FORMAT`|`strftime()`-like date parsing format (or `isodate` to specify dates in strict ISO 8601 format)                                    |
|`DATE-FORMAT`      |Date output format for plot axes                                                                                                   |
|`LABEL`            |Axis/legend label for the named data field                                                                                         |
|`UNITS`            |Units for the named field                                                                                                          |
|`ERROR-FOR`        |Names another data field for which this field is an uncertainty/error value                                                        |

###### Body

None

###### Interpretation

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

###### Examples

Simple example demonstrating all attributes:
```html
<metadata name="date" format="date" date-parse-format="isodate"
          date-format="%e %b %Y"></metadata>
<metadata name="date.doy" label="Day of year"></metadata>
<metadata name="temp" label="Mean temperature" units="&deg;C"></metadata>
<metadata name="error" error-for="temp"></metadata>
```


### <a name="data-accessors">Data accessor syntax</a>

Within plotting directives, data values to be plotted, as well as
other plot attributes (e.g. marker size, colours, and so on) are
specified using an extended JavaScript expression syntax.  There are
three aspects to this syntax: permitted operators, name scoping and
attribute data binding, and standard functions.

In order to distinguish between Radian expressions and raw string
values, all Radian expressions are enclosed in double square brackets,
e.g. `[ [x+y]]`.  This is the same sort of approach as taken in
Angular, where the double brace notation `{{expr}}` introduces an
Angular expression.  The Radian expression syntax is a superset of
full JavaScript expression syntax, so is rather more flexible than the
more restricted grammar supported for Angular expressions.

#### Data accessor operators

Data accessor syntax allows three extensions to standard JavaScript
syntax.  These are intended to make it more convenient to write the
kinds of expressions that needed in common plot types.

**Exponentiation operator** Instead of writing `Math.pow(x,y)`, one
may write `x**y`.  The `**` operator has a higher precedence than any
other binary operator.

**Pluck operator** If `y` is an identifier, the expression `x#y` is
equivalent to
```javascript
x.map(function(e) { return e.y; )}
```
while if `y` is an integer literal, `x#y` is equivalent to
```javascript
x.map(function(e) { return e[y]; )}
```
and if `expr` is a general JavaScript expression, `x#(expr)` (note
parentheses!) is equivalent to
```javascript
x.map(function(e) { return e[expr]; )}
```

This allows fields from arrays of objects or arrays of arrays to be
plucked out into flat arrays in a simple way (method "plucking" of the
form `x#f(z)` is also supported).  This syntax is particularly useful
for JSON arrays of objects or for compound object fields within other
data.  For instance, if we have a data set `d` with a field `date`
containing an array of date fields, we can extract the day of year of
each date as a single array using the expression `d.date#dayOfYear()`.
Note that the *only* possibilities for the right hand side of the `#`
operator are an identifier, a literal integer or a parenthesised
expression (the parentheses are necessary for disambiguation of the
`x#y` and `x#(y)` cases -- in the first case `y` is an identifier, in
the second an expression).

**Expression vectorisation** Standard functions and arithmentic
operators are automatically vectorised, so that, for example, `sin(x)`
calculates either the sine of a single value or an array and `x + y`
adds two arrays, two scalars or a scalar and an array in the natural
way.  This means that we can express functional plots in a very simple
way:
```html
<plot height=300 aspect=3 stroke-width=1>
  <lines x="[[seq(-1,1,100)]]" y="[[-x**3+x+sin(x)]]" stroke="red"/>
</plot>
```


#### Name scoping and data binding in data accessors

The following names are in scope within data accessor expressions:

* The names of all datasets defined in `<plot-data>` directives, with
  variable names given by the directives' `ID` attributes.

* All names passed as attributes to plotting directives that are not
  reserved (see list in the [Appendix](#reserved)).

* The functions and constants defined [here](#std-fns).

What this means is that it is possible to pass data values around
using attributes with meaningful names.  Keeping the namespace for
plot expression evaluation separate from the Angular scope namespaces
is useful since we want to implicitly bring data set names into scope,
as well as simplified standard function names to make writing plot
directives quick and simple.

Combined with Angular's `ng-model` data binding attribute and
`{{expr}}` expression syntax, we can do some very powerful things:
```html
<div class="form-inline">
  <label>Mean</label>
  <input type="text" ng-model="mu" ng-init="mu=5">
  <label>&nbsp;&nbsp;Standard deviation</label>
  <input type="text" ng-model="sigma" ng-init="sigma=1">
</div>
<br>

<plot height=300 aspect=3 stroke-width=2 stroke="red">
  <lines x="[[seq(0,10,200)]]" y="[[normal(x,{{mu}},{{sigma}})]]"/>
</plot>
```

In this example, updating the values in the input text fields triggers
an immediate update of the plot, pulling in the new values from the UI
elements.  This means that plots can be attached to arbitrary UI
elements with ease.  Note how Angular expressions with their
`{{expr}}` syntax may be embedded within Radian expressions.  The
Radian expression parsing infrastructure interacts correctly with
Angular data binding so that plots are regenerated when Angular
expressions within Radian expressions change.

#### <a name="std-fns">Standard functions</a>

###### JavaScript standard functions

The following constants and functions from the `Math.xxx` JavaScript
scope are brought into scope within data accessor expressions
(i.e. one can write "`sin(x)`" instead of "`Math.sin(x)`"): `E`,
`LN10`, `LN2`, `LOG10E`, `LOG2E`, `PI`, `SQRT1\_2`, `SQRT2`, `abs`,
`acos`, `asin`, `atan`, `atan2`, `ceil`, `cos`, `exp`, `floor`, `log`,
`pow`, `round`, `sin`, `sqrt`, `tan`.

###### D3 functions

The following functions from the `d3.xxx` JavaScript scope are brought
into scope within data accessor expressions (i.e. one can write
"`extent(x)`" instead of "`d3.extent(x)`"): `min`, `max`, `extent`,
`sum`, `mean`, `median`, `quantile`, `zip`.

###### Extra functions

`seq`, `seqStep`: Generate evenly spaced sequences of values:
`seq(start, end, n)` produces a sequence of `n` values ranging from
`start` to `end`, while `seqStep(start, end, delta)` produces a
sequence from `start` to `end` in steps of `delta`.

`sdev`: Calculate the sample standard deviation of an array.

`unique`: Return the unique entries in an array in the order that they
first appear.

`minBy`, `maxBy`, `sumBy`, `meanBy`, `sdevBy`: Calculate categorical
sums, means and standard deviations of data sets: `sumBy(x, y)`
calculates the sum of `x` values for each distinct value of `y`,
returning an array of results in the order of occurrence of the
distinct values in `y`.  For example, given a dataset `d` containing
daily temperature data with associated dates, `meanBy(d#temp,
d#date#mon)` calculates a monthy seasonal cycle of temperatures.

`normal`: Normal distribution function: `normal(x, mu, sigma)` gives
the value of the normal PDF with mean `mu` and standard deviation
`sigma` at ordinate `x`.

`lognormal`: Log-normal distribution function: `lognormal(x, mu,
sigma)` gives the value of the log-normal PDF with mean `mu` and
standard deviation `sigma` at ordinate `x`.

`gamma`: Gamma distribution function: `gamma(x, k, theta)` gives the
value of the gamma PDF with shape parameter `k` and scale parameter
`theta` at ordinate `x`.

`invgamma`: Inverse gamma distribution function: `invgamma(x, alpha,
beta)` gives the value of the inverse gamma PDF with shape parameter
`alpha` and scale parameter `beta` at ordinate `x`.


#### Handling of dates

Time and date data can be read using a `<metadata>` directive
with a `FORMAT="date"` attribute.  Individual fields of date
values can then be plucked from date data using methods of the
standard JavaScript `Date` class: for instance,
`date#getMonth()` extracts the month field from a series of
dates.  In combination with aggregation functions and arbitrary
mapping functions, this allows for various complex manipulations of
date data.  This example shows extraction of date fields, aggregation
(using the `unique` and `meanBy` functions) and the use
of a user-defined function (`midMonths`) injected into the
`plotLib` plotting library in the Angular controller used to
manage the page:
```html
<plot height=300 aspect=3 stroke-width=2>
  <lines x="vic2012ooa.date" y="vic2012ooa.tmp" stroke="red"/>
  <lines x="[[midMonths(unique(vic2012ooa.date#getMonth()), 2012)]]"
         y="[[meanBy(vic2012ooa.prc,vic2012ooa.date#getMonth())]]"
         stroke="blue"/>
</plot>
```

#### Examples

In this simple example, we use Angular data binding to set the `mu`
and `sigma` attributes from scope variables called `mean` and `sdev`.
These "attribute variables" are then in scope for the calculation of
`x` and `y` attributes for the plot:
```html
<lines mu="{{mean}}" sigma="{{sdev}}"
       x="[[seq(mu-3*sigma,mu+3*sigma,100)]]" y="[[normal(x,mu,sigma)]]"/>
```

The processing of this example goes as follows:

|Evaluate|Requires                           |
|--------|-----------------------------------|
|`x`     |`mu`, `sigma`                      |
|`y`     |`x`, `mu`, `sigma`                 |
|`mu`    |AngularJS fills in value from scope|
|`sigma` |AngularJS fills in value from scope|


## Plot types

### The `<plot>` directive

**Not done: y-zooming, 2D pan and zoom, proper legend management,
marker size and type, fill opacity.**

###### Attributes

|Name              |Description                                                                                                                                                  |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
|`RANGE-X`         |Specify $x$-coordinate range for plot                                                                                                                        |
|`RANGE-Y`         |Specify $y$-coordinate range for plot                                                                                                                        |
|`RANGE`           |Specify both $x$- and $y$-coordinate ranges for plot together                                                                                                |
|`AXIS-X`          |Either `on`/`off` to allow (default) or suppress axis display, or a tick specification                                                                       |
|`AXIS-X-TRANSFORM`|If present, one of `linear` (default) or `log`                                                                                                               |
|`AXIS-X2`         |Either `on`/`off` to allow or suppress (default) axis display, or a tick specification                                                                       |
|`AXIS-Y`          |Either `on`/`off` to allow (default) or suppress axis display, or a tick specification                                                                       |
|`AXIS-Y-TRANSFORM`|If present, one of `linear` (default) or `log`                                                                                                               |
|`AXIS-Y2`         |Either `on`/`off` to allow or suppress (default) axis display, or a tick specification                                                                       |
|`AXIS-X-LABEL`    |Either `on`/`off` to allow (default) or suppress axis labelling, or a label string (when `on` is used, the axis label is taken from metadata where possible) |
|`AXIS-X2-LABEL`   |Either `on`/`off` to allow or suppress (default) axis labelling, or a label string (when `on` is used, the axis label is taken from metadata where possible) |
|`AXIS-Y-LABEL`    |Either `on`/`off` to allow (default) or suppress axis labelling, or a label string (when `on` is used, the axis label is taken from metadata where possible) |
|`AXIS-Y2-LABEL`   |Either `on`/`off` to allow or suppress (default) axis labelling, or a label string (when `on` is used, the axis label is taken from metadata where possible) |
|`X`               |Data path defining x-coordinate for plot data                                                                                                                |
|`Y`               |Data path defining y-coordinate for plot data                                                                                                                |
|`X2`              |Data path defining x2-coordinate for plot data                                                                                                               |
|`Y2`              |Data path defining y2-coordinate for plot data                                                                                                               |
|`TITLE`           |Plot title                                                                                                                                                   |
|`WIDTH`           |Plot width in pixels                                                                                                                                         |
|`HEIGHT`          |Plot height in pixels                                                                                                                                        |
|`ASPECT`          |Plot aspect ratio                                                                                                                                            |
|`ZOOM-X`          |Presence/absence or fraction: enable X-zooming                                                                                                               |
|`ZOOM-Y`          |Presence/absence or fraction: enable X-zooming                                                                                                               |
|`ZOOM-2D`         |Presence/absence: enable 2-D pan and zoom                                                                                                                    |
|`LEGEND-SWITCHES` |Enable interactive on/off switching of traces via the plot legend                                                                                            |
|`STROKE-SWITCH`   |Labels for stroke switching UI                                                                                                                               |
|`SELECT-X`        |Provide UI for selecting between x-variables of plot                                                                                                         |
|`SELECT-Y`        |Provide UI for selecting between y-variables of plot                                                                                                         |
|`MARKER`          |Standard paint attribute                                                                                                                                     |
|`MARKER-SIZE`     |Standard paint attribute                                                                                                                                     |
|`FILL`            |Standard paint attribute                                                                                                                                     |
|`FILL-OPACITY`    |Standard paint attribute                                                                                                                                     |
|`STROKE`          |Standard paint attribute                                                                                                                                     |
|`STROKE-WIDTH`    |Standard paint attribute                                                                                                                                     |
|`STROKE-OPACITY`  |Standard paint attribute                                                                                                                                     |

* The coordinate ranges for the plot are controlled by the `RANGE-X`,
  `RANGE-Y` and `RANGE` attributes.  These can be specified either
  explicitly (e.g. `range-x="0,20"` or `range="0,20;0,50"`), via a
  data path (in which case the range is taken from the extent of the
  data values, excluding infinite and NaN values) or via a URL (in
  which case the range is taken from the coordinate range of the SVG
  image the URL points to).

* The actual plot dimensions are determined from a combination of the
  `WIDTH`, `HEIGHT` and `ASPECT` attributes and CSS dimension styles
  for the `bh-plot` CSS class.

* Only one of `ZOOM-X`, `ZOOM-Y` or `ZOOM-2D` may be specified on a
  plot.  The `ZOOM-X` and `ZOOM-Y` attributes can specify a fraction
  of the plot viewport to be used for the zoom component.

* The `STROKE-SWITCH` attribute gives a semicolon separated list of
  labels used to refer to the possible stroke values in subsidiary
  plots.  If a single string is given (i.e. no semicolons), a simple
  switch between "on" and "off" is provided as a UI element and
  selection is performed between the first and second stroke
  possibilities for each subsidiary plot.  If more than one label is
  provided, a selection UI is used, and as many stroke possibilities
  can be selected as labels are given.

* The `SELECT-X` and `SELECT-Y` UI elements interact in such a way as
  to provide a reasonable interface for managing the variables shown
  in an x-vs.-y plot: it is never possible to select the same variable
  for the x and y variable, and switching between plot variables is
  handled sensibly.

###### Body

The body of a `<plot>` directive should contain directives specifying
the data to be drawn into the plot (using `<lines>`, `<points>`,
etc.).  There may also be a `<plot-options>` directive specifying
paint and calculational attributes common to all plot directives.


### Option defaulting and the `<plot-options>` directive

The `<plot-options>` directive can be used to wrap inner plotting
directives that share plotting options.  For instance, the following
example plots two line graphs that share a stroke width value.  Note
how attribute variables defined in the main `<plot>` directive
propagate down to the inner plotting directives, and also how
attributes set in `<plot-options>` can be overridden by the inner
plotting directives:
```html
<plot height=300 aspect=3 xs="[[seq(-1,1,100)]]">
  <plot-options stroke-width=2 stroke="red">
    <lines x="[[xs]]" y="[[-x**3+x+1]]"/>
    <lines x="[[xs]]" y="[[x**2]]" stroke="blue"/>
  </plot-options>
</plot>
```

### Paint attributes

**Need to separate this out and document the interpolation choices for
these clearly.**

### Line plots and the `<lines>` directive

###### Attributes

|Name            |Description                                   |
|----------------|----------------------------------------------|
|`X`             |Data path defining x-coordinate for plot data |
|`Y`             |Data path defining y-coordinate for plot data |
|`X2`            |Data path defining x2-coordinate for plot data|
|`Y2`            |Data path defining y2-coordinate for plot data|
|`STROKE`        |Standard paint attribute                      |
|`STROKE-WIDTH`  |Standard paint attribute                      |
|`STROKE-OPACITY`|Standard paint attribute                      |
|`LABEL`         |Label for line in plot legend                 |

###### Body

None

###### Interpretation

Produces a line plot from the given x and y coordinate data.

###### Examples

Simple plot with two line graphs -- note the inheritance of the
`STROKE-WIDTH` standard paint attribute from the containing `<plot>`
directive:
```html
<plot height=300 aspect=3 stroke-width=2>
  <lines x="[[vic2012ooa.day]]" y="[[vic2012ooa.tmp]]" stroke="red"/>
  <lines x="[[vic2012ooa.day]]" y="[[vic2012ooa.prc]]" stroke="blue"/>
</plot>
```


### Area plots and the `<area>` directive

###### Attributes

|Name          |Description                                                           |
|--------------|----------------------------------------------------------------------|
|`X`           |Data path defining x-coordinate for plot data                         |
|`Y`           |Data path defining upper y-coordinate for plot data                   |
|`YMIN`        |Data path or constant value defining lower y-coordinate for plot data |
|`X2`          |Data path defining x2-coordinate for plot data                        |
|`Y2`          |Data path defining upper y2-coordinate for plot data                  |
|`Y2MIN`       |Data path or constant value defining lower y-coordinate for plot data |
|`FILL`        |Standard paint attribute                                              |
|`FILL-OPACITY`|Standard paint attribute                                              |
|`LABEL`       |Label for area plot in plot legend                                    |

###### Body

None

###### Interpretation

Produces an area line plot from the given x and y coordinate data.  It
is possible to specify both upper (`Y` or `Y2`) and lower (`YMIN` or
`Y2MIN`) bounds for the area display, either as a data path or as a
constant value (default 0).

###### Examples

Area plot used to show monthly precipitation range along with line
graph of monthly means and temperature data:
```html
<plot height=300 aspect=3 stroke-width=2 range-y2="-10"
      axis-y-label="Precipitation (mm/month)"
      mmonths="[[midMonths(unique(vic2012ooa.date#getMonth()),2012)]]"
      mprecip="[[sumBy(vic2012ooa.prc,vic2012ooa.date#getMonth())]]"
      msd="[[sdevBy(vic2012ooa.prc,vic2012ooa.date#getMonth())]]">
  <area x="[[mmonths]]" y2min="[[mprecip-msd]]" y2="[[mprecip+msd]]"
        fill="lightblue"/>
  <lines x="[[mmonths]]" y2="[[mprecip]]" stroke="blue"/>
  <lines x="[[vic2012ooa.date]]" y="[[vic2012ooa.tmp]]" stroke="red"/>
</plot>
```

### Marker plots and the `<points>` directive

**Not done: marker orientation**

###### Attributes

|Name            |Description                                  |
|----------------|---------------------------------------------|
|`X`             |Data path defining x-coordinate for plot data|
|`Y`             |Data path defining y-coordinate for plot data|
|`MARKER`        |Standard paint attribute                     |
|`MARKER-SIZE`   |Standard paint attribute                     |
|`STROKE`        |Standard paint attribute                     |
|`STROKE-WIDTH`  |Standard paint attribute                     |
|`STROKE-OPACITY`|Standard paint attribute                     |
|`FILL`          |Standard paint attribute                     |
|`FILL-OPACITY`  |Standard paint attribute                     |
|`ORIENTATION`   |Standard paint attribute                     |
|`LABEL`         |Label for points in plot legend              |

###### Body

None

###### Interpretation

Produces a scatter/bubble plot from the given x and y coordinate data.
Points are placed at the positions given by the `X` and `Y`
attributes, using markers of the type specified by the `MARKER`
attribute oriented according to the `ORIENTATION` attribute, coloured
according to the `STROKE` and `FILL` attributes (which are not
necessarily appropriate for all marker types) and sized according to
the `MARKER-SIZE` attribute (which is a linear size whose exact
interpretation depends on the marker used).  All of the paint
attributes can either be fixed or be functions of arbitrary variables
that are in scope in Radian expressions defining the attributes.


###### Examples

Simple scatter plot with fixed styling:
```html
<plot height=300 marker-size=1.5 marker="circle" stroke="none">
  <points x="[[ctrl.pred1]]" y="[[ctrl.resp]]" fill="black"></points>
  <points x="[[treat.pred1]]" y="[[treat.resp]]" fill="red"></points>
</plot>
```

More complex plot with calculation of attributes from data -- note the
inheritance of the `STROKE` and `STROKE-WIDTH` standard paint
attributes from the containing `<plot>` directive, the extraction of
timeslices of data for the x- and y-coordinate values, the allocation
of fill colours from a standard palette based on a categorical
variable in the country data, and the generation of markers whose
areas are linearly related to country population for the current year,
normalised by the population across the whole dataset (this example
uses an additional custom `fillIn` function for data pre-processing):
```html
<plot height=500 stroke="black" stroke-width=1
      gdp="[[nat#income.map(function(d){return fillIn(d,1800,2009);}))]]"
      life="[[nat#lifeExpectancy.map(function(d){return fillIn(d,1800,2009);}))]]"
      pop="[[nat#population.map(function(d){return fillIn(d,1800,2009);}))]]"
      region="[[nat#region]]" yidx="[[year-1800]]"
      range-x="300,100000" range-y="10,90"
      popint="[[interpolate(pop,[1,1000],'sqrt')]]"
      axis-x-label="Per capita GDP" axis-x-transform="log"
      axis-y-label="Life expectancy">
  <points x="[[gdp.map(function(d) { return d[yidx]; })]]"
          y="[[life.map(function(d) { return d[yidx]; })]]"
          fill="[[category10(region)]]"
          marker-size="[[popint(pop.map(function(d) { return d[yidx]; }))]])">
  </points>
</plot>
```

### Bar charts and the `<bars>` directive

###### Attributes

|Name            |Description                                       |
|----------------|--------------------------------------------------|
|`X`             |Data path defining x-coordinate for plot data     |
|`Y`             |Data path defining y-coordinate for plot data     |
|`X2`            |Data path defining x2-coordinate for plot data    |
|`Y2`            |Data path defining y2-coordinate for plot data    |
|`BAR-WIDTH`     |Width for bars (single pixel value or fractions)  |
|`BAR-OFFSET`    |Offsets for bars (single pixel value or fractions)|
|`FILL`          |Standard paint attribute                          |
|`FILL-OPACITY`  |Standard paint attribute                          |
|`STROKE`        |Standard paint attribute                          |
|`STROKE-WIDTH`  |Standard paint attribute                          |
|`STROKE-OPACITY`|Standard paint attribute                          |
|`LABEL`         |Label for bars in plot legend                     |

###### Body

None

###### Interpretation

Produces a bar chart from the given x and y coordinate data.  The
x-coordinates give the bar centres and the y coordinates the bar
heights.

###### Examples

Simple bar chart with fixed bar widths:
```html
<plot height=300 aspect=3 stroke-width=2 range-y="0"
      stroke="blue" fill="skyblue">
  <bars x="[[test.x]]" y="[[test.y]]" bar-width="50px"/>
</plot>

<plot-data name="test" format="csv" cols="x,y">
  1, 2
  2, 4
  3, 8
  4, 16
  5, 32
  6, 48
  7, 24
  8, 12
  9, 6
 10, 3
</plot-data>
```


### The `<background>` directive

**NOT DONE**

It can be useful to display a background image behind plot data.  This
is particularly useful for geospatial data where it's important to
show a map image to help locate data.  Since plots are rendered as
SVG, this is the easiest format to deal with (made easier by the fact
that SVG files define a coordinate system), but it's also important to
handle raster image formats (only PNG for now).

Given a background image, we may need to assign coordinate ranges
(mandatory for PNG files) or clip the image within the plot frame.
Background images are implemented using the `<background>`
directive.

###### Attributes

|Name    |Description                                                                                               |
|--------|----------------------------------------------------------------------------------------------------------|
|`SRC`   |URL for background source (either an SVG or a PNG)                                                        |
|`X`     |Data path or range defining $x$-coordinate range for image (overrides any native coordinates in SVG files)|
|`Y`     |Data path or range defining $y$-coordinate range for image (overrides any native coordinates in SVG files)|
|`CLIP-X`|Data path or range defining clipping x-coordinate range for image                                         |
|`CLIP-Y`|Data path or range defining clipping y-coordinate range for image                                         |

###### Body

None

###### Interpretation

The background image is loaded from the given URL and is rendered into
the plot area.  For SVG files, if `X` and `Y` attributes are not
specified, the coordinates defined in the SVG file are assumed to
refer directly to plot coordinates.  The `X` and `Y` attributes can be
used to override this coordinate range assignment.  For PNG files, the
use of the `X` and `Y` attributes to assign coordinate ranges is
mandatory.

The background image can further be clipped by specifying values for
the `CLIP-X` and/or `CLIP-Y` attributes.

###### Examples

Basic SVG example with clipping to the latitude/longitude range of a
set of case data:
```html
<plot>
  <background src="http://www.bayeshive.com/assets/maps/europe-political.svg"
               clip-x="[[cases#lon]]" clip-y="[[cases#lat]]"/>
  <points x="[[cases#lon]]" y="[[cases#lat]]"
          marker="[[{circle;square}(cases#sex)]]"
          size="[[{linear 1 3}(cases#age)]]"/>
</plot>
```

Basic PNG example using UK National Grid coordinates to show GPS track
data over a background map:
```html
<plot>
  <background src="http://www.bayeshive.com/assets/maps/central-london.png"
              x="520520,540520" clip-y="151830,171830"/>
  <lines x="[[track#ng_x]]" y="[[track#ng_y]]" stroke="black" stroke-width=2/>
</plot>
```


## Palettes and interpolators

The subject of colour palettes and interpolators for properties like
stroke width are closely related.  A palette is just a sort of colour
interpolator.  The slightly different uses of palettes compared to
general scalar interpolators suggest slightly different syntax and
features for the two cases.

### Palette definitions

A palette is used to map input values from some domain to colour
values.  The mapping may be a discrete mapping (from discrete values
taken by a variable to discrete colour values), an absolute mapping
(from fixed variable values to colours) or a normalised mapping (from
the range [0,1] to a range of colours, with the understanding that
data values used with the palette will somehow be normalised to
[0,1]).  For non-discrete palettes, the interpolation between
specified (value,colour) pairs is either linear (in RGB, HSL, HCL or
Lab given colour space ) or constant (giving a "banded" palette).
For example, a scale for temperatures might have a linear HSL
interpolation between blue (for cold temperatures) and red (for warm),
while a palette for topographic elevation would be absolute banded,
with fixed colours being used for fixed elevation ranges.

A suitable Haskell datatype to represent palettes is thus:
```haskell
data Colour = Colour { colRed, colGreen, colBlue :: Double }
data Banded = Banded | Linear
data ColInterp = RGB | HSL | HCL | Lab
data Palette = Discrete   [Colour]
             | Normalised ColInterp Banded [(Fraction, Colour)]
             | Absolute   ColInterp Banded [(Double, Colour)]
```
(Here, `Fraction` is a type representing values lying in [0,1].)

Palettes are defined in HTML `<palette>` directives:

###### Attributes

|Name    |Description                                  |
|--------|---------------------------------------------|
|`NAME`  |Standard                                     |
|`TYPE`  |One of `discrete`, `abs` or `norm` (default) |
|`BANDED`|Present/absent                               |
|`INTERP`|One of `RGB`, `HSL` (default), `HCL` or `Lab`|

###### Body

If `TYPE` = "discrete": either `<colour>` ( { "`;`" | "`\n`" }
`<colour>` )* or `<dvalue>` `<colour>` ( \{ "`;`" | "`\n`" \} `<dvalue>`
`<colour>` )*

Otherwise: `<value>` `<colour>` ( \{ "`;`" | "`\n`" \} `<value>` `<colour>` )*

Here `<value>` is a real number, `<colour>` is a colour specifier
(either a colour name, or a `#XXX` or `#XXXXXX` value) and `<dvalue>`
is a discrete palette value (normally a value from a set of strings,
e.g. `male` or `female` -- discrete palette values can be quoted with
double quotes, in order to allow keys containing spaces).


###### Interpretation

Discrete palettes give a simple list of colours, which are used
one-by-one to colour categorical values -- this is implemented by
deriving a zero-based index *i* from the data categories and taking
the *(i mod n)*'th colour from the palette, where *n* is the number of
colours in the palette.

Absolute and normalised palettes both work in a similar fashion,
either interpolating linearly between the (value, colour) set points
of the palette or (for banded palettes) returning a fixed colour for
each value range between set points.  The only difference between
absolute and normalised palettes is that, for absolute palettes, the
actual data values are used to define the set points, while for
normalised palettes, the set point values all lie in [0,1] and data
values are normalised to this range before calculating colours from
the palette (the normalisation is a simple linear mapping of
[min *D*, max *D*] to [0,1], where *D* is the set of data values).}

###### Examples

Palette for display of topographic data:
```html
<palette name="terrain" type="abs" banded>
  -8000.0 #000066; -4000.0 #4C4CFF; -1000.0 #7F7FFF; -500.0 #66B2FF
   -100.0 #7FFFFF;   -50.0 #66CCB2;    -0.1 #E5FFFF;    0.0 #003300
    100.0 #00B24C;   500.0 #E5FF00;  1200.0 #994C00; 4000.0 #E5E5FF
   5000.0 #FFFFFF
</palette>
```

Simple discrete colour palette:
```html
<palette name="colours" type="discrete">
  orange; green; blue; red; black
</palette>
```

Palette for blue-to-red temperature scale:
```html
<palette name="temppal" type="norm">
  0 #0000FF; 1 #FF0000
</palette>
```
Note that, in the last case, there is a compact direct representation
of the palette that [may be used](#palette-use).

### <a name="palette-use">Palette use and compact palette syntax</a>

**Not done: application of palettes to stroke along paths,
  i.e. passing a palette function as the stroke.**

Palettes are used to specify colours for stroking and filling SVG
elements in plots.  (Note that in all the following examples, the
stroke or fill attribute can actually contain a semicolon-separated
list of colour/palette specifiers, allowing for
[stroke switching](#ui-stroke-sel).  **(Stroke switching is currently
broken while I work on palettes.)**

Palettes defined using `<palette>` directives are installed as
functions (with names taken from the directive's `NAME` attribute)
that can be called to assign colours based on Radian variables.  For
*ad hoc* palette use, there is a compact syntax for defining palette
functions "in place".

The most basic instance is using a single colour to specify the stroke
or fill for an element:
  `stroke="red"`
  `fill="#CC3342"`

To make use of a palette, we need to provide a palette specifier,
*`palspec`* and, optionally, a data path *`dataspec`* describing the
data item to be used to generate colours from the palette:

  `stroke = "@P{`*`palspec`*`}(`*`dataspec`*`)"`
  `fill = "@P{`*`palspec`*`}"`

In the second case, where no data path is given, the data item index
is used to index into the palette.  For path stroking, this gives
palette interpolation along the path.

To support the simplest use case, there is a compact syntax for
normalised linear interpolation between two colours:

  `stroke = "@P{grey:red}"`
  `fill = "@P{grey:red}(station#startDate)"`

These are equivalent to defining a normalised HSL interpolation
palette whose 0 value is "grey" and whose 1 value is "red", the first
along the path to be stroked and the second as a function of the
`station#startDate` variable.

More generally, if a palette is defined by a `<palette>` element with
a suitable `NAME` attribute, the palette can be accessed directly as a
function, for example:

  `fill = "terrainpal(stations#elevation)"`

Here, the `terrainpal` palette must be defined within the current
document using a `<palette>` element.

Palette definitions can also be included inline:

  `fill = "@P{discrete red;green;blue}(station#type)"`
  `fill = "@P{norm 0 blue; 0.5 blue; 0.5 green; 1 red}(x)"`
  `fill = "@P{abs rgb -4000 black; 8000 green}(station#elevation)"`

The first example here defines a three element discrete palette, the
second a normalised HSL interpolation palette and the third an
absolute RGB interpolation palette.

The general syntax of a palette use is:
```
  paluse ::= colour | "@P{" palspec "}" [ "(" [datapath] ")" ]

  palspec ::= colour ":" colour
           |  colour ( ";" colour )*
           |  type [interp] ["banded"] value colour (";" value colour)+

  type ::= "normalised" | "absolute" | "discrete"
  interp ::= "RGB" | "HSL" | "HCL" | "Lab"
```

The `type` can be abbreviated to `n`, `a` or `d`.

### General interpolation

As well as the specialised interpolation provided by palettes, there
is a general interpolation facility exposed via the `interpolate`
function in the Radian plotting library.  This function is called as
`interpolate(domain, range, type)` where `domain` and `range` are
(possibly nested) arrays of values, and `type` is one of `linear`,
`sqrt`, `log` or `pow:k` (with `k` a numeric exponent).  The return
value of a call to `interpolate` is an interpolation function whose
domain covers the values in `domain`, whose range is the range of
values in `range` and has an interpolation law as specified by `type`.

The following example demonstrates how marker *areas* can be related
to plot data:
```html
<plot height=500 stroke-width=1
      szint="[[interpolate(d#size,[1,1000],'sqrt')]]">
  <points x="d#x" y="d#y" fill="[[category10(d#cat)]]"
          marker-size="[[szint(d#size)]]">
  </points>
</plot>
```

## User interface features

### Plot visibility switching

**This is partially done in a shonky way with the `LEGEND-SWITCHES`
attribute, but this needs to be managed in a much more coherent way.**

### Pan and zoom

**Not done: y-zooming, 2D pan and zoom.**

The `ZOOM-X` and `ZOOM-Y` attributes on the `<plot>` directive enable
a focus/context plot setup, where a draggable region of a context plot
is displayed in a focus panel, subsetting either in the x-direction
(`ZOOM-X`) or the y-direction (`ZOOM-Y`).  The user interface
interaction and management is entirely self-contained within the
rendering of the `<plot>` directive and any embedded plotting
directives.

### <a name="ui-stroke-sel">Stroke selection</a>

It is possible to specify multiple stroke palettes for plot elements
using a semicolon separated list of options for the `STROKE`
attribute.  Switching between these options is controlled by the UI
enabled by the `STROKE-SWITCH` attribute on the `<plot>` or
`<plot-grid>` directives.  This allows for switching between two
stroke choices (by giving a single UI element label for
`STROKE-SWITCH`, which is used to label a toggle button), or for
switching between multiple choices (by giving multiple
semicolon-separated UI labels for `STROKE-SWITCH`, which are used as
labels for a selection UI element).

The actual switching of stroke palettes is controlled by the Angular
custom `strokeSelChange` event: this is emitted by the standard
plotting UI which is included as an element in the Angular template
for the `<plot>` and `<plot-grid>` directives and is responded to by
the logic in the `<plot>` directive.  It is thus possible to disable
the standard UI and emit the appropriate events oneself.

### Data selection

The `SELECT-X` and `SELECT-Y` attributes on the `<plot>` and
`<plot-grid>` directives make it possible to switch between different
choices for the x- and y-coordinate data of plot elements.  The
standard UI for this uses normal select UI elements, linked together
to ensure that only reasonable combinations of variables can be
selected.  As for the stroke selection though, the change in data
items is managed using custom Angular events (`xDataSelChange` and
`yDataSelChange`), so the standard UI can easily be overridden.


## Plot layout directives

A number of directives are provided for laying out plots using a
"VBox/HBox" approach (`<plot-row>` and `<plot-col>`) and in simple
grids (`<plot-grid>`).

All of the plot layout directives can be embedded one inside the
other, forming a layout tree, the leaves of which are normal `<plot>`
directives.  So, rows can be items inside columns, columns can items
be inside grids, grids can be items inside rows, and so on.  The
outermost layout directive (this includes a `<plot>` directive on its
own) is responsible for allocating space within the main layout frame
for the subsidiary plots.  The overall height, width and aspect ratio
of the plot layout can therefore be set on the outermost layout
element.

As with most Radian directives, plot attributes and other Radian
variables can be specified for all the plots inside the directive.  In
addition, each of the layout directives supports a number of
specialised layout attributes:

###### Layout attributes for the `<plot-grid>` directive

|Name           |Description                                                            |
|---------------|-----------------------------------------------------------------------|
|`ROWS`         |Number of rows in plot grid                                            |
|`COLS`         |Number of columns in plot grid                                         |
|`SPACING`      |Spacing between layout elements in pixels                              |

If either or both of the `ROWS` or `COLS` attributes is missing,
sensible defaults are chosen based on the number of items inside the
`<plot-grid>` directive.

###### Layout attributes for the `<plot-row>` and `<plot-col>` directives

The only special attribute for these two directives is `LAYOUT-SHARE`,
which can be applied to the elements within the `<plot-row>` or
`<plot-col>` directives to specify proportionally how much space in
the "layout direction" should be allocated to each element: setting
`LAYOUT-SHARE` to 1 for one element and 2 for another element means
that the second element will be allocated twice as much space as the
first.  Elements without a `LAYOUT-SHARE` value are allocated space
corresponding to the mean size of all elements.

###### Examples

The functionality of these directives is best understood through
examples.

Two plots laid out side-by-side, both allocated the same amount of
space, and both (because of the `ASPECT` setting) square:
```html
<plot-row height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <plot>
    <lines y="[[sin(x)]]"></lines>
  </plot>
  <plot>
    <lines y="[[cos(x)]]"></lines>
  </plot>
</plot-row>
```

A nested layout with varying size ratios -- the second column is three
times the width of the first, and because of the height and width
choices, all of the plots are square:
```html
<plot-row height=600 width=800 x="[[seq(0,2*PI,101)]]">
  <plot-col layout-share=1>
    <plot title="Copy 1">
      <lines y="[[sin(x)]]"></lines>
    </plot>
    <plot title="Copy 2">
      <lines y="[[sin(x)]]"></lines>
    </plot>
    <plot title="Copy 3">
      <lines y="[[sin(x)]]"></lines>
    </plot>
  </plot-col>
  <plot layout-share=3>
    <lines y="[[cos(x)]]"></lines>
  </plot>
</plot-row>
```

## Use cases

### Historical time series

First thing to note is that data for plots is separated out from the
representation of individual plots.  This allows the same data to be
used for multiple plots.  The `<plot-data>` directive is used to
specify data sets for plotting, either directly within the directive,
or indirectly via a URL using the `SRC` attribute (one of the examples
below demonstrates this).  The `<plot-data>` directive is given an ID
which is used to refer to the data set in plots.

Other attributes on the `<plot-data>` directive specify the data
format (defaults to JSON, with `"csv"` being another possibility, and
perhaps some forms of binary data encoded as CDATA) and other
information needed to parse the data (a list of column names for CSV
files, for instance).

Within the body of the `<plot-data>` directive are optional
`<metadata>` directives which encoded information about default label
names and units for individual data fields, and the data (when it's
not specified via a URL).

The following example gives a CSV data set of historical global
temperature data:
```html
<plot-data id="globaltemp" format="csv" cols="date,temp,error">
  <metadata name="date" format="isodate"></metadata>
  <metadata name="temp" label="Global mean temperature" units="&deg;C"></metadata>
  <metadata name="error" error-for="temp"></metadata>
"1970-01-15", 17.352, 0.100
"1970-02-14", 16.936, 0.090
"1970-03-15", 17.029, 0.095
"1970-04-15", 17.550, 0.087
...
</plot-data>
```

Plots are specified within a `<plot>` directive, which represents any
number of data sets displayed on common axes.  The ranges of the axes
are normally determined from the plot data, but can also be specified
using `range-x` and `range-y` (or `range`) attributes if required.  In
these attributes, as in other locations, values from plot data sets
are represented by data paths, which are expressions in JavaScript
with the addition of a "pluck" operator (represented by `#`).  Data
access paths are normally pluck or member access expressions, e.g.
`id#var#field` where `id` is the ID of a `<plot-data>` directive, and
`var#field` is a path through hierarchical data objects.  The pluck
operator is useful for arrays of objects whose fields need to be
plucked out to form arrays of plot values.  In the simple cases here,
`globaltemp#date` accesses the date column of the plot data specified
above.  Other attributes on the `<plot>` directive control axis
transforms, e.g. `axis-y-transform="log"` (or `"z-score"` or
`"invlogit"` or other reasonable possibilities).

Within a `<plot>` directive, the display of individual data sets is
controlled by directives like `<lines>`, the attributes of which
specify data sets to be plotted (in order from bottom to top in terms
of z-order) and plot attributes (e.g. `stroke` and `stroke-width`).
Plot values are either given as dataset paths or as JavaScript
functions.

This example plots a time series based on the given data (including
error bars, which for a line plot are displayed as bands around the
data, and for a point data set are displayed as normal error bars),
with an exponential fit line superimposed.  Axis labels and units will
be taken from the defaults provided in the `<plot-data>`
directive.
```html
<plot>
  <lines x="[[globaltemp#date]]" y="[[globaltemp#temp]]"
         y-error="[[globaltemp#error]]" stroke="blue" stroke-width=1/>
  <lines ref="[[(new Date("1970-01-01")).jd]]" x="[[globaltemp#date]]"
         y="[[17.0 + 0.0012 * exp((x.jd - ref.jd) / 1453)]]"
         stroke="black" stroke-width=2/>
</plot>
```

### Simulation time series (from DS builder)

Being able to include data sets directly into a document makes it easy
to include data sets created on the fly, for instance:
```html
<plot-data id="sim1" format="csv" cols="t,x,y,z">
0.00,1.000,1.000,1.000
0.01,1.001,1.002,0.995
...
</plot-data>
```

To handle compositing of plots, a single `<plot-grid>` directive is
provided.  This has attributes `rows`, `cols` and `tabs` that control,
respectively, horizontal and vertical juxtaposition of plots and
"stacking" of plots (using labelled tabs within the browser).  Nesting
of `<plot-grid>` elements allows for arbitrary juxtaposition of plots.

In the following example, two plots are stacked with tabs to switch
between them.  The first is a time series plot with a zoom panel and a
legend allowing for individual traces to be switched on or off, and
the second is an X/Y line plot where the variable plotted on the X and
Y axes can be selected from a drop-down list, and where colour fading
along the traces is available as an option:
```html
<plot-grid tabs>
  <plot zoom-x title="Time series" stroke-width=2 legend-switches>
    <lines x="[[sim1.t]]" y="[[sim1.x]]" stroke="orange"/>
    <lines x="[[sim1.t]]" y="[[sim1.y]]" stroke="blue"/>
    <lines x="[[sim1.t]]" y="[[sim1.z]]" stroke="green"/>
  </plot>
  <plot title="Trajectories" stroke-switch="Fade"
        select-x="x,y,z" select-y="x,y,z">
    <lines x="[[[sim1.x,sim1.y,sim1.z]]]" y="[[[sim1.x,sim1.y,sim1.z]]]"
           stroke="blue;red:grey"/>
  </plot>
</plot-grid>
```

### Broad Street cholera map

Including JSON data is simple, as is accessing data from a URL:
```html
<plot-data id="pumps">
  [ { "name": "Broad Street", "lat": 51.02345, "lon": 0.02345 },
    { "name": "Other",        "lat": 51.05445, "lon": 0.04538 } ]
</plot-data>
<plot-data id="cases" src="http://.../cholera-cases.csv"
           format="csv" cols="date,lat,lon"/>
```

Since plots are rendered as SVG, it is possible to include SVG
background images.  Here, the coordinate range of a plot is taken from
the bounding box of the SVG file used as a background, thus clipping
the other data plotted to this coordinate range.  Axis display is
suppressed (the SVG file is supposed to be a map of the streets in the
area of John Snow's cholera study).  Superimposed on the background
image are points representing water pumps (rendered as image specified
by a URL) and points representing cholera case occurrence (coloured by
hues linearly interpolated between red and blue covering the range of
dates of occurrence):
```html
<plot range="http://.../basemap.svg" axis-x="off" y-axis="off">
  <background src="http://.../basemap.svg">
  <points x="[[pumps#lon]]" y="[[pumps#lat]]" marker-size="16px"
          marker="http://.../pump.png" legend="Pumps"/>
  <points x="[[cases#lon]]" y="[[cases#lat]]" stroke="none"
          fill="[[{red:blue}(cases#date)]]" marker-size="2px" legend="Cases"/>
</plot>
```

### Categorical bar chart

Here, we have some JSON data with discrete labels in three different
directions, plus real-valued measurements:
```html
<plot-data id="d1">
  [ { "sex": "female", "env": "rural", "age": "50-54", "rate": 15.5 },
    { "sex": "female", "env": "rural", "age": "55-59", "rate": 20.2 },
    { "sex": "female", "env": "rural", "age": "60-64", "rate": 32.1 },
    { "sex": "female", "env": "rural", "age": "65-69", "rate": 48.0 },
    { "sex": "female", "env": "rural", "age": "70-74", "rate": 65.5 },
    { "sex": "female", "env": "urban", "age": "50-54", "rate": 15.5 },
    { "sex": "female", "env": "urban", "age": "55-59", "rate": 20.2 },
    { "sex": "female", "env": "urban", "age": "60-64", "rate": 32.1 },
    { "sex": "female", "env": "urban", "age": "65-69", "rate": 48.0 },
    { "sex": "female", "env": "urban", "age": "70-74", "rate": 65.5 },
    { "sex": "male", "env": "rural", "age": "50-54", "rate": 15.5 },
    { "sex": "male", "env": "rural", "age": "55-59", "rate": 20.2 },
    { "sex": "male", "env": "rural", "age": "60-64", "rate": 32.1 },
    { "sex": "male", "env": "rural", "age": "65-69", "rate": 48.0 },
    { "sex": "male", "env": "rural", "age": "70-74", "rate": 65.5 },
    { "sex": "male", "env": "urban", "age": "50-54", "rate": 15.5 },
    { "sex": "male", "env": "urban", "age": "55-59", "rate": 20.2 },
    { "sex": "male", "env": "urban", "age": "60-64", "rate": 32.1 },
    { "sex": "male", "env": "urban", "age": "65-69", "rate": 48.0 },
    { "sex": "male", "env": "urban", "age": "70-74", "rate": 65.5 } ]
</plot-data>
```

A simple bar plot can be constructed that displays categorical
relationships in the data.  Here, the specification
`d1#age;d1#env,d1#sex` for the X-value indicates that data groups
distinguished by age range should be separated while bars for
different values of the environment and gender should be plotted
together (see http://gallery.r-enthusiasts.com/graph/standard_bar_plot,58):
```html
<plot>
  <bars x="[[[[d1#age,d1#env],d1#sex]]]" y="[[d1#rate]]"/>
</plot>
```

### Miscellaneous unclassified

Background map with marker plot and track:
```html
<plot zoom-2d x1-axis="none" y1-axis="none">
  <background src="http://www.bayeshive.com/data/1/map1.svg">
  <plot-options stroke-width=1 stroke="#000">
    <points x="[[stations#lon]]" y="[[stations#lat]]" marker="circle"
            fill="[[{#terrain}(stations#elevation)]]"
            marker-size="[[{linear 1 3}(stations#temp)]]"/>
    <points x="[[model#lon]]" y="[[model#lat]]" marker="diamond"
            fill="none" stroke="red"
            marker-size="[[{linear 1 3}(model#temp)]]"/>
  </plot-options>
  <lines x="[[track#lon]]" y="[[track#lat]]" stroke="grey" stroke-width=2/>
</plot>
```

Bubble chart with scrubbable UI:
```html
<plot width=500 height=300 year=1870 stroke="black" stroke-width=1
      axis-x-label="GDP" axis-y-label="Life expectancy">
  <points i="[[year-1870]]" x="[[dat[i].gdp]]" y="[[dat[i].lifeexp]]"
          marker="circle" fill="[[dat[i].continent]]"
          size="[[{quadratic(dat#pop) 0 10}(dat[i].pop)]]"/>
  <scrubbable ng-model="year" lower="1870" upper="2010" round=0/>
</plot>
```

(Here, CSS would be used to position the `<scrubbable>` within the
plot frame.)



## Other features

The following things need to be thought about:

1. Plot legends: positioning (inside/outside plot frame and location);
legend elements to be displayed; labels, boxes, titles and other
formatting issues; user interaction (show/hide specific plot elements,
collapsible UI?).

2. Tooltips for individual data points (configurable, both in terms of
whether they're shown at all and in terms of the content of the
tooltips).

3. Rendering efficiency for pan and zoom (bitmaps, background
rendering, etc.).

4. Rendering efficiency for fade paths: at the moment, a separate path
element is defined for every data point, which is really inefficient
and slows down plotting noticeably; instead, it should be possible to
specify that only a certain number of "fade steps" are used along
the path (in cases where a banded palette is used, new path elements
only need to be created when a stroke colour change is required).

5. Handling of missing values, NaNs and infinite values in input data.

6. Two-dimensional pan and zoom.

7. Arbitrary plot annotations: text, overdrawing, etc.

8. Plot titles.

9. Easy access to ColorBrewer colour sets.

10. Stroke dash handling.

11. Other plot types: heatmap, contour plots, marker plots, box plots.



## <a name="reserved">Appendix: Reserved names</a>

### Directives

The following directive names are reserved and implemented by the
plotting library: `<area>`, `<background>`, `<bars>`, `<lines>`,
`<metadata>`, `<palette>`, `<plot>`, `<plot-data>`, `<plot-grid>`,
`<plot-options>`, `<points>`.

### Attributes

The following attributes names are reserved for use by plotting
library directives: `axis-x`, `axis-x-label`, `axis-x2`, `axis-y`,
`axis-y-label`, `axis-y2`, `banded`, `clip-x`, `clip-y`, `cols`,
`error-for`, `fill`, `fill-opacity`, `format`, `id`, `interp`,
`label`, `legend-switches`, `marker`, `marker-size`, `name`, `range`,
`range-x`, `range-y`, `rows`, `select-x`, `select-y`, `separator`,
`src`, `stroke`, `stroke-opacity`, `stroke-switch`, `stroke-width`,
`tabs`, `title`, `type`, `units`, `x`, `x2`, `y`, `y2`, `zoom-2d`,
`zoom-x`, `zoom-y`.

Any other attribute name applied to a plotting
directive brings a name into scope for data access expression
evaluation.


## Mlack

### User interface 1

```html
<plot-grid tabs>
  <plot title="Time series">
    ...
  <plot title="Trajectories">
    ...
```

could become something like:

```html
<div>
  <div ng-show="...">
    <span .form-inline>
      <span .btn-group data-toggle="buttons-radio">
        <button ng-repeat="panel in bhUI.panels" #{{panel.id}} .btn
                ng-click="bhUI.activePanel={{\$index}}">
          {{panel.label}}
    ...
    <div ng-show="bhUI.activePanel==0">
      ...
    <div ng-show="bhUI.activePanel==1">
      ...
    <div ng-show="bhUI.activePanel==2">
      ...
```

### User interface 2

* User interface attributes that appear on individual `<plot>`
  directives apply only to those plots.

* User interface attributes that appear on `<plot-grid>` attributes
  apply to all plots contained within the grid.

* Plot elements search up through the DOM as far as the highest
  enclosing `<plot-grid>` element looking for relevant UI elements.

* Changes in UI configuration are communicated to containing plots via
  `scope.\$broadcast`, using a custom cancellation mechanism to
  prevent elements lower down the containment tree from handling UI
  events that have already been processed higher up the tree.
