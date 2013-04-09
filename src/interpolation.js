// Process palette directive.

radian.directive('palette',
 ['discPalFn', 'absPalFn', 'normPalFn',
   function(discPalFn, absPalFn, normPalFn)
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
      if (!attrs.id)
        throw Error("<palette> directive without ID attribute");
      var id = attrs.id;
      var typ = attrs.type || 'norm';
      var interp = attrs.interp || 'hsl';
      interp = interp.toLowerCase();
      var banded = !!attrs.banded;

      // Process content -- all text children are appended together
      // for parsing.
      var paltext = '';
      elm.contents().each(function(i,n) {
        if (n instanceof Text) paltext += n.textContent;
      });

      // Normalise content: line separators are equivalent to
      // semicolons.
      paltext = paltext.replace(/\n/g, ';');

      // Generate palette function.
      var fn;
      switch (typ) {
      case 'discrete':
        fn = discPalFn(paltext);
        break;
      case 'abs':
        fn = absPalFn(paltext, banded, interp);
        break;
      case 'norm':
        fn = normPalFn(paltext, banded, interp);
        break;
      default:
        throw Error("invalid <palette> type: " + typ);
      }

      // Install palette function.
      scope.$parent[id] = fn;
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


radian.factory('absPalFn', function()
{
  return function(txt, band, interp) {


  };
});


radian.factory('normPalFn', function()
{
  return function(txt, band, interp) {
    // Prototype for returned function -- does linear interpolation
    // from data extent to [0,1] and applies polylinear colour
    // interpolation function.
    function proto(cmap, v) {
      if (!(v instanceof Array))
        throw Error("normalised palettes must be applied to array arguments");
      var ext = d3.extent(v);
      var sc = d3.scale.linear().domain(ext);
      return v.map(function(x) { return cmap(sc(x)); });
    };

    // Set up appropriate D3 colour interpolation factory.
    var intfac;
    switch (interp) {
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
    console.log("cs = " + JSON.stringify(cs));

    // For normalised palettes, each entry should have a numeric value
    // and a colour, separated by a space.
    if (!cs.every(function(c) { return c.indexOf(' ') != -1; }))
      throw Error("invalid format in <palette>");

    // Extract the segment limits and colours from the palette data.
    var lims = [], cols = [];
    cs.forEach(function(x) {
      var css = x.split(' ');
      lims.push(css[0].trim());
      cols.push(css[1].trim());
    });
    console.log("lims = " + JSON.stringify(lims));
    console.log("cols = " + JSON.stringify(cols));

    // Check for ascending limit values.
    for (var i = 1; i < lims.length; ++i)
      if (lims[i] < lims[i - 1])
        throw Error("entries out of order in <palette>");

    // Minimum and maximum segment limits.
    var minl = lims[0], maxl = lims[lims.length-1];
    console.log("minl = " + minl + "  maxl = " + maxl);
    if (minl != 0 || maxl != 1)
      throw Error("invalid segment limits for normalised palette");

    // Build polylinear colour interpolation scale using appropriate
    // colour interpolation factory.
    var thiscmap = d3.scale.linear().
      clamp(true).interpolate(intfac).
      domain(lims).range(cols);
    return function(v) { return proto(thiscmap, v); };
  };
});
