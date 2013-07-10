---
layout: default
title: Radian Tutorial -- 3.1. Angular data binding
---

# 3.1. Angular data binding

In this section, we'll look at a few examples of using Angular
variables bound to UI elements in Radian expressions.

<hr>
## Simple parameter binding

Our first example defines a couple of slider controls, and uses
Angular's `ng-model` attribute to associate the values of the sliders
with Angular scope variables (here, called `mu` and `sigma` for the
mean and standard deviation of the normal probability distribution
we're going to plot).

These Angular scope variables can be used directly in Radian
expressions, so we can write a Radian expression for the normal
distribution with mean `mu` and standard deviation `sigma` just as
`normal(x,mu,sigma)`, plotting the distribution as a function of `x`.

The only other more JavaScript-oriented feature we've used in this
example is the Angular `ng-init` attribute, which is used to assign
initial values to `mu` and `sigma`.

<plot-example key=1 title="Example 1 (continuous values)"></plot-example>

``` html
<div class="form-inline">
  <label>Mean</label>
  <input type="range" min=0 max=10 step=0.01 ng-model="mu" ng-init="mu=5">
  <label>&nbsp;&nbsp;Standard deviation</label>
  <input type="range" min=0.01 max=10 step=0.01 ng-model="sigma" ng-init="sigma=1">
</div>
<br>

<plot height=300 aspect=3 stroke-width=2 stroke="red">
  <lines x="[[seq(0,10,200)]]" y="[[normal(x,mu,sigma)]]"></lines>
</plot>
```

<div ng-class="plotVisible[1]">
  <div class="form-inline">
    <label>Mean</label>
    <input type="range" min=0 max=10 step=0.01 ng-model="mu" ng-init="mu=5">
    <label>&nbsp;&nbsp;Standard deviation</label>
    <input type="range" min=0.01 max=10 step=0.01 ng-model="sigma" ng-init="sigma=1">
  </div>
  <br>

  <plot height=300 aspect=3 stroke-width=2 stroke="red">
    <lines x="[[seq(0,10,200)]]" y="[[normal(x,mu,sigma)]]"></lines>
  </plot>
</div>


Here's an example where we use a HTML user interface element to bind a
discrete integer parameter, in this case the number of bins used to
calculate a histogram.  The data we use is just the daily temperatures
from the Victoria weather station that we looked at before.  Here, we
bind the `nbins` variable to an input field, and can then use this
variable directly as the bin count parameter in a call to the Radian
`histogram` function[^1].

<plot-example key=2 title="Example 2 (discrete values)"></plot-example>

``` html
<form class="form-inline">
  <label>Number of bins:</label>
  <input type="number" min=4 max=70 ng-model="nbins" ng-init="nbins=25">
</form>

<plot-data name="vic2012" src="/data/vic2012.json"></plot-data>

<plot height=300 aspect=2 hist="[[histogram(vic2012#tmp,nbins)]]"
      axis-x-label="Temperature (&deg;C)" axis-y-label="Day count">
  <bars x="[[hist.centres]]" y="[[hist.counts]]"></bars>
</plot>
```

<div ng-class="plotVisible[2]">
  <form class="form-inline">
    <label>Number of bins:</label>
    <input type="number" min=4 max=70 ng-model="nbins" ng-init="nbins=25">
  </form>

  <plot-data name="vic2012" src="/data/vic2012.json"></plot-data>

  <plot height=300 aspect=2 hist="[[histogram(vic2012#tmp,nbins)]]"
        axis-x-label="Temperature (&deg;C)" axis-y-label="Day count">
    <bars x="[[hist.centres]]" y="[[hist.counts]]"></bars>
  </plot>
</div>


<hr>
## Controlling paint attributes

Paint attributes (line stroke colour and width, marker size type and
colours, etc.) can all be controlled using the same sort of data
binding as illustrated above for plot coordinates and function
parameters.  Here, we select stroke colour and width from drop-down
lists:

<plot-example key=3 title="Example 3 (paint parameters)"></plot-example>

``` html
<form class="form-inline">
  <label>Stroke colour:</label>
  <select ng-model="col" ng-init="col='red'">
    <option value="red">Red</option>
    <option value="orange">Orange</option>
    <option value="green">Green</option>
    <option value="blue">Blue</option>
    <option value="magenta">Magenta</option>
  </select>
  &nbsp;&nbsp;&nbsp;
  <label>Stroke width:</label>
  <select ng-model="swidth" ng-init="swidth=1">
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="4">4</option>
    <option value="8">8</option>
  </select>
</form>

<plot height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
  <lines y="[[0*x]]"></lines>
  <lines y="[[sin(x)]]" stroke="[[col]]" stroke-width="[[swidth]]"></lines>
</plot>
```

<div ng-class="plotVisible[3]">
  <form class="form-inline">
    <label>Stroke colour:</label>
    <select ng-model="col" ng-init="col='red'">
      <option value="red">Red</option>
      <option value="orange">Orange</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
      <option value="magenta">Magenta</option>
    </select>
    &nbsp;&nbsp;&nbsp;
    <label>Stroke width:</label>
    <select ng-model="swidth" ng-init="swidth=1">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="4">4</option>
      <option value="8">8</option>
    </select>
  </form>

  <plot height=300 aspect=2 x="[[seq(0,2*PI,101)]]">
    <lines y="[[0*x]]"></lines>
    <lines y="[[sin(x)]]" stroke="[[col]]" stroke-width="[[swidth]]"></lines>
  </plot>
</div>

<br>
<hr>
<a class="btn pull-left" href="index.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="3-2-building-the-example.html">
  Next section &raquo;
</a>
<br>
<br>

[^1]: Being able to quickly alter the number of bins for a histogram
      like this is pretty useful: try holding down one of the stepper
      arrows for the input field to see how the pattern of the
      histogram changes as the number of bins used changes.  There are
      cases where choosing a particular number of histogram bins can
      make it look as though there are patterns in your data that
      aren't really there.  Being able to view your histogram with
      different numbers of bins gives you a quick way of making sure
      that this isn't a problem.
