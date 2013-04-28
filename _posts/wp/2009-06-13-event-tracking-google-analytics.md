---
title: 'Event tracking &#8211; Google Analytics'
author: Alex
layout: post
permalink: /blog/2009/06/13/event-tracking-google-analytics/
categories:
  - Javascript
  - Tips
  - Web-related
tags:
  - analytics
  - event
  - google
  - tracking
---
# 

Hello everyone,  
As most people do, I’m sure you use [Google Analytics ][1]for the stat metrics for some of your sites, so you’ll love this new feature:

 [1]: http://www.google.com/analytics/

If you use AJAX in your site, or if you want to track outbound links, or downloads… etc then this is really useful for you.

## What is event tracking?

In simple terms, it logs events that happen on your site, for example rate a post (If you have post rating), download a file… or you do some sort of JavaScript processing that you want to measure.

So finally, we can keep track of AJAX interactions with the server, we can log also normal POST requests that do some php processing, like posting a comment, or editing some data in our database.

## Using Event Tracking:

This step couldn’t be possible easier. First of all make sure you have the new code installed. The new code looks like this:

    "));
    
    
    

That *var pageTracker* is what holds the tracking object.

### Example:

Imagine we have a site where we feature some sort of mp3 downloads. And we want to track those with Analytics. In the link to the file we would put:

    [Download song][2]
    

 [2]: song_file.mp3 "Download file"

As you can see we use the function *_trackEvent*, from the pageTracker object. This function takes 4 parameters, Category name, action name and a label and value:

    _trackEvent(category, action, optional_label, optional_value)
    

The category can be used to store different events that are similar, for example in the category music we could use the actions Download, Listen, Rate… And finally the label, that is normally used to refer to which specific object in that category you are referring to, in this case which song.

### From the Analytics panel

Wait for a day after you install this to see the data in Google Analytics, and then go to the stats panel, go to the Content tab, then you’ll see at the bottom Event Tracking:  
I’ve created a sample profile with some events and I clicked a couple times to show you how it looks like:  
![Screen capture of the Event Tracking page][3]
Screen capture of the Event Tracking page

 [3]: http://urbanoalvarez.es/blog/wp-content/uploads/2009/06/analytics.gif "Analytics shot"

Well I hope you found this useful, more information on the [Google API][4]

 [4]: http://www.code.google.com/apis/analytics/docs/tracking/eventTrackerGuide.html

## How do you use this?

Have you found any sort of smart uses for this? Please share with us ![:)][5] 

 [5]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_smile.gif