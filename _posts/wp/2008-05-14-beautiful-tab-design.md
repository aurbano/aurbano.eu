---
title: 'Beautiful tab design:'
author: Alex
layout: post
permalink: /blog/2008/05/14/beautiful-tab-design/
categories:
  - CSS
  - Layout/Styling
tags:
  - css
  - tabs
---
# 

This article is not on how to create tabbed menus, is just about how to style them!  
I completely forgot who was the source, so if you happen to be the author comment your URL and I’ll put up a link :S

Anyway, I found that this is by far the easiest and probably most beautiful design for liquid rounded tabs out there, that requires absolutely no tweaking or adjusting.  
It uses only one background image, which contains at the same time the normal state, hover state, and active state. In this case the image is a png image in white, and grey tones, but that can be easily changed in photoshop.  
Here is the image in question:  
![Tab image][1]

 [1]: http://urbanoalvarez.es/blog/wp-content/uploads/2008/05/tab-round.png "Tab image"

As you can see it has the three tab states on it. We will use CSS background position abilities to make it look as if we are changing the image.  
Now to make the tabs have liquid width we will use an a element for the left corner and a span for the other one.  
Here is the CSS source:

    @charset "utf-8";
    /* CSS Document */
    ul.cftab,ul.cftab li{border:0; margin:0; padding:0; list-style:none;}
    ul.cftab{
	    border-bottom:solid 1px #DEDEDE;
	    height:29px;
	    padding-left:20px;
	    margin-bottom:20px;
    }
    ul.cftab li{float:left; margin-right:2px;}
    
    .cftab a:link, .cftab a:visited{
	    background:url(tab-round.png) right 60px;
	    color:#666666;
	    display:block;
	    font-weight:bold;
	    height:30px;
	    line-height:30px;
	    text-decoration:none;
    }
    .cftab a span{
	    background:url(tab-round.png) left 60px;
	    display:block;
	    height:30px;
	    margin-right:14px;
	    padding-left:14px;
    }
    .cftab a:hover{
	    background:url(tab-round.png) right 30px;
	    display:block;
	   }
    .cftab a:hover span{
	    background:url(tab-round.png) left 30px;
	    display:block;
    }
    
    /* -------------------------------- */
    /* ACTIVE ELEMENTS */
    .cfactive a:link, .cfactive a:visited, .cfactive a:visited, .cfactive a:hover{
    	background:url(tab-round.png) right 0 no-repeat;
    }
    .cfactive a span, .cfactive a:hover span{
    	background:url(tab-round.png) left 0 no-repeat;
    }

To have it working you must use html code in the following way: