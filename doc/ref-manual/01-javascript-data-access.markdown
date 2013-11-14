---
layout: default
title: Reference manual - JavaScript data access
---

# 1. JavaScript data access

The HTML side of the plotting API uses a slight extension of the
JavaScript expression syntax to express values to be plotted.  Data
sets can be included in HTML pages and named using the `<plot-data>`
directive, and AngularJS data binding can be used to access arbitrary
values from page UI elements or other sources.

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


<hr>
## <a name="data-accessors">Data accessor syntax</a>

Within plotting directives, data values to be plotted, as well as
other plot attributes (e.g. marker size, colours, and so on) are
specified using an extended JavaScript expression syntax.  There are
three aspects to this syntax: permitted operators, name scoping and
attribute data binding, and standard functions.

In order to distinguish between Radian expressions and raw string
values, all Radian expressions are enclosed in double square brackets,
e.g. `[[x+y]]`.  This is the same sort of approach as taken in
Angular, where Angular expressions are enclosed in double braces.  The
Radian expression syntax is a superset of full JavaScript expression
syntax, so is rather more flexible than the more restricted grammar
supported for Angular expressions.

### Data accessor operators

Data accessor syntax allows three extensions to standard JavaScript
syntax.  These are intended to make it more convenient to write the
kinds of expressions needed in common plot types.

**Exponentiation operator** Instead of writing `Math.pow(x,y)`, one
may write `x**y`.  The `**` operator has a higher precedence than any
other binary operator.

**Pluck operator** If `y` is an identifier, the expression `x#y` is
equivalent to

~~~~ {.javascript}
x.map(function(e) { return e.y; )}
~~~~

while if `y` is an integer literal, `x#y` is equivalent to

~~~~ {.javascript}
x.map(function(e) { return e[y]; )}
~~~~

and if `expr` is a general JavaScript expression, `x#(expr)` (note
parentheses!) is equivalent to

~~~~ {.javascript}
x.map(function(e) { return e[expr]; )}
~~~~

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

~~~~ {.html}
<plot height=300 aspect=3 stroke-width=1>
  <lines x="[[seq(-1,1,100)]]" y="[[-x**3+x+sin(x)]]" stroke="red"></lines>
</plot>
~~~~


### Name scoping and data binding in data accessors

The following names are in scope within data accessor expressions:

* The names of all data sets defined in `<plot-data>` directives in
  Angular scopes that enclose the scope of the directive containing
  the Radian expression.  Each data set is accessible by the name
  given in the `ID` attribute of its `<plot-data>` directive.

* All names passed as attributes to plotting directives that are not
  reserved names (see list in the [Appendix](#reserved)).

* All Angular scope variables defined in the scope of the directive
  containing the expression (not that, via Angular's prototype object
  inheritance chain for scopes, this includes values in outer
  surrounding scopes, as long as their names are not shadowed by names
  in inner scopes).

* The "Radian library" functions and constants defined
  [here](06-radian-plotting-library.html).

What this means is that it is possible to pass data values around
using attributes with meaningful names.  We implicitly bring data set
names into scope as well as simplified standard function names to make
writing plot directives quick and simple.

Combined with Angular's `ng-model` data binding attribute, we can do
some very powerful things in very simple ways:

~~~~ {.html}
<div class="form-inline">
  <label>Mean</label>
  <input type="text" ng-model="mu" ng-init="mu=5">
  <label>&nbsp;&nbsp;Standard deviation</label>
  <input type="text" ng-model="sigma" ng-init="sigma=1">
</div>
<br>

<plot height=300 aspect=3 stroke-width=2 stroke="red">
  <lines x="[[seq(0,10,200)]]" y="[[normal(x,mu,sigma)]]"></lines>
</plot>
~~~~

In this example, updating the values in the input text fields triggers
an immediate update of the plot, pulling in the new values from the UI
elements.  This means that plots can be attached to arbitrary UI
elements with ease.  Note how names of Angular scope variables defined
for instance using `ng-model` may be used within Radian expressions.
The Radian expression parsing infrastructure interacts correctly with
Angular data binding so that plots are regenerated when Angular
expressions within Radian expressions change.

### Handling of dates

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

~~~~ {.html}
<plot height=300 aspect=3 stroke-width=2>
  <lines x="vic2012ooa.date" y="vic2012ooa.tmp" stroke="red"></lines>
  <lines x="[[midMonths(unique(vic2012ooa.date#getMonth()), 2012)]]"
         y="[[meanBy(vic2012ooa.prc,vic2012ooa.date#getMonth())]]"
         stroke="blue"></lines>
</plot>
~~~~

### Examples

In this simple example, we use Angular data binding to set the `mu`
and `sigma` attributes from scope variables called `mean` and `sdev`.
These "attribute variables" are then in scope for the calculation of
`x` and `y` attributes for the plot:

~~~~ {.html}
<lines mu="[[mean]]" sigma="[[sdev]]"
       x="[[seq(mu-3*sigma,mu+3*sigma,100)]]"
       y="[[normal(x,mu,sigma)]]">
</lines>
~~~~

The processing of this example goes as follows:

|Evaluate|&nbsp;&nbsp;&nbsp;|Requires                           |
|--------|------------------|-----------------------------------|
|`x`     |                  |`mu`, `sigma`                      |
|`y`     |                  |`x`, `mu`, `sigma`                 |
|`mu`    |                  |`mean`                             |
|`sigma` |                  |`sdev`                             |
|`mean`  |                  |AngularJS scope variable           |
|`sdev`  |                  |AngularJS scope variable           |

<hr>
## Categorical data

For point and bar plots, it is possible to use categorical data values
for the `x` and `y` data coordinates.  A number of attributes are
provided to support this, as well as a special data structure format
to take advantage of hierarchical grouping using multiple categorical
data fields.

For point plots, using a categorical value as the `x` attribute for a
plot results in a discrete set of point clouds being produced, one per
category, evenly spaced along the `x`-axis (see
[this example](/Radian/gallery/#/68)):

~~~~ {.html}
<plot height=400 aspect=1.5 order-x="I. virginica;I. versicolor;I. setosa"
      axis-x-label="Species" axis-y-label="Petal length"
      marker="circle" marker-size=10 stroke="none">
  <points x="[[iris.species]]"
          jitter-x y="[[iris.petal_length]]"
          fill="[[irispal(iris.species)]]">
  </points>
</plot>

<palette name="irispal" type="discrete">
  "I. setosa" red
  "I. versicolor" green
  "I. virginica" blue
</palette>

<plot-data name="iris" format="csv"
           cols="sepal_length,sepal_width,petal_length,petal_width,species">
  <metadata name="species"
            category-order="I. setosa;I. versicolor;I. virginica"></metadata>
5.1,3.5,1.4,0.2,I. setosa
4.9,3.0,1.4,0.2,I. setosa
4.7,3.2,1.3,0.2,I. setosa
4.6,3.1,1.5,0.2,I. setosa
...
</plot-data>
~~~~~

For bar plots, categorical data fields can be used for the `x`
attribute, as for point plots, but an aggregation scheme is also
needed to turn the set of data values corresponding to the category
into a single bar height to be plotted.  For the `<bars>` directive,
the `AGGREGATION` attribute (which can take on the values `mean`,
`sum`, `min` or `max`) determines the aggregation scheme used.  A
simple example plots the mean value for each category:

~~~~ {.html}
<plot axis-x-label="off" axis-y-label="Rate" stroke="none">
  <bars x="[[d1#sex]]" y="[[d1#rate]]" fill="[[mfpal(x)]]"
        aggregation="mean" bar-width=0.5></bars>
</plot>
~~~~


### Supporting attributes

ORDER-X
GROUP-X
JITTER-X
JITTER-Y
CATEGORY-ORDER
AGGREGATION

### The `boxes` directive
