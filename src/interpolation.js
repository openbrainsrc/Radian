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

    // Palette entries are separated by semicolons: split them and
    // trim them for further processing.
    var cs = txt.split(';').
      map(function(s) { return s.trim(); }).
      filter(function(s) { return s.length > 0; });

    // A palette with keys will have entries with a key, then a space,
    // then a colour value.
    if (cs[0].indexOf(' ') != -1) {
      // Set up the key to colour mapping and return a function based
      // on the "with keys" prototype.
      var thiscs = { };
      cs.forEach(function(x) {
        var css = x.split(' '), k = css[0].trim(), c = css[1].trim();
        thiscs[k] = c;
      });
      return function(v) { return protoWithKeys(thiscs, v); };
    } else {
      // Extract a simple colour list and return a function based
      // on the "no keys" prototype.
      var thisn = cs.length;
      var thiscs =
        '[' + cs.map(function(c) { return '"' + c + '"' }).join(',') + ']';
      return function(v) { return protoNoKeys(thisn, thiscs, v); };
    }
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

