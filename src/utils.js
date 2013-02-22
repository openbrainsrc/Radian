// Depth-first traversal of Angular scopes.  Much like Angular's
// scope.$broadcast capability, but with operations at each level
// driven by the caller, rather than an event receiver.

radian.factory('dft', function() {
  'use strict';
  return function(scope, f) {
    function go(s) {
      f(s);
      for (var c = s.$$childHead; c; c = c.$$nextSibling) go(c);
    };
    go(scope);
  };
});


// More flexible depth-first traversal of Angular scopes, allowing for
// pruning and skipping of the top level.  The function f should
// return false if it doesn't want the traversal to continue into the
// current scope's children and true if it does.

radian.factory('dftEsc', function() {
  'use strict';
  return function(scope, f, dotop) {
    function go(s, doit) {
      if (doit) { if (!f(s)) return; }
      for (var c = s.$$childHead; c; c = c.$$nextSibling) go(c, true);
    };
    go(scope, dotop);
  };
});
