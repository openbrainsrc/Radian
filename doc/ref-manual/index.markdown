---
layout: default
title: Reference manual
---

# Reference manual

<p class="nyi">Throughout the body of this manual, text in grey
italics describes functionality that is not yet implemented.</p>

The **Radian** plotting library provides a convenient approach to
embedding SVG plots in HTML documents.  Plots are specified using
custom HTML-like elements (e.g. `<plot>`, `<lines>`, `<plot-data>`,
etc.) whose attributes and contents are used to control plot
appearance and plot data.  A flexible expression syntax is provided to
make the access of compound JSON datasets simple, and to allow for
grouping and simple processing of data for plotting.

**Radian** works by combining the benefits of the AngularJS JavaScript
framework with the data visualisation capabilities of the D3.js
library.  <span class="nyi">A Haskell combinator library is provided
for easy server-side rendering of plots.</span>

### [1. JavaScript data access](01-javascript-data-access.html)
### [2. Plot types](02-plot-types.html)
### [3. Palettes and interpolators](03-palettes-and-interpolators.html)
### [4. User interface features](04-user-interface-features.html)
### [5. Plot layout directives](05-plot-layout-directives.html)
### [Appendix. Reserved names](A-reserved-names.html)

<hr>
## Caveat

Because of the way that browsers parse HTML pages, it is, in general,
not possible to use XML's compact tag syntax `<tag a="abc"/>` for
custom tags that are not part of the HTML standard even if these tags
do not have any content.  This means that all custom tags must be
closed by an explicit close tag, even if there is no content within
the tag.  For example, `<metadata>` tags must always be immediately
closed by a `</metadata>`.
