---
title: Apply a background image to an image
author: Alex
layout: post
permalink: /blog/2008/09/15/apply-a-background-image-to-an-image/
categories:
  - CSS
tags:
  - background
  - css
  - display
  - Firefox
  - ie
  - image
---
# 

this is quite a neat trick, and it can look really good depending on your design and the image you put as background…

To get it to work all you need is to apply a padding and display:block; to the image. So the CSS would be:

    img{
    	display:block;
    	padding:10px;
    	background-image:url(image.gif);
    }
    

[Here is a very smart use of this technique][1], where a div contains the sky, the image is a little man running, with an animated background that simulates motion.

 [1]: http://www.contentwithstyle.co.uk/resources/img_bg_demo/

Read [the post][2] that explains how that was achieved if you have any doubts.

 [2]: http://ajaxian.com/archives/tip-using-a-background-image-on-an-image

Enjoy,