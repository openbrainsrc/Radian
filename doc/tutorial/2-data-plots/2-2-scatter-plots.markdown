---
layout: default
title: Radian Tutorial -- 2.2. Scatter plots
---

# 2.2. Scatter plots

So far, we have looked only at line plots.  In this section, we branch
out a bit and look at scatter plots.  The Radian directives for all
plot types work more or less the same way, so we'll be able to get
going very quickly based on the knowledge acquired using the `<lines>`
directive for line plots.

<hr>
## The `<points>` directive

In Radian, scatter plots are generated using the `<points>`
directive.  The coordinates of points to be plotted are specified
using `x` and `y` attributes, as for the `<lines>` directive.  The
primary difference between using `<points>` and `<lines>` is in the
range of paint attributes that can be given for the markers displayed
at each of the plot points.  Markers have a shape and size, and can be
filled and stroked (so have colours and opacities for both as well as
a stroke width).

<plot-example key=6 title="Example 6"></plot-example>

``` html
<plot height=300 aspect=1>
  <points x="[[iris.sepal_length]]" y="[[iris.petal_length]]"
          marker-size=25 stroke="none" fill="red"></points>
</plot>

<plot-data name="iris" format="csv" src="/data/iris.csv"
           cols="sepal_length,sepal_width,petal_length,petal_width,species">
  <metadata name="sepal_length" label="Sepal length" units="mm"></metadata>
  <metadata name="sepal_width" label="Sepal width" units="mm"></metadata>
  <metadata name="petal_length" label="Petal length" units="mm"></metadata>
  <metadata name="petal_width" label="Petal width" units="mm"></metadata>
</plot-data>
```

<plot ng-class="plotVisible[6]" height=300 aspect=1>
  <points x="[[iris.sepal_length]]" y="[[iris.petal_length]]"
          marker-size=25 stroke="none" fill="red"></points>
</plot>

<plot-data name="iris" format="csv" src="/data/iris.csv"
           cols="sepal_length,sepal_width,petal_length,petal_width,species">
  <metadata name="sepal_length" label="Sepal length" units="mm"></metadata>
  <metadata name="sepal_width" label="Sepal width" units="mm"></metadata>
  <metadata name="petal_length" label="Petal length" units="mm"></metadata>
  <metadata name="petal_width" label="Petal width" units="mm"></metadata>
</plot-data>


Marker type is given using the `marker` attribute.  Marker size is set
by the `marker-size` attribute, which gives a measure of the *area* in
square pixels of the marker.  Colours are set with the `stroke` and
`fill` attributes.

As a more advanced example of what can be done, the following example
assigns marker type and fill colour based on the discrete values of
the `species` field in our data.  This uses Radian *palettes*, a topic
that we won't discuss much, but you can see more or less what to do
(all the details are in the
[reference manual](/ref-manual/03-palettes-and-interpolators.html)).

<plot-example key=7 title="Example 7"></plot-example>

``` html
<plot height=300 aspect=1>
  <points x="[[iris.sepal_length]]" y="[[iris.petal_length]]"
          marker="[[spmark(iris.species)]]"
          marker-size=25 fill="[[spcol(iris.species)]]"></points>
</plot>

<palette name="spmark" type="discrete">
  "I. setosa"     circle
  "I. versicolor" square
  "I. virginica"  diamond
</palette>

<palette name="spcol" type="discrete">
  "I. setosa"     red
  "I. versicolor" green
  "I. virginica"  blue
</palette>

<plot-data name="iris" format="csv" src="/data/iris.csv"
           cols="sepal_length,sepal_width,petal_length,petal_width,species">
  <metadata name="sepal_length" label="Sepal length" units="mm"></metadata>
  <metadata name="sepal_width" label="Sepal width" units="mm"></metadata>
  <metadata name="petal_length" label="Petal length" units="mm"></metadata>
  <metadata name="petal_width" label="Petal width" units="mm"></metadata>
</plot-data>
```

<palette name="spmark" type="discrete">
  \"I. setosa\" circle; \"I. versicolor\" square; \"I. virginica\" diamond
</palette>

<palette name="spcol" type="discrete">
  \"I. setosa\" red; \"I. versicolor\" green; \"I. virginica\" blue
</palette>

<plot ng-class="plotVisible[7]" height=300 aspect=1>
  <points x="[[iris.sepal_length]]" y="[[iris.petal_length]]"
          marker="[[spmark(iris.species)]]"
          marker-size=25 fill="[[spcol(iris.species)]]"></points>
</plot>


<br>
<div class="exercise">
**Exercise**

Generate some more scatter plots using the `iris.csv` data set.
Experiment with marker type, size and stroke and fill attributes.  You
can try playing with palettes for colours and marker type following
Example 7 above.

</div>


<hr>
<a class="btn pull-left" href="2-1-accessing-plot-data.html">
   &laquo; Prev section
</a>
<a class="btn pull-right" href="2-3-bar-charts.html">
  Next section &raquo;
</a>
<br>
<br>
