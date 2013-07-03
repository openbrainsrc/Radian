---
layout: default
title: Reference manual - Other features
---

## Other features

The following things need to be thought about:

1. Plot legends: positioning (inside/outside plot frame and location);
legend elements to be displayed; labels, boxes, titles and other
formatting issues; user interaction (show/hide specific plot elements,
collapsible UI?).

2. Tooltips for individual data points (configurable, both in terms of
whether they're shown at all and in terms of the content of the
tooltips).

3. Rendering efficiency for pan and zoom (bitmaps, background
rendering, etc.).

4. Rendering efficiency for fade paths: at the moment, a separate path
element is defined for every data point, which is really inefficient
and slows down plotting noticeably; instead, it should be possible to
specify that only a certain number of "fade steps" are used along
the path (in cases where a banded palette is used, new path elements
only need to be created when a stroke colour change is required).

5. Handling of missing values, NaNs and infinite values in input data.

6. Two-dimensional pan and zoom.

7. Arbitrary plot annotations: text, overdrawing, etc.

8. Plot titles.

9. Easy access to ColorBrewer colour sets.

10. Stroke dash handling.

11. Other plot types: heatmap, contour plots, marker plots, box plots.
