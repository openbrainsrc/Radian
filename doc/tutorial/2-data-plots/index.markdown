---
layout: default
title: Radian Tutorial -- 2. Data plots
---

# 2. Data plots

Here's the plot we're going to be working towards producing in this
part of the tutorial:

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

The left hand plot shows a daily time series of temperature and
monthly aggregate rainfall (calculated from a daily time series) from
a weather station in Victoria, Canada (data available
[here](http://www.victoriaweather.ca/)) while the right hand panel
shows a scatter plot of daily rainfall versus temperature from the
same data.

### Setup

As for Part 1, we need to check out the appropriate contents in the
`Radian-tutorial` directory.  *Remember that the following command
will delete any local changes you have made in the `Radian-tutorial`
directory, so if you have example plots from Part 1 you want to keep,
copy them somewhere else.*  To switch to the tutorial contents for
Part 2, do the following in the `Radian-tutorial` directory:

```
git checkout -f part-2
```

<hr>
<a class="btn pull-left" href="../1-function-plots/1-5-putting-it-together.html">
  &laquo; Prev section
</a>
<a class="btn pull-right" href="2-1-accessing-plot-data.html">
  Next section &raquo;
</a>
<br>
<br>
