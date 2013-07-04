---
layout: default
title: Reference manual - Palettes and interpolators
---

# 3. Palettes and interpolators

The subject of colour palettes and interpolators for properties like
stroke width are closely related.  A palette is essentially just a
sort of colour interpolator.

<hr>
## Palette definitions

A palette is used to map input values from some domain to colour
values.  The mapping may be a discrete mapping (from discrete values
taken by a variable to discrete colour values), an absolute mapping
(from fixed variable values to colours) or a normalised mapping (from
the range [0,1] to a range of colours, with the understanding that
data values used with the palette will somehow be normalised to
[0,1]).  For non-discrete palettes, the interpolation between
specified *(value, colour)* pairs is either linear (in RGB, HSL, HCL
or Lab colour space) or constant (giving a "banded" palette).  For
example, a scale for temperatures might have a linear HSL
interpolation between blue (for cold temperatures) and red (for warm),
while a palette for topographic elevation might be absolute banded,
with fixed colours being used for fixed elevation ranges.

A suitable Haskell datatype to represent palettes is thus:

~~~~ {.haskell}
data Colour = Colour { colRed, colGreen, colBlue :: Double }
data Banded = Banded | Linear
data ColInterp = RGB | HSL | HCL | Lab
data Palette = Discrete   [Colour]
             | Normalised ColInterp Banded [(Fraction, Colour)]
             | Absolute   ColInterp Banded [(Double, Colour)]
~~~~

(Here, `Fraction` is a type representing values lying in [0,1].)

Palettes are defined in HTML `<palette>` directives, which have
attributes to specify the palette type, and a body to define the
domain and range of the palette interpolation.

### Attributes

|Name    |&nbsp;&nbsp;&nbsp;|Description|
|--------|-|----------------------------|
|`NAME`  | |Name of generated palette function|
|`TYPE`  | |One of `discrete`, `abs` or `norm` (default)|
|`BANDED`| |Present/absent|
|`INTERP`| |One of `RGB`, `HSL` (default), `HCL` or `Lab`|

### Body

For discrete palettes, the body of the `<palette>` directive contains
either a simple list of colours (separated by newlines or `;`
characters), e.g.

~~~~ {.html}
<palette name="rainbow" type="discrete">
  red; orange; yellow
  green; blue; indigo; violet
</palette>
~~~~

or a list of *(value, colour)* pairs (separated by newlines or `;`
characters), where the *value*s are discrete labels (numeric or
strings -- these string values can be quoted with double quotes, in
order to allow keys containing spaces), e.g.

~~~~ {.html}
<palette name="gender" type="discrete">
  male blue
  female red
</palette>
~~~~

For continuous palettes, the body of the palette contains a list of
*(value, colour)* pairs, where the *value*s are real numbers, e.g.

~~~~ {.html}
<palette name="rbpal">
  0.0 #FF0000; 1.0 #0000FF
</palette>
~~~~

In all cases, colour specifiers can be any of a colour name, `#XXX`,
`#XXXXXX`, `rgb(r, g, b)` or `rgba(r, g, b, a)`).


### Interpretation

Discrete palettes either assign given colours to given discrete keys,
or give a simple list of colours, which are used one-by-one to colour
categorical values -- this is implemented by deriving a zero-based
index *i* from the data categories and taking the *(i mod n)*'th
colour from the palette, where *n* is the number of colours in the
palette.

Absolute and normalised palettes both work in a similar fashion,
either interpolating linearly between the *(value, colour)* set points
of the palette or (for banded palettes) returning a fixed colour for
each value range between set points.  The only difference between
absolute and normalised palettes is that, for absolute palettes, the
actual data values are used to define the set points, while for
normalised palettes, the set point values all lie in [0,1] and data
values are normalised to this range before calculating colours from
the palette (the normalisation is a simple linear mapping of
[min *D*, max *D*] to [0,1], where *D* is the set of data values).}

### Examples

#### Palette for display of topographic data

~~~~ {.html}
<palette name="terrain" type="abs" banded>
  -8000.0 #000066; -4000.0 #4C4CFF; -1000.0 #7F7FFF; -500.0 #66B2FF
   -100.0 #7FFFFF;   -50.0 #66CCB2;    -0.1 #E5FFFF;    0.0 #003300
    100.0 #00B24C;   500.0 #E5FF00;  1200.0 #994C00; 4000.0 #E5E5FF
   5000.0 #FFFFFF
</palette>
~~~~

#### Simple discrete colour palette

~~~~ {.html}
<palette name="colours" type="discrete">
  orange; green; blue; red; black
</palette>
~~~~

#### Palette for blue-to-red temperature scale

~~~~ {.html}
<palette name="temppal" type="norm">
  0 #0000FF; 1 #FF0000
</palette>
~~~~

Note that, in the last case, there is a compact direct representation
of the palette that [may be used](#palette-use).

<hr>
## <a name="palette-use">Palette use and compact palette syntax</a>

**Not done: application of palettes to stroke along paths,
  i.e. passing a palette function as the stroke.**

Palettes are used to specify colours for stroking and filling SVG
elements in plots.  (Note that in all the following examples, the
stroke or fill attribute can actually contain a semicolon-separated
list of colour/palette specifiers, allowing for
[stroke switching](#ui-stroke-sel).)

Palettes defined using `<palette>` directives are installed as
functions (with names taken from the directive's `NAME` attribute)
that can be called to assign colours based on Radian variables.  For
*ad hoc* palette use, there is a compact syntax for defining palette
functions "in place".

The most basic instance is using a single colour to specify the stroke
or fill for an element, for example:

> `stroke="red"` &nbsp;or&nbsp; `fill="#CC3342"`.

To make use of a palette, we need to provide a palette specifier,
*palspec* and, optionally, a data path *dataspec* describing the data
item to be used to generate colours from the palette:

> `stroke = "@P{`*palspec*`}(`*dataspec*`)"` &nbsp;or&nbsp; `fill = "@P{`*palspec*`}"`.

In the second case, where no data path is given, the data item index
is used to index into the palette.  For path stroking, this gives
palette interpolation along the path.

To support the simplest use case, there is a compact syntax for
normalised linear interpolation between two colours:

> `stroke = "@P{grey:red}"`

> `fill = "@P{grey:red}(station#startDate)"`

These are equivalent to defining a normalised HSL interpolation
palette whose 0 value is "grey" and whose 1 value is "red", the first
along the path to be stroked and the second as a function of the
`station#startDate` variable.

More generally, if a palette is defined by a `<palette>` element with
a suitable `NAME` attribute, the palette can be accessed directly as a
function, for example:

> `fill = "terrainpal(stations#elevation)"`

Here, the `terrainpal` palette must be defined within the current
document using a `<palette>` element.

More complex palette definitions can also be included inline:

> `fill = "@P{discrete red;green;blue}(station#type)"`

> `fill = "@P{norm 0 blue; 0.5 blue; 0.5 green; 1 red}(x)"`

> `fill = "@P{abs rgb -4000 black; 8000 green}(station#elevation)"`

The first example here defines a three element discrete palette, the
second a normalised HSL interpolation palette and the third an
absolute RGB interpolation palette.

The general syntax of a palette use is:

~~~~
  paluse ::= colour | palref [ "(" [datapath] ")" ]

  palref ::= palette-function | "@P{" palspec "}"

  palspec ::= colour ":" colour
           |  colour ( ";" colour )*
           |  type [interp] ["banded"] value colour (";" value colour)+

  type ::= "normalised" | "absolute" | "discrete"
  interp ::= "RGB" | "HSL" | "HCL" | "Lab"
~~~~

The `type` can be abbreviated to `n`, `a` or `d`.

<hr>
## General interpolation

As well as the specialised interpolation provided by palettes, there
is a general interpolation facility exposed via the `interpolate`
function in the Radian plotting library.  This function is called as
`interpolate(domain, range, type)` where `domain` and `range` are
(possibly nested) arrays of values, and `type` is one of `linear`,
`sqrt`, `log` or `pow:k` (with `k` a numeric exponent).  The return
value of a call to `interpolate` is an interpolation function whose
domain covers the values in `domain`, whose range is the range of
values in `range` and has an interpolation law as specified by `type`.

The following example demonstrates how marker *linear sizes* can be
related to plot data:

~~~~ {.html}
<plot height=500 stroke-width=1
      szint="[[interpolate(d#size,[1,50],'pow:2')]]">
  <points x="d#x" y="d#y" fill="[[category10(d#cat)]]"
          marker-size="[[szint(d#size)]]">
  </points>
</plot>
~~~~
