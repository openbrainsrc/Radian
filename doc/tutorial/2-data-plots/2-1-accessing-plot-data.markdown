---
layout: default
title: Radian Tutorial -- 2.1. Accessing plot data
---

# 2.1. Accessing plot data

In order to make Radian plots from data, we need some way of accessing
data from within Radian expressions.  The link between our data and
Radian is the `<plot-data>` directive.

<hr>
## The `<plot-data>` directive

The `<plot-data>` directive can be used either to provide data for
plotting directly within an HTML page, or to access data via a URL.
Radian currently supports access to CSV and JSON formatted data.  The
data contained or accessed by a `<plot-data>` directive is "installed"
as a variable in an Angular scope that is accessible to plot
directives at the same Angular scope level as the `<plot-data>`
directive.  In practice, this means that, unless you do something
clever with Angular scopes, things will just work.

As a simple example, here is a case where we provide a small CSV data
set directly within the page:

<plot-example key=1 title="Example 1"></plot-example>

``` html
<plot height=300 aspect=2>
  <lines x="[[dat.a]]" y="[[dat.b]]"></lines>
</plot>

<plot-data name="dat" format="csv" cols="a,b">
1,5
2,10
3,14
4,12
5,22
6,6
7,5
</plot-data>
```

<plot ng-class="plotVisible[1]" height=300 aspect=2>
  <lines x="[[d1.a]]" y="[[d1.b]]"></lines>
</plot>

<plot-data name="d1" format="csv" cols="a,b" src="/data/tutorial-2/d1.csv">
</plot-data>


We specify the name we want to use for the data set in Radian
expressions using the `name` attribute of the `<plot-data>` directive.
The `format` attribute denotes that the data is formatted as comma
separated values.  The `cols` attribute allows us to give names to the
data columns and these individual data columns can then be referred to
as `dat.a`, `dat.b`, etc. in Radian expressions.

Note that, at the moment, Radian requires CSV data to contain *only*
the data values, and for column names to be specified using the `cols`
attribute of the `<plot-data>` directive.

As an alternative to writing the data directly into our web pages, we
can load data from a URL:

<plot-example key=2 title="Example 2"></plot-example>

``` html
<plot height=300 aspect=2 x="[[dat.day]]">
  <lines y="[[dat.temp]]" stroke="red"></lines>
  <lines y2="[[dat.prec]]" stroke="blue"></lines>
</plot>

<plot-data name="dat" format="csv" cols="day,temp,prec"
           src="/data/vic2012.csv">
</plot-data>
```

<plot ng-class="plotVisible[2]" ng-class="plotVisible[]" height=300 aspect=2 x="[[d2.day]]">
  <lines y="[[d2.temp]]" stroke="red"></lines>
  <lines y2="[[d2.prec]]" stroke="blue"></lines>
</plot>

<plot-data name="d2" format="csv" cols="day,temp,prec"
           src="/data/vic2012.csv">
</plot-data>


The only difference with this use of `<plot-data>` is that we omit the
inline data and instead provide a URL using the `src` attribute.  This
data is loaded and made available for plotting.

When using data loaded from URLs, it is normal to see some error
messages in the JavaScript console coming from Radian.  Radian handles
data in an event-driven way, and attempts to render a plot for the
initial empty data set that is available (leading to the error
messages).  As soon as the data download is complete, the plot is
re-rendered.

One other Radian feature we have used in this example is the "second
axes" capability.  In the second of the `<lines>` directive, we use
the attribute `y2` instead of `y` to say that we want this data should
be plotted using an independent axis scale from the `y` data.  The `y`
axis is displayed on the left and the `ys` axis on the right of plots.

<hr>
## Data formats

Data for Radian can be provided in CSV format, or as JSON data.  The
two following `<plot-data>` directives specify the same data, but in
different formats:

<plot-example title="CSV data"></plot-example>

``` html
<plot-data name="dcsv" format="csv" cols="a,b">
1,1
2,4
3,6
</plot-data>
```

<plot-example title="JSON data"></plot-example>

``` html
<plot-data name="djson" format="json">
[ { "a": 1, "b": 1 },
  { "a": 2, "b": 4 },
  { "a": 3, "b": 6 } ]
</plot-data>
```

There are two main differences between the treatment of the data
formats.  First, for JSON data, we don't need to specify a `cols`
attribute.  The data labels are included in the data itself.  Second,
the formats of the objects named `dcsv` and `djson` resulting from
these directives are different.  The CSV data is processed to produce
an *object of arrays*, i.e. a single JavaScript object with one array
field per data column.  The data columns can thus be accessed as
arrays using simple JavaScript member expressions, e.g. `dcsv.a`.

The situation with JSON data is more complicated.  We can serialise
data with arbitrary structure as JSON values, so there are no general
data access patterns that are applicable in all cases.  However, the
pattern displayed by `djson` above is very common: this is an *array
of objects*, with multiple instances of objects with the same fields
stored in a single array.

So, given `djson`, how do we get at all the `a` field values so that
we can use them as *x* values in a plot?  A JavaScript programmer
would write something to map over the array of values, pulling out the
fields one by one.  In Radian, we provide a special extension to
JavaScriptp expression syntax for this case, because it's so common.
In Radian expressions, the `#` character, called the "pluck" operator,
can be used to pull fields out of this sort of array of objects
structure.  For example, in a Radian expression, we can write
`djson#a` to get all the `a` values from the array of objects.

We can use the pluck operator to rewrite Example 1 using JSON data:

<plot-example key=3 title="Example 3"></plot-example>

``` html
<plot height=300 aspect=2>
  <lines x="[[dat#a]]" y="[[dat#b]]"></lines>
</plot>

<plot-data name="dat" format="json">
[{ "a": 1, "b": 5 },
 { "a": 2, "b": 10 },
 { "a": 3, "b": 14 },
 { "a": 4, "b": 12 },
 { "a": 5, "b": 22 },
 { "a": 6, "b": 6 },
 { "a": 7, "b": 5 }]
</plot-data>
```

<plot ng-class="plotVisible[3]" height=300 aspect=2>
  <lines x="[[d3#a]]" y="[[d3#b]]"></lines>
</plot>

<plot-data name="d3" format="json" src="/data/tutorial-2/d3.json">
</plot-data>


The pluck operator is actually rather more flexible than this[^1], but
this simple field plucking is sufficient for our purposes for now.

<hr>
## Metadata

Data often comes with "metadata", information about things like units
of measurement, the names of quantities, perhaps other information
needed to properly interpret data values.  The `<plot-data>` directive
can contain embedded `<metadata>` directives allowing us to specify
some of this kind of information, which can then automatically be used
to label plot axes.

For example, if we take the above example and add some metadata
information, Radian can label the axes with a suitable label and unit:

<plot-example key=4 title="Example 4"></plot-example>

``` html
<plot height=300 aspect=2>
  <lines x="[[dat#a]]" y="[[dat#b]]"></lines>
</plot>

<plot-data name="dat" format="json">
  <metadata name="a" label="Aardvarks" units="Mt"></metadata>
  <metadata name="b" label="Bogosity" units="nBogon"></metadata>
[{ "a": 1, "b": 5 },
 { "a": 2, "b": 10 },
 { "a": 3, "b": 14 },
 { "a": 4, "b": 12 },
 { "a": 5, "b": 22 },
 { "a": 6, "b": 6 },
 { "a": 7, "b": 5 }]
</plot-data>
```

<plot ng-class="plotVisible[4]" height=300 aspect=2>
  <lines x="[[d4#a]]" y="[[d4#b]]"></lines>
</plot>

<plot-data name="d4" format="json" src="/data/tutorial-2/d4.json">
  <metadata name="a" label="Aardvarks" units="Mt"></metadata>
  <metadata name="b" label="Bogosity" units="nBogon"></metadata>
</plot-data>


Metadata specifications are particularly useful for dealing with date
and time data.  We can specify that a data field represents dates, and
if necessary give a format to be used for parsing the date values
(many reasonable formats are handled automatically):

<plot-example key=5 title="Example 5"></plot-example>

``` html
<plot height=300 aspect=2 axis-x-label="January 2012">
  <lines x="[[dat.date]]" y="[[dat.temp]]"></lines>
</plot>

<plot-data name="dat" format="csv" cols="date,temp">
  <metadata name="date" format="date"></metadata>
  <metadata name="temp" label="Temperature" units="&deg;C"></metadata>
"2012-01-01",  3.80
"2012-01-02",  5.50
"2012-01-03",  7.90
"2012-01-04",  8.50
"2012-01-05",  4.90
"2012-01-06",  2.70
"2012-01-07",  5.70
"2012-01-08",  6.50
"2012-01-09",  6.80
"2012-01-10",  2.20
"2012-01-11",  1.40
"2012-01-12",  1.60
"2012-01-13", -0.10
"2012-01-14",  1.70
</plot-data>
```

<plot ng-class="plotVisible[5]" height=300 aspect=2 axis-x-label="January 2012">
  <lines x="[[d5.date]]" y="[[d5.temp]]"></lines>
</plot>

<plot-data name="d5" format="csv" cols="date,temp" src="/data/tutorial-2/d5.csv">
  <metadata name="date" format="date"></metadata>
  <metadata name="temp" label="Temperature" units="&deg;C"></metadata>
</plot-data>


<br>
<div class="exercise">
**Exercise**

Experiment with making Radian plots from whatever CSV or JSON data you
have lying around!

</div>

<br>
<hr>
<a class="btn pull-left" href="index.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="2-2-scatter-plots.html">
  Next section &raquo;
</a>
<br>
<br>

[^1]: It can pluck array elements from arrays of arrays, can "pluck"
      method calls across arrays of objects, and can do a sort of
      "computed pluck" for more complex indexing calculations.
