// Plotting function library.

radian.factory('plotLib', function()
{
  'use strict';

  // Vectorise scalar function.
  function vect(f) {
    return function(x) {
      return (x instanceof Array) ? x.map(f) : f(x);
    };
  };

  // Vectorise binary operator.
  function vectOp(f) {
    return function(x, y) {
      var xa = x instanceof Array, ya = y instanceof Array;
      if (!xa && !ya) return f(x, y);
      var xlen = xa ? x.length : 0, ylen = ya ? y.length : 0;
      var rlen = xa && ya ? Math.min(xlen, ylen) : Math.max(xlen, ylen);
      var res = new Array(rlen);
      var ff;
      if (xa && ya) ff = function(i) { return f(x[i], y[i]); };
      else if (xa)  ff = function(i) { return f(x[i], y   ); };
      else          ff = function(i) { return f(x,    y[i]); };
      for (var i = 0; i < rlen; ++i) res[i] = ff(i);
      return res;
    }
  };

  // Construct grouping function.
  function by(f) {
    return function(x, c) {
      var cs = { }, ord = [];
      x.forEach(function(e, i) {
        if (cs[c[i]])
          cs[c[i]].push(e);
        else { ord.push(c[i]); cs[c[i]] = [e]; }
      });
      var ret = [];
      ord.forEach(function(e) { ret.push(f(cs[e])); });
      return ret;
    };
  };

  // Basic functions.
  function seq(s, e, n) { return d3.range(s, e, (e - s) / (n - 1)); };
  function seqStep(s, e, delta) { return d3.range(s, e, delta); };
  function sdev(x) {
    var m = d3.mean(x), m2 = d3.mean(x, function(a) { return a*a; });
    return Math.sqrt(m2 - m * m);
  };
  function unique(x) {
    var ret = [], check = { };
    x.forEach(function(e) { if (!check[e]) { ret.push(e); check[e] = 1; } });
    return ret;
  };

  // log(Gamma(x))
  function gammaln(x) {
    var cof = [76.18009172947146,-86.50532032941677,24.01409824083091,
               -1.231739572450155,0.001208650973866179,-0.000005395239384953];
    var ser = 1.000000000190015;
    var tmp = (x + 5.5) - (x + 0.5) * Math.log(x + 5.5);
    var ser1 = ser + sumArr(cof.map(function(c,y) { return c/(x+y+1); }));
    return (-tmp + Math.log(2.5066282746310005 * ser1 / x));
  };

  // Probability distributions.
  function normal(x, mu, sigma) {
    var c1 = 1 / (sigma * Math.sqrt(2 * Math.PI)), c2 = 2*sigma*sigma;
    return vect(function(x) { return c1 * Math.exp(-(x-mu)*(x-mu)/c2); })(x);
  };
  function lognormal(x, mu, sigma) {
    var c1 = 1 / (sigma * Math.sqrt(2 * Math.PI)), c2 = 2*sigma*sigma;
    return vect(function(x) {
      return x <= 0 ? 0 :
        c1/x * Math.exp(-(Math.log(x)-mu)*(Math.log(x)-mu)/c2);
    })(x);
  };
  function gamma(x, k, theta) {
    var c = k * Math.log(theta) + gammaln(k);
    return vect(function(x) {
      return x <= 0 ? 0 : Math.exp((k - 1) * Math.log(x) - x / theta - c);
    })(x);
  };
  function invgamma(x, alpha, beta) {
    var c = alpha * Math.log(beta) - gammaln(alpha);
    return vect(function(x) {
      return x<=0 ? 0 : Math.exp(cval - beta / x - (alpha + 1) * Math.log(x));
    })(x);
  };

  // Histogramming function.
  function histogram(xs, nbins) {
    var rng = d3.extent(xs), binwidth = (rng[1] - rng[0]) / nbins;
    var cs = [], ns = [];
    for (var i = 0; i < nbins; ++i) {
      ns.push(0);  cs.push(rng[0] + binwidth * (i + 0.5));
    }
    for (var i = 0; i < xs.length; ++i)
      ++ns[Math.min(nbins-1, Math.max
                    (0, Math.floor((xs[i] - rng[0]) / binwidth)))];
    var fs = [];
    for (var i = 0; i < nbins; ++i) fs.push(ns[i] / xs.length);
    return { centres:cs, counts:ns, freqs:fs };
  };

  // Helper function to find minimum and maximum values in a
  // potentially nested array.
  function flattenExtent(a) {
    var min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] instanceof Array) {
        var sub = flattenExtent(a[i]);
        min = Math.min(min, sub[0]); max = Math.max(max, sub[1]);
      } else { min = Math.min(min, a[i]);  max = Math.max(max, a[i]); }
    }
    return [min, max];
  };

  // Interpolator generating function.
  function interpolate(d, r, t) {
    var type = t || 'linear', base;
    switch (type) {
    case 'linear': base = d3.scale.linear();  break;
    case 'sqrt':   base = d3.scale.sqrt();    break;
    case 'log':    base = d3.scale.log();     break;
    default:
      if (type.substr(0, 4) == 'pow:')
        base = d3.scale.pow().exponent(Number(type.substr(5)));
      else throw Error("invalid interpolation type");
    }
    var dom = d || [0,1];  dom = flattenExtent(dom);
    var rng = r || [0,1];  rng = flattenExtent(rng);
    var ret = base.domain(dom).range(rng);
    return function(x) { return x.map(ret); };
  };

  // Variadic array range function.
  function multiExtent() {
    if (arguments.length == 0) return [];
    var ret = d3.extent(arguments[0]);
    for (var i = 1; i < arguments.length; ++i) {
      var e = d3.extent(arguments[i]);
      ret = d3.extent([ret[0], ret[1], e[0], e[1]]);
    }
    return ret;
  };

  // Library -- used for bringing useful names into scope for
  // plotting data access expressions.
  return { E: Math.E,
           LN10: Math.LN10,
           LN2: Math.LN2,
           LOG10E: Math.LOG10E,
           LOG2E: Math.LOG2E,
           PI: Math.PI,
           SQRT1_2: Math.SQRT1_2,
           SQRT2: Math.SQRT2,
           abs: vect(Math.abs),
           acos: vect(Math.acos),
           asin: vect(Math.asin),
           atan: vect(Math.atan),
           ceil: vect(Math.ceil),
           cos: vect(Math.cos),
           exp: vect(Math.exp),
           floor: vect(Math.floor),
           log: vect(Math.log),
           round: vect(Math.round),
           sin: vect(Math.sin),
           sqrt: vect(Math.sqrt),
           tan: vect(Math.tan),
           atan2: Math.atan2,
           pow: Math.pow,
           min: d3.min,
           max: d3.max,
           extent: multiExtent,
           sum: d3.sum,
           mean: d3.mean,
           median: d3.median,
           quantile: d3.quantile,
           category10: vect(d3.scale.category10()),
           category20: vect(d3.scale.category20()),
           zip: d3.zip,
           seq: seq,
           seqStep: seqStep,
           sdev: sdev,
           unique: unique,
           minBy: by(d3.min),
           maxBy: by(d3.max),
           sumBy: by(d3.sum),
           meanBy: by(d3.mean),
           sdevBy: by(sdev),
           normal: normal,
           lognormal: lognormal,
           gamma: gamma,
           invgamma: invgamma,
           histogram: histogram,
           interpolate: interpolate,
           rad$$neg: vect(function(a) { return -a; }),
           rad$$add: vectOp(function(a, b) { return a + b; }),
           rad$$sub: vectOp(function(a, b) { return a - b; }),
           rad$$mul: vectOp(function(a, b) { return a * b; }),
           rad$$div: vectOp(function(a, b) { return a / b; }),
           rad$$pow: vectOp(function(a, b) { return Math.pow(a, b); }),
           rad$$pal: {}
         };
});
