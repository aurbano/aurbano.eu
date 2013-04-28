---
title: Perfect jQuery UI rotating tabs
author: Alex
layout: post
permalink: /blog/2009/10/20/perfect-jquery-ui-rotating-tabs/
categories:
  - CSS
  - Javascript
tags:
  - javascript
  - jquery
  - rotate
  - tabs
  - ui
---
# 

Tabs are nice. They create a very elegant interface, and jQuery UI does this marvelously, here we have a little preview of this:

![jQuery UI Tabs][1]
jQuery UI Tabs

## How to do that?

 [1]: http://urbanoalvarez.es/blog/wp-content/uploads/2009/10/tabs.png "Tabs"

### Include the files

With [jQuery][2] and [jQuery UI][3] it is dead simple. First, load the JS libraries, I recommend using the hosted files at Google for jQuery:

 [2]: http://jquery.com/
 [3]: http://jqueryui.com/

    

Remember to include also the *CSS files* for the UI Theme! Otherwise the tabs won’t seem to work!

### The HTML for the tabs:

We need a little HTML for our tabs to work:  
A wrapper, a few divs with the content, and an unordered list with the tabs:

    
    
    	
    *   [Tab 1][4]
    	
    *   [Tab 2][5]
    	
    *   [Tab 3][6]
    
    
    
    Tab 1 content
    
    
    Tab 2 content
    
    
    Tab 3 content
    

 [4]: #tab1
 [5]: #tab2
 [6]: #tab3

### The JavaScript:

Now comes the cool part, basically we want to have tabs. But although tabs are nice, people may not realize there is more content, or they might be just too lazy to browse through it, so, why not *rotate* through the tabs?  
jQuery UI does that by itself with a very simple commant, but it is **not** perfect! So we need to program our tabs to rotate, **unless** the mouse is over them. This way when a user is looking for a link, the tab will wait!

So here is how this is achieved:

    $(document).ready(function(){
    	$("#tabs-rotate").tabs({ fx: { opacity: 'toggle' } }).tabs('rotate', 3000);
    	$('#tabs-rotate').hover(function(){
    			$(this).tabs('rotate', 0, false);
    		},function(){
    			$(this).tabs({ fx: { opacity: 'toggle' } }).tabs('rotate', 3000);
    		}
    	);
    });

First we instruct jQuery UI to set up tabs in that div, and to rotate them. Then we use a hover event to control the rotation. On hover no rotation, and on out resume rotation.

## Further actions:

Now you may want to stop rotation completely when a tab is clicked. This can be done “easily”: First we will add a new handler for the onclick event to the tabs-rotate, which will remove rotation. But we also have to unbind the hover handler we had setup, using the [unbind][7] jQuery function:

 [7]: http://api.jquery.com/unbind/

    $('#tabs').click(function(){
    	$(this).tabs('rotate', 0, false);
    	$(this).unbind('hover');
    });
    

## See it in action

You can see it working on the [DJs Music][8] homepage

 [8]: http://djs-music.com

As with the best stuff, it’s terribly simple ![;)][9] 

 [9]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_wink.gif

Hope you enjoy,  
Alex