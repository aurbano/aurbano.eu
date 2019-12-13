---
author: Alex
categories:
- PHP
- Main
date: "2009-01-20T00:00:00Z"
tagline: PHP snippets
tags:
- php
- timestamp
- unix
thumbnail: http://www.wired.com/images_blogs/wiredscience/2012/09/mf-do-the-right-things-at-the-right-time_f.jpg
title: Display time since last visit in PHP
aliases: [ /blog/2009/01/20/display-time-since-last-visit-in-php/ ]
---

This short snippet produces a "Twitter style" time difference, the idea is that it will round to the nearest time unit, and display only the integers on that unit. For example `1 minute ago`, `2 weeks ago`, `1 year ago`...

You can specify the word you want to appear instead of ago by setting the `$ago` argument to something else as well.

I moved this code to a Github Gist, available here:

{% gist aurbano/7e83bef9923cd4ed800a timeBetween.php %}
