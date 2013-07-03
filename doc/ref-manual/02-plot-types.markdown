---
layout: default
title: Reference manual - Plot types
---

## Plot types

### The `<plot>` directive

**Not done: y-zooming, 2D pan and zoom, proper legend management.**

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

~~~~ {.html}
<plot height=300 aspect=3 xs="[[seq(-1,1,100)]]">
  <plot-options stroke-width=2 stroke="red">
    <lines x="[[xs]]" y="[[-x**3+x+1]]"/>
    <lines x="[[xs]]" y="[[x**2]]" stroke="blue"/>
  </plot-options>
</plot>
~~~~

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

~~~~ {.html}
<plot height=300 aspect=3 stroke-width=2>
  <lines x="[[vic2012ooa.day]]" y="[[vic2012ooa.tmp]]" stroke="red"/>
  <lines x="[[vic2012ooa.day]]" y="[[vic2012ooa.prc]]" stroke="blue"/>
</plot>
~~~~


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

~~~~ {.html}
<plot height=300 marker-size=1.5 marker="circle" stroke="none">
  <points x="[[ctrl.pred1]]" y="[[ctrl.resp]]" fill="black"></points>
  <points x="[[treat.pred1]]" y="[[treat.resp]]" fill="red"></points>
</plot>
~~~~

More complex plot with calculation of attributes from data -- note the
inheritance of the `STROKE` and `STROKE-WIDTH` standard paint
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
      popint="[[interpolate(pop,[1,1000],'sqrt')]]"
      axis-x-label="Per capita GDP" axis-x-transform="log"
      axis-y-label="Life expectancy">
  <points x="[[gdp.map(function(d) { return d[yidx]; })]]"
          y="[[life.map(function(d) { return d[yidx]; })]]"
          fill="[[category10(region)]]"
          marker-size="[[popint(pop.map(function(d) { return d[yidx]; }))]])">
  </points>
</plot>
~~~~

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

~~~~ {.html}
<plot>
  <background src="http://www.bayeshive.com/assets/maps/europe-political.svg"
               clip-x="[[cases#lon]]" clip-y="[[cases#lat]]"/>
  <points x="[[cases#lon]]" y="[[cases#lat]]"
          marker="[[{circle;square}(cases#sex)]]"
          size="[[{linear 1 3}(cases#age)]]"/>
</plot>
~~~~

Basic PNG example using UK National Grid coordinates to show GPS track
data over a background map:

~~~~ {.html}
<plot>
  <background src="http://www.bayeshive.com/assets/maps/central-london.png"
              x="520520,540520" clip-y="151830,171830"/>
  <lines x="[[track#ng_x]]" y="[[track#ng_y]]" stroke="black" stroke-width=2/>
</plot>
~~~~
