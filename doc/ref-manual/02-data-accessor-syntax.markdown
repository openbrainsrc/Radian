---
layout: default
title: Reference manual - Data accessor syntax
---

# 2. <a name="data-accessors">Data accessor syntax</a>

The HTML side of the plotting API uses a slight extension of the
JavaScript expression syntax to express values to be plotted.  Within
plotting directives, data values to be plotted, as well as other plot
attributes (e.g. marker size, colours, and so on) are specified using
an extended JavaScript expression syntax.  There are three aspects to
this syntax: permitted operators, name scoping and attribute data
binding, and standard functions.

In order to distinguish between Radian expressions and raw string
values, all Radian expressions are enclosed in double square brackets,
e.g. `[[x+y]]`.  This is the same sort of approach as taken in
Angular, where Angular expressions are enclosed in double braces.  The
Radian expression syntax is a superset of full JavaScript expression
syntax, so is rather more flexible than the more restricted grammar
supported for Angular expressions.

<hr>
## Data accessor operators

Data accessor syntax allows three extensions to standard JavaScript
syntax.  These are intended to make it more convenient to write the
kinds of expressions needed in common plot types.

**Exponentiation operator** Instead of writing `Math.pow(x,y)`, one
may write `x**y`.  The `**` operator has a higher precedence than any
other binary operator.

**Pluck operator** If `y` is an identifier, the expression `x#y` is
equivalent to

~~~~ {.javascript}
x.map(function(e) { return e.y; )}
~~~~

while if `y` is an integer literal, `x#y` is equivalent to

~~~~ {.javascript}
x.map(function(e) { return e[y]; )}
~~~~

and if `expr` is a general JavaScript expression, `x#(expr)` (note
parentheses!) is equivalent to

~~~~ {.javascript}
x.map(function(e) { return e[expr]; )}
~~~~

This allows fields from arrays of objects or arrays of arrays to be
plucked out into flat arrays in a simple way (method "plucking" of the
form `x#f(z)` is also supported).  This syntax is particularly useful
for JSON arrays of objects or for compound object fields within other
data.  For instance, if we have a data set `d` with a field `date`
containing an array of date fields, we can extract the day of year of
each date as a single array using the expression `d.date#dayOfYear()`.
Note that the *only* possibilities for the right hand side of the `#`
operator are an identifier, a literal integer or a parenthesised
expression (the parentheses are necessary for disambiguation of the
`x#y` and `x#(y)` cases -- in the first case `y` is an identifier, in
the second an expression).

**Expression vectorisation** Standard functions and arithmentic
operators are automatically vectorised, so that, for example, `sin(x)`
calculates either the sine of a single value or an array and `x + y`
adds two arrays, two scalars or a scalar and an array in the natural
way.  This means that we can express functional plots in a very simple
way:

~~~~ {.html}
<plot height=300 aspect=3 stroke-width=1>
  <lines x="[[seq(-1,1,100)]]" y="[[-x**3+x+sin(x)]]" stroke="red"></lines>
</plot>
~~~~

<hr>
## Name scoping and data binding in data accessors

The following names are in scope within data accessor expressions:

* The names of all data sets defined in `<plot-data>` directives in
  Angular scopes that enclose the scope of the directive containing
  the Radian expression.  Each data set is accessible by the name
  given in the `ID` attribute of its `<plot-data>` directive.

* All names passed as attributes to plotting directives that are not
  reserved names (see list in the [Appendix](#reserved)).

* All Angular scope variables defined in the scope of the directive
  containing the expression (not that, via Angular's prototype object
  inheritance chain for scopes, this includes values in outer
  surrounding scopes, as long as their names are not shadowed by names
  in inner scopes).

* The "Radian library" functions and constants defined
  [here](06-radian-plotting-library.html).

What this means is that it is possible to pass data values around
using attributes with meaningful names.  We implicitly bring data set
names into scope as well as simplified standard function names to make
writing plot directives quick and simple.

Combined with Angular's `ng-model` data binding attribute, we can do
some very powerful things in very simple ways:

~~~~ {.html}
<div class="form-inline">
  <label>Mean</label>
  <input type="text" ng-model="mu" ng-init="mu=5">
  <label>&nbsp;&nbsp;Standard deviation</label>
  <input type="text" ng-model="sigma" ng-init="sigma=1">
</div>
<br>

<plot height=300 aspect=3 stroke-width=2 stroke="red">
  <lines x="[[seq(0,10,200)]]" y="[[normal(x,mu,sigma)]]"></lines>
</plot>
~~~~

In this example, updating the values in the input text fields triggers
an immediate update of the plot, pulling in the new values from the UI
elements.  This means that plots can be attached to arbitrary UI
elements with ease.  Note how names of Angular scope variables defined
for instance using `ng-model` may be used within Radian expressions.
The Radian expression parsing infrastructure interacts correctly with
Angular data binding so that plots are regenerated when Angular
expressions within Radian expressions change.

<hr>
## Handling of dates

Time and date data can be read using a `<metadata>` directive
with a `FORMAT="date"` attribute.  Individual fields of date
values can then be plucked from date data using methods of the
standard JavaScript `Date` class: for instance,
`date#getMonth()` extracts the month field from a series of
dates.  In combination with aggregation functions and arbitrary
mapping functions, this allows for various complex manipulations of
date data.  This example shows extraction of date fields, aggregation
(using the `unique` and `meanBy` functions) and the use
of a user-defined function (`midMonths`) injected into the
`plotLib` plotting library in the Angular controller used to
manage the page:

~~~~ {.html}
<plot height=300 aspect=3 stroke-width=2>
  <lines x="vic2012ooa.date" y="vic2012ooa.tmp" stroke="red"></lines>
  <lines x="[[midMonths(unique(vic2012ooa.date#getMonth()), 2012)]]"
         y="[[meanBy(vic2012ooa.prc,vic2012ooa.date#getMonth())]]"
         stroke="blue"></lines>
</plot>
~~~~

<hr>
## Examples

In this simple example, we use Angular data binding to set the `mu`
and `sigma` attributes from scope variables called `mean` and `sdev`.
These "attribute variables" are then in scope for the calculation of
`x` and `y` attributes for the plot:

~~~~ {.html}
<lines mu="[[mean]]" sigma="[[sdev]]"
       x="[[seq(mu-3*sigma,mu+3*sigma,100)]]"
       y="[[normal(x,mu,sigma)]]">
</lines>
~~~~

The processing of this example goes as follows:

|Evaluate|&nbsp;&nbsp;&nbsp;|Requires                           |
|--------|------------------|-----------------------------------|
|`x`     |                  |`mu`, `sigma`                      |
|`y`     |                  |`x`, `mu`, `sigma`                 |
|`mu`    |                  |`mean`                             |
|`sigma` |                  |`sdev`                             |
|`mean`  |                  |AngularJS scope variable           |
|`sdev`  |                  |AngularJS scope variable           |
