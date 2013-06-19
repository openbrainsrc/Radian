---
layout: default
title: Radian Tutorial - Getting started
---

## 1. Getting started

### What is Radian?

There are many JavaScript plotting and graphing libraries out there,
ranging in complexity from quick-and-easy things like
[Flot](http://www.flotcharts.org/) up to extremely powerful but
complex-to-use things like [D3.js](http://d3js.org/).  These things
are great, and produce attractive graphs, but they do require you to
write JavaScript.  Radian is a plotting API that works in a different
way: plots are defined declaratively using custom HTML elements.
Apart from a tiny bit of boilerplate setup code, you don't need to
write any JavaScript.  This has a couple of benefits:

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

### AngularJS + D3.js + some other things

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

### Some motivating examples

To whet you appetite, here are a couple of examples:

#### An interactive functional plot

Here, we set up a couple of range controls, using Angular's `ng-model`
attribute to bind their values to JavaScript variables.  These values
can then be accessed in Radian expressions (the things in `[[]]`
double square brackets) to define plot values.  Radian comes with a
library of commonly used functions, so here we plot a Gaussian
probability distribution.  Moving the range sliders around changes the
plot.

~~~~ {.html}
<div class="form-inline">
  <label>Mean</label>
  <input type="range" min=0 max=10 step=0.01 ng-model="mu" ng-init="mu=5">
  <label>&nbsp;&nbsp;&nbsp;&nbsp;Standard deviation</label>
  <input type="range" min=0.01 max=10 step=0.01 ng-model="sigma" ng-init="sigma=1">
</div>
<br>

<plot width=800 aspect=3 stroke-width=2 stroke="red">
  <lines x="[[seq(0,10,200)]]" y="[[normal(x,mu,sigma)]]"/>
</plot>
~~~~
<br>

<div class="form-inline">
  <label>Mean</label>
  <input type="range" min=0 max=10 step=0.01 ng-model="mu" ng-init="mu=5">
  <label>&nbsp;&nbsp;Standard deviation</label>
  <input type="range" min=0.01 max=10 step=0.01 ng-model="sigma" ng-init="sigma=1">
</div>
<br>

<plot width=800 aspect=3 stroke-width=2 stroke="red">
  <lines x="[[seq(0,10,200)]]" y="[[normal(x,mu,sigma)]]"/>
</plot>

It's worth emphasising that the code displayed above is *all* you need
to do this.  There is no extra JavaScript code required to make this
work.

#### Plotting data loaded from a URL

Of course, most of the time, we'll be interested in plotting data, not
just functions.  Radian provides a `<plot-data>` directive for
defining data sets for plotting.  Data can either be embedded directly
in the web page, or can be loaded from a URL.  Here, we load some
weather data (as a CSV file) from a URL and plot time series of a
couple of variables next to a scatter plot of those variables.

~~~~ {.html}
<plot-row width=850 aspect=3>
  <plot layout-share=3>
    <lines x="[[vic2012ooa.day]]" y="[[vic2012ooa.tmp]]" stroke="red"></lines>
    <lines x="[[vic2012ooa.day]]" y2="[[vic2012ooa.prc]]" stroke="blue"></lines>
  </plot>
  <plot layout-share=2 marker-size=30 stroke="none" fill="rgba(0,0,255,0.4)">
    <points x="[[vic2012ooa.tmp]]" y="[[vic2012ooa.prc]]"></points>
  </plot>
</plot-row>

<plot-data name="vic2012ooa" src="/tutorial/data/vic2012.csv"
           format="csv" cols="day,tmp,prc">
  <metadata name="day" label="Day of year" units="d"></metadata>
  <metadata name="tmp" label="Temperature" units="&deg;C"></metadata>
  <metadata name="prc" label="Rainfall" units="mm/day"></metadata>
</plot-data>
~~~~
<br>

<plot-row width=850 aspect=3>
  <plot layout-share=3>
    <lines x="[[vic2012ooa.day]]" y="[[vic2012ooa.tmp]]" stroke="red"></lines>
    <lines x="[[vic2012ooa.day]]" y2="[[vic2012ooa.prc]]" stroke="blue"></lines>
  </plot>
  <plot layout-share=2 marker-size=30 stroke="none" fill="rgba(0,0,255,0.4)">
    <points x="[[vic2012ooa.tmp]]" y="[[vic2012ooa.prc]]"></points>
  </plot>
</plot-row>

<plot-data name="vic2012ooa" src="/tutorial/data/vic2012.csv"
           format="csv" cols="day,tmp,prc">
  <metadata name="day" label="Day of year" units="d"></metadata>
  <metadata name="tmp" label="Temperature" units="&deg;C"></metadata>
  <metadata name="prc" label="Rainfall" units="mm/day"></metadata>
</plot-data>

As well as loading data from a URL, this example also illustrates some
of Radian's plot layout facilities (the `<plot-row>` element and the
`layout-share` attributes on the individual plots), and the automatic
labelling of plot axes based on metadata.


### Getting set up to work with Radian


<hr>
[Section 2 &raquo;](02-simple-functional-plots.html)
