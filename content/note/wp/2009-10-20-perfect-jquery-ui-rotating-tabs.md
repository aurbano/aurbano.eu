---
author: Alex
categories:
- JavaScript
- Main
date: "2009-10-20T00:00:00Z"
tags:
- javascript
- jquery
- rotate
- tabs
- ui
thumbnail: /assets/files/thumbnails/jqueryUI.png
title: Perfect jQuery UI rotating tabs
aliases: [ /blog/2009/10/20/perfect-jquery-ui-rotating-tabs/ ]
outdated: true
---

Tabs are nice. They create a very elegant interface, and jQuery UI does this marvelously.

## How to do that?

### Include the files

With [jQuery][2] and [jQuery UI][3] it is dead simple. First, load the libraries, I recommend using the hosted files at Google for jQuery:

[2]: http://jquery.com/
[3]: http://jqueryui.com/

``` html
	<script src="http://jqueryjs.googlecode.com/files/jquery-x.min.js" type="text/javascript"></script>
	<script src="path/to/jquery UI" type="text/javascript"></script>
```

Remember to include also the *CSS files* for the UI Theme! Otherwise the tabs won\'t seem to work!

### The JavaScript:

Now comes the cool part, basically we want to have tabs: But although tabs are nice, people may not realize there is more content, or they might be just too lazy to browse through it, so, why not *rotate* through the tabs?  
jQuery UI does that by itself with a very simple command, but it is **not** perfect! So we need to program our tabs to rotate, **unless** the mouse is over them. This way when a user is looking for a link, the tab will wait!

So here is how this is achieved:

``` javascript
    $(document).ready(function(){
    	$("#tabs-rotate").tabs({ fx: { opacity: 'toggle' } }).tabs('rotate', 3000);
    	$('#tabs-rotate').hover(function(){
    			$(this).tabs('rotate', 0, false);
    		},function(){
    			$(this).tabs({ fx: { opacity: 'toggle' } }).tabs('rotate', 3000);
    		}
    	);
    });
```

First we instruct jQuery UI to set up tabs in that div, and to rotate them. Then we use a hover event to control the rotation. On hover no rotation, and on out resume rotation.

## Further actions:

Now you may want to stop rotation completely when a tab is clicked. This can be done easily: First we will add a new handler for the onclick event to the tabs-rotate, which will remove rotation. But we also have to unbind the hover handler we had setup, using the [`unbind`][7] jQuery function:

 [7]: http://api.jquery.com/unbind/

``` javascript
    $('#tabs').click(function(){
    	$(this).tabs('rotate', 0, false);
    	$(this).unbind('hover');
    });
```

## See it in action

You can see it working on the [DJs Music][8] homepage

 [8]: http://djs-music.com
