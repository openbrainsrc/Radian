---
layout: default
title: Radian Tutorial -- 3. Interactive plots
---

# 3. Interactive plots

In this section, we're going to explore a few of the possibilities
offered by Radian's integration with the AngularJS framework.  This
section of the tutorial is necessarily going to be a little more
technical than the previous two -- there are a lot of things you can
do with only a minimal amount of extra work, but we also want to
demonstrate some slightly more complicated things, things that will
require us to write a little bit of JavaScript code.  However, even
though we'll end up with some more complex stuff, most of the examples
we're going to look at will be things that you can easily take and
modify for your own purposes, without needing to know lots of
JavaScript to do it.

The plot that we're going to be working towards producing in this part
of the tutorial is a little interactive stock price viewer.  Below,
you can select stocks from the menu, click "Add" to add them to the
graph view (which appears once you've selected a stock), and you can
then select the variable you want to view from the second drop-down
list, control the visibility of different traces using the legend
(which only appears when you have two or more stocks plotted), pan and
zoom using the context panel below the main plot, and remove stock
traces using the buttons that appear below the plot[^1].

This example requires some features of Radian that we've not yet
covered, and it also requires about 10 lines of extra JavaScript to
set some things up.

<br>
<div class="plot-center">
  <form class="form-inline">
    <label>Stock symbol:</label>
    <select ng-model="sym" ng-init="sym=stocks[0]"
            ng-options="s for s in stocks" required></select>
    <button class="btn" ng-disabled="symbols.indexOf(sym)!=-1"
            ng-click="symbols.push(sym)">
      Add
    </button>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <label>Plot:</label>
    <select ng-model="plotvar" ng-init="plotvar=fields[0]"
            ng-options="s as s.label for s in fields" required></select>
  </form>

  <plot height=400 aspect=2 legend-switches zoom-x
        no-data="No stocks selected"
        axis-y-label="[[plotvar.label]]" axis-x-label="off">
    <lines ng-repeat="s in symbols" d="[[dat[s]]]"
           x="[[d.Date]]" y="[[d[plotvar.name]]]" label="[[s]]"
           stroke="[[category10($index)]]"></lines>
  </plot>

  <plot-data ng-repeat="s in symbols"
             name="dat" subname="[[s]]"
             format="csv" src="[[dataUrl(s)]]">
    <metadata name="Date" format="date"></metadata>
  </plot-data>

  <div>
    <span ng-repeat="s in symbols">
      <button class="btn btn-mini" ng-click="symbols.splice($index,1)">
        <i class="icon-trash"></i>
      </button>
      {{s}}&nbsp;&nbsp;&nbsp;
    </span>
  </div>
</div>


### Setup

As for Parts 1 and 2, we need to check out the appropriate contents in
the `Radian-tutorial` directory.  *Remember that the following command
will delete any local changes you have made in the `Radian-tutorial`
directory, so if you have example plots from Part 1 or 2 you want to
keep, copy them somewhere else.* To switch to the tutorial contents
for Part 3, do the following in the `Radian-tutorial` directory:

```
git checkout -f part-3
```

<hr>
<a class="btn pull-left" href="../2-data-plots/2-5-putting-it-together.html">
  &laquo; Prev section
</a>
<a class="btn pull-right" href="3-1-data-binding.html">
  Next section &raquo;
</a>
<br>
<br>

[^1]: Note that the prices shown here are just some canned data
      downloaded from Yahoo Finance.  In order to have live prices,
      we'd need to deal with cross-domain request issues: as a
      security measure, a piece of JavaScript served from, for
      example, the `http://openbrainsrc.github.io` domain, isn't
      allowed to make HTTP requests to other domains
      (e.g. `http://ichart.finance.yahoo.com`).  It's an easy problem
      to fix if you're writing a real web application -- you just
      provide a proxy service from a server in your domain to make the
      requests for you -- but it's not something we want to deal with
      here, so canned data it is.
