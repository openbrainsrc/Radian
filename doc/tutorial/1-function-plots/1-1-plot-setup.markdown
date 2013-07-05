---
layout: default
title: Radian Tutorial -- 1.1. Plot setup
---

# 1.1. Plot setup

<hr>
## The `<plot>` directive

The most important Radian plotting directive is `<plot>`.  This is
used as a wrapper around all plots, and is used to define plot sizes,
axis details, coordinate ranges and other aspects of a plot that are
shared by all the items displayed on a plot.

In order to demonstrate some features of the `<plot>` directive, we
will use the following piece of plotting code:

<div class="plot-title">Example 1</div>
``` html
<plot>
  <lines x="[[seq(0,2*PI,101)]]" y="[[sin(x)]]"></lines>
</plot>
```

Don't worry about the `<lines>` directive yet.  We'll cover that in
the next section.  If you have checked out the `part-1` tag from the
tutorial repository, then the `index.html` page in the tutorial
directory will contain a list of links to examples -- this is "Example
1".

Because we've not specified any sizing information for this plot, what
we get depends on CSS attributes controlling the sizes of SVG elements
in pages.  In my browser, I see a plot that's 940 pixels wide by 185
pixels tall, but you may see something different.

<hr>
## Plot sizing

We can control the plot size by explicitly given two out of the width,
height and aspect ratio of the plot (the aspect ratio is just the
ratio of the width to the height).  All plot dimensions are given in
pixels, and are used directly to control the size of the resulting SVG
image in the HTML page containing the `<plot>` directive.

<div class="plot-title">Example 2</div>
``` html
<plot height=300 aspect=2>
  <lines x="[[seq(0,2*PI,101)]]" y="[[sin(x)]]"></lines>
</plot>
```

This gives us a plot that is 300 pixels tall and 600 pixels wide (it's
twice as wide as tall, to give an aspect ratio of 2).

<div class="exercise">
**Exercise**

1. Copy the `template.html` file to make a new HTML page.
2. Make a plot 800 pixels wide by 400 pixels tall by specifying the
   height and width directly.
3. Make a square plot 600 pixels wide and tall by setting either the
   height or width and the aspect ratio.
</div>

<hr>
## Plot axes

We can control whether axes and axis labels are displayed for our
plots using the `AXIS-X`, `AXIS-Y`, `AXIS-X-LABEL` and `AXIS-Y-LABEL`
attributes of the `<plot>` directive.  For instance, Example 3 has no
axes at all:

<div class="plot-title">Example 3</div>
``` html
<plot height=300 aspect=2 axis-x="off" axis-y="off">
  <lines x="[[seq(0,2*PI,101)]]" y="[[sin(x)]]"></lines>
</plot>
```

while Example 4 has axes and explicitly set axis labels:

<div class="plot-title">Example 4</div>
``` html
<plot height=300 aspect=2 axis-x-label="Custom X axis label"
      axis-y-label="Custom Y axis label">
  <lines x="[[seq(0,2*PI,101)]]" y="[[sin(x)]]"></lines>
</plot>
```

<hr>
## Titles and fonts

We can give our plots a title:

<div class="plot-title">Example 5</div>
``` html
<plot height=300 aspect=2 title="Example 5">
  <lines x="[[seq(0,2*PI,101)]]" y="[[sin(x)]]"></lines>
</plot>
```

and we can adjust the fonts for the axes and title independently:

<div class="plot-title">Example 6</div>
``` html
<plot height=300 aspect=2 title="Example 6"
      font-family="Monospace" font-size=16
      title-font-family="Serif" title-font-style="italic">
  <lines x="[[seq(0,2*PI,101)]]" y="[[sin(x)]]"></lines>
</plot>
```

<br>
<div class="exercise">
**Exercise**

Experiment with these sizing and styling options.  The section in the
[reference manual](/ref-manual/02-plot-types.html#plot-directive) on
the `<plot>` directive may give you some more ideas.
</div>

<br>
<hr>
<a class="btn pull-left" href="index.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="1-2-line-plots.html">
  Next section &raquo;
</a>
<br>
<br>
