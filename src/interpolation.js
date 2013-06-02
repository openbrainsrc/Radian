// Process palette directive.

radian.directive('palette',
 ['processAttrs', 'radianEval', 'discPalFn', 'contPalFn',
  function(processAttrs, radianEval, discPalFn, contPalFn)
{
  'use strict';

  return {
    restrict: 'E',
    scope: false,
    link: function(scope, elm, attrs) {
      // The <palette> element is only there to carry data, so hide it
      // right away.
      elm.hide();

      // Process attributes.
      processAttrs(scope, attrs);
      if (!scope.name)
        throw Error("<palette> directive without NAME attribute");
      var name = scope.name;
      var typ = scope.type || 'norm';
      var interp = scope.interp || 'hsl';
      interp = interp.toLowerCase();
      var banded = scope.hasOwnProperty("banded");

      // Process content -- all text children are appended together
      // for parsing.
      var paltext = '';
      elm.contents().each(function(i,n) {
        if (n instanceof Text) paltext += n.textContent;
      });

      // Normalise content: line separators are equivalent to
      // semicolons.
      paltext = radianEval(scope, paltext.trim());
      paltext = paltext.replace(/\n/g, ';');

      // Generate palette function.
      var fn;
      switch (typ) {
      case 'discrete':
        fn = discPalFn(paltext);
        break;
      case 'abs':
        fn = contPalFn(true, paltext, banded, interp);
        break;
      case 'norm':
        fn = contPalFn(false, paltext, banded, interp);
        break;
      default:
        throw Error("invalid <palette> type: " + typ);
      }

      // Install palette function on nearest enclosing scope that
      // isn't associated with an ng-repeat.
      var s = scope;
      while (s.$parent && s.hasOwnProperty('$index')) s = s.$parent;
      s[name] = fn;
    }
  };
}]);


radian.factory('discPalFn', function()
{
  // Mmmmmm...  I love the smell of regular expressions in the
  // morning.  Smells like... VICTORY!  Not.
  var renoquotes = '[^"\\s]+', requotes = '"[^"]*"';
  var reids = renoquotes + '|' + requotes;
  var resplits = '(?:(' + reids + ')\\s+)?([^\\s;]+)';
  var resings = '(?:(?:' + reids + ')\\s+)?(?:[^\\s;]+)';
  var remults = '(' + resings + ')((?:\\s*;\\s*' + resings + ')*)';
  var resplit = new RegExp(resplits);
  var remult = new RegExp(remults);
  var restripsemi = /\s*;\s*(.*)/;

  return function(txt) {
    // Prototype palette function for discrete palette with no keys,
    // i.e. just a list of colours.
    function protoNoKeys(n, cs, v) {
      if (v instanceof Array) {
        // For array data, we pull colours out of the palette in
        // sorted order of the keys.
        var vs = { };
        v.forEach(function(x) { vs[x] = 1; });
        var uvs = Object.keys(vs).sort();
        return v.map(function(x) { return cs[uvs.indexOf(x) % n]; });
      } else if (typeof v == "number")
        // Otherwise, the palette function argument must be numeric
        // and is just used as an index into the list of colours.
        return cs[(Math.round(v) - 1) % n];
      else throw Error("invalid operand to discrete palette function");
    };

    // Prototype palette function for discrete palette with keys.
    function protoWithKeys(cs, v) {
      // Just pull out the appropriate colour value using the key.
      return (v instanceof Array) ?
        v.map(function(x) { return cs[x]; }) : cs[v];
    };

    // Palette entries consist either of a key value or a key value
    // and a colour, and are separated by semicolons.  Key values may
    // be quoted using double quotes.
    txt = txt.trim();
    var ks = [], cs = [], nks = 0, ms;
    while (true) {
      ms = txt.match(remult);
      if (!ms) throw Error("invalid palette definition");
      var m = ms[1];
      var ss = m.match(resplit);
      if (!ss) throw Error("invalid palette definition");
      if (ss[1]) {
        ks.push(ss[1].charAt(0) == '"' ? ss[1].slice(1, -1) : ss[1]);
        ++nks;
      }
      cs.push(ss[2]);
      if (ms[2] == '') break;
      var tmp = ms[2].match(restripsemi);
      if (!tmp) throw Error("invalid palette definition");
      txt = tmp[1];
    }

    // At this point, ks is an array of key values and cs is an array
    // of colour values.  If all the colours have keys, then we set up
    // the key to colour mapping and return a function based on the
    // "with keys" prototype.  If none of the colours have keys, we
    // return a function based on the "no keys" prototype.  Any other
    // situation is an error.
    if (nks == 0) {
      // Return a function based on the "no keys" prototype.
      var thisn = cs.length;
      var thiscs =
        '[' + cs.map(function(c) { return '"' + c + '"' }).join(',') + ']';
      return function(v) { return protoNoKeys(thisn, thiscs, v); };
    } else if (nks == cs.length) {
      // Return a function based on "with keys" prototype.
      var thiscs = { };
      for (var i = 0; i < cs.length; ++i) thiscs[ks[i]] = cs[i];
      return function(v) { return protoWithKeys(thiscs, v); };
    } else throw Error("invalid palette definition");
  };
});


radian.factory('contPalFn', function()
{
  return function(isabs, txt, band, interp) {
    // Prototype for returned function for normalised palette -- does
    // linear interpolation from data extent to [0,1] and applies
    // polylinear colour interpolation function.
    function protoNorm(cmap, v) {
      if (!(v instanceof Array))
        throw Error("normalised palettes must be applied to array arguments");
      var ext = d3.extent(v);
      var sc = d3.scale.linear().domain(ext);
      return v.map(function(x) { return cmap(sc(x)); });
    };

    // Prototype for returned function for absolute palette -- just
    // applies polylinear colour interpolation function.
    function protoAbs(cmap, v) {
      return v instanceof Array ?
        v.map(function(x) { return cmap(x); }) : cmap(v);
    };

    // Set up appropriate D3 colour interpolation factory.
    var intfac;
    if (band)
      intfac = function(a, b) { return function(t) { return a; }; };
    else switch (interp) {
    case 'rgb': intfac = d3.interpolateRgb;  break;
    case 'hcl': intfac = d3.interpolateHcl;  break;
    case 'lab': intfac = d3.interpolateLab;  break;
    default:    intfac = d3.interpolateHsl;  break;
    }

    // Palette entries are separated by semicolons: split them and
    // trim them for further processing.
    var cs = txt.split(';').
      map(function(s) { return s.trim(); }).
      filter(function(s) { return s.length > 0; });

    // For normalised palettes, each entry should have a numeric value
    // and a colour, separated by a space.
    if (!cs.every(function(c) { return c.indexOf(' ') != -1; }))
      throw Error("invalid format in <palette>");

    // Extract the segment limits and colours from the palette data.
    var lims = [], cols = [];
    cs.forEach(function(x) {
      var css = x.split(' ');
      lims.push(Number(css[0].trim()));
      cols.push(css[1].trim());
    });
    // Check for ascending limit values.
    for (var i = 1; i < lims.length; ++i)
      if (lims[i] < lims[i - 1])
        throw Error("entries out of order in <palette>");

    // Minimum and maximum segment limits (fix up top end for banded
    // palettes).
    var minl = lims[0], maxl = lims[lims.length-1];
    if (band) {
      if (isabs) {
        lims.push(Number.MAX_VALUE);
        cols.push('black');
        maxl = Number.MAX_VALUE;
      } else if (maxl != 1) {
        lims.push(1);
        cols.push('black');
        maxl = 1;
      }
    }
    if (!isabs && (minl != 0 || maxl != 1))
      throw Error("invalid segment limits for normalised palette");

    // Build polylinear colour interpolation scale using appropriate
    // colour interpolation factory.
    var thiscmap = d3.scale.linear().
      clamp(true).interpolate(intfac).
      domain(lims).range(cols);
    return isabs ?
      function(v) { return protoAbs(thiscmap, v); } :
      function(v) { return protoNorm(thiscmap, v); };
  };
});


radian.factory('genPalFn',
 ['discPalFn', 'contPalFn', 'MD5', 'plotLib',
  function(discPalFn, contPalFn, MD5, plotLib)
{
  'use strict';

  return function(paldef) {
    var paltext;
    if (paldef.values)
      paltext = d3.zip(paldef.values, paldef.colours).map(function(p) {
        return p.join(' ');
      }).join(';');
    else
      paltext = paldef.colours.join(';');
    var fnname = paldef.type.charAt(0) + MD5(JSON.stringify(paltext));
    if (!plotLib.rad$$pal[fnname]) {
      var fn, interp = paldef.interp || 'hsl', band = paldef.banded;
      switch (paldef.type) {
      case 'discrete':   fn = discPalFn(paltext);                      break;
      case 'absolute':   fn = contPalFn(true, paltext, band, interp);  break;
      case 'normalised': fn = contPalFn(false, paltext, band, interp); break;
      }
      plotLib.rad$$pal[fnname] = fn;
    }
    return fnname;
  };
}]);

