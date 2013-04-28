---
title: JW Player Captions
author: Alex
layout: post
permalink: /blog/2010/06/01/jw-player-captions/
categories:
  - Javascript
tags:
  - captions
  - flash
  - jw player
  - stream
  - translate
  - video
---
# 

[![JW Player with captions][2]][2]
JW Player with captions

  
Captions are a great way to offer multi-lingual media content on your site, but they don’t seem easy to add right? Well with the right tools and guidance, it will be very easy

## Setting everything up:

In order for captions to work flawlessly on every major browser, we will be using JW Player version **4.5** (At the time of writing, version 5 and 5.1 don’t seem to work well in Internet Explorer)

Once you have that version ready, add the following Flashvars:

    
    

Of course you may leave all the other Flashvars you had before (Specially *file* ![;)][2] )

 [2]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_wink.gif

## The XML file:

Now that the player is ready, we need to setup the XML file with the captions, so create *captions.xml* and write the following:

    
      
        
          
    Subtitle 1
          
    Subtitle 2
          
    Subtitle 3
        
      
    
    
    As you can see, all we need is to change the Subtitle text, and the begin and end times of each, to set those up.
    
    
### Generate the XML file with PHP:
    
    
    If you want to change the language dynamically, you could use PHP to generate the XML using the following headers:
    
    
        header("Content-type: text/xml");
        header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
        header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past (no cache)
        // And now all the XML data as before
        
    
    
    If you want to learn how to easily translate your website read [my article on that ][3]too!
    
    
    Hope you found this useful!

 [3]: http://urbanoalvarez.es/blog/2010/03/22/best-website-translation-method/