---
layout: default
title: Radian Tutorial -- 1. Function plots
---

# 1. Function plots

Here's the plot we're going to be working towards producing in this
part of the tutorial:

<br>
<div class="plot-center">
  <plot height=300 aspect=2 stroke-width=2 x="[[seq(0,10,20)]]"
        range-y=0 axis-x-label="X" axis-y-label="Y"
        legend-switches>
    <lines y="[[30-3*x]]" stroke="blue" label="Line"></lines>
    <lines y="[[12-3*x+x**2/2]]" stroke="red" label="Curve"></lines>
  </plot>
</div>

It's a plot with two curves (one a straight line, one a parabola)
defined by functions *y = f(x)*.  There is some simple styling (line
width and colour) and a little bit of interactivity (you can click on
the coloured blobs in the legend to toggle the visibility of the two
curves).

### Setup

Before we get started for real, you will need to set up the tutorial
materials.  These are
[available on GitHub](https://github.com/openbrainsrc/Radian-tutorial).
The easiest way to get the tutorial materials is to clone the GitHub
repository.  To do this, in a terminal window, do:

```
git clone git@github.com:openbrainsrc/Radian-tutorial.git
```

To serve the tutorial pages, you can either use a pre-existing web
server, setting it up to serve the pages in the `Radian-tutorial`
directory, or you can use the `web-server.js` script provided in the
`Radian-tutorial` directory.  This script uses Node.js, and is
identical to the web server script provided with the Angular seed
application.

Once you have a suitable web server running, check that everything is
working by pointing your browser at the `index.html` page in the
`Radian-tutorial` directory.  You should see some text saying "Content
goes here!" and a rudimentary plot.

### Starting the tutorial

Once page serving appears to be working, check out the first section
of the tutorial by going to the `Radian-tutorial` directory in a
terminal and doing:

```
git checkout -f part-1
```

We'll do something similar at the beginning of each part of the
tutorial to get out the files needed for that part.  *This command
will delete any local changes you have made in the `Radian-tutorial`
directory.*

As well as the content for each tutorial section, the
`Radian-tutorial` directory contains a `template.html` file that you
can copy to create new pages -- this contains all the JavaScript setup
required to be able to embed Radian plots in a page.

<hr>
<a class="btn pull-right" href="1-1-plot-setup.html">
  Next section &raquo;
</a>
<br>
<br>
