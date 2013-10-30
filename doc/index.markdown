---
layout: default
title: Home
---

<div class="hero-unit">
**Radian** is an open source JavaScript library that makes it easy to
embed plots in HTML documents.  It is being developed as part of
OpenBrain's [BayesHive](http://www.bayeshive.com) project.

Instead of writing JavaScript plotting code yourself, you use custom
HTML elements to represent plots.  For instance, the HTML code on the
left produces the plot on the right:

<div class="left50pct">
~~~~ {.html}
<plot height=200 aspect=2 stroke-width=2
      x="[[seq(0,4*PI,101)]]"
      axis-x-label="Time"
      axis-y-label="sin(x) / cos(x)">
  <lines y="[[sin(x)]]" stroke="red"></lines>
  <lines y="[[cos(x)]]" stroke="blue"></lines>
</plot>
~~~~
</div>

<div class="right50pct">
<plot height=200 aspect=2 stroke-width=2 x="[[seq(0,4*PI,101)]]"
       axis-x-label="Time" axis-y-label="sin(x) / cos(x)">
  <lines y="[[sin(x)]]" stroke="red"></lines>
  <lines y="[[cos(x)]]" stroke="blue"></lines>
</plot>
</div>

<div class="clear50pct"></div>

Radian uses the [AngularJS](http://angularjs.org/) JavaScript
framework to provide the machinery to implement custom HTML elements,
and to allow two-way binding between attributes in HTML elements and
JavaScript variables, and it uses the [D3.js](http://d3js.org/)
plotting library for graphics generation.  Plots are generated as SVG
elements embedded directly in the page, so can be rendered by most
modern browsers.

Radian is licensed under the [Mozilla public license](license.html).

<br>
**Applications**

<a href="http://www.bayeshive.com"><img class="pull-right" src="img/bayeshive-logo.svg" width=150></a>

Radian is used extensively in the
[BayesHive](http://www.bayeshive.com) Bayesian statistics platform.
If you want to get an idea of what you can do with Radian, take a look
at BayesHive.

</div>

<hr>
### Features

- Easy to use for both functional and data-based plots
- No need to write any JavaScript
- Most common plot types supported: lines, points, bar charts, area
  plots, heatmaps (WIP)
- Integrates with AngularJS for more complicated interactive
  applications
- Open source with a liberal [license](license.html)
- Examples and comprehensive [documentation](documentation.html)

<hr>
### Rationale

There are many JavaScript plotting and graphing libraries out there,
ranging in complexity from quick-and-easy utilities like
[Flot](http://www.flotcharts.org/) up to powerful but complex
libraries like [D3.js](http://d3js.org/).  These things are great, and
produce attractive graphs, but they do require you to write
JavaScript.  Radian is a plotting API that works in a different way:
plots are defined declaratively using custom HTML elements.  Apart
from a tiny bit of boilerplate setup code, you don't need to write any
JavaScript.  This has a couple of benefits:

 * For users who either don't know JavaScript, don't want to write it,
   or just want a quick and simple way to drop a plot into a web page,
   Radian offers an ideal solution -- you write your plots inline in
   the HTML for your web page.  (This works with other markup systems
   as well.  All of these web pages are written in Markdown.  All
   that's needed to make Radian plots appear are a few `<script>` tags
   to provide access to the Radian library and its dependencies.)

 * For more complex applications where there may be dozens of plots on
   a page, and where the numbers and contents of the plots aren't
   known in advance, it's much easier to generate HTML containing
   Radian's custom tags than it is to generate an HTML page with
   parallel JavaScript code defining the plots.  In fact, the
   development of Radian came out of just such an application: the
   [BayesHive](http://www.bayeshive.com/) Bayesian statistical
   authoring system allows you to write literate documents describing
   complex statistical calculations, the results of which are rendered
   into Radian plots.  It became apparent pretty quickly that we
   needed something like Radian to allow us to do this with a minimum
   of pain.

<hr>
### We couldn't do it without...

Radian leverages the power of two very cool JavaScript libraries:

[AngularJS](http://angularjs.org/) is a framework for building web
applications that's based on a couple of interesting and innovative
ideas.  The first is two-way data binding -- you can easily set things
up so that the contents of an HTML page are linked to JavaScript
variables, so that changes in the JavaScript values are reflected
immediately in the displayed page, and changes in the page (via
interactive elements in forms) are propagated to the JavaScript
values.  The second idea is that of extending HTML with custom tags
and attributes that to implement application-specific behaviours.  As
you'll see, Radian makes heavy use of both of these ideas.  For
example, two-way data binding makes it almost trivial to produce
interactive plots, and custom HTML elements are used everywhere:
`<plot>`, `<plot-data>`, `<lines>`, `<points>`, and so on.

The second big thing we use is [D3.js](http://d3js.org/).  This is a
library for building "data-driven documents".  It's quite complex to
use, but it can produce amazing results -- take a look at some of the
[examples](https://github.com/mbostock/d3/wiki/Gallery) for a taste of
what it can do.

We wanted to take some of the best features of AngularJS and D3.js and
use them to make a plotting API that was ridiculously easy to use for
simple things, and possible to use for complex things.

As well as AngularJS and D3.js, we make use of a few other very useful
libraries: we use a modified version of the
[Acorn JavaScript parser](http://marijnhaverbeke.nl/blog/acorn.html)
and the [estraverse](https://github.com/Constellation/estraverse) and
[escodegen](https://github.com/Constellation/escodegen) libraries for
parsing and processing Radian expressions.
