---
title: 'Firefox problem solved: Address bar not working'
author: Alex
layout: post
permalink: /blog/2009/10/18/firefox-problem-solved-address-bar-not-working/
categories:
  - Browsers
  - General talk
  - Web-related
tags:
  - address
  - bug
  - Firefox
  - url
---
# 

A few days ago Firefox started one of the most annoying bugs I’ve come across: The address bar stopped working completely. No matter what I tried to do, this are the detailed symptoms:

*   Write a URL and hit enter and nothing would happen
*   The same as before but clicking the green arrow at the end of the address bar
*   The URL in the address bar would not change when switching between tabs

Now this was really annoying me, and I’ve realized that quite a lot of people had the same problem so after a lot of research, I got to the solution.  
The problem is caused by these plugins: Alexa Sparky 1.4.4 and Delicious. As for the Alexa plugin, just downgrade to 1.3.0 and everything will be fine. With the Delicious plugin though my advice is to completely remove it until there is a new version.

I hope you could get your problem fixed,  
Alex