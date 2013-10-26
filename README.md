# AngularJS + D3.js = Radian

**Radian** is a JavaScript library for producing interactive SVG plots
in HTML using Angular JS and D3.js.  Using Angular directives leads to
a clear and declarative API for representing plots that can respond to
UI elements via Angular data binding.

Documentation is on the
[website](http://openbrainsrc.github.io/Radian/index.html) (some
technical documentation is also on the
[wiki](https://github.com/glutamate/Radian/wiki).)

## Installation

Radian uses a very simple setup for building: there is a single
Makefile in the root directory of the repository which concatenates
all the Radian library source into a single `radian.js`, then minifies
this (using UglifyJS) to make a `radian.min.js`.

In order to use Radian in an HTML page, you need to include one or the
other of the `radian.js` or `radian.min.js` scripts, along with the
`radian.css` stylesheet and a small number of dependencies, versions
of which are included in the `lib` directory of the repository:

 * `jquery.js`: the main [jQuery](http://www.jquery.com) library
 * `jquery.csv.js`: a
   [CSV parser library](https://code.google.com/p/jquery-csv/)
 * `bootstrap.js`: Javascript for the
  [Bootstrap framework](http://getbootstrap.com/2.3.2/index.html)
  (used for some UI elements)
 * `escodegen.browser.js`: a
  [library](https://github.com/Constellation/escodegen) for generating
  Javascript code from Mozilla's SpiderMonkey abstract syntax tree
  description
 * `d3.v2.js`: the [D3.js](http://d3js.org/) plotting library, on
  which Radian is based
 * `angular.js`: the [AngularJS framework](http://angularjs.org/)

The versions of these libraries in the `lib` directory are known to
work, but more recent versions may also be fine.

To get an idea of how to set up a page to use Radian, you can take a
look at the
[index page](https://github.com/openbrainsrc/Radian/blob/master/examples/index.html)
for the Radian examples.
