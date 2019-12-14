---
author: Alex
categories:
- JavaScript
- Main
date: "2009-06-13T00:00:00Z"
tags:
- analytics
- event
- google
- tracking
thumbnail: /assets/files/thumbnails/analytics.png
title: Event tracking - Google Analytics
aliases: [ /blog/2009/06/13/event-tracking-google-analytics/ ]
---

## What is event tracking?

In simple terms, it logs events that happen on your site, for example rate a post (If you have post rating), download a file... or you do some sort of JavaScript processing that you want to measure.

So finally, we can keep track of AJAX interactions with the server, we can log also normal POST requests that do some php processing, like posting a comment, or editing some data in our database.

### Example:

Imagine we have a site where we feature some sort of mp3 downloads. And we want to track those with Analytics. In the link to the file we would put:

``` html
<a href="song_file.mp3" title="Download file">Download song</a>
```

As you can see we use the function `_trackEvent`, from the pageTracker object. This function takes 4 parameters, Category name, action name and a label and value:

``` javascript
_trackEvent(category, action, optional_label, optional_value)
``` 

The category can be used to store different events that are similar, for example in the category music we could use the actions Download, Listen, Rate... And finally the label, that is normally used to refer to which specific object in that category you are referring to, in this case which song.

### From the Analytics panel

Wait for a day after you install this to see the data in Google Analytics, and then go to the stats panel, go to the Content tab, then you\'ll see at the bottom Event Tracking.

Well I hope you found this useful, more information on the [Google API][4]

 [4]: http://www.code.google.com/apis/analytics/docs/tracking/eventTrackerGuide.html
