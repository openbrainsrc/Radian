---
layout: default
title: Reference manual - Plot types
---

# 5. Plot types

<hr>
## Line plots and the `<lines>` directive

The `<lines>` directive draws a line plot based on given *x*- and
*y*-coordinate values.  Line width and stroke colour can be specified,
and palettes (ADD LINK) can be used to specify colour gradients along
curves.

### Attributes

|Name            |&nbsp;&nbsp;&nbsp;|Description|
|----------------|-|----------------------------|
|`X`             | |Data path defining x-coordinate for plot data|
|`Y`             | |Data path defining y-coordinate for plot data|
|`X2`            | |Data path defining x2-coordinate for plot data|
|`Y2`            | |Data path defining y2-coordinate for plot data|
|`STROKE`        | |Standard paint attribute|
|`STROKE-WIDTH`  | |Standard paint attribute|
|`STROKE-OPACITY`| |Standard paint attribute|
|`LABEL`         | |Label for line in plot legend|

### Body

None

### Interpretation

Produces a line plot from the given x and y coordinate data.

### Examples

Simple plot with two line graphs -- note the inheritance of the
`STROKE-WIDTH` standard paint attribute from the containing `<plot>`
directive:

~~~~ {.html}
<plot height=300 aspect=3 stroke-width=2>
  <lines x="[[vic2012ooa.day]]" y="[[vic2012ooa.tmp]]" stroke="red"/>
  <lines x="[[vic2012ooa.day]]" y="[[vic2012ooa.prc]]" stroke="blue"/>
</plot>
~~~~


<hr>
## Area plots and the `<area>` directive

Area plots produce "fat lines" where the area between given minimum
and maximum *y*-coordinates is area filled, as a function of given
$x$-coordinates.

### Attributes

|Name          |&nbsp;&nbsp;&nbsp;|Description|
|--------------|-|----------------------------|
|`X`           | |Data path defining x-coordinate for plot data|
|`Y`           | |Data path defining upper y-coordinate for plot data|
|`YMIN`        | |Data path or constant value defining lower y-coordinate for plot data|
|`X2`          | |Data path defining x2-coordinate for plot data|
|`Y2`          | |Data path defining upper y2-coordinate for plot data|
|`Y2MIN`       | |Data path or constant value defining lower y-coordinate for plot data|
|`FILL`        | |Standard paint attribute|
|`FILL-OPACITY`| |Standard paint attribute|
|`LABEL`       | |Label for area plot in plot legend|

### Body

None

### Interpretation

Produces an area line plot from the given x and y coordinate data.  It
is possible to specify both upper (`Y` or `Y2`) and lower (`YMIN` or
`Y2MIN`) bounds for the area display, either as a data path or as a
constant value (default 0).

### Examples

Area plot used to show monthly precipitation range along with line
graph of monthly means and temperature data:

~~~~ {.html}
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
~~~~

<hr>
## Marker plots and the `<points>` directive

The `<points>` directive is used to produce scatter plots, bubble
plots and any other plots where discrete markers are positioned at
given *x*- and *y*-coordinates.  Bubble plots can be created by making
marker shape, size and colour functions of data as well as the marker
positions.

### Attributes

|Name            |&nbsp;&nbsp;&nbsp;|Description|
|----------------|-|----------------------------|
|`X`             | |Data path defining x-coordinate for plot data|
|`Y`             | |Data path defining y-coordinate for plot data|
|`MARKER`        | |Standard paint attribute|
|`MARKER-SIZE`   | |Standard paint attribute|
|`STROKE`        | |Standard paint attribute|
|`STROKE-WIDTH`  | |Standard paint attribute|
|`STROKE-OPACITY`| |Standard paint attribute|
|`FILL`          | |Standard paint attribute|
|`FILL-OPACITY`  | |Standard paint attribute|
|<span class="nyi">`ORIENTATION`</span>| |<span class="nyi">Standard paint attribute</span>|
|`LABEL`         | |Label for points in plot legend|

### Body

None

### Interpretation

Produces a scatter/bubble plot from the given *x*- and *y*-coordinate
data.  Points are placed at the positions given by the `X` and `Y`
attributes, using markers of the type specified by the `MARKER`
attribute <span class="nyi">oriented according to the `ORIENTATION`
attribute</span>, coloured according to the `STROKE` and `FILL`
attributes (which are not necessarily appropriate for all marker
types) and sized according to the `MARKER-SIZE` attribute (which is an
area-based size measure whose exact interpretation depends on the
marker used).  All of the paint attributes can either be fixed or be
functions of arbitrary variables that are in scope in Radian
expressions defining the attributes.

### Examples

#### Simple scatter plot with fixed styling

~~~~ {.html}
<plot height=300 marker-size=1.5 marker="circle" stroke="none">
  <points x="[[ctrl.pred1]]" y="[[ctrl.resp]]" fill="black"></points>
  <points x="[[treat.pred1]]" y="[[treat.resp]]" fill="red"></points>
</plot>
~~~~

#### More complex plot with calculation of attributes from data

Note the inheritance of the `STROKE` and `STROKE-WIDTH` standard paint
attributes from the containing `<plot>` directive, the extraction of
timeslices of data for the x- and y-coordinate values, the allocation
of fill colours from a standard palette based on a categorical
variable in the country data, and the generation of markers whose
areas are linearly related to country population for the current year,
normalised by the population across the whole dataset (this example
uses an additional custom `fillIn` function for data pre-processing):

~~~~ {.html}
<plot height=500 stroke="black" stroke-width=1
      gdp="[[nat#income.map(function(d){return fillIn(d,1800,2009);}))]]"
      life="[[nat#lifeExpectancy.map(function(d){return fillIn(d,1800,2009);}))]]"
      pop="[[nat#population.map(function(d){return fillIn(d,1800,2009);}))]]"
      region="[[nat#region]]" yidx="[[year-1800]]"
      range-x="300,100000" range-y="10,90"
      popint="[[interpolate(pop,[1,1000])]]"
      axis-x-label="Per capita GDP" axis-x-transform="log"
      axis-y-label="Life expectancy">
  <points x="[[gdp.map(function(d) { return d[yidx]; })]]"
          y="[[life.map(function(d) { return d[yidx]; })]]"
          fill="[[category10(region)]]"
          marker-size="[[popint(pop.map(function(d) { return d[yidx]; }))]])">
  </points>
</plot>
~~~~

<hr>
## <a name="bars-directive">Bar charts and the `<bars>` directive</a>

### Attributes

|Name            |&nbsp;&nbsp;&nbsp;|Description|
|----------------|-|----------------------------|
|`X`             | |Data path defining x-coordinate for plot data|
|`Y`             | |Data path defining y-coordinate for plot data|
|`X2`            | |Data path defining x2-coordinate for plot data|
|`Y2`            | |Data path defining y2-coordinate for plot data|
|`BAR-MIN`       | |Minimum x-coordinate for bars (specified instead of `X`)|
|`BAR-MAX`       | |Maximum x-coordinate for bars (specified instead of `X`)|
|`BAR-WIDTH`     | |Width for bars (single pixel value or fractions)|
|`BAR-OFFSET`    | |Offsets for bars (single pixel value or fractions)|
|`FILL`          | |Standard paint attribute|
|`FILL-OPACITY`  | |Standard paint attribute|
|`STROKE`        | |Standard paint attribute|
|`STROKE-WIDTH`  | |Standard paint attribute|
|`STROKE-OPACITY`| |Standard paint attribute|
|`LABEL`         | |Label for bars in plot legend|

### Body

None

### Interpretation

Produces a bar chart from the given *x*- and *y*-coordinate data.  The
*x*-coordinates give the bar centres and the *y* coordinates the bar
heights.  (Alternatively, it is possible to explicitly specify the
*x*-coordinate edges of the bars using `BAR-MIN` and `BAR-MAX`, which
useful for variable width bars.)


### Examples

#### Simple bar chart with fixed bar widths

~~~~ {.html}
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
~~~~

#### Histograms

The `histogram` function in the Radian standard library can be used to
pre-process data for plotting bar chart histograms.  This example
shows how to use the `binrange` option to the histogram function to
use the same bins for calculating histogram frequencies for multiple
data sets, so as to be able to plot multiple histograms on the same
axes in a coherent way.

~~~~ {.html}
<plot height=300 aspect=2 range-y="0" stroke="black"
      ext="[[extent(dat1.x,dat2.x)]]"
      h1="[[histogram(dat1.x,{binrange:ext,nbins:20})]]"
      h2="[[histogram(dat2.x,{binrange:ext,nbins:20})]]">
  <bars x="[[h1.centres]]" y="[[h1.freqs]]" fill="red"
        bar-width=0.4 bar-offset=-0.2></bars>
  <bars x="[[h2.centres]]" y="[[h2.freqs]]" fill="blue"
        bar-width=0.4 bar-offset=0.2></bars>
</plot>
~~~~

The `histogram` function can either be called as `histogram(xs,
nbins)`, where `xs` is a one-dimensional data array and `nbins` is an
integer count of histogram bins, or as `histogram(xs, opts)`, where
`opts` is an object with fields taken from the following list:

* `transform`: either "`linear`", "`log`", or a two-element array of
  functions giving a function *f* and its inverse *f*<sup> -1</sup>
  for transforming from linear to histogram space and back again (for
  "`linear`", this is just (id, id), while for "`log`" it's (`log`,
  `exp`)).

* `nbins`, `binwidth`, `binrange`: parameters for specifying bins (in
  histogram space) -- if you have multiple histograms on the same
  axes, the best way to go is to specify `binrange` and one of `nbins`
  or `binwidth`; `binrange` (a two-element array) fixes the minimum
  and maximum bin centres, and then one bin-size parameter fixes the
  number and location of the bins independent of the input data; if
  you don't specify a range, `histogram` does a best effort to
  allocate sensible bins, but you can't guarantee that bins from two
  independent histograms will match up.

The output of `histogram` is a record with the following fields:

* `centres`: bin centres in "input" space;

* `bins`: an array of two-element arrays, giving bin boundaries in
  "input" space (this is useful for non-linear transformations, since
  the bins are no longer symmetric about their "centres");

* `counts`: the number of data values falling in each bin;

* `freqs`: the number of data values in each bin divided by total
  number of data items;

* `probs`: probability values defined so that `sum(probs[i] *
  (bins[i].max - bins[i].min), i=0, nbins-1) = 1` and so that
  `probs[i] * (bins[i].max - bins[i].min)` is proportional to
  `freqs[i]`.
