---
layout: default
title: Reference manual - Plot types
---

# 2. Plot types

Radian supports a number of common plot types (lines, points, bars,
areas, etc.), and these plots can be composed in a number of ways.
Multiple plots can be superimposed on a single plot frame, or multiple
plot frames can be laid out using a VBox/HBox layout scheme (ADD
LINK).

Each plot frame is defined by a `<plot>` directive, which contains a
number of plot type directives (e.g. `<lines>`, `<points>`, etc.).
The attributes of the `<plot>` directive provide information about the
overall structure of the plot such as its size, axis labelling, title,
and so on.  As with all Radian directives, extra variables for use in
Radian expressions within the plot can also be specified as
attributes.

<hr>
## <a name="plot-directive">The `<plot>` directive</a>

The `<plot>` directive has a large number of attributes.  The most
important are those for specifying plot size (`WIDTH`, `HEIGHT` and
`ASPECT`) and for specifying axis characteristics.

### Attributes

|Name                |&nbsp;&nbsp;&nbsp;|Description|
|--------------------|-|----------------------------|
|`RANGE-X`           | |Specify $x$-coordinate range for plot|
|`RANGE-Y`           | |Specify $y$-coordinate range for plot|
|`RANGE`             | |Specify both $x$- and $y$-coordinate ranges for plot together|
|`AXIS-X`            | |Either `on`/`off` to allow (default) or suppress axis display, or a tick specification|
|`AXIS-X-TRANSFORM`  | |If present, one of `linear` (default) or `log`|
|`AXIS-X2`           | |Either `on`/`off` to allow or suppress (default) axis display, or a tick specification|
|`AXIS-Y`            | |Either `on`/`off` to allow (default) or suppress axis display, or a tick specification|
|`AXIS-Y-TRANSFORM`  | |If present, one of `linear` (default) or `log`|
|`AXIS-Y2`           | |Either `on`/`off` to allow or suppress (default) axis display, or a tick specification|
|`AXIS-X-LABEL`      | |Either `on`/`off` to allow (default) or suppress axis labelling, or a label string (when `on` is used, the axis label is taken from metadata where possible)|
|`AXIS-X2-LABEL`     | |Either `on`/`off` to allow or suppress (default) axis labelling, or a label string (when `on` is used, the axis label is taken from metadata where possible)|
|`AXIS-Y-LABEL`      | |Either `on`/`off` to allow (default) or suppress axis labelling, or a label string (when `on` is used, the axis label is taken from metadata where possible)|
|`AXIS-Y2-LABEL`     | |Either `on`/`off` to allow or suppress (default) axis labelling, or a label string (when `on` is used, the axis label is taken from metadata where possible)|
|`X`                 | |Data path defining x-coordinate for plot data|
|`Y`                 | |Data path defining y-coordinate for plot data|
|`X2`                | |Data path defining x2-coordinate for plot data|
|`Y2`                | |Data path defining y2-coordinate for plot data|
|`TITLE`             | |Plot title|
|`WIDTH`             | |Plot width in pixels|
|`HEIGHT`            | |Plot height in pixels|
|`ASPECT`            | |Plot aspect ratio|
|`ZOOM-X`            | |Presence/absence or fraction: enable X-zooming|
|<span class="nyi">`ZOOM-Y`</span>| |<span class="nyi">Presence/absence or fraction: enable Y-zooming</span>|
|<span class="nyi">`ZOOM-2D`</span>| |<span class="nyi">Presence/absence: enable 2-D pan and zoom</span>|
|`LEGEND-SWITCHES`   | |Enable interactive on/off switching of traces via the plot legend|
|`STROKE-SWITCH`     | |Labels for stroke switching UI|
|`SELECT-X`          | |Provide UI for selecting between x-variables of plot|
|`SELECT-Y`          | |Provide UI for selecting between y-variables of plot|
|`FONT-SIZE`         | |Standard font attribute (axes and annotations)|
|`FONT-FAMILY`       | |Standard font attribute (axes and annotations)|
|`FONT-STYLE`        | |Standard font attribute (axes and annotations)|
|`FONT-WEIGHT`       | |Standard font attribute (axes and annotations)|
|`FONT-VARIANT`      | |Standard font attribute (axes and annotations)|
|`TITLE-FONT-SIZE`   | |Standard font attribute (plot title)|
|`TITLE-FONT-FAMILY` | |Standard font attribute (plot title)|
|`TITLE-FONT-STYLE`  | |Standard font attribute (plot title)|
|`TITLE-FONT-WEIGHT` | |Standard font attribute (plot title)|
|`TITLE-FONT-VARIANT`| |Standard font attribute (plot title)|
|`MARKER`            | |Standard paint attribute|
|`MARKER-SIZE`       | |Standard paint attribute|
|`FILL`              | |Standard paint attribute|
|`FILL-OPACITY`      | |Standard paint attribute|
|`STROKE`            | |Standard paint attribute|
|`STROKE-WIDTH`      | |Standard paint attribute|
|`STROKE-OPACITY`    | |Standard paint attribute|

<br>

* The coordinate ranges for the plot are controlled by the `RANGE-X`,
  `RANGE-Y` and `RANGE` attributes.  These can be specified either
  explicitly (e.g. `range-x="0,20"` or `range="0,20;0,50"`), via a
  data path (in which case the range is taken from the extent of the
  data values, excluding infinite and NaN values) <span class="nyi">or
  via a URL (in which case the range is taken from the coordinate
  range of the SVG image the URL points to)</span>.

* The actual plot dimensions are determined from a combination of the
  `WIDTH`, `HEIGHT` and `ASPECT` attributes and CSS dimension styles
  for the `<plot>` element.

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

*The user interface elements of Radian will be getting a complete
overhaul at some point soon, so the behaviour of the zoom and stroke
and variable selection attributes of `<plot>` are likely to change.*

### Body

The body of a `<plot>` directive should contain directives specifying
the data to be drawn into the plot (using `<lines>`, `<points>`,
etc.).  There may also be `<plot-options>` directives specifying paint
and calculational attributes common to all plot directives.

The `<plot-options>` directive can be used to wrap inner plotting
directives that share plotting options.  For instance, the following
example plots two line graphs that share a stroke width value.  Note
how attribute variables defined in the main `<plot>` directive
propagate down to the inner plotting directives, and also how
attributes set in `<plot-options>` can be overridden by the inner
plotting directives:

~~~~ {.html}
<plot height=300 aspect=3 xs="[[seq(-1,1,100)]]">
  <plot-options stroke-width=2 stroke="red">
    <lines x="[[xs]]" y="[[-x**3+x+1]]"/>
    <lines x="[[xs]]" y="[[x**2]]" stroke="blue"/>
  </plot-options>
</plot>
~~~~

<hr>
## Paint attributes

There are a number of attributes shared among several plotting
directives, used to specify line stroke, area fill, or plot marker
styles.  The names of most of these attributes correspond directly to
attributes from the definition of the SVG image format.

|Name            |&nbsp;&nbsp;&nbsp;|Description|
|----------------|-|-------------------------|
|`MARKER`        | |Marker name to use for point plots: one of `circle`, `cross`, `diamond`, `square`, `triangle-down`, `triangle-up` <span class="nyi">or a URL referencing an image file to use as a marker|
|`MARKER-SIZE`   | |Marker size to use for point plots (as an area in square pixels: i.e. `MARKER="square" MARKER-SIZE=100` would give squares 10 pixels by 10 pixels in size|
|`FILL`          | |Fill colour for markers and area plots (usual CSS syntax for colours, i.e. names, `#XXX`, `#XXXXXX`, `rgb(r, g, b)` or `rgba(r, g, b, a)`|
|`FILL-OPACITY`  | |Opacity for fill colours for markers and area plots (from 0 to 1)|
|`STROKE`        | |Stroke colour for line plots and marker outlines (usual CSS syntax for colours, i.e. names, `#XXX`, `#XXXXXX`, `rgb(r, g, b)` or `rgba(r, g, b, a)`|
|`STROKE-WIDTH`  | |Line width for line plots|
|`STROKE-OPACITY`| |Opacity for stroke colours for line plots and marker outlines (from 0 to 1)|

<br>

All of these attributes can be supplied as single values,
e.g. `FILL="red"`, or as functions of data expressed as Radian
expressions, e.g. using a palette expression (ADD LINK):

~~~~ {.html}
<plot height=600 aspect=1
      axis-x-label="Age" axis-y-label="Height" stroke="none"
      marker="circle" marker-size=75>
  <points x="[[fam.age]]" y="[[fam.height]]"
          fill="[[@P{D female #FF7F7F; male #7F7FFF}(fam.sex)]]">
  </points>
</plot>
~~~~

Many more examples of the use of paint attributes can be seen in the
[example gallery](/gallery).

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
## Bar charts and the `<bars>` directive

### Attributes

|Name            |&nbsp;&nbsp;&nbsp;|Description|
|----------------|-|----------------------------|
|`X`             | |Data path defining x-coordinate for plot data|
|`Y`             | |Data path defining y-coordinate for plot data|
|`X2`            | |Data path defining x2-coordinate for plot data|
|`Y2`            | |Data path defining y2-coordinate for plot data|
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
heights.

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
