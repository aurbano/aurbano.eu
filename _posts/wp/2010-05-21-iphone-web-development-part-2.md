---
title: 'iPhone web development [Part 2]'
author: Alex
layout: post
permalink: /blog/2010/05/21/iphone-web-development-part-2/
categories:
  - CSS
  - iPhone
  - Javascript
tags:
  - css
  - design
  - detection
  - iPhone
  - javascript
  - landscape
  - orientation
  - portrait
  - web development
---
# 

[![iPhone orientation change][2]][2]In [part one][2] of my tutorial on iPhone web development, we talked about the basic stuff (Recognizing iPhones or iPods, setting up special HTML and CSS tags… ) we will now move on to the really clever bit: Orientation detection.

 []: http://urbanoalvarez.es/blog/wp-content/uploads/2010/05/orient.gif
 [2]: http://urbanoalvarez.es/blog/2010/05/05/iphone-web-development-full-guide/

For many sites, we may just have the same thing both on portrait and landscape. But sometimes we will want to use that extra space to display our content differently, and here is how.

## Orientation detection with CSS:

We can use some smart CSS3 selectors to ensure that some styles only apply to landscape, or to portrait modes:

    /* Portrait */
    @media screen and (max-width: 320px){
    	h1{ font-size:20px; }
    }
    /* Landscape */
    @media screen and (min-width: 321px){
    	h1{ font-size:24px; }
    }

Remember that for this to work we must use the viewport meta tag I showed you in [my previous tutorial][2]  
This media query works (According to Apple’s documentation) since iPhone OS 1.0, so there shouldn’t be any problem with it, Firefox mobile should also support this, so by using max-device-width and min-width we should be able to develop specific CSS for every device without the need of PHP to include only certain style sheets

## Orientation detection with JavaScript:

We can easily detect the device orientation by checking the innerWidth. This method will also work for other PDAs and SmartPhones:

    var updateLayout = function() {
      if (window.innerWidth != currentWidth) {
        currentWidth = window.innerWidth;
        var orient = (currentWidth == 320) ? "profile" : "landscape";
        document.body.setAttribute("orient", orient);
        window.scrollTo(0, 1);
      }
    };
    
    iPhone.DomLoad(updateLayout);
    setInterval(updateLayout, 500);

This code will add a new attribute (orient) to the body element, which will be either portrait or landscape. All we have to do now is use CSS to filter out whatever orientation we need:  
There is another method, which will work only on the iPhone though:

    body[orient="landscape"]{
    // CSS code here...
    }
    // ... or ...
    body[orient="portrait"]{
    // CSS code here...
    }

That JavaScript also hides the toolbar by using the *scrollTo()* function when the orientation changes,

## Next release:

On my next release in this series of iPhone web development tutorials, I will get into the really advanced JavaScript API we have for the iPhone (touch detection, gestures… etc) so stay tuned!  
  
Hope you found this useful,  
Alex