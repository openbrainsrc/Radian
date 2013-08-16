// Helper service to allow overriding of default use of $http for
// accessing plot data defined via a SRC attribute.  This can be
// useful to implement client-side caching of plot data, for example.

radian.factory('plotDataHttpProvider', ['$http', function($http)
{
  var provider = $http;
  function set(prov) { provider = prov; provider.set = set; };
  provider.set = set;
  return provider;
}]);


// Bring plot data into Angular scope by parsing <plot-data> directive
// body.

radian.directive('plotData',
 ['$http', 'processAttrs', 'plotDataHttpProvider',
  function($http, processAttrs, plotDataHttpProvider)
{
  'use strict';

  // Recursively transform any string values that can be parsed as
  // numbers into numeric values.
  function numberTypes(d) {
    if (typeof d == 'object') {
      var n;
      Object.keys(d).forEach(function(k) {
        switch (typeof d[k]) {
        case 'object':
          if (d[k]) numberTypes(d[k]);
          break;
        case 'string':
          n = Number(d[k]);
          if (!isNaN(n)) d[k] = n;
          break;
        }
      });
    }
  };

  // Parse JSON or CSV data.
  function parseData(datatext, format, cols, separator) {
    var d;
    var fpre = /^\s*[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\s*$/;
    switch (format) {
    case 'json':
      try {
        d = typeof datatext == 'string' ? JSON.parse(datatext) : datatext;
        numberTypes(d);
      }
      catch (e) { throw Error('invalid JSON data in <plot-data>'); }
      break;
    case 'csv':
      try {
        d = $.csv.toArrays(datatext.replace(/^\s*\n/g, '').split('\n')
                           .map(function(s) {
                             return s.replace(/^\s+/, '');
                           }).join('\n'),
                           { separator: separator });
        if (d.length > 0) {
          if (cols) {
            if (d[0].length != cols.length)
              throw Error('mismatch between COLS and' +
                          ' CSV data in <plot-data>');
          } else {
            cols = d[0];
            d.splice(0, 1);
          }
          var tmp = { }, nums = [];
          for (var c = 0; c < cols.length; ++c) {
            tmp[cols[c]] = [];
            nums.push(d[0][c].match(fpre));
          }
          for (var i = 0; i < d.length; ++i)
            for (var c = 0; c < cols.length; ++c) {
              if (nums[c])
                tmp[cols[c]].push(parseFloat(d[i][c]));
              else
                tmp[cols[c]].push(d[i][c]);
            }
          d = tmp;
        }
      } catch (e) { throw Error('invalid CSV data in <plot-data>'); }
    }
    return d;
  };

  // Date field processing.
  function dateProcess(d, k, f) {
    function go(x, active) {
      if (x instanceof Array && x.length > 0) {
        if (typeof x[0] == 'string' && active)
          x.forEach(function(v, i) { x[i] = f(v); });
        else
          x.forEach(function(v) { go(v, false); });
      } else if (typeof x == 'object') {
        if (x.hasOwnProperty(k) && !(x[k] instanceof Array))
          x[k] = f(x[k]);
        else
          Object.keys(x).forEach(function(xk) { go(x[xk], xk == k); });
      }
    }
    go(d, false);
  };

  // Process all date fields.
  function processDates(scope, dataset, d) {
    if (scope[dataset] && scope[dataset].metadata) {
      for (var k in scope[dataset].metadata) {
        var md = scope[dataset].metadata[k];
        if (md.format == 'date') {
          if (!md.dateParseFormat)
            dateProcess(d, k, function(v) { return new Date(v); });
          else {
            var parse;
            if (md.dateParseFormat == 'isodate')
              parse = d3.time.format.iso.parse;
            else
              parse = d3.time.format(md.dateParseFormat).parse;
            dateProcess(d, k, function(v) { return parse(v); });
          }
        }
      }
    }
  };


  // We use a post-link function here so that any enclosed <metadata>
  // directives will have been linked by the time we get here.
  function postLink(sc, elm, as) {
    // The <plot-data> element is only there to carry data, so hide
    // it right away.
    elm.hide();

    // Process attributes.
    processAttrs(sc, as);
    if (!sc.name) throw Error('<plot-data> must have NAME attribute');
    var dataset = sc.name, subname = sc.subname;
    var format = sc.format || 'json';
    var sep = sc.separator === '' ? ' ' : (sc.separator || ',');
    var cols = sc.cols;
    if (cols) cols = cols.split(',').map(function (s) { return s.trim(); });
    if (!sc.src) {
      var formats = ['json', 'csv'];
      if (formats.indexOf(format) == -1)
        throw Error('invalid FORMAT "' + format + '" in <plot-data>');
    }

    // Get plot data via a HTTP request.
    function getData() {
      sc.firstDataLoad = true;
      plotDataHttpProvider.get(sc.src)
        .success(function(data, status, headers, config) {
          if (headers("Content-Type").indexOf('application/json') == 0)
            format = 'json';
          processData(data);
        })
        .error(function() {
          throw Error("failed to read data from " + sc.src);
        });
    };

    // Process content -- all text children are appended together
    // for parsing.
    function processData(datatext) {
      // Parse data.
      var d = parseData(datatext, format, cols, sep);

      // Process any date fields.
      processDates(sc, dataset, d);

      // Install data on nearest enclosing scope that isn't associated
      // with an ng-repeat.  Preserve any metadata.
      var md = sc[dataset] ? sc[dataset].metadata : null;
      var s = sc;
      while (s.$parent && s.hasOwnProperty('$index')) s = s.$parent;
      if (sc.subname) {
        s[dataset][subname] = d;
        if (md) s[dataset][subname].metadata = md;
      } else {
        s[dataset] = d;
        if (md) s[dataset].metadata = md;
      }
    };
    if (sc.src)
      getData();
    else {
      var datatext = sc.$eval(as.ngModel);
      if (!datatext) {
        var datatext = '';
        elm.contents().each(function(i,n) {
          if (n instanceof Text) datatext += n.textContent;
        });
      }
      processData(datatext);
    }
    sc.$watch('src', function(n, o) {
      if (n == undefined || n == o && sc.firstDataLoad) return;
      getData();
    });
  };

  return {
    restrict: 'E',
    scope: false,
    compile: function(elm, as, trans) {
      return { post: postLink };
    }
  };
}]);


radian.directive('metadata', [function()
{
  'use strict';

  return {
    restrict: 'E',
    scope: false,
    link: function(scope, elm, as) {
      // Identify the data set that we're metadata for.
      if (!elm[0].parentNode || elm[0].parentNode.tagName != 'PLOT-DATA' ||
          !$(elm[0].parentNode).attr('name'))
        throw Error('<metadata> not properly nested inside <plot-data>');
      var dataset = $(elm[0].parentNode).attr('name');

      // Copy metadata attributes into a new object.
      if (!as.name) throw Error('<metadata> without NAME attribute');
      var name = as.name;
      var md = { };
      [ 'dateFormat', 'dateParseFormat', 'errorFor',
        'format', 'label', 'units', 'categoryOrder' ].forEach(function(a) {
          if (as.hasOwnProperty(a)) md[a] = as[a];
        });

      // Set up metadata for this data set.
      if (!scope[dataset]) scope[dataset] = { metadata: { } };
      if (!scope[dataset].metadata)
        scope[dataset].metadata = { };
      scope[dataset].metadata[name] = md;
    }
  };
}]);
