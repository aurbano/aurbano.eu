---
layout: post
title: "Going from unsalted to salted hashes"
tagline: "It really isn't that complicated"
description: "Migrating a system from unsalted hashes to salted hashes using any algorithm"
category: "Main"
thumbnail: /assets/files/thumbnails/salting.jpg
tags: [security, hashing, hash, sha1]
---
{% include JB/setup %}

If you work on a legacy web application, or even a badly designed new one, it might not have salted hashes. I just came across this problem with one of my own old websites, and now want to improve it.

This might be your current setup:

<img src="/assets/files/posts/hashing/non_salted.jpg" alt="Sanded arms" class="img-responsive img-thumbnail" />

