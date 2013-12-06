---
layout: default
title: Reference manual - Plot layout directives
---

# 8. Plot layout directives

A number of directives are provided for laying out plots using a
"VBox/HBox" approach (`<plot-row>` and `<plot-col>`) and in simple
grids (`<plot-grid>`).  In addition, the `<plot-stack>` directive can
be used to "stack" plots or plot layouts into a set of Bootstrap tabs.

<hr>
## Flat layout

All of the "flat" plot layout directives (i.e. `<plot-row>`,
`<plot-col>` and `<plot-grid>`) can be embedded one inside the other,
forming a layout tree, the leaves of which are normal `<plot>`
directives.  So, rows can be items inside columns, columns can be
items be inside grids, grids can be items inside rows, and so on.  The
outermost layout directive (this includes a `<plot>` directive on its
own) is responsible for allocating space within the main layout frame
for the subsidiary plots.  The overall height, width and aspect ratio
of the plot layout can therefore be set on the outermost layout
element.  A single SVG image is generated for the outermost plot or
plot layout element, with space allocated within the SVG for each of
the subsidiary elements.

As with most Radian directives, plot attributes and other Radian
variables can be specified for all the plots inside the directive.  In
addition, each of the layout directives supports a number of
specialised layout attributes.

### Layout attributes for the `<plot-grid>` directive

|Name     |&nbsp;&nbsp;&nbsp;|Description|
|---------|-|----------------------------|
|`ROWS`   | |Number of rows in plot grid|
|`COLS`   | |Number of columns in plot grid|
|`SPACING`| |Spacing between layout elements in pixels|

If either or both of the `ROWS` or `COLS` attributes is missing,
sensible defaults are chosen based on the number of items inside the
`<plot-grid>` directive.

### Layout attributes for the `<plot-row>` and `<plot-col>` directives

The only special attribute for these two directives is `LAYOUT-SHARE`,
which can be applied to the elements within the `<plot-row>` or
`<plot-col>` directives to specify proportionally how much space in
the "layout direction" should be allocated to each element: setting
`LAYOUT-SHARE` to 1 for one element and 2 for another element means
that the second element will be allocated twice as much space as the
first.  Elements without a `LAYOUT-SHARE` value are allocated space
corresponding to the mean size of all elements.

### Examples

The functionality of these directives is best understood through
examples.

#### Two plots laid out side-by-side

Both plots are allocated the same amount of space, and both (because
of the `ASPECT` setting) are square:

~~~~ {.html}
<plot-row height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <plot>
    <lines y="[[sin(x)]]"></lines>
  </plot>
  <plot>
    <lines y="[[cos(x)]]"></lines>
  </plot>
</plot-row>
~~~~

#### Nested layout with varying size ratios

The second column is three times the width of the first, and because
of the height and width choices, all of the plots are square:

~~~~ {.html}
<plot-row height=600 width=800 x="[[seq(0,2*PI,101)]]">
  <plot-col layout-share=1>
    <plot title="Copy 1">
      <lines y="[[sin(x)]]"></lines>
    </plot>
    <plot title="Copy 2">
      <lines y="[[sin(x)]]"></lines>
    </plot>
    <plot title="Copy 3">
      <lines y="[[sin(x)]]"></lines>
    </plot>
  </plot-col>
  <plot layout-share=3>
    <lines y="[[cos(x)]]"></lines>
  </plot>
</plot-row>
~~~~

<hr>
## Tabbed layout

The `<plot-stack>` directive allows for a set of plots to be displayed
with a tabbed navigation interface for switching between them.  The
`<plot-stack>` directive can only appear as the outermost of a tree of
layout directives (this is because the "flat" layout directives
generate a single SVG image for the full plot layout, and there is no
easy way of embedding a tabbed navigation UI within a single SVG
image), and can contain any number of plots or plot layouts.  As for
the other layout directives, the overall size of the plot is specified
by the sizing attributes of this outer `<plot-stack>` directive.

Labels for the tabs are taken from the `TITLE` attribute of the inner
plot elements.

For example, the following will generate a lyout with three tabs named
"sin", "cos" and "combined":

~~~~ {.html}
<plot-stack width=600 aspect=1 stroke-width=2
            x="[[seq(0,2*PI+0.2,101)]]" axis-x-label="Time"
            axis-x-ticks="[[[0,[PI,'&pi;'],[2*PI,'2&pi;']]]]"
            end-tick-size=0>
  <plot title="sin" axis-y-label="sin(x)">
    <lines y="[[sin(x)]]" stroke="red"></lines>
  </plot>
  <plot title="cos" axis-y-label="cos(x)">
    <lines y="[[cos(x)]]" stroke="blue"></lines>
  </plot>
  <plot title="combined" axis-y-label="sin(x) + cos(x)">
    <lines y="[[sin(x)+cos(x)]]" stroke="green"></lines>
  </plot>
</plot-stack>
~~~~
