---
title: Display timezone-specific dates in PHP
author: Alex
layout: post
permalink: /blog/2010/04/17/display-timezone-specific-date-in-php/
categories:
  - PHP
  - Programming
tags:
  - change
  - php
  - timezone
---
# 

It’s common to have a website designed for one country (For example Spain or the UK) and have it in a server elsewhere (In the US for example). You will notice that sometimes when displaying a date this way, it shows the local time at the server!

Instead of manually correcting this time difference there is a much safer way of getting around this issue, using built-in PHP functions:

Take a look at this:

    

Which would generate the following output (At the time of writing of course!)

    22:52pm (Sat, Apr 17th, 2010)

As you can see it is extremely easy to set up new timezones and to display dates for those zones specifically. You could even prompt your user for his/her own timezone, or add it as a specific setting for them ![:)][1] 

 [1]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_smile.gif