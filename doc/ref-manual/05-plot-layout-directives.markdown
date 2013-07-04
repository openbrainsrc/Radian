---
layout: default
title: Reference manual - Plot layout directives
---

# 5. Plot layout directives

A number of directives are provided for laying out plots using a
"VBox/HBox" approach (`<plot-row>` and `<plot-col>`) and in simple
grids (`<plot-grid>`).

All of the plot layout directives can be embedded one inside the
other, forming a layout tree, the leaves of which are normal `<plot>`
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
