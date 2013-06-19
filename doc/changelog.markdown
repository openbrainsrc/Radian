---
layout: default
title: Version history
---

## Version history
{% for post in site.tags.changelog %}
---
<a href="{{ post.url }}">
<h3>Version {{ post.title }}</h3>
<span class="date">
<div class="dateday">{{ post.date | date: "%e" }}</div>
<div>{{ post.date | date: "%b" }}</div>
<div class="dateyear">{{ post.date | date: "%Y" }}</div>
</span>
</a>
{{ post.content }}
{% endfor %}

---
### Version 0.0
- Pre-release
