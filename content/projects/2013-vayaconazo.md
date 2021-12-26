---
title: VayaCoñazo
year: 2013
date: "2013-01-01"
offline: true
href: https://aurbano.eu
image: vayaconazo.jpg
thumbnail: vayaconazo.png
description: Entertainment site, mixing an RSS aggregator and a "rage comic" site where users submitted their content
---

An entertainment site, mixing an RSS aggregator and a "rage comic" site where users submit their content. It pulls content from its own database and a lot other sources, combining everything on the same feed.

There is also a video viewer that displays the latest videos in a nice AJAX interface, I actually used the video viewer quite more often than the actual site, it's a nice way to spend 10 minutes. Every single video that ever goes viral or becomes famous appears on this viewer some time before.

This website saw quite a bit of traffic, so in order to make it efficient I wrote a backend in PHP that ran on a cronjob, generating JSON files for all the content on the site (mainly the Hot, New, and Trending lists). This effectively turned it into a blazing-fast static site, where upvotes would influence the content only every minute or so.

I eventually closed it down when I got my first full time job because I wasn't sure of the legal side of aggregating content from multiple sources.
