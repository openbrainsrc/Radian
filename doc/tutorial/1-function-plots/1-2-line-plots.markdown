---
layout: default
title: Radian Tutorial -- 1.2. Line plots
---

# 1.2. Line plots

<hr>
## The `<lines>` directive

In the last section, we used the `<lines>` directive without comment.
Here we'll see how to use it to make plots of functions.

The `<lines>` directive takes *x* and *y* coordinates as JavaScript
arrays provided via Radian expressions and draws line segments between
adjacent *(x, y)* pairs to make a polyline or (if the points are close
enough together, to the eye at least) a curve.  To use Radian
expressions, we write attributes whose values are enclosed in double
square brackets, e.g. `x="[[seq(0,2*PI,101)]]"`.  We'll explore
exactly how these expressions work in the next section.  Just take the
expressions in the examples on trust for now.

Multiple `<lines>` directives can be contained within a single
`<plot>` directive, and the lines are drawn in the order that they are
given.  For example, Example 7 draws two curves:

<plot-example key=7 title="Example 7"></plot-example>

``` html
<plot height=300 aspect=2>
  <lines x="[[seq(0,2*PI,101)]]" y="[[sin(x)]]"></lines>
  <lines x="[[seq(0,2*PI,101)]]" y="[[cos(x)]]"></lines>
</plot>
```

<plot ng-class="plotVisible[7]" height=300 aspect=2>
  <lines x="[[seq(0,2*PI,101)]]" y="[[sin(x)]]"></lines>
  <lines x="[[seq(0,2*PI,101)]]" y="[[cos(x)]]"></lines>
</plot>

In this case, because the two `<lines>` directives use the same *x*
coordinate values, we can pull the definition of the *x* values out
and put it on the `<plot>` directive:

<plot-example key=8 title="Example 8"></plot-example>

``` html
<plot height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <lines y="[[sin(x)]]"></lines>
  <lines y="[[cos(x)]]"></lines>
</plot>
```

<plot ng-class="plotVisible[8]" height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <lines y="[[sin(x)]]"></lines>
  <lines y="[[cos(x)]]"></lines>
</plot>

> **Caveat**
>
> *One important thing to note in both of these cases is that we must
> explicitly close the `<lines>` directive with a `</lines>` closing
> tag.  Because of the way that the Angular HTML parser works, it
> doesn't seem to be possible to use "auto-closing" tags like
> `<lines/>` with custom HTML elements.*

<hr>
## Simple plot styling

There are a couple of options that we can specify for the rendering of
our line plots: stroke width, colour and opacity.  Here, we plot our
two curves with different colours and different (fat) line widths:

<plot-example key=9 title="Example 9"></plot-example>

``` html
<plot height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <lines y="[[sin(x)]]" stroke="red" stroke-width=5></lines>
  <lines y="[[cos(x)]]" stroke="blue" stroke-width=10></lines>
</plot>
```

<plot ng-class="plotVisible[9]" height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <lines y="[[sin(x)]]" stroke="red" stroke-width=5></lines>
  <lines y="[[cos(x)]]" stroke="blue" stroke-width=10></lines>
</plot>

We can activate alpha blending between overlying plot elements in one
of two ways.  We can either specify a stroke opacity for the overlying
element:

<plot-example key=10 title="Example 10"></plot-example>

``` html
<plot height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <lines y="[[sin(x)]]" stroke="red" stroke-width=5></lines>
  <lines y="[[cos(x)]]" stroke="blue" stroke-width=10
         stroke-opacity=0.5></lines>
</plot>
```

<plot ng-class="plotVisible[10]" height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <lines y="[[sin(x)]]" stroke="red" stroke-width=5></lines>
  <lines y="[[cos(x)]]" stroke="blue" stroke-width=10
         stroke-opacity=0.5></lines>
</plot>

or we can use an `rgba` style colour specification for the stroke
colour of the overlying element:

<plot-example key=11 title="Example 11"></plot-example>

``` html
<plot height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <lines y="[[sin(x)]]" stroke="red" stroke-width=5></lines>
  <lines y="[[cos(x)]]" stroke="rgba(0,0,255,0.5)" stroke-width=10></lines>
</plot>
```

<plot ng-class="plotVisible[11]" height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <lines y="[[sin(x)]]" stroke="red" stroke-width=5></lines>
  <lines y="[[cos(x)]]" stroke="rgba(0,0,255,0.5)" stroke-width=10></lines>
</plot>

<br>
<div class="exercise">
**Exercise**

Experiment with these styling possibilities.  Colours can be specified
using any of the CSS colour formats, i.e. colour names, `#XXX`,
`#XXXXXX`, `rgb(r,g,b)` or `rgba(r,g,b,a)`.

</div>
<br>

More complex approaches to styling line plots are also possible: you
can specify a colour palette to be used to interpolate along the path
of a curve or you can specify the stroke colour as a function of
another array that parallels the *x* and *y* coordinate arrays.  Some
quite striking effects can be attained this way, but we need to know
about Radian expressions to use any of these approaches.

<hr>
<a class="btn pull-left" href="1-1-plot-setup.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="1-3-radian-expressions.html">
  Next section &raquo;
</a>
<br>
<br>
