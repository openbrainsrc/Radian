---
layout: default
title: Reference manual - User interface features
---

# 4. User interface features

## Vision

The current user interface features in Radian are very much
experimental.  Our eventual goal is to have a comprehensive set of
interactive tools for manipulating plots, both in terms of simple
control over data display (switching between linear and log axes,
selecting *x* and *y* variables from a drop-down list, control of
visibility of plot layers, and so on) and in terms of control over
plot styling (interactive modification of line and marker colours,
sizes, axis formatting, plot titles, annotations, and so on).

Our primary application for Radian is a statistical document authoring
system called [BayesHive](www.bayeshive.com), for which we take
documents written by users in a literate statistical programming
language, do some Bayesian analysis on the statistical models in the
documents and render the results (including Radian plots) into HTML
for display to the user.  What we would like to do is to have a direct
manipulation interface for rendered plots (provided by Radian) where
the changes made by the user can be communicated back to our server
and persisted as changes to the original literate programming
document.

The two things needed to implement this vision are a comprehensive
user interface for plot manipulation and a means of communicating
changes to plot styling back to the server.  The first is just a
matter of implementing the required GUI.  The second we will do using
Angular's event management -- an Angular application will be able to
register for `radianStyleChange` events, which will come with
information about the plot being modified (its `ID`) and the changes
made by the user.  The application can then do whatever it likes with
that change data.

All this is obviously not a trivial amount of work, and for the
moment, the UI elements of Radian remain somewhat rudimentary.  You
can use Angular data binding to implement most of the styling controls
that we're likely to implement if you really need them right now.

## Current implementation

### Axis type switching


### Histogram bin control


### Plot visibility switching

Using the `LEGEND-SWITCHES` option on the `<plot>` directive enables a
simple interface for switching the visibility of plot layers on or
off.  A basic legend is generated using the `LABEL` field of each plot
directive to provide a plot name, and the legend entries can be
clicked to view or hide each plot.

### Pan and zoom

The `ZOOM-X` attribute on the `<plot>` directive enables a
focus/context plot setup, where a draggable region of a context plot
is displayed in a focus panel, subsetting either in the *x*-direction
(`ZOOM-X`).  The user interface interaction and management is entirely
self-contained within the rendering of the `<plot>` directive and any
embedded plotting directives.

<span class="nyi">Eventually, zooming in the y-direction and 2D pan
and zoom will also be implemented.</span>

### <a name="ui-stroke-sel">Stroke selection</a>

It is possible to specify multiple stroke palettes for plot elements
using a JavaScript array of options for the `STROKE` attribute.
Switching between these options is controlled by the UI enabled by the
`STROKE-SWITCH` attribute on the `<plot>` or plot layout directives.
This allows for switching between two stroke choices (by giving a
single UI element label for `STROKE-SWITCH`, which is used to label a
toggle button), or for switching between multiple choices (by giving
multiple semicolon-separated UI labels for `STROKE-SWITCH`, which are
used as labels for a selection UI element).

The actual switching of stroke palettes is controlled by the Angular
custom `strokeSelChange` event: this is emitted by the standard
plotting UI which is included as an element in the Angular template
for the `<plot>` and plot layout directives and is responded to by the
logic in the `<plot>` directive.  It is thus possible to disable the
standard UI and emit the appropriate events oneself.

### Data selection

The `SELECT-X` and `SELECT-Y` attributes on the `<plot>` and plot
layout directives make it possible to switch between different choices
for the *x*- and *y*-coordinate data of plot elements.  The standard
UI for this uses normal select UI elements, linked together to ensure
that only reasonable combinations of variables can be selected.  As
for the stroke selection though, the change in data items is managed
using custom Angular events (`xDataSelChange` and `yDataSelChange`),
so the standard UI can easily be overridden.
