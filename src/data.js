// Bring plot data into Angular scope by parsing <plot-data> directive
// body.

radian.directive('plotData', [function()
{
  'use strict';

  // We use a post-link function here so that any enclosed <metadata>
  // directives will have been linked by the time we get here.
  function postLink(scope, elm, as) {
    // The <plot-data> element is only there to carry data, so hide
    // it right away.
    elm.hide();

    // Process attributes.
    if (!as.name) throw Error('<plot-data> must have NAME attribute');
    var dataset = as.name;
    var format = as.format || 'json';
    var sep = as.separator === '' ? ' ' : (as.separator || ',');
    var cols = as.cols;
    if (cols) cols = cols.split(',').map(function (s) { return s.trim(); });
    var formats = ['json', 'csv'];
    if (formats.indexOf(format) == -1)
      throw Error('invalid FORMAT "' + format + '" in <plot-data>');
    if (format == 'csv' && !cols)
      throw Error('CSV <plot-data> must have COLS');

    // Process content -- all text children are appended together
    // for parsing.
    var datatext = '';
    elm.contents().each(function(i,n) {
      if (n instanceof Text) datatext += n.textContent;
    });

    // Parse data.
    var d;
    var fpre = /^\s*[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\s*$/;
    switch (format) {
    case 'json':
      try { d = JSON.parse(datatext); }
      catch (e) { throw Error('invalid JSON data in <plot-data>'); }
      break;
    case 'csv':
      try {
        d = $.csv.toArrays(datatext.replace(/^\s*\n/g, '').split('\n')
                           .map(function(s) {
                             return s.replace(/^\s+/, '');
                           }).join('\n'),
                           { separator: sep });
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

    // Process any date fields.
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
    if (scope.$parent[dataset] && scope.$parent[dataset].metadata) {
      for (var k in scope.$parent[dataset].metadata) {
        var md = scope.$parent[dataset].metadata[k];
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

    // Install data in scope, preserving any metadata.
    var md = scope.$parent[dataset] ? scope.$parent[dataset].metadata : null;
    scope.$parent[dataset] = d;
    if (md) scope.$parent[dataset].metadata = md;
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

  [ 'dateFormat', 'dateParseFormat', 'errorFor',
    'format', 'label', 'units' ]

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
      if (!scope.$parent[dataset]) scope.$parent[dataset] = { metadata: { } };
      if (!scope.$parent[dataset].metadata)
        scope.$parent[dataset].metadata = { };
      scope.$parent[dataset].metadata[name] = md;
    }
  };
}]);
