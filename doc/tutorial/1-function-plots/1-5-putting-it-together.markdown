---
layout: default
title: Radian Tutorial -- 1.5. Putting it together
---

# 1.5. Putting it together

We now know enough to make this plot:

<br>
<div class="plot-center">
  <plot height=300 aspect=2 stroke-width=2 x="[[seq(0,10,20)]]"
        range-y=0 axis-x-label="X" axis-y-label="Y"
        legend-switches>
    <lines y="[[30-3*x]]" stroke="blue" label="Line"></lines>
    <lines y="[[12-3*x+x**2/2]]" stroke="red" label="Curve"></lines>
  </plot>
</div>

We'll do it step by step.  Make a copy of the `template.html` file in
the tutorial directory and give it a try yourself.

<hr>
#### 1. Plot setup

First, we need to set up the `<plot>` directive.  The plot is 300
pixels tall and about twice as long as it is high.

<div class="exercise">
**Exercise**

Set up the `<plot>` directive in your HTML file with the right
dimensions.

</div>
<br>

#### 2. Drawing the curves

The *x* coordinate values run from 0 up to 10, and we can share those
coordinate values between the two curves we want to plot.

<div class="exercise">
**Exercise**

Add a suitable `x` attribute to the `<plot>` directive using the `seq`
function.

</div>
<br>

The equations of the two curves are *y = 30 - 3x* and *y = 12 - 3x +
x<sup>2</sup>/2*.

<div class="exercise">
**Exercise**

Add suitable `<lines>` directives inside the `<plot>` directive to
plot these curves.

</div>
<br>
At this point, it should be possible to render the plot.  Give it a
go.  If it doesn't work, you can sometimes get some idea of what's
wrong by looking in the JavaScript developer console in your browser
(in Chrome, you switch this on and off with by pressing
*Ctrl-Shift-J*).  In particular, if you make a mistake in a Radian
expression, you'll see error messages from a function called
`radianEval`, the JavaScript function that processes Radian
expressions.

<br>

#### 3. Styling

We need to make the lines thicker, and we need to set their colours.
We also need to set the axis labels.

<div class="exercise">
**Exercise**

1. Make the stroke width for both lines 2 pixels, make the straight
   line blue and the parabola red.

2. Set the axis labels to "X" and "Y".

</div>
<br>

One thing we've not talked about yet is control over plotting ranges.
By default, Radian makes the coordinate ranges in the *x* and *y*
directions large enough to contain all of your plot data, i.e. all the
values you include in any `x` and `y` attributes in plot directives
within a `<plot>` directive.  Sometimes you want to be able to
override these ranges, either to exclude some data or to position your
plot more advantageously.  Here, we'd like the *y* values to run from
zero upwards.  We can do this by adding a `range-y=0` attribute to the
`<plot>` directive.

<div class="exercise">
**Exercise**

Add a `range-y=0` attribute to your `<plot>` directive and look at
what difference it makes to the plot.

</div>
<br>

#### 4. Interaction

The final aspect of the plot we need to deal with is the visibility
switching of the curves.  We can do this by adding a `legend-switches`
attribute to the `<plot>` directive and adding `label` attributes to
each of the `<lines>` directives to give labels for the curves.

<div class="exercise">
**Exercise**

Set up the visibility switching for the curves in this plot.

</div>

<hr>
## Conclusion

You should have ended up with something like this:

``` html
<plot height=300 aspect=2 stroke-width=2 x="[[seq(0,10,20)]]"
      range-y=0 axis-x-label="X" axis-y-label="Y"
      legend-switches>
  <lines y="[[30-3*x]]" stroke="blue" label="Line"></lines>
  <lines y="[[12-3*x+x**2/2]]" stroke="red" label="Curve"></lines>
</plot>
```

This is about all you need to know to be able to produce simple plots
of functions using Radian.  In the next section, we'll go on to look
at producing plots from data, and producing different types of plots
(scatter plots, bar charts and so on).

<hr>
<a class="btn pull-left" href="1-4-basic-interaction.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="../2-data-plots/index.html">
  Next section &raquo;
</a>
<br>
<br>
