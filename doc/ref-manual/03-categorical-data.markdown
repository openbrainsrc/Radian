---
layout: default
title: Reference manual - Categorical data
---

# 3. Categorical data

For point and bar plots, it is possible to use categorical data values
for the `x` and `y` data coordinates.  A number of attributes are
provided to support this, as well as a special data structure format
to take advantage of hierarchical grouping using multiple categorical
data fields.

<hr>
## Basic categorical data plots

For point plots, using a categorical value as the `x` attribute for a
plot results in a discrete set of point clouds being produced, one per
category, evenly spaced along the `x`-axis (see
[this example](/Radian/gallery/#/68)):

~~~~ {.html}
<plot height=400 aspect=1.5 order-x="I. virginica;I. versicolor;I. setosa"
      axis-x-label="Species" axis-y-label="Petal length"
      marker="circle" marker-size=10 stroke="none">
  <points x="[[iris.species]]"
          jitter-x y="[[iris.petal_length]]"
          fill="[[irispal(iris.species)]]">
  </points>
</plot>

<palette name="irispal" type="discrete">
  "I. setosa" red
  "I. versicolor" green
  "I. virginica" blue
</palette>

<plot-data name="iris" format="csv"
           cols="sepal_length,sepal_width,petal_length,petal_width,species">
  <metadata name="species"
            category-order="I. setosa;I. versicolor;I. virginica"></metadata>
5.1,3.5,1.4,0.2,I. setosa
4.9,3.0,1.4,0.2,I. setosa
4.7,3.2,1.3,0.2,I. setosa
4.6,3.1,1.5,0.2,I. setosa
...
</plot-data>
~~~~~

For bar plots, categorical data fields can be used for the `x`
attribute, as for point plots, but an aggregation scheme is also
needed to turn the set of data values corresponding to the category
into a single bar height to be plotted.  For the `<bars>` directive,
the `AGGREGATION` attribute (which can take on the values `mean`,
`sum`, `min` or `max`) determines the aggregation scheme used.  A
simple example plots the mean value for each category:

~~~~ {.html}
<plot axis-x-label="off" axis-y-label="Rate" stroke="none">
  <bars x="[[d1#sex]]" y="[[d1#rate]]" fill="[[mfpal(x)]]"
        aggregation="mean" bar-width=0.5></bars>
</plot>
~~~~

<hr>
## Supporting attributes

The following attributes are defined to support plots involving
categorical data -- some of these should appear on the `<plot>`
directive, some on `<metadata>` and some on `<bars>` as specified in
the following table:

|Name|&nbsp;&nbsp;&nbsp;|Directive|&nbsp;&nbsp;&nbsp;|Description|
|----------------|-|------------|-----|
|`ORDER-X`       | |`<plot>`    |Override default ordering for categorical data|
|`GROUP-X`       | |`<plot>`    |Integer grouping level for hierarchical categorical data|
|`JITTER-X`      | |`<plot>`    |Jitter data points in `x`-direction (can specify a fraction of the distance between category values or take the default of 0.05)|
|`JITTER-Y`      | |`<plot>`    |As for `JITTER-X` but in the `y`-direction|
|`CATEGORY-ORDER`| |`<metadata>`|Define default ordering for categorical data|
|`AGGREGATION`   | |`<bars>`    |Aggregation scheme for generating bars from categorical data (one of `mean`, `sum`, `min`, `max`)|

Ordering of categorical values is controlled by the `CATEGORY-ORDER`
attribute of the `<metadata>` directive and the `ORDER-X` attribute of
the `<plot>` directive.  In both cases, the ordering is defined by a
semicolon-separated list of data values.  The `<plot>` directive's
`ORDER-X` attribute overrides the default ordering defined by the
`<metadata>` `CATEGORY-ORDER` attribute.

When displaying categorical data as points, it's sometimes useful to
jitter the position of individual points so as to avoid overlapping
points (which give a false sense of the number of points in the plot).
The `JITTER-X` and `JITTER-Y` attributes on the `<plot>` directive
enable these small random displacements of individual points.  These
two attributes can either be given without any value, in which case
points are jittered by a random value within &plusmn;5% of the
separation between adjacent categorical values, or a jitter value can
be given as a fraction of the inter-category spacing.

The `AGGREGATION` attribute is explained in the previous section.

Finally, the `GROUP-X` attribute is used to control the grouping of
points and bars when hierarchical categorical data is used.  To
explain how this works, let's look at three plots based on the
following data:

~~~~ {.html}
<plot-data name="d1">
  <metadata name="sex" category-order="male;female"></metadata>
  <metadata name="env" category-order="urban;rural"></metadata>
  <metadata name="age" category-order="50-54;55-59;60-64;65-69;70-74">
  </metadata>
  [ { "sex": "female", "env": "rural", "age": "50-54", "rate": 15.5 },
    { "sex": "female", "env": "rural", "age": "55-59", "rate": 20.2 },
    { "sex": "female", "env": "rural", "age": "60-64", "rate": 32.1 },
    { "sex": "female", "env": "rural", "age": "65-69", "rate": 48.0 },
    { "sex": "female", "env": "rural", "age": "70-74", "rate": 65.5 },
    { "sex": "female", "env": "urban", "age": "50-54", "rate": 15.5 },
    ... ]
</plot-data>
~~~~

We could make plots that split the data by a single category (`sex` or
`env`, for instance), but we can also split on multiple categories at
once by zipping the data for the relevant categories together:

~~~~ {.html}
<plot height=600 aspect=1.5 axis-x-label="off" axis-y-label="Rate">
  <bars x="[[zip(d1#sex,d1#env)]]" y="[[d1#rate]]"
        aggregation="mean" bar-width=0.5 stroke-width=10
        stroke="[[urpal(x#1)]]" fill="[[mfpal(x#0)]]"></bars>
</plot>
~~~~

In this case, there will be one bar for each distinct value of the
pair `(sex, env)`, and the spacing between the bars will be constant.
The bars are stroke and filled based on palettes where we pass the
`env` value to `urpal` for the stroke and pass the `sex` value to
`mfpal` for the fill.  The bars appear in the order `(male,urban)`,
`(male,rural)`, `(female,urban)`, `(female,rural)`, i.e. the first
element in each zipped data item varies slowest.

Grouping behaviour is enabled by setting the `GROUP-X` attribute to
the count of data levels that should be grouped together.  Here,
`GROUP-X` is set to one:

~~~~ {.html}
<plot height=600 aspect=1.5 axis-x-label="off" axis-y-label="Rate"
      group-x="1">
  <bars x="[[zip(d1#sex,d1#age)]]" y="[[d1#rate]]"
        aggregation="mean" bar-width=0.5 stroke-width=2
        fill="[[mfpal(x#0)]]"></bars>
</plot>
~~~~

This results in bars that are position in two groups, one for the each
value of the `sex` field.  Each group contains one bar for each value
of the `age` field.  The grouping can be switched around by changing
the order of appearance of the zipped fields in the `x` data.  This
plot:

~~~~ {.html}
<plot height=600 aspect=1.5 axis-x-label="off" axis-y-label="Rate"
      group-x="1">
  <bars x="[[zip(d1#age,d1#sex)]]" y="[[d1#rate]]"
        aggregation="mean" bar-width=0.5 stroke-width=2
        fill="[[mfpal(x#1)]]"></bars>
</plot>
~~~~

has one group for each value of the `age` field, each group having a
bar for the different values of the `sex` field.

This hierarchical composition of categorical data and grouping extends
as you would expect for more than two variables (although this kind of
plot generally looks better with two or, at most, three, levels of
data).

<hr>
## The `boxes` directive

The `boxes` directive provides rudimentary box-and-whisker plots.
There will be more of this sort of thing in future releases of
Radian.  For the moment, you can write something like this:

~~~~ {.html}
<plot height=600 aspect=1 axis-x-label="Species" axis-y-label="Petal length">
  <boxes x="[[iris.species]]" y="[[iris.petal_length]]"
        stroke="[[irispal(iris.species)]]">
  </boxes>
</plot>
~~~~

and you will get box-and-whisker plots that show the minimum and
maximum values for each category as the whiskers, the 25% and 75%
percentiles as the bottom and top edges of the box and the median
value as a line across the box.  The usual paint styling attributes
can be used.
