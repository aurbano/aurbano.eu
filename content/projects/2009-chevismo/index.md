---
title: Chevismo
year: 2009
date: "2009-01-01"
offline: true
href: https://github.com/chevismo/chevismo.com
image: chevismo.jpg
thumbnail: chevismo.png
description: Entertainment site featuring many popular tools and services. Also a chat, forum, and many other sections that users discovered over time.
---

Entertainment site featuring many popular tools and services. Also a chat, forum, and many other sections that users discovered over time.

This was mostly done to experiment with some new programming concepts, but it got quite popular in Spain so I kept on working on it for several years, making a few good friends in the community that it formed

The chat was the main feature, and some people kept coming back for some reason, eventually forming a very tight community. It was built before Nodejs and Socket.io were a thing, so I built it on top of MySQL with just INSERTS and SELECTS. Some JavaScript would poll this server on a varying interval depending on how active the chat was at the time. This taught me a lot about how efficient a DB can be if tuned properly.

Once the site became popular I started having issues with abuse and spam, so I added a system that would shadow-ban users who misbehaved. I even added some fake replies to their chat posts so the ban would be even harder to detect.

All in all it was a blast running this and I plan on recreating something similar soon (2020)
