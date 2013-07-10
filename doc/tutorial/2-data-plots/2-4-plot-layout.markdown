---
layout: default
title: Radian Tutorial -- 2.4. Plot layout
---

# 2.4. Plot layout

It's very common to want to produce multi-panel plots, with views of
different data (or different views of the same data) lined up together
for comparison.  Radian contains three layout directives to allow us
to do this sort of thing.

<hr>
## Tree layout

Radian plot layout uses the `<plot-row>`, `<plot-col>` and
`<plot-grid>` directives, plus an extra attribute called
`layout-share` that can be applied to plot elements within these
directives.  (In fact, `<plot-grid>` is just a special case of uses of
`<plot-row>` and `<plot-col>` provided for convenience.)

As you might expect from the names, `<plot-row>` lays things out in a
row, `<plot-col>` in a column and `<plot-grid>` in a grid.  The
important feature of these directives is that they can each contain
either `<plot>` directives (defining single plots) or other layout
directives.  You can thus define a "layout tree" to arrange plots in a
very flexible way (this sort of layout is sometimes called VBox/HBox
layout).

Here's a quick example to show how this works:

<plot-example key=11 title="Example 11 (tree layout)"></plot-example>

``` html
<plot-row width=600 height=400 x="[[seq(0,2*PI,101)]]">
  <plot-col layout-share=1>
    <plot>
      <lines y="[[sin(x)]]"></lines>
    </plot>
    <plot>
      <lines y="[[sin(2*x)]]"></lines>
    </plot>
    <plot>
      <lines y="[[sin(3*x)]]"></lines>
    </plot>
  </plot-col>
  <plot layout-share=3>
    <lines y="[[sin(x)+sin(2*x)+sin(3*x)]]"></lines>
  </plot>
</plot-row>
```

<plot-row ng-class="plotVisible[11]" width=600 height=400 x="[[seq(0,2*PI,101)]]">
  <plot-col layout-share=1>
    <plot>
      <lines y="[[sin(x)]]"></lines>
    </plot>
    <plot>
      <lines y="[[sin(2*x)]]"></lines>
    </plot>
    <plot>
      <lines y="[[sin(3*x)]]"></lines>
    </plot>
  </plot-col>
  <plot layout-share=3>
    <lines y="[[sin(x)+sin(2*x)+sin(3*x)]]"></lines>
  </plot>
</plot-row>


This plot has a column of three small plots next to a single large
plot.  Note how the plot size is defined on the outermost plot layout
directive.  This outermost directive manages the allocation of space
to all the inner layout directives and plots.  You can also see how
the `layout-share` attribute is used to control the relative amounts
of space allocated to the elements contained in the outermost
`<plot-row>` directive: the widths of the `<plot-col>` and the large
`<plot>` are in the ratio 1:3, as specified by their `layout-share`
values.  You can also see how attributes are propagated down through
the tree of directives -- we specify *x* values on the outermost
`<plot-row>` directive and these are used by all the inner plots.

The different plot elements within this type of layout tree are all
rendered independently once their sizes and locations within the
containing SVG image are determined -- no matter how many layers of
`<plot-row>` and `<plot-col>` you use, the plots are all rendered into
a single SVG image.

<hr>
## Grid layout

As well as `<plot-row>` and `<plot-col>`, which allow the construction
of arbitrary hierarchical layouts, the `<plot-grid>` directive
performs simple grid-based layout -- specify the number of rows and
columns you want (using the `rows` and `cols` attributes), put a
suitable number of `<plot>` directives inside the `<plot-grid>`
directive, and the plots will be laid out in rows in the order you
give them:

<plot-example key=12 title="Example 12 (grid layout)"></plot-example>

``` html
<plot-grid width=600 height=600 rows=2 cols=2 x="[[seq(0,2*PI,101)]]">
  <plot>
    <lines y="[[sin(x)]]"></lines>
  </plot>
  <plot>
    <lines y="[[sin(2*x)]]"></lines>
  </plot>
  <plot>
    <lines y="[[sin(3*x)]]"></lines>
  </plot>
  <plot>
    <lines y="[[sin(x)+sin(2*x)+sin(3*x)]]"></lines>
  </plot>
</plot-grid>
```

<plot-grid ng-class="plotVisible[12]" width=600 height=600 rows=2 cols=2 x="[[seq(0,2*PI,101)]]">
  <plot>
    <lines y="[[sin(x)]]"></lines>
  </plot>
  <plot>
    <lines y="[[sin(2*x)]]"></lines>
  </plot>
  <plot>
    <lines y="[[sin(3*x)]]"></lines>
  </plot>
  <plot>
    <lines y="[[sin(x)+sin(2*x)+sin(3*x)]]"></lines>
  </plot>
</plot-grid>


<br>
<hr>
<a class="btn pull-left" href="2-3-bar-charts.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="2-5-putting-it-together.html">
  Next section &raquo;
</a>
<br>
<br>
