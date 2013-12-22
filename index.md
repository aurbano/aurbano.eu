---
layout: page
title: Welcome
tagline:
---

Welcome to my just-created Jekyll blog. I still have to update the theme and ensure that the posts were imported fine from WordPress.
The site will be hosted on Github, at least for now.

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>