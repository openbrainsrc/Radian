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

When data is loaded from a URL, the semantics of the `<plot-data>`
directive are identical to the case where the data is included
directly in the directive body (except for possible rendering issues
if the data download takes a long time: you may see warnings from the
`radianEval` function in the browser console when Radian attempts to
plot the empty data set before the data has arrived -- these warnings
are harmless, and the plots are re-rendered when the data download is
complete).

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

|Name               |Description                                                                                                                        |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------|
|`NAME`             |Refers to a data field name in the enclosing`<plot-data>` directive (mandatory)                                                    |
|`FORMAT`           |Absent or `date` (specifies dates either using flexible parsing or in restricted format given by the `DATE-PARSE-FORMAT` attribute)|
|`DATE-PARSE-FORMAT`|`strftime()`-like date parsing format (or `isodate` to specify dates in strict ISO 8601 format)                                    |
|`DATE-FORMAT`      |Date output format for plot axes                                                                                                   |
|`LABEL`            |Axis/legend label for the named data field                                                                                         |
|`UNITS`            |Units for the named field                                                                                                          |
|`ERROR-FOR`        |Names another data field for which this field is an uncertainty/error value                                                        |

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
  [here](#std-fns).

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

### <a name="std-fns">Standard functions</a>

#### JavaScript standard functions

The following constants and functions from the `Math.xxx` JavaScript
scope are brought into scope within data accessor expressions
(i.e. one can write "`sin(x)`" instead of "`Math.sin(x)`"): `E`,
`LN10`, `LN2`, `LOG10E`, `LOG2E`, `PI`, `SQRT1_2`, `SQRT2`, `abs`,
`acos`, `asin`, `atan`, `atan2`, `ceil`, `cos`, `exp`, `floor`, `log`,
`pow`, `round`, `sin`, `sqrt`, `tan`.

#### D3 functions

The following functions from the `d3.xxx` JavaScript scope are brought
into scope within data accessor expressions (i.e. one can write
"`extent(x)`" instead of "`d3.extent(x)`"): `min`, `max`, `extent`,
`sum`, `mean`, `median`, `quantile`, `zip`.  (In fact, `extent` in
Radian expressions is a variadic function: passing multiple arrays to
`extent` will find the union of their ranges.)

#### Extra functions

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

#### Histogramming

The Radian plotting library also contains a `histogram` function for
histogram binning calculations.  This is called either as
`histogram(xs, nbins)` with `nbins` an integer count of the number of
bins to use, or as `histogram(xs, opts)` with `opts` an object with
some of the following fields:

* `transform`: either a string (one of `linear` or `log`) or a
  two-element array of functions giving forward and inverse coordinate
  transformations; if the `transform` argument is supplied, histogram
  binning is done in transformed coordinates, with bin centres and
  extents being transformed back to the original coordinate values
  before return.
 
 * `binrange`: data range over which bins are to be generated; if
   omitted, the binning range is calculated from the data;
 
 * `nbins`: number of histogram bins to use;
 
 * `binwidth`: width of histogram bins to use (in transformed
   coordinates); not used if `nbins` is supplied.

The return value of the `histogram` function is an object with the
following fields:

 * `centres`: histogram bin centres;

 * `bins`: array of two-element arrays giving the minimum and maximum
   bounds for each histogram bin (this is useful when using the
   `transform` argument to `histogram`, since, for nonlinear
   coordinate transformations, the histogram bins are no longer
   symmetric about their centres, and are no longer of a uniform
   size);
 
 * `counts`: integer counts of data items in each bin;

 * `freqs`: fraction of data items in each bin;

 * `probs`: probability of data items falling into each bin, defined
   so that the integral of the bar chart constructed using the
   coordinate ranges in `bins` and these values is unity.

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
