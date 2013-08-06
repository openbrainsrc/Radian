---
layout: default
title: Download
---

## Download

The current release version is 0.1.1, which was released on
2013-07-30:

| TGZ |&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|ZIP |&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|Date |
|-----|-|-----|-|-----|
|[radian-0.1.1.tar.gz](/downloads/radian-0.1.1.tar.gz)| |[radian-0.1.1.zip](/downloads/radian-0.1.1.zip)| |2013-07-30|
|[radian-0.1.tar.gz](/downloads/radian-0.1.tar.gz)| |[radian-0.1.zip](/downloads/radian-0.1.zip)| |2013-07-10|

<hr>
## GitHub repository

The latest version of the source code, including tags for all
releases, is always available in our
[GitHub repository](https://github.com/openbrainsrc/Radian).

<hr>
## Changelog

##### Unreleased changes in GitHub repository

 - Add `flatten` function to plotting library to help with using
   hierarchical JSON data.
 - Make JSON data processing more lenient: string values that can be
   interpreted as numbers are converted to numeric values.

##### Version 0.1.1 (2013-07-30)

 - Fix for processing of dates in JSON data.
 - Data type for `<plot-data>` with `SRC` defaults to JSON if no
   `TYPE` attribute is given.
