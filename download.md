---
layout: default
title: Download
---

{% for post in site.tags.changelog limit:1 %}

## Download

The current version is **{{ post.title }}**, which was released on
{{ post.date | date: "%B %e, %Y" }}.  See the [version history](changelog.html)
for a list of changes.

---
### Source archive

<a class="download" href="http://somewhere/{{ post.title }}/Radian-{{ post.title }}.zip/download" title="Download Source (ZIP)">Download</a>

This contains:

- The complete source code for the Radian library
- A collection of example plots
- Full [documentation](documentation.html)

---
## Git repository

The latest version of the source code, including tags for all
releases, is always available in our
[Git repository](https://github.com/openbrainsrc/Radian).

{% endfor %}
