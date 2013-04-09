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
    function protoNoKeys(n, cs, v) {
      if (v instanceof Array) {
        var vs = { };
        v.forEach(function(x) { vs[x] = 1; });
        var uvs = Object.keys(vs).sort();
        return v.map(function(x) { return cs[uvs.indexOf(x) % n]; });
      } else if (typeof v == "number")
        return cs[(Math.round(v) - 1) % n];
      else throw Error("invalid operand to discrete palette function");
    };
    function protoWithKeys(cs, v) {
      return (v instanceof Array) ?
        v.map(function(x) { return cs[x]; }) : cs[v];
    };

    var cs = txt.split(';').
      map(function(s) { return s.trim(); }).
      filter(function(s) { return s.length > 0; });
    if (cs[0].indexOf(':' != -1)) {
      var thiscs = { };
      cs.forEach(function(x) {
        var css = x.split(':'), k = css[0].trim(), c = css[1].trim();
        thiscs[k] = c;
      });
      return function(v) { return protoWithKeys(thiscs, v); };
    } else {
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


  };
});
