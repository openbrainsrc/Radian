---
layout: default
title: Reference manual - User interface features
---

## User interface features

### Plot visibility switching

**This is partially done in a shonky way with the `LEGEND-SWITCHES`
attribute, but this needs to be managed in a much more coherent way.**

### Pan and zoom

**Not done: y-zooming, 2D pan and zoom.**

The `ZOOM-X` and `ZOOM-Y` attributes on the `<plot>` directive enable
a focus/context plot setup, where a draggable region of a context plot
is displayed in a focus panel, subsetting either in the x-direction
(`ZOOM-X`) or the y-direction (`ZOOM-Y`).  The user interface
interaction and management is entirely self-contained within the
rendering of the `<plot>` directive and any embedded plotting
directives.

### <a name="ui-stroke-sel">Stroke selection</a>

It is possible to specify multiple stroke palettes for plot elements
using a semicolon separated list of options for the `STROKE`
attribute.  Switching between these options is controlled by the UI
enabled by the `STROKE-SWITCH` attribute on the `<plot>` or
`<plot-grid>` directives.  This allows for switching between two
stroke choices (by giving a single UI element label for
`STROKE-SWITCH`, which is used to label a toggle button), or for
switching between multiple choices (by giving multiple
semicolon-separated UI labels for `STROKE-SWITCH`, which are used as
labels for a selection UI element).

The actual switching of stroke palettes is controlled by the Angular
custom `strokeSelChange` event: this is emitted by the standard
plotting UI which is included as an element in the Angular template
for the `<plot>` and `<plot-grid>` directives and is responded to by
the logic in the `<plot>` directive.  It is thus possible to disable
the standard UI and emit the appropriate events oneself.

### Data selection

The `SELECT-X` and `SELECT-Y` attributes on the `<plot>` and
`<plot-grid>` directives make it possible to switch between different
choices for the x- and y-coordinate data of plot elements.  The
standard UI for this uses normal select UI elements, linked together
to ensure that only reasonable combinations of variables can be
selected.  As for the stroke selection though, the change in data
items is managed using custom Angular events (`xDataSelChange` and
`yDataSelChange`), so the standard UI can easily be overridden.
