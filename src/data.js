// Bring plot data into Angular scope by parsing <plot-data> directive
// body.

radian.directive('plotData', ['$http', function($http)
{
  'use strict';

  // Parse JSON or CSV data.
  function parseData(datatext, format, cols, separator) {
    var d;
    var fpre = /^\s*[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\s*$/;
    switch (format) {
    case 'json':
      try { d = typeof datatext == 'string' ? JSON.parse(datatext) : datatext; }
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
          if (d[0].length != cols.length)
            throw Error('mismatch between COLS and' +
                        ' CSV data in <plot-data>');
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
      } else if (typeof x == 'object')
        Object.keys(x).forEach(function(xk) { go(x[xk], xk == k); });
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
  function postLink(scope, elm, as) {
    // The <plot-data> element is only there to carry data, so hide
    // it right away.
    elm.hide();

    // Process attributes.
    if (!as.name) throw Error('<plot-data> must have NAME attribute');
    var dataset = as.name;
    var src = as.src;
    var format = as.format || 'json';
    var sep = as.separator === '' ? ' ' : (as.separator || ',');
    var cols = as.cols;
    if (cols) cols = cols.split(',').map(function (s) { return s.trim(); });
    if (!src) {
      var formats = ['json', 'csv'];
      if (formats.indexOf(format) == -1)
        throw Error('invalid FORMAT "' + format + '" in <plot-data>');
      if (format == 'csv' && !cols)
        throw Error('CSV <plot-data> must have COLS');
    }

    // Process content -- all text children are appended together
    // for parsing.
    function processData(datatext) {
      // Parse data.
      var d = parseData(datatext, format, cols, sep);

      // Process any date fields.
      processDates(scope, dataset, d);

      // Install data in scope, preserving any metadata.
      var md = scope[dataset] ? scope[dataset].metadata : null;
      scope[dataset] = d;
      if (md) scope[dataset].metadata = md;
    };
    if (!src) {
      var datatext = '';
      elm.contents().each(function(i,n) {
        if (n instanceof Text) datatext += n.textContent;
      });
      processData(datatext);
    } else {
      $http.get(src)
        .success(function(data, status, headers, config) {
          format = (headers("Content-Type") == 'application/json') ?
            'json' : 'csv';
          if (format == 'csv' && !cols)
            throw Error('CSV <plot-data> must have COLS');
          processData(data);
        })
        .error(function() { throw Error("failed to read data from " + src); });
    }
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
        'format', 'label', 'units' ].forEach(function(a) {
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
