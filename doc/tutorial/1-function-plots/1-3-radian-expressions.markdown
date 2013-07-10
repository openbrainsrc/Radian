---
layout: default
title: Radian Tutorial -- 1.3. Radian expressions
---

# 1.3. Radian expressions

The key to the way that Radian works is its use of expressions to
calculate plot characteristics, both *x* and *y* coordinates for
lines, points, bar charts and so on, but also paint attributes for
plots.  The size, colour and shape of markers on a scatter plot can be
expressed as functions of data, making it easy to produce bubble plots
and other multivariate scatter plot types.  The stroke colour of a
curve can vary along the curve as a function of data (imagine, for
example, that you have *x* and *y* coordinates giving the longitude
and latitude of a drifting ocean buoy, and you want to plot the path
of the buoy as a curve whose colour varies depending on the ocean
temperature measured at each point).

We aren't going to get to everything that you can do with Radian
expressions in this tutorial, but we will cover the basics here and
some more powerful features in Part 3.

We have already seen some Radian expressions: these are the bits of
code in double square brackets in attributes for Radian plotting
directives.  For example, we gave the *x* coordinates of plots in the
last section as `x="[[seq(0,2*PI,101)]]"`.  Radian expressions must be
contained in double quotes, since they can contain characters that are
treated specially in HTML.  The language for the code inside the
`[[]]` brackets is a superset of the JavaScript expression syntax.
(Note that this means that it is quite a bit more expressive than the
syntax for Angular expressions.)

<hr>
## Generating sequences

The first kind of expressions that we'll look at are those for
generating evenly spaced sequences of values.  This is useful for
producing *x* coordinate values for plotting functions, as we're going
to do here.

The basic Radian function for producing sequences is `seq`.  This
takes three arguments: the starting value, the end value, and the
number of values to produce.  For example `seq(1,100,100)` produces
the sequence of integers 1, 2, ..., 100.  To use an expression like
this in a plot, we just surround it with double square brackets (to
mark that it's a Radian expression), surround that with double quotes
(to protect any HTML special characters) and assign it to an attribute
in a Radian plotting directive.

In all the plot examples so far, we've used this approach to set up a
vector of *x* coordinate values as `x="[[seq(0,2*PI,101))]]"`.  As
well as the `seq` function, this also makes use of the constant `PI`,
which is one of a number of mathematical entities imported into the
namespace of Radian expressions from JavaScript's maths library.

<hr>
## Arithmetic expressions

Once we've generated a sequence of *x* values, we'd like to be able to
calculate corresponding *y* coordinates to go with them.  The simplest
cases are arithmetic expressions, i.e. expressions that involve just
numbers, variables and the arithmetic operators `+`, `-`, `*`
(multiplication), `/` (division) and `**` (exponentiation).  (The
exponentiation operator is not something that is available in normal
JavaScript, but is a Radian "extra", added for convenience.)

This example plots a number of different polynomial curves:

<plot-example key=12 title="Example 12"></plot-example>

``` html
<plot height=300 aspect=2 x="[[seq(-5,5,101)]]">
  <lines y="[[20*x+5]]" stroke="red"></lines>
  <lines y="[[3*x**2-10*x-40]]" stroke="blue"></lines>
  <lines y="[[2*x**3-30*x-32]]" stroke="green"></lines>
</plot>
```

<plot ng-class="plotVisible[12]" height=300 aspect=2 x="[[seq(-5,5,101)]]">
  <lines y="[[20*x+5]]" stroke="red"></lines>
  <lines y="[[3*x**2-10*x-40]]" stroke="blue"></lines>
  <lines y="[[2*x**3-30*x-32]]" stroke="green"></lines>
</plot>

There are two things to note here.

First, the variable `x` defined by an attribute in the surrounding
`<plot>` directive is available in Radian expressions in the `<lines>`
directives inside the `<plot>` directive.  This is a general feature
of Radian expressions: all attributes are installed as Angular scope
variables on a scope associated with the plotting directive carrying
the directive, and the nesting of these scopes defined by Angular's
prototype inheritance mechanism makes everything work nicely.  (If
that last sentence didn't mean a whole lot to you, don't worry.
Everything will normally work the way you would expect it to -- just
remember that you can define variables via attributes on outer
plotting directives and use them in expressions within inner plotting
directives.

The second thing to note is that the expressions are *vectorised* over
the variable `x`.  Here, `x` is an array of values produced by the
`seq` function, but we can write an expression like `20*x+5`, and each
value in the `x` array is substituted for `x` in this expression one
at a time to produce an array of results.  This vectorisation is,
again, not something that is supported in ordinary JavaScript
expressions, but it is incredibly useful for writing the kinds of
expressions that are needed for plotting.  All arithmetic operators in
Radian are implicitly vectorised, and behave sensibly for combinations
of two arrays, one array and one scalar value and (obviously) two
scalar values.  To understand what this means, note that in the
expression `20*x+5`, `x` is an array, but the numbers `20` and `5` are
single scalar values.  This means that each entry in `x` is multiplied
by 20 with 5 being added to the result.  The overall result of this
expression is the array of all these results.

To see another example of how this works, consider this example:

<plot-example key=13 title="Example 13"></plot-example>

``` html
<plot height=300 aspect=2 x="[[seq(-5,5,101)]]" a="[[seq(0,20,101)]]">
  <lines y="[[a*x+5]]" stroke="red"></lines>
  <lines y="[[3*x**2-a*x-a]]" stroke="blue"></lines>
</plot>
```

<plot ng-class="plotVisible[13]" height=300 aspect=2 x="[[seq(-5,5,101)]]" a="[[seq(0,20,101)]]">
  <lines y="[[a*x+5]]" stroke="red"></lines>
  <lines y="[[3*x**2-a*x-a]]" stroke="blue"></lines>
</plot>

Here, as well as the coordinate array `x`, we define another array
called `a` which we then use in the expressions for the
*y*-coordinates in our plots.  As well as operating between one array
and a scalar value, we can, for instance, multiply one array by
another: `a*x` takes values in parallel from the arrays `a` and `x`
and multiplies them together, yielding an array as a result whose
length is the shorter of the lengths of `a` and `x`.

The upshot of all this is that writing functional plot expressions is
very simple: given an array of *x* values, just write down an
expression for the *y* value for a typical *x*, and Radian will
vectorise as necessary.

<div class="exercise">
**Exercise**

Create some line plots of polynomial functions.  Experiment with
different ranges of *x* values and different expressions for the *y*
coordinates.

</div>

<hr>
## Some simple functions

As well as arithmetic expressions, we have access to a range of
standard mathematical functions (see the
[reference manual](/ref-manual/01-javascript-data-access.html#std-fns)
for the full list).  Where it makes sense, these functions are
vectorised over the appropriate arguments in the same way as
arithmetic expressions.  Here are some examples.

<plot-example key=14 title="Example 14 (trigonometric functions)"></plot-example>

``` html
<plot height=300 aspect=2 x="[[seq(0,4*PI,501)]]">
  <lines y="[[sin(x)]]" stroke="red"></lines>
  <lines y="[[cos(x)]]" stroke="blue"></lines>
  <lines y="[[2*sin(3*x)+cos(5*x+PI/4)]]" stroke-width=2
         stroke="green"></lines>
</plot>
```

<plot ng-class="plotVisible[14]" height=300 aspect=2 x="[[seq(0,4*PI,501)]]">
  <lines y="[[sin(x)]]" stroke="red"></lines>
  <lines y="[[cos(x)]]" stroke="blue"></lines>
  <lines y="[[2*sin(3*x)+cos(5*x+PI/4)]]" stroke-width=2
         stroke="green"></lines>
</plot>

<plot-example key=15 title="Example 15 (rounding)"></plot-example>

``` html
<plot height=300 aspect=2 x="[[seq(0,4*PI,501)]]"
      s="[[10*sin(x)]]" c="[[10*cos(x)]]"
      m="[[5*(2*sin(3*x)+cos(5*x+PI/4))]]">
  <lines y="[[ceil(s)]]" stroke="red"></lines>
  <lines y="[[floor(s)]]" stroke="red"></lines>
  <lines y="[[ceil(c)]]" stroke="blue"></lines>
  <lines y="[[floor(c)]]" stroke="blue"></lines>
  <lines y="[[ceil(m)]]" stroke="green"></lines>
  <lines y="[[floor(m)]]" stroke="green"></lines>
</plot>
```

<plot ng-class="plotVisible[15]" height=300 aspect=2 x="[[seq(0,4*PI,501)]]"
      s="[[10*sin(x)]]" c="[[10*cos(x)]]"
      m="[[5*(2*sin(3*x)+cos(5*x+PI/4))]]">
  <lines y="[[ceil(s)]]" stroke="red"></lines>
  <lines y="[[floor(s)]]" stroke="red"></lines>
  <lines y="[[ceil(c)]]" stroke="blue"></lines>
  <lines y="[[floor(c)]]" stroke="blue"></lines>
  <lines y="[[ceil(m)]]" stroke="green"></lines>
  <lines y="[[floor(m)]]" stroke="green"></lines>
</plot>

<plot-example key=16 title="Example 16 (probability distributions)"></plot-example>

``` html
<plot height=300 aspect=2 x="[[seq(0,6,101)]]">
  <lines y="[[normal(x,3,0.5)]]" stroke="red"></lines>
  <lines y="[[gamma(x,2,0.5)]]" stroke="blue"></lines>
</plot>
```

<plot ng-class="plotVisible[16]" height=300 aspect=2 x="[[seq(0,6,101)]]">
  <lines y="[[normal(x,3,0.5)]]" stroke="red"></lines>
  <lines y="[[gamma(x,2,0.5)]]" stroke="blue"></lines>
</plot>

<div class="exercise">
**Exercise**

Experiment with making plots based on some of the other functions
defined in the
[reference manual](/ref-manual/01-javascript-data-access.html#std-fns).

</div>

<hr>
<a class="btn pull-left" href="1-2-line-plots.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="1-4-basic-interaction.html">
  Next section &raquo;
</a>
<br>
<br>
