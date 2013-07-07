---
layout: default
title: Radian Tutorial -- 2.3. Bar charts
---

# 2.3. Bar charts

<hr>
## The `<bars>` directive

Bar charts are generated using the `<bars>` directive.  This works in
just the same way as `<lines>` and `<points>`, in the sense that you
provide *x* and *y* coordinates via `x` and `y` attributes.  The *x*
coordinates give the centres of the bars and the *y* coordinates their
tops.  There is one wrinkle you need to be aware of, displayed in this
plot:

<div class="plot-title">Example 8 (single bars)</div>
``` html
<plot height=300 aspect=1 range-y=0>
  <bars x="[[dat.month]]" y="[[dat.precip]]"></bars>
</plot>

<plot-data name="dat" format="csv" cols="month,precip">
  1,34
  2,22
  3,53
  4,27
  5,13
  6,8
  7,5
  8,12
  9,29
  10,44
  11,27
  12,30
</plot-data>
```

We have set the `range-y` attribute on the `<plot>` directive to
ensure that the *y*-axis runs from zero upwards so that we see the
full extent of the bars.  Most of the time this is what you will want
(particularly for the histograms we'll look at below), but sometimes
you may want to truncate the bars at a different level.

Bars can be styled using the usual stroke and fill attributes, and the
width and relative location of bars can also be modified, using the
`bar-width` and `bar-offset` attributes.  These can be specified as
fractions of the "natural" bar width, or as pixel values, and are
useful for plotting multiple series of bars on the same axes:

<div class="plot-title">Example 9 (double bars)</div>
``` html
<plot height=300 aspect=1 range-y=0 stroke="none" bar-width=0.3>
  <bars x="[[dat.x]]" y="[[dat.y]]" fill="red" bar-offset=0.2></bars>
  <bars x="[[dat.x]]" y="[[dat.z]]" fill="blue" bar-offset=-0.2></bars>
</plot>

<plot-data name="dat" format="csv" cols="x,y,z">
  1,34,10
  2,22,20
  3,53,50
  4,27,20
  5,13,30
  6,8,40
  7,5,10
  8,12,5
  9,29,40
  10,44,20
  11,27,10
  12,30,5
</plot-data>
```

(There are some other features of bar charts that allow you to draw
bars of unequal widths.  You can read about these in the
[reference manual](/ref-manual/02-plot-types.html#bars-directive).)

<hr>
## Histograms

Histograms are just a special kind of bar chart where the bar heights
are derived.  Radian provides a library function (called, naturally
enough, `histogram`) to help with producing this type of plot.  The
`histogram` function takes two arguments: the first is a
one-dimensional array of data values and the second is either an
integer count of histogram bins, or an object specifying information
needed to calculate the histogram bins (number or size of bins and
possibly the range of values over which to calculate the bins, and
also optional coordinate transformations that can be used for creating
log-space histograms).  In the simplest case, this is all that's
needed to create a histogram:

<div class="plot-title">Example 10 (histogram)</div>
``` html
<plot height=300 aspect=1 range-y=0 stroke="none"
      hist="[[histogram(dat.x,10)]]">
  <bars x="[[hist.centres]]" y="[[hist.counts]]" fill="red"></bars>
</plot>

<plot-data name="dat" format="csv" cols="x">
  -0.21991614
  -1.21243350
  0.25558776
  -0.13629943
  -2.22833941
  -1.60829920
  -0.55755778
  -0.23925929
  0.40663494
  0.99105558
  -0.95120549
  -1.67478975
  -0.14602045
  -0.01902537
  -0.40205444
  1.44275512
  -1.05451039
  -1.01921213
  1.03799046
  -0.33640740
</plot-data>
```

Much more complex applications are possible: you can calculate
multiple histograms using the same bins for plotting on the same axes,
you can calculate histograms in log-coordinates and plot them on a
log-transformed *x*-axis to give constant width bins in log
coordinates, and many other possibilities.  Read the reference manual
to get some ideas.

<br>
<hr>
<a class="btn pull-left" href="2-2-scatter-plots.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="2-4-plot-layout.html">
  Next section &raquo;
</a>
<br>
<br>
