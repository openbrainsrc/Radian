---
layout: default
title: Radian Tutorial -- 1.4. Basic interaction
---

# 1.4. Basic interaction

We have just one more ingredient to add before we can make the plot
we're aiming at.  That's some very simple interaction.  We'll look at
two of Radian's interaction features here, zooming and plot visibility
switching.

<hr>
## Zooming

Sometimes we want to be able to zoom into detail on a plot.  At the
moment, Radian only supports zooming in the *x*-direction, but it's
very easy to set up -- just add a `zoom-x` attribute to the `<plot>`
directive.  The result is a double plot, with a "focus" area above a
"context" area.  You can drag in the context area to select a region
to view in the focus plot, and you can then drag that focussed area
around or resize it.  To go back to the full view, just click in the
context view outside the focused region.  For the `zoom-x` attribute,
you can either supply a fraction of the vertical height of the plot to
be used for the context area, or you can just let the fraction default
to 0.2.

<div class="plot-title">Example 17 (zooming)</div>
``` html
<plot height=500 width=600 x="[[seq(0.01,1,10000)]]" zoom-x=0.25>
  <lines y="[[sin(1/x)]]" stroke="red"></lines>
</plot>
```

<hr>
## Visibility switching

If we have multiple traces on the same plot, sometimes we may want to
switch traces on and off to make it easier to see what's going on.  To
do this in Radian, add the `legend-switches` attribute to the `<plot>`
directive, and provide a label for each switchable plot with a `label`
attribute:

<div class="plot-title">Example 18 (visibility switching)</div>
``` html
<plot height=300 aspect=2 x="[[seq(0,4*PI,501)]]" legend-switches>
  <lines y="[[sin(x)]]" stroke="red" label="sin"></lines>
  <lines y="[[cos(x)]]" stroke="blue" label="cos"></lines>
  <lines y="[[2*sin(3*x)+cos(5*x+PI/4)]]" stroke-width=2
         stroke="green" label="mixed"></lines>
</plot>
```


<hr>
<a class="btn pull-left" href="1-3-radian-expressions.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="1-5-putting-it-together.html">
  Next section &raquo;
</a>
<br>
<br>
