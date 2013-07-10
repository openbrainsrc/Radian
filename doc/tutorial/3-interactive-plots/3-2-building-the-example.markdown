---
layout: default
title: Radian Tutorial -- 3.2. Building the example
---

# 3.2. Building the example

In this section of the tutorial, we're going to build the stock price
viewer example step by step.  It's a little complicated, but we'll
take it slowly, starting with something you should already know how to
do.

<hr>
## Step 1: Plotting a single time series

First, we're going to plot a single time series: the opening price for
the CSCO stock.  All the stock data we're going to use is in the
`data` directive in the `Radian-tutorial` directory (assuming you've
checked out `part-3` of the tutorial).  The files are called
`CSCO.csv`, `DELL.csv` and so on.  This means that we can access the
`CSCO` data using the URL `/data/CSCO.csv` in a `<plot-data>`
directive `src` attribute.

If you take a look at these data files, you'll see that they have a
single line header giving the column names, the first column is a
date, and there is one day of data per row in each file.  Because the
files have a header line, we don't need to specify a `cols` attribute
in our `<plot-data>` directive: if there is no `cols` attribute,
`<plot-data>` assumes that it should take the column names from the
first line of the file.  So, for our `<plot-data>` directive, we need
to give the data set a name (we'll use `dat`), we need to give the
data URL and we need to say that the data format is CSV.  We also need
to include a `<metadata>` directive to say that the `Date` column of
the file is a date.

Once we have the data available, we can make a simple plot with a
single `<lines>` directive to display the data.

<div class="exercise">
**Exercise**

1. Copy the `template.html` file to make a new HTML page.
2. Write a suitable `<plot-data>` directive to access the `CSCO` data.
3. Make a plot 800 pixels wide by 400 pixels tall with a line plot of
   the opening price of the `CSCO` stock (the relevant field in the
   CSV file is called `Open`).
4. Tidy up the styling a little: switch off the X axis label (use
   `axis-x-label="off"` to do this); set the Y axis label to "Opening
   price"; set the stroke colour to something reasonable; enable
   X-zooming.

*Things that might go wrong:*

 * You might get the data URL wrong.
 * You might forget the `<metadata>` for the `Date` field.

*A solution to this exercise is saved as `ex-step-1.html` in the
tutorial directory.*

</div>

<hr>
## Step 2: Selecting the plot variable

Once we have a basic line plot for a single stock, we're going to add
some simple UI interaction to choose which variable from the CSV file
we plot.  To do this, we need to set up two things: the user interface
elements in our HTML page, and a little bit of JavaScript code to set
up some data structures we can use.

Let's deal with the JavaScript code first.  If you look at the bottom
of the tutorial `template.html` file, you'll see a `<script>` tag
containing the following JavaScript code:

``` javascript
angular.module('myApp', ['radian']).
  controller('MyCtrl', [function()
{
}]);
```

This is the code that initialises the page for use with Radian: it
sets up an Angular module to manage the page, imports the Radian
library, and defines an Angular controller for the page (called
`MyCtrl`).  Any initialisation code we want to use can go in this
controller[^1].

To start with, we're going to change this controller code as shown
below.  This does two things.  First, it makes the Angular `$scope`
value available in our controller (calling it `sc` for convenience).
Angular scopes form a hierarchy of containers for values associated
with different user interface elements.  Here, we're getting hold of
the scope associated with the body of our HTML page.  Once we have the
scope, we add some values to it describing the fields of our data.
For each field, we give the field's name in the data file and a long
name we will use as an axis label.

``` javascript
angular.module('myApp', ['radian']).
  controller('MyCtrl', ['$scope', function(sc)
{
  sc.fields = [ { name: 'Open',      label: 'Opening price' },
                { name: 'High',      label: 'Daily high' },
                { name: 'Low',       label: 'Daily low' },
                { name: 'Close',     label: 'Closing price' },
                { name: 'Volume',    label: 'Daily volume' },
                { name: 'Adj Close', label: 'Adjusted closing price' } ];
}]);
```

Next, we want to add some user interface elements to our page.  Before
your `<plot>` and `<plot-data>` elements, you will want to put
something like the following:

``` html
<form class="form-inline">
  <label>Plot:</label>
  <select ng-model="plotvar" ng-init="plotvar=fields[0]"
          ng-options="s as s.label for s in fields" required></select>
</form>
```

This defines an HTML form that contains a single select list.  The
select list setup uses some useful Angular features:

 * The value of the selection is bound to the Angular variable
   `plotvar` using the `ng-model` attribute.  This will be a variable
   we can use in Radian expressions in our plotting directives.

 * The `plotvar` variable is assigned an initial value using the
   `ng-init` attribute -- the initial value is set to the first entry
   (number 0) in the `fields` array we added to our JavaScript.

 * The entries in the select list are set using the `ng-options`
   attribute.  This can be used in a number of different ways, but
   here, by saying `ng-options="s as s.label for s in fields"`, we
   make one option in the select list for each entry in our `fields`
   array, we label those options using the `label` field from the
   objects in the `fields` array (so the select list options will say
   things like "Opening price", "Daily high" and so on), and we return
   the whole of the entry from the `fields` array as the result of the
   selection.  This last bit means that `plotvar` will be set to one
   of the entries in the `fields` array, so we'll be able to refer to
   `plotvar.name` and `plotvar.label` in Radian expressions.

This seems a little complicated the first time you see it, but there
are a couple of stereotypical uses of `select` with `ng-options` that
are very common -- this is one of them, and it's a good model to copy.

Finally, we need to make the connection between the selection of the
`plotvar` variable and what we plot.  So far, our plot has something
like `y="[[dat.Open]]"` to select the opening price from our data
set.  Now though, we want to pull out a data field based on `plotvar`,
specifically based on `plotvar.name`.  That means that we'll change
our `y` attribute to say something like `y="[[dat[plotvar.name]]]"` --
in JavaScript, `dat.Open` really means the same as `dat['Open']`, so
we can easily select a field that depends on a variable value.

We also have a `plotvar`-dependent Y axis label that we can use.  The
`axis-y-label` attribute can be assigned a Radian expression like most
other attributes of Radian plotting directives.

<div class="exercise">
**Exercise**

1. Make the required changes in the JavaScript at the bottom of your
   page.
2. Add the user interface code to your HTML page to select the plot
   variable.
3. Change the `y` attribute in your `<lines>` directive to plot the
   variable selected from the list of options.
4. Set up the Y axis labelling based on the option choice too.

*A solution to this exercise is saved as `ex-step-2.html` in the
tutorial directory.*

</div>

<hr>
## Step 3: Adding and removing stocks

Now we want to be able to add and remove stocks.  There are a couple
of quite tricky points here, but we'll start with the simpler stuff,
which is more or less the same as in the last step.

First, we need to add some more JavaScript.  We want a list of all the
stocks we have data for (which we'll call `stocks`), a list of the
stock symbols for the stocks we're currently plotting (which we'll
call `symbols` and which will start as an empty list), and a place to
put all the data sets we're going to create (which we'll call `dat`),
which we put on the *root* Angular scope -- I'll explain why below
where I show how we use this thing.  We also define a little helper
function to generate data URLs from the stock names.  Including the
stuff from before, our JavaScript in the `<script>` tag at the bottom
of our page ends up looking like this:

``` javascript
angular.module('myApp', ['radian']).
  controller('MyCtrl', ['$scope', '$rootScope', function(sc, rsc)
{
  rsc.dat = {};
  sc.symbols = [];
  sc.fields = [ { name: 'Open',      label: 'Opening price' },
                { name: 'High',      label: 'Daily high' },
                { name: 'Low',       label: 'Daily low' },
                { name: 'Close',     label: 'Closing price' },
                { name: 'Volume',    label: 'Daily volume' },
                { name: 'Adj Close', label: 'Adjusted closing price' } ];
  sc.stocks = ['CSCO', 'DELL', 'FB', 'GOOG', 'MSFT', 'YHOO'];
  sc.dataUrl = function(s) {
    return '/data/' + s + '.csv';
  };
}]);
```

We're going to need a user interface for selecting and adding stocks
to our plot.  This has a select list very much like the one for the
plot variable, and a button to add stocks:

```html
<label>Stock symbol:</label>
<select ng-model="sym" ng-init="sym=stocks[0]"
        ng-options="s for s in stocks" required></select>
<button class="btn" ng-click="symbols.push(sym)">
  Add
</button>
```

The `ng-model` and `ng-init` attributes for the `<select>` element are
similar to before, but the `ng-options` attribute is a little simpler:
because the entries in the `stocks` array are just simple strings, we
can use the same values as we display for the value of our `sym`
variable.  This means that we just put `ng-options="s for s in
stocks"`.  The button is fairly simple, and we use Angular's event
handler attribute, `ng-click`, so that we can just splice a bit of
JavaScript code right in place to add the selected symbol to our list
of symbols.

This gives us a way to *add* stocks to our list, but what about
removing them?  We can put some extra Angular-aware HTML below our
plots to help take care of this:

``` html
<div>
  <span ng-repeat="s in symbols">
    <button class="btn btn-mini" ng-click="symbols.splice($index,1)">
      <i class="icon-trash"></i>
    </button>
    {{s}}&nbsp;&nbsp;&nbsp;
  </span>
</div>
```

This code demonstrates an Angular feature that we use all over the
place: `ng-repeat`.  This has lots of different options, but we use it
in its simplest form here -- for each entry in the `symbols` array,
`ng-repeat` causes everything inside the `<span>` element to be
replicated, with the Angular variable `s` bound to each element in
`symbols` in turn.  This means that we get one button per stock in our
list, and the button is set up to remove that stock from the list.
The `$index` variable is a special one maintained by `ng-repeat` that
gives the position of the current element in the source array
`symbols`.  This makes it easy to delete items from an array, as we're
doing here using JavaScripts `Array.splice` function.  The only other
feature of note here is the use of the Angular expression `{{s}}` to
splice the value of the `s` variable in as text to give a label for
the button.

The result of all this is that as we add elements to the `symbols`
array using our select list and "Add" button, Angular automatically
maintains a series of buttons and labels at the bottom of our plots
that we can use to remove items from the `symbols` list.

So, we can add and remove items from the `symbols` list.  Next, we
need to talk about how we manage the data associated with these
things.  It should come as no surprise that we use `ng-repeat` again,
this time in conjunction with `<plot-data>`.  There is one difficulty
with this though, and that's related to how we set up *names* for our
data set.  It's quite difficult to access variables by dynamically
constructed names, which we would have to do if we just iterated over
our symbols using `ng-repeat="s in symbols"` and `name="[[s]]"` or
something similar in our `<plot-data>` directive.  Instead, Radian
provides the `subname` attribute for `<plot-data>` for just this
case.  We use a single `name="dat"` attribute and use a `subname` to
assign data sets to fields of this one big variable.  This makes it
much easier to deal with dynamically defined data set names.  We end
up with a `<plot-data>` directive like this:

``` html
<plot-data ng-repeat="s in symbols"
           name="dat" subname="[[s]]"
           format="csv" src="[[dataUrl(s)]]">
  <metadata name="Date" format="date"></metadata>
</plot-data>
```

For each value in `symbols`, this sets up a data set using the
appropriate URL (calculated by the `dataURL` function we set up in our
JavaScript), using the value from `symbols` as the *sub-name* of the
dataset `dat`.  What this means is that, if we have the symbol
"`CSCO`" in `symbols`, we can write `dat['CSCO'].Date`,
`dat['CSCO'].Open` and so on in Radian expressions to get at these
data fields.

Finally, we need to plot these multiple data sets.  And we do that, as
you might guess, using `ng-repeat` again, this time with our `<lines>`
directive:

``` html
<lines ng-repeat="s in symbols" d="[[dat[s]]]"
       x="[[d.Date]]" y="[[d[plotvar.name]]]" stroke="blue"></lines>
```

Here, for each entry in `symbols`, we extract the relevant part of the
`dat` data set (into an Angular scope variable called `d`, for
convenience), then use this data for our plot, just as before.  We
will get one line per entry in the `symbols` array.

<div class="exercise">
**Exercise**

1. Update the JavaScript to add the stocks list variables.
2. Add the stock selection UI.
3. Add the stock deletion list UI.
4. Update the `<plot-data>` directive to access multiple data sets.
5. Update the `<lines>` directive to plot these multiple data sets.

*A solution to this exercise is saved as `ex-step-3.html` in the
tutorial directory.*

</div>

<hr>
## Step 4: Final features

There are some flaws to our little application: all the plots appear
in the same colour; we can add multiple copies of the same stock; and
there's no indication when we first load the page what's going on,
just a blank plot area.  We can fix these all pretty easily.

First, stroke colour selection.  Instead of setting the stroke colour
to a fixed value, we can make if a function of the `$index` variable
inside the `ng-repeat` that draws the plot lines.  The Radian plotting
library provides access to some categorical colour palettes from the
D3.js library that we can exploit to generate stroke colours.  All we
need to do is to change the `stroke` attribute within our `<lines>`
directive to say `stroke="[[category10($index)]]"` and we will get a
new colour for each new stock we add.

This still leaves us with the problem of identifying the different
traces by their colour.  We can get some help with this by adding a
legend.  We add the `legend-switches` attribute to the `<plot>`
directive, and a `label` attribute to each `<lines>` directive:
`label="[[s]]"` does the job of labelling each trace with its stock
symbol name.

To allow each stock to be selected only once, we just need to disable
the "Add" button if the stock is already in the `symbols` list.  This
can be done by adding an `ng-disabled` attribute to the button
definition: `ng-disabled="symbols.indexOf(sym)!=-1"`.  This basically
just says "disable this button if `sym` is already in the `symbols`
array".

It's not unusual to have a situation like the one we have here, where
multiple data sets are plotted on a single set of axes.  So far, the
behaviour of our graph is pretty good: a single plot works fine and a
legend appears to help us identify the different lines if there is
more than one.  But what about when there is no data at all?  We can
use the `no-data` attribute on the `<plot>` directive to deal with
this case.  Just add a `no-data` attribute with the value `"No stocks
selected"`.

<div class="exercise">
**Exercise**

1. Add symbol-based stroke colour selection.
2. Enable the plot legend.
3. Disable the "Add" button if the selected symbol is already plotted.
4. Add a suitable `no-data` attribute.

*A solution to this exercise is saved as `example-final.html` in the
tutorial directory.*

</div>

<hr>
## Conclusion

If you've made it this far, you should have a pretty good idea of the
kind of things you can do with Radian: it's easy to make simple plots,
and possible to make complex interactive plots.  We hope you find some
use for Radian in your own projects!

<br>
<hr>
<a class="btn pull-left" href="3-2-data-processing.html">
   &laquo; Prev section
</a>
<br>
<br>

[^1]: If you know JavaScript and you know Angular, you can obviously
      do things in a more organised and clever way.  Here, we're
      interested in a minimal setup that will make these examples
      work.
