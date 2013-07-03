---
layout: default
title: Reference manual - Use cases
---

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

~~~~ {.html}
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
~~~~

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

~~~~ {.html}
<plot>
  <lines x="[[globaltemp#date]]" y="[[globaltemp#temp]]"
         y-error="[[globaltemp#error]]" stroke="blue" stroke-width=1/>
  <lines ref="[[(new Date("1970-01-01")).jd]]" x="[[globaltemp#date]]"
         y="[[17.0 + 0.0012 * exp((x.jd - ref.jd) / 1453)]]"
         stroke="black" stroke-width=2/>
</plot>
~~~~

### Simulation time series (from DS builder)

Being able to include data sets directly into a document makes it easy
to include data sets created on the fly, for instance:

~~~~ {.html}
<plot-data id="sim1" format="csv" cols="t,x,y,z">
0.00,1.000,1.000,1.000
0.01,1.001,1.002,0.995
...
</plot-data>
~~~~

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

~~~~ {.html}
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
~~~~

### Broad Street cholera map

Including JSON data is simple, as is accessing data from a URL:

~~~~ {.html}
<plot-data id="pumps">
  [ { "name": "Broad Street", "lat": 51.02345, "lon": 0.02345 },
    { "name": "Other",        "lat": 51.05445, "lon": 0.04538 } ]
</plot-data>
<plot-data id="cases" src="http://.../cholera-cases.csv"
           format="csv" cols="date,lat,lon"/>
~~~~

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

~~~~ {.html}
<plot range="http://.../basemap.svg" axis-x="off" y-axis="off">
  <background src="http://.../basemap.svg">
  <points x="[[pumps#lon]]" y="[[pumps#lat]]" marker-size="16px"
          marker="http://.../pump.png" legend="Pumps"/>
  <points x="[[cases#lon]]" y="[[cases#lat]]" stroke="none"
          fill="[[{red:blue}(cases#date)]]" marker-size="2px" legend="Cases"/>
</plot>
~~~~

### Categorical bar chart

Here, we have some JSON data with discrete labels in three different
directions, plus real-valued measurements:

~~~~ {.html}
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
~~~~

A simple bar plot can be constructed that displays categorical
relationships in the data.  Here, the specification
`d1#age;d1#env,d1#sex` for the X-value indicates that data groups
distinguished by age range should be separated while bars for
different values of the environment and gender should be plotted
together (see http://gallery.r-enthusiasts.com/graph/standard_bar_plot,58):

~~~~ {.html}
<plot>
  <bars x="[[[[d1#age,d1#env],d1#sex]]]" y="[[d1#rate]]"/>
</plot>
~~~~

### Miscellaneous unclassified

Background map with marker plot and track:

~~~~ {.html}
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
~~~~

Bubble chart with scrubbable UI:

~~~~ {.html}
<plot width=500 height=300 year=1870 stroke="black" stroke-width=1
      axis-x-label="GDP" axis-y-label="Life expectancy">
  <points i="[[year-1870]]" x="[[dat[i].gdp]]" y="[[dat[i].lifeexp]]"
          marker="circle" fill="[[dat[i].continent]]"
          size="[[{quadratic(dat#pop) 0 10}(dat[i].pop)]]"/>
  <scrubbable ng-model="year" lower="1870" upper="2010" round=0/>
</plot>
~~~~

(Here, CSS would be used to position the `<scrubbable>` within the
plot frame.)
