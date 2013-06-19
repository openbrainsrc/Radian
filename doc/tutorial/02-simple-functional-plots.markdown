---
layout: default
title: Radian Tutorial - Simple functional plots
---

## 2. Simple functional plots

### Introduction

Most of the time, we'll be wanting to plot data.  However, it's
simpler to start with functional plots.  You'll often want to
superimpose a functional plot on top of data plots anyway, so it's
useful to see how these work.

#### The `<plot>` directive

All Radian plots live inside a `<plot>` directive.  The represents a
plot frame, with optional axes, axis labels, plot title and legend.
For simple plots, the `<plot>` directive specifies the size of the
plot plus all the details of the axes[^1].

Within a `<plot>` directive, you can put as many plotting directives
as you like.  The plotting directives are processed in order, so you
can overlay one plot with another just by ordering them
appriopriately.

#### The `<lines>` directive

We'll start by making some simple line graphs.  These use the
`<lines>` directive, one per curve that we want to draw.  The
`<lines>` directive allows us to specify the `x` and `y` coordinates
for our plot, along with paint attributes: stroke colours, stroke
width and so on.


### Simple examples


### Basic plot expressions

### The basics of Radian attribute handling

### Plot styling


<hr>
[&laquo; Section 1](01-getting-started.html)&nbsp;&nbsp;&nbsp;
[Section 3 &raquo;](03-simple-data-plots.html)

[^1]: In more complex cases, a `<plot>` directive may hand off its
size calculations to a containing plot layout directive
(e.g. `<plot-row>` or `<plot-col>`).  We'll look at these in
[Section 6](06-other-plot-types.html).
