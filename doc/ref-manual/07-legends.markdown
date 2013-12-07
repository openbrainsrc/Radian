---
layout: default
title: Reference manual - Plot legends
---

# 7. Plot legends

<hr>
## The `<legend>` directive

### Attributes

|Name               |&nbsp;&nbsp;&nbsp;|Description|
|-------------------|-|----------------------------|
|`POSITION`         | |Legend position (see below)|
|`FRAME-THICKNESS`  | |Stroke thickness for frame surrounding legend|
|`FRAME-COLOR`      | |Stroke colour for frame surrounding legend|
|`BACKGROUND-COLOR` | |Background colour of box containing legend|
|`ORDER`            | |Legend entry order based on semicolon-separated list of entry labels|
|`ORIENTATION`      | |Orientation of legend: either `horizontal` or `vertical` with possibly a row or column count|
|`ROW-SPACING`      | |Pixel spacing between legend rows|
|`COLUMN-SPACING`   | |Pixel spacing between legend columns|
|`SEGMENT-LENGTH`   | |Pixel size of legend line segments|
|`SEGMENT-GAP`      | |Pixel gap between legend line segments and labels|
|`HORIZONTAL-MARGIN`| |Pixel margin to left and right of legend entries|
|`VERTICAL-MARGIN`  | |Pixel margin above and below legend entries|
|`MARGIN`           | |Default pixel margin around legend entries|
|`LABEL-POSITION`   | |Do labels appear `before` or `after` the corresponding legend samples?|

### Body

Optionally, `<legend-entry>` directives describing explicit legend
entries.  Implicit legend entries are picked up from plotting
directives within the surrounding `<plot>` directive that have a
`LABEL` attribute.

### Interpretation

A `<legend>` directive within a `<plot>` directive causes a plot legend
to be generated.  The position, frame and background of the legend can
be controlled, as can the orientiation (entries in vertical columns or
horizontal rows) and sizing and spacing of individual legend entries.

Legend entries can be specified explicitly (using embedded
`<legend-entry>` directives) or implicitly (by adding a `LABEL`
attribute to plotting directives).

#### Legend positioning and sizing

The position of the legend within the plot frame is controlled by the
`POSITION` attribute, which is of the form `x,y` with `x` being either
a pixel count (positive or negative), `left` or `right` and `y` either
a pixel count (positive or negative), `top` or `bottom`.  Positive
pixel counts position the left or top edge of the legend relative to
the from left or top edge of the plot frame, while negative pixel
counts position the right or bottom edge of the legend relative to the
right or bottom edge of the plot frame.  The `left`, `right`, `top`
and `bottom` values put the legend a reasonable distance from the edge
of the plot frame.

The orientation of legend entries is controlled by the `ORIENTATION`
attribute.  This can be `horizontal`, `horizontal:<nrows>`, `vertical`
or `vertical:<ncols>` -- the `horizontal` options produce legends with
entries laid out in rows, while the `vertical` options produce legends
with entries laid out in columns.  In each case, the optional value
controls the number of rows (for horizontal legends) or columns (for
vertical legends) of legend entries.  For example, an `ORIENTATION`
attribute value of `vertical:2` will result in a legend with two
columns of entries.  The default is `vertical`, i.e. legend entries
are laid out in a single column.

The spacing between rows and columns within a legend can be controlled
by the `ROW-SPACING` and `COLUMN-SPACING` attributes, both of which
are given in pixels.

#### Legend frame and background

A legend can have be surrounded by a frame, controlled by the
`FRAME-THICKNESS` and `FRAME-COLOR` attributes.  The default is to
display no frame.  A frame is drawn if either or both of the thickness
or colour are specified (thickness defaults to 1 pixel, and frame
colour defaults to black if only one is specified).

By default, the background of the legend is solid white, to set the
legend entries off against any plot graphics lying in the same area of
the plot frame as the legend.  The colour of the background rectangle
can be controlled using the `BACKGROUND-COLOR` attribute.  By setting
`BACKGROUND-COLOR` to `none`, the background rectangle can be
suppressed, making the legend transparent and allowing plot graphics
behind the legend to show through.

#### Legend entries

Legend entries can be specified both explicitly using the
`<legend-entry>` directive, and implicitly, by adding a `LABEL`
attribute to a plotting directive (e.g. `<lines>`, `<points>`,
`<bars>`, etc.).

<hr>
## Explicit legend entries: the `<legend-entry>` directive

### Attributes

|Name              |&nbsp;&nbsp;&nbsp;|Description|
|------------------|-|----------------------------|
|`LABEL`           | |Legend label for entry (mandatory)|
|`TYPE`            | |Legend type for entry (mandatory: one of `lines`, `points`, `area`, `bars`, `boxes`)|
|`STROKE`          | |Legend stroke colour|
|`STROKE-THICKNESS`| |Legend stroke thickness|
|`STROKE-OPACITY`  | |Legend stroke opacity|
|`FILL`            | |Legend fill colour|
|`FILL-OPACITY`    | |Legend fill opacity|
|`MARKER`          | |Legend marker type|

<br>
The subset of the paint attributes that are appropriate for a given
instance of `<legend-entry>` depend on the value of the `TYPE`
attribute:

| |&nbsp;&nbsp;&nbsp;|`lines`|&nbsp;|`points`|&nbsp;|`area`|&nbsp;|`bars`|&nbsp;|`boxes`|
|------------------|-|:--:|-|:--:|-|:--:|-|:--:|-|:--:|
|`STROKE`          | | OK | | OK | |    | | OK | | OK |
|`STROKE-THICKNESS`| | OK | | OK | |    | | OK | | OK |
|`STROKE-OPACITY`  | | OK | | OK | |    | | OK | | OK |
|`FILL`            | |    | | OK | | OK | | OK | | OK |
|`FILL-OPACITY`    | |    | | OK | | OK | | OK | | OK |
|`MARKER`          | |    | | OK | |    | |    | |    |


### Body

None.

### Interpretation

Each `<legend-entry>` directive explicitly specifies an entry that
will appear in the legend defined by a surrounding `<legend>`
directive.  The mandatory `LABEL` attribute is used to provide a
string label for the legend entry, and the mandatory `TYPE` attribute
is used to control the type of legend entry that appears, based on a
selected plot type.

Unless the sort order of the legend entries is otherwise modified
using the `ORDER` attribute of the `<legend>` directive, all explicit
legend entries appear after all implicit entries in the order that
they are defined by `<legend-entry>` directives.

In all other respects than ordering, explicit legend entries are
treated entirely equivalently to implicitly defined legend entries.


<hr>
## Implicit legend entries

Each plotting directive (i.e. `<lines>`, `<points>`, etc.) within a
`<plot>` directive can define have an associated implicit legend entry
in a legend defined by a `<legend>` directive within the `<plot>`
directive.  Implicit legend entries are created for any plotting
directive that has a `LABEL` attribute.


<hr>
## Legend interactivity

For implicit legend entries defined by adding a `LABEL` attribute to a
plotting directive, it is also possible to produce a user interface
allowing the plot element to be switched on and off by adding a
`LEGEND-SWITCH` attribute to the plot directive.  For each plotting
directive with a `LEGEND-SWITCH` attribute, a checkbox appears in the
legend allowing the visibility of the relevant plot to be controlled.
