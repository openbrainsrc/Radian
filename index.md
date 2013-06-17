---
layout: default
title: Home
---

## Welcome

**Radian** is an open source JavaScript library that makes it easy to
embed plots in HTML documents.  Instead of writing JavaScript plotting
code yourself, you use custom HTML elements to represent plots.  For
instance, the HTML code on the left produces the plot on the right:

{% highlight html %}
<plot height=200 aspect=2 stroke-width=2 x="[[seq(0,4*PI,101)]]"
      axis-x-label="Time" axis-y-label="sin(x) / cos(x)">
  <lines y="[[sin(x)]]" stroke="red"></lines>
  <lines y="[[cos(x)]]" stroke="blue"></lines>
</plot>
{% endhighlight %}

<plot height=200 aspect=2 stroke-width=2 x="[[seq(0,4*PI,101)]]"
       axis-x-label="Time" axis-y-label="sin(x) / cos(x)">
  <lines y="[[sin(x)]]" stroke="red"></lines>
  <lines y="[[cos(x)]]" stroke="blue"></lines>
</plot>

Radian uses the [AngularJS](http://angularjs.org/) JavaScript
framework to provide the machinery to implement custom HTML elements,
and to allow two-way binding between attributes in HTML elements and
JavaScript variables, and it uses the [D3.js](http://d3js.org/)
plotting library for graphics generation.  Plots are generated as SVG
elements embedded directly in the page, so can be rendered by most
modern browsers.

Radian is licensed under the [Mozilla public licence](licence.html).


### Features

- Easy to use for both functional and data-based plots
- No need to write any JavaScript
- Most common plot types supported: lines, points, bar charts, area
  plots, heatmaps (WIP)
- Integrates with AngularJS for more complicated interactive
  applications
- Open source with a liberal [license](license.html)
- Examples and comprehensive [documentation](documentation.html)


{% for post in site.tags.news limit:10 %}
---
<a href="{{ post.url }}">
<h3>{{ post.title }}</h3>
<span class="date">
<div class="dateday">{{ post.date | date: "%e" }}</div>
<div>{{ post.date | date: "%b" }}</div>
<div class="dateyear">{{ post.date | date: "%Y" }}</div>
</span>
</a>

{{ post.content }}
{% endfor %}

---
<p>See the <a href="news.html">news archive</a> for older posts.</p>
