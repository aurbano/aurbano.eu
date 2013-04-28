---
title: Creating original website backgrounds
author: Alex
layout: post
permalink: /blog/2008/12/30/creating-original-website-backgrounds/
categories:
  - Cool pics
  - CSS
  - Graphic Design
tags:
  - background
  - fyre
  - gimp
  - website
---
# 

This tutorial is all about creating beautiful backgrounds for website with a modern/stylish look, have you ever wondered how those curved shapes were created? Here is a preview of one I created for this tutorial: ![Fyre sample image][1]
Fyre sample image

 [1]: http://urbanoalvarez.es/blog/wp-content/uploads/2008/12/fyre.jpg "Fyre Demonstration"

The image is only 300x300px, I didn’t want to make anything huge, since it was only a test. The program we will be using will work both under Linux and Windows (No support for Mac users yet), it is called [Fyre][2].

 [2]: http://fyre.navi.cx/ "Fyre homepage"

So if you are using Windows, scroll down until you see the tab “07 February 2005 – 0.9 released” and there you’ll find both a Windows installer and a Windows zip. I prefer the installer, it runs a bit faster, but it is up to you.  
If you are using Linux, before you download it and compile it yourself go to Synaptic and get it from there. It is available at least in Ubuntu (Which is the one I am using right now), if you can’t find it in the repositories then download the latest release from their website and compile it. It comes with handy instructions on the configuration, so it shouldn’t be hard. (If you have no clue on how to compile/install linux programs use Google, although I’ll tell you a fast version: If there is a file called Makefile go to the Terminal, browse to the folder where the files are (First you have to extract them from the .tar.bz or whatever filetype it is, and type >> make all, or >> make. It depends on the program)

Now that Fyre is intalled open it and you’ll see a main window to the right with a preview, and to the left a column full of options. For our website, select a bigger width and height. 1000×1000 will do most times. Now play with the controls, center the result, adjust the zoom to fit exactly the canvas WITHOUT touching the corners, and then save it. I’ve had some issues saving some images, so I sometimes simply print the screen and then cut out the image with Gimp…

Now that you have it place it in the website’s folder and simply set it as background. If you don’t know how to use this CSS code:

    body{
    background:url('fyre_image.png') no-repeat top left;
    }
    

The top left can be changed to top center, top right… or bottom corners, although I think that top alignment is much better.

Hope this helped you ![;)][3] 

 [3]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_wink.gif