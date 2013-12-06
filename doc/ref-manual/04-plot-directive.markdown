---
layout: default
title: Reference manual - The main plotting directive
---

# 4. The main plotting directive

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
`ASPECT`) and for specifying axis characteristics.  There are four
axes: `X` and `Y` (bottom and left) and `X2` and `Y2` (top and right),
each associated with a corresponding "data path" attribute of the same
name, and each having a set of formatting attributes.  In the table
below, the symbol "&loz;" stands for one of `X`, `Y`, `X2` or `Y2`.

### Attributes

|Name                          |&nbsp;&nbsp;&nbsp;|Description|
|------------------------------|-|----------------------------|
|`RANGE-`&loz;                 | |Specify coordinate range for plot|
|`RANGE`                       | |Specify both $x$- and $y$-coordinate ranges for plot together|
|`AXIS-`&loz;                  | |Either `on`/`off` to allow (default) or suppress axis display, or a tick specification|
|`AXIS-`&loz;`-TRANSFORM`      | |If present, one of `linear` (default) or `log`|
|`AXIS-`&loz;`-LABEL`          | |Either `on`/`off` to allow (default) or suppress axis labelling, or a label string (when `on` is used, the axis label is taken from metadata where possible)|
|`AXIS-`&loz;`-TICK-FORMAT`    | |Format string for axis tick display (see below)|
|`AXIS-`&loz;`-TICK-SIZES`     | |Tick sizes for axis ticks (see below)|
|`AXIS-`&loz;`-TICK-SIZE`      | |Tick size for major axis ticks|
|`AXIS-`&loz;`-MINOR-TICK-SIZE`| |Tick size for minor axis ticks|
|`AXIS-`&loz;`-END-TICK-SIZE`  | |Tick size for axis end ticks|
|`AXIS-`&loz;`-TICKS`          | |Number of major ticks or explicit tick values (see below)|
|`AXIS-`&loz;`-MINOR-TICKS`    | |Number of minor ticks per major axis tick|
|`AXIS-`&loz;`-TICK-PADDING`   | |Padding between axis ticks and tick labels|
|`TICK-SIZES`                  | |Default tick sizes for all axes (see below)|
|`TICK-SIZE`                   | |Default tick size for major axis ticks for all axes (see below)|
|`MINOR-TICK-SIZE`             | |Default tick size for minor axis ticks for all axes (see below)|
|`END-TICK-SIZE`               | |Default tick size for axis end ticks for all axes (see below)|
|`MINOR-TICKS`                 | |Default number of minor ticks per major axis tick for all axes|
|`TICK-PADDING`                | |Default padding between axis ticks and tick labels for all axes|
|`NO-DATA`                     | |Message to display when no data is available|
|`X`                           | |Data path defining x-coordinate for plot data|
|`Y`                           | |Data path defining y-coordinate for plot data|
|`X2`                          | |Data path defining x2-coordinate for plot data|
|`Y2`                          | |Data path defining y2-coordinate for plot data|
|`TITLE`                       | |Plot title|
|`WIDTH`                       | |Plot width in pixels|
|`HEIGHT`                      | |Plot height in pixels|
|`ASPECT`                      | |Plot aspect ratio|
|`ZOOM-X`                      | |Presence/absence or fraction: enable X-zooming|
|<span class="nyi">`ZOOM-Y`</span>| |<span class="nyi">Presence/absence or fraction: enable Y-zooming</span>|
|<span class="nyi">`ZOOM-2D`</span>| |<span class="nyi">Presence/absence: enable 2-D pan and zoom</span>|
|`LEGEND-SWITCHES`             | |Enable interactive on/off switching of traces via the plot legend|
|`STROKE-SWITCH`               | |Labels for stroke switching UI|
|`SELECT-X`                    | |Provide UI for selecting between x-variables of plot|
|`SELECT-Y`                    | |Provide UI for selecting between y-variables of plot|
|`FONT-SIZE`                   | |Standard font attribute (axes and annotations)|
|`FONT-FAMILY`                 | |Standard font attribute (axes and annotations)|
|`FONT-STYLE`                  | |Standard font attribute (axes and annotations)|
|`FONT-WEIGHT`                 | |Standard font attribute (axes and annotations)|
|`FONT-VARIANT`                | |Standard font attribute (axes and annotations)|
|`TITLE-FONT-SIZE`             | |Standard font attribute (plot title)|
|`TITLE-FONT-FAMILY`           | |Standard font attribute (plot title)|
|`TITLE-FONT-STYLE`            | |Standard font attribute (plot title)|
|`TITLE-FONT-WEIGHT`           | |Standard font attribute (plot title)|
|`TITLE-FONT-VARIANT`          | |Standard font attribute (plot title)|
|`MARKER`                      | |Standard paint attribute|
|`MARKER-SIZE`                 | |Standard paint attribute|
|`FILL`                        | |Standard paint attribute|
|`FILL-OPACITY`                | |Standard paint attribute|
|`STROKE`                      | |Standard paint attribute|
|`STROKE-WIDTH`                | |Standard paint attribute|
|`STROKE-OPACITY`              | |Standard paint attribute|

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

* Axis tick display and formatting is controlled by global options
  (`TICK-SIZES`, `MINOR-TICKS`, etc.) and per-axis options
  (`AXIS-X-TICK-SIZES`, `AXIS-Y-MINOR-TICKS` and so on).  In all
  cases, the axis-specific options override the global options.

* The number and location of ticks are controlled by the
  `AXIS-`&loz;`-TICKS` and `AXIS-`&loz;`-MINOR-TICKS` attributes.  The
  latter, if specified, just gives the number of minor ticks between
  each pair of major ticks.  The `AXIS-`&loz;`-TICKS` attributes,
  however, allow for either the specification of a requested number of
  major ticks or, if a Radian expression evaluating to an array is
  given, explicit tick values.  Each entry in the tick array can
  either be a single number or a two element array, the first element
  of which is a number giving the tick position and the second a
  string giving the tick label.

* Tick label formatting is controlled by the
  `AXIS-`&loz;`-TICK-FORMAT` options.  The value of one of these
  options should be a format string following the formatting language
  used by the `d3.format` function, as specified
  [here](https://github.com/mbostock/d3/wiki/Formatting#wiki-d3_format).

* Tick sizing is controlled by the `TICK-SIZES`, `TICK-SIZE`,
  `MINOR-TICK-SIZE` and `END-TICK-SIZE` attributes and their
  axis-specific equivalents.  `TICK-SIZE` refers to major ticks,
  `MINOR-TICK-SIZE` to minor ticks and `END-TICK-SIZE` to the ticks at
  the end of the axis.  These sizes can either be set individually, or
  by setting the `TICK-SIZES` attribute: giving a single value for
  this will set all tick sizes to that value, giving two values
  separated by a comma will set the major and minor tick sizes to the
  first value and the end tick size to the second value, and giving
  three comma-separated values will set the major, minor and end tick
  sizes to the given values.  The individual sizing attributes
  override the values set by `TICK-SIZES` and, as for the other tick
  formatting attributes, axis-specific attributes override the default
  attributes.

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
