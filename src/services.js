// Naughty.  Need to use "with" in evalPlotExpr...
// 'use strict';

/* Services */

radian.factory('dumpScope', function()
{
  'use strict';

  var go = function(scope, indent) {
    var indentstr = "";
    for (var i = 0; i < indent; ++i)
      indentstr = indentstr.concat(" ");
    console.log(indentstr + scope.$id + ": " +
                Object.keys(scope).filter(function(k) {
                  return k.charAt(0) != "$" && k != "this";
                }));
    for (var ch = scope.$$childHead; ch; ch = ch.$$nextSibling)
      go(ch, indent + 2);
  };
  return function(scope) { go(scope, 0); };
});


radian.factory('evalPlotExpr',
  ['$rootScope', 'plotLib', 'parseExpr',
  function($rootScope, plotLib, parseExpr)
{
  return function(scope, expr) {
    // Parse data path as (slightly enhanced) JavaScript.  Any parse
    // failures are passed back unchanged (HTML colours, for
    // example).
    console.log("eval: " + expr);
    var ast;
    try {
      ast = parseExpr(expr);
    } catch (e) { return expr; }

    // Determine metadata key, which is only possible for simple
    // applications of member access and plucking.  (For example,
    // for an expression of the form "vic2012#tmp", the metadata key
    // is "tmp"; for the expression "vic2012#date#doy", the metadata
    // key is "doy").
    var metadatakey = null, dataset = null;
    estraverse.traverse(ast, { enter: function(node) {
      if (node.type != "PluckExpression" && node.type != "MemberExpression")
        return estraverse.VisitorOption.Skip;
      else if (node.property.type == "Identifier") {
        metadatakey = node.property.name;
        var o = node.object;
        while (o.type != "Identifier") o = o.object;
        dataset = o.name;
        return estraverse.VisitorOption.Break;
      }
    }});

    // Vectorise arithmetic expressions.
    estraverse.traverse(ast, { leave: function(n) {
      delete n.start; delete n.end;
    } });
    console.log("      ast = " + JSON.stringify(ast));
    var astrepl = estraverse.replace(ast, {
      leave: function(n) {
        if (n.type == "BinaryExpression") {
          var fn = "";
          switch (n.operator) {
            case "+": fn = "rad$$add"; break;
            case "-": fn = "rad$$sub"; break;
            case "*": fn = "rad$$mul"; break;
            case "/": fn = "rad$$div"; break;
            case "**": fn = "rad$$pow"; break;
          }
          return !fn ? n : {
            "type":"CallExpression",
            "callee":{ "type":"Identifier","name":fn },
            "arguments": [n.left, n.right] };
        } else if (n.type == "UnaryExpression" && n.operator == "-") {
          return {
            "type":"CallExpression",
            "callee":{ "type":"Identifier","name":"rad$$neg" },
            "arguments": [n.argument] };
        } else
          return n;
      }
    });

    // Pluck expression transformations:
    //
    //  a#b     ->  a.map(function($$x) { return $$x.b; })
    //  a#b(c)  ->  a.map(function($$x) { return $$x.b(c); })
    //
    astrepl = estraverse.replace(astrepl, {
      enter: function(n) {
        if (n.type == "CallExpression" && n.callee.type == "PluckExpression") {
          return {
            type:"CallExpression",
            callee:{type:"MemberExpression", object:n.callee.object,
                    property:{type:"Identifier", name:"map"},
                    computed:false},
            arguments:
            [{type:"FunctionExpression",
              id:null, params:[{type:"Identifier", name:"$$x"}],
              body:{
                type:"BlockStatement",
                body:[{type:"ReturnStatement",
                       argument:{type:"CallExpression",
                                 callee:{type:"MemberExpression",
                                         object:{type:"Identifier", name:"$$x"},
                                         property:n.callee.property,
                                         computed:false},
                                 arguments:n.arguments}
                      }]
              }
             }]
          };
        } else return n;
      },
      leave: function(n) {
        if (n.type == "PluckExpression") {
          return {
            type:"CallExpression",
            callee:{ type:"MemberExpression", object:n.object,
                     property:{ type:"Identifier", name:"map" },
                     computed:false },
            arguments:
            [{ type:"FunctionExpression",
               id:null, params:[{ type:"Identifier", name:"$$x"}],
               body:{
                 type:"BlockStatement",
                 body:[{ type:"ReturnStatement",
                         argument:{ type:"MemberExpression",
                                    object:{ type:"Identifier", name:"$$x" },
                                    property:n.property, computed:false }
                       }]
               }
             }]
          };
        }}});
    console.log("  astrepl = " + JSON.stringify(astrepl));

    // Replace free variables in JS expression with calls to
    // "scope.$eval".  We do things this way rather than using
    // Angular's "scope.$eval" on the whole JS expression because
    // the Angular expression parser only deals with a relatively
    // small subset of JS (no anonymous functions, for instance).
    var exc = { "Math":1, "Date":1, "Object":1 }, excstack = [ ];
    Object.keys(plotLib).forEach(function(k) { exc[k] = 1; });
    astrepl = estraverse.replace(astrepl, {
      enter: function(v, w) {
        switch (v.type) {
        case "FunctionExpression":
          excstack.push(v.params.map(function(p) { return p.name; }));
          v.params.forEach(function(p) {
            if (exc[p.name]) ++exc[p.name]; else exc[p.name] = 1;
          });
          break;
        case "Identifier":
          if (!exc[v.name]) {
            if (!w ||
                (!((w.type == "MemberExpression" ||
                    w.type == "PluckExpression") && v == w.property) &&
                 !(w.type == "CallExpression" && v == w.callee))) {
              return parseExpr("scope.$eval('" + v.name + "')");
            }
          }
        }
        return v;
      },
      leave: function(v) {
        if (v.type == "FunctionExpression")
          excstack.pop().forEach(function(n) {
            if (--exc[n] == 0) delete exc[n];
          });
        return v;
      }
    });

    // Generate JS code suitable for accessing data.
    var access = escodegen.generate(astrepl);
    console.log("  access = " + access);
    console.log("");

    var ret = [];
    try {
      // Bring plot function library names into scope.
      with (plotLib) {
        eval("ret = " + access);
      }
    } catch (e) {
      console.log("evalPlotExpr failed on '" + expr + "' -- " + e.message);
    }
    if (dataset && metadatakey) {
      if ($rootScope[dataset] && $rootScope[dataset].metadata &&
          $rootScope[dataset].metadata[metadatakey])
        ret.metadata = $rootScope[dataset].metadata[metadatakey];
    }
    return ret;
  };
}]);


radian.factory('getStyle', function()
{
  'use strict';

  return function(n, scope, defval) {
    var s = scope;
    if (s.plotOptions && s.plotOptions[n]) return s.plotOptions[n];
    while (s.$parent) {
      s = s.$parent;
      if (s.plotOptions && s.plotOptions[n]) return s.plotOptions[n];
    }
    return defval;
  };
});


radian.factory('splitAttrs',
  ['evalPlotExpr', '$timeout',
  function(evalPlotExpr, $timeout)
{
  'use strict';

  var plotas =
    [ "aspect", "axisX", "axisXLabel", "axisX2", "axisY", "axisYLabel",
      "axisY2", "banded", "clipX", "clipY", "cols", "dateFormat",
      "dateParseFormat", "errorFor", "fill", "fillOpacity", "format", "height",
      "id", "interp", "label", "legendSwitches", "marker", "markerSize", "name",
      "range", "rangeX", "rangeY", "rows", "selectX", "selectY", "separator",
      "src", "stroke", "strokeOpacity", "strokeSwitch", "strokeWidth", "tabs",
      "title", "type", "units", "width", "zoom2d", "zoomX", "zoomY" ];
  var allas = { };
  plotas.forEach(function(a) { allas[a] = 1; });
  return function(scope, as, okplotas, allowvs, dir) {
    scope.plotOptions = { };
    Object.keys(as).forEach(function(k) {
      if (okplotas.hasOwnProperty(k))
        scope.plotOptions[k] = as[k];
      else if (allas.hasOwnProperty(k))
        throw Error("invalid attribute in <" + dir + "> directive: " + k);
      else if (k.charAt(0) != '$') {
        if (allowvs)
          $timeout(function() { scope[k] = evalPlotExpr(scope, as[k]); }, 0);
        else throw Error("extra variable attributes not allowed in <" +
                         dir + ">");
      }
    });
  };
}]);


radian.factory('plotOption', function()
{
  'use strict';

  return function(scope, opt, def) {
    while (scope) {
      if (scope.plotOptions && scope.plotOptions[opt])
        return scope.plotOptions[opt];
      scope = scope.$parent;
    }
    return def;
  };
});


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
           extent: d3.extent,
           sum: d3.sum,
           mean: d3.mean,
           median: d3.median,
           quantile: d3.quantile,
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
           rad$$neg: vect(function(a) { return -a; }),
           rad$$add: vectOp(function(a, b) { return a + b; }),
           rad$$sub: vectOp(function(a, b) { return a - b; }),
           rad$$mul: vectOp(function(a, b) { return a * b; }),
           rad$$div: vectOp(function(a, b) { return a / b; }),
           rad$$pow: vectOp(function(a, b) { return Math.pow(a, b); }),
         };
});
