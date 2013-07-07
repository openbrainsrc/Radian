---
layout: default
title: Radian Tutorial -- 2.5. Putting it together
---

# 2.5. Putting it together

We now know enough to make this plot (with a bit of guidance...):

<br>
<div class="plot-center">
  <plot-row width=850 aspect=3>
    <plot layout-share=3 range-y2=0 axis-y2-label="Monthly total rainfall (mm)">
      <lines x="[[vic2012.date]]" y="[[vic2012.tmp]]"
             stroke-width=2 stroke="red"></lines>
      <bars bar-width=0.9 stroke="blue" fill-opacity=0.5 fill="lightblue"
            x="[[midMonths(unique(vic2012.date#getMonth()), 2012)]]"
            y2="[[sumBy(vic2012.prc,vic2012.date#getMonth())]]"></bars>
    </plot>
    <plot layout-share=2 marker-size=30 stroke="none" fill="rgba(0,0,255,0.4)">
      <points x="[[vic2012.tmp]]" y="[[vic2012.prc]]"></points>
    </plot>
  </plot-row>

  <plot-data name="vic2012" src="/data/vic2012d.csv"
             format="csv" cols="date,tmp,prc">
    <metadata name="date" format="date"></metadata>
    <metadata name="tmp" label="Temperature" units="&deg;C"></metadata>
    <metadata name="prc" label="Rainfall" units="mm/day"></metadata>
  </plot-data>
</div>

As in Part 1, we'll do it step by step.  Make a copy of the
`template.html` file in the tutorial directory and follow along.

<hr>
#### 1. Data access

The data we need for this plot is available as `/data/vic2012d.csv`
within the tutorial directory -- this means that you can set up a
`<plot-data>` directive with a `src` attribute pointing to this
location.

The file is a CSV file containing the following columns:

* `date`: Daily dates as YYYY-MM-DD (Radian can parse these dates
  directly if you use a `<metadata>` directive with `format="date"`;

* `tmp`: Temperatures in degrees C (use `units="&deg;C"`);

* `prc`: Rainfall in units of mm/day.

<div class="exercise">
**Exercise**

Write a suitable `<plot-data>` directive to access this dataset (call
the dataset something like `vic2012`).

Add `<metadata>` directives for the data fields, given labels and
units as appropriate and setting the format for the date field.

</div>
<br>


#### 2. Temperature time series plot

We'll start with a simple time series plot of the daily temperature
data.

<div class="exercise">
**Exercise**

Make a simple line plot of the daily temperature data, 850 pixels
wide, three times as wide as tall, with the graph stroked in red, 2
pixels wide.

</div>
<br>


#### 3. Monthly precipitation bar chart

There are a couple of steps to this.  We'll start by making a *line*
plot of the daily rainfall data.

<div class="exercise">
**Exercise**

Add a line plot of the daily rainfall data on the same axes as the
temperature plot, using the second axes, stroking the line plot in
blue, two pixels wide.

</div>
<br>

We now want to try to convert our daily rainfall plot to a plot of
monthly total rainfall.  We'll use some functions from the Radian
plotting library to do this.

<div class="exercise">
**Exercise**

Modify the `x` and `y` attributes of your rainfall plot to be
something like (the exact variable names will depend on what you've
already set up):

* `x="[[midMonths(unique(vic2012.date#getMonth()), 2012)]]"`

* `y2="[[sumBy(vic2012.prc,vic2012.date#getMonth())]]"`

The `x` coordinate expression extracts the month from each date value
and calculates the mid-point of each month as a data in the year 2012
(the year the data is taken from).  The `y` expression uses the Radian
`sumBy` function to calculate monthly totals of rainfall: the first
argument to `sumBy` is a one-dimensional array of data values and the
second argument is a one-dimensional array of discrete labels (in this
case, month indexes) used to partition the first array of values for
summation.

The result of this is a line plot with one data value per month,
giving the total rainfall for that month in millimetres.

</div>
<br>

Next, we'll turn this into a bar chart.

<div class="exercise">
**Exercise**

Convert your rainfall line plot into a bar chart.  You will need to
set `range-y2=0` to make the "second axis" range run from zero.  You
will also probably want to set the bar fill colour and opacity to
something suitable (I used `fill="lightblue"` and
`fill-opacity=0.5`).  You will also want to set the Y2 axis label to
something like "Monthly total rainfall (mm)" (the relevant attribute
is `axis-y2-label` on the `<plot>` directive).

</div>
<br>


#### 4. Temperature/precipitation scatter plot

At this point, we've completed the left hand part of the plot.  Put
that part of things away somewhere safe (or just comment it out) and
let's work on the temperature/precipitation scatter plot.

<div class="exercise">
**Exercise**

Make a new plot, using a `<points>` directive to plot temperature
along the *x*-axis and daily precipitation along the *y*-axis.  The
axis labels should get set up automatically from the metadata you
specified.

</div>
<br>

The default styling for the scatter plot isn't quite what we want, so
let's clean it up.

<div class="exercise">
**Exercise**

Set the marker size for the scatter plot to something sensible (I used
30, but experiment a bit to see what you like).  Disable the stroking
of the markers, and set the fill colour to a suitable colour -- you'll
want to use a colour specification of the `rgba` type to enable alpha
blending of the markers (&alpha; = 0.4 works pretty well).  Experiment
with the colour settings until you're happy with the way it looks.

</div>
<br>


#### 5. Plot composition

All that's left now is to put the two plots together.

<div class="exercise">
**Exercise**

Take the two plots you've made and put them together in a
`<plot-row>`.  Use the `layout-share` attribute on the plots to set
their widths to a ratio of about 3:2.

</div>
<br>

<hr>
## Conclusion

That's it!  You should have ended up with something a little like
this:

``` html
<plot-row width=850 aspect=3>
  <plot layout-share=3 range-y2=0 axis-y2-label="Monthly total rainfall (mm)">
    <lines x="[[vic2012.date]]" y="[[vic2012.tmp]]"
           stroke-width=2 stroke="red"></lines>
    <bars bar-width=0.9 stroke="blue" fill-opacity=0.5 fill="lightblue"
          x="[[midMonths(unique(vic2012.date#getMonth()), 2012)]]"
          y2="[[sumBy(vic2012.prc,vic2012.date#getMonth())]]"></bars>
  </plot>
  <plot layout-share=2 marker-size=30 stroke="none" fill="rgba(0,0,255,0.4)">
    <points x="[[vic2012.tmp]]" y="[[vic2012.prc]]"></points>
  </plot>
</plot-row>

<plot-data name="vic2012" src="/data/vic2012d.csv"
           format="csv" cols="date,tmp,prc">
  <metadata name="date" format="date"></metadata>
  <metadata name="tmp" label="Temperature" units="&deg;C"></metadata>
  <metadata name="prc" label="Rainfall" units="mm/day"></metadata>
</plot-data>
```

This is quite a complex plot, but hopefully you're starting to get an
idea of what you can do with Radian.  Next, we'll look at making
interactive plots, exploiting Angular's data binding capabilities.

<br>
<hr>
<a class="btn pull-left" href="2-4-plot-layout.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="../3-interactive-plots/index.html">
  Next section &raquo;
</a>
<br>
<br>
