---
layout: default
title: Roadmap
---

We have a big pile of stuff we want to do to Radian.  To a large
extent, what we (Ian and Tom) work on is driven by the needs of the
[BayesHive](http://www.bayeshive.com) project, but we'll be trying to
implement other features as we can.

If you have features that you particularly need, let us know and we'll
see what we can do about helping you out.  (It you're really desperate
for something, you can try offering to pay us.  Depending on how much
other stuff we have going on, that might work!)  If you want to help
develop any of these features, really do let us know.  We'd be
delighted to get some more people working on this stuff.  (You can
just push pull requests at us on GitHub if you like, but we're
actively developing Radian, so it might be useful for you to know what
we're working on and what we're not, so as to avoid duplicated
effort.)

### Things we're going to do soon

 * Better management of axis formatting, ticks and so on: some of this
   is done, but it could be better.
 * Better support for categorical data, particularly for bar charts: I
   copped out on doing this when I first did bar charts, but it's been
   on my list for a while, and it's something that's used a lot in
   statistics.
 * Heatmaps, including hex-binning and categorical heatmaps: these are
   useful for all sorts of data, and hex-binned heatmaps are very
   nice.
 * More "bar type" plots, especially box plots and things of various
   "bar and whisker" flavours: we do statistics; statisticians love
   this stuff.
 * Real legend management: at the moment, legends in Radian are far
   from legendary.
 * Optimisation: Radian isn't very efficient.  I've been concentrating
   on making it work before making it fast.  There are a number of
   places where things could be cached, pre-computed or just sped up.

### Bigger jobs we want to do as soon as we can

 * Reflective styling UI: this is a little complicated to explain, but
   the basic idea is that there will be a UI that you can enable for
   each Radian plot that allows you to directly manipulate the styling
   of the plot (changing colours, fonts, axis types, whatever); the
   "reflective" part is that those changes will be advertised as some
   sort of Angular events, so that if you want to, you can persist the
   changes back to a server.  We're embedding Radian plots in literate
   documents built from a statistical modelling language, and we want
   people to be able to produce quick plots without caring about the
   styling, then manipulate the styling via this UI and have the
   changes they make reflected in the code that's used to generate the
   plots.  Not a small job, but could be super cool.
 * Contour plots: useful for all sorts of 2.5-D and 3-D data.
 * Kernel density estimation for 1-D and 2-D data: this is important
   to us for plotting credible regions on empirical probability
   density functions, but it's useful for a lot of other things too.

### Big jobs that we'd like to do, but don't know when

 * WebGL backend: this could potentially help a lot with speeding up
   handling of interactive plots, but it's quite a bit of work,
   particularly since Radian relies on D3.js to do much of the heavy
   lifting of plot generation, and we'd have to reimplement all that
   stuff ourselves to drive a WebGL backend.  Could be worth it
   though.
 * Maps: we want to be able to say "`<map>`" instead of "`<plot>`" and
   have a Leaflet map that we can drop Radian plots onto.  Not
   super-hard, but quite a bit of work, and not something we'll get
   around to until we're dealing with spatial statistics in BayesHive.

