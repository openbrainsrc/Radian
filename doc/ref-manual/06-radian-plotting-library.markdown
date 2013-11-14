---
layout: default
title: Reference manual - Radian plotting library
---

# 6. The Radian plotting library

Within Radian expressions, a standard set of constants and functions
are made available.  Some of these are standard JavaScript functions,
some are adapted from the D3 plotting library, and some are unique to
Radian.

<hr>
## JavaScript standard functions

The following constants and functions from the `Math.xxx` JavaScript
scope are brought into scope within data accessor expressions
(i.e. one can write "`sin(x)`" instead of "`Math.sin(x)`"): `E`,
`LN10`, `LN2`, `LOG10E`, `LOG2E`, `PI`, `SQRT1_2`, `SQRT2`, `abs`,
`acos`, `asin`, `atan`, `atan2`, `ceil`, `cos`, `exp`, `floor`, `log`,
`pow`, `round`, `sin`, `sqrt`, `tan`.

<hr>
## D3 functions

The following functions from the `d3.xxx` JavaScript scope are brought
into scope within data accessor expressions (i.e. one can write
"`extent(x)`" instead of "`d3.extent(x)`"): `min`, `max`, `extent`,
`sum`, `mean`, `median`, `quantile`, `zip`.  (In fact, `extent` in
Radian expressions is a variadic function: passing multiple arrays to
`extent` will find the union of their ranges.)

<hr>
## Extra functions

`seq`, `seqStep`: Generate evenly spaced sequences of values:
`seq(start, end, n)` produces a sequence of `n` values ranging from
`start` to `end`, while `seqStep(start, end, delta)` produces a
sequence from `start` to `end` in steps of `delta`.

`sdev`: Calculate the sample standard deviation of an array.

`unique`: Return the unique entries in an array in the order that they
first appear.

`flatten`: Flatten a multi-dimensional array into a one-dimensional
array.

`minBy`, `maxBy`, `sumBy`, `meanBy`, `sdevBy`, `quantileBy`,
`firstBy`: Calculate categorical sums, means, standard deviations and
quantiles of data sets (or extract first element with matching
category): `sumBy(x, y)` calculates the sum of `x` values for each
distinct value of `y`, returning an array of results in the order of
occurrence of the distinct values in `y`.  For example, given a
dataset `d` containing daily temperature data with associated dates,
`meanBy(d#temp, d#date#mon)` calculates a monthy seasonal cycle of
temperatures.  The `quantileBy` function is called as `quantileBy(x,
y, p)` and calculates the `p`th quantile of the vector `x` segregated
by distinct values of the parameter `y`.

`normal`: Normal distribution function: `normal(x, mu, sigma)` gives
the value of the normal PDF with mean `mu` and standard deviation
`sigma` at ordinate `x`.

`lognormal`: Log-normal distribution function: `lognormal(x, mu,
sigma)` gives the value of the log-normal PDF with mean `mu` and
standard deviation `sigma` at ordinate `x`.

`gamma`: Gamma distribution function: `gamma(x, k, theta)` gives the
value of the gamma PDF with shape parameter `k` and scale parameter
`theta` at ordinate `x`.

`invgamma`: Inverse gamma distribution function: `invgamma(x, alpha,
beta)` gives the value of the inverse gamma PDF with shape parameter
`alpha` and scale parameter `beta` at ordinate `x`.

<hr>
## Histogramming

The Radian plotting library also contains a `histogram` function for
histogram binning calculations.  This is called either as
`histogram(xs, nbins)` with `nbins` an integer count of the number of
bins to use, or as `histogram(xs, opts)` with `opts` an object with
some of the following fields:

* `transform`: either a string (one of `linear` or `log`) or a
  two-element array of functions giving forward and inverse coordinate
  transformations; if the `transform` argument is supplied, histogram
  binning is done in transformed coordinates, with bin centres and
  extents being transformed back to the original coordinate values
  before return.

 * `binrange`: data range over which bins are to be generated; if
   omitted, the binning range is calculated from the data;

 * `nbins`: number of histogram bins to use;

 * `binwidth`: width of histogram bins to use (in transformed
   coordinates); not used if `nbins` is supplied.

The return value of the `histogram` function is an object with the
following fields:

 * `centres`: histogram bin centres;

 * `bins`: array of two-element arrays giving the minimum and maximum
   bounds for each histogram bin (this is useful when using the
   `transform` argument to `histogram`, since, for nonlinear
   coordinate transformations, the histogram bins are no longer
   symmetric about their centres, and are no longer of a uniform
   size);

 * `counts`: integer counts of data items in each bin;

 * `freqs`: fraction of data items in each bin;

 * `probs`: probability of data items falling into each bin, defined
   so that the integral of the bar chart constructed using the
   coordinate ranges in `bins` and these values is unity.
