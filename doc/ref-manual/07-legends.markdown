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

The `<legend>` directive...

#### Legend positioning and sizing

`POSITION` attribute: `x,y` with `x` either &plusmn; a pixel count,
`left` or `right` and `y` either &plusmn; a pixel count, `top` or
`bottom`.  Positive pixel counts are for left/top edge from left/top
of frame, negative pixel counts are for right/bottom edge from
right/bottom of frame.  The `left`, `right`, `top` and `bottom`
specifiers put the legend a reasonable distance from the edge of the
plot.

`ORIENTATION` attribute: `horizontal`, `horizontal:<nrows>`,
`vertical` or `vertical:<ncols>`.

`ROW-SPACING`, `COLUMN-SPACING`: given in pixels.

#### Legend frame and background

`FRAME-THICKNESS`, `FRAME-COLOR`: defaults to no frame; frame is drawn
if either or both of thickness or colour are specified (thickness
defaults to 1px, colour to black if only one is specified).

`BACKGROUND-COLOR`: defaults to "none", i.e. transparent.

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
