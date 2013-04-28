---
title: Easiest rounded corners ever
author: Alex
layout: post
permalink: /2008/03/17/easiest-rounded-corners-ever/
categories:
  - Javascript
  - Programming
  - Web-related
tags:
  - corners
  - css
  - design
  - javascript
  - jquery
  - rounded
  - web
---
 

After an incredible amount of time spent looking for a way of easily rounding my corners, I\'ve come across the one I find the easiest possible:

[jquery][1] [rounded corners plug-in][2]

 [1]: http://jquery.com/ \"jquery\"
 [2]: http://www.malsup.com/jquery/corner/ \"rounded corners plugin\"

So now I\'ll explain how to install, use, improve...

## Installation:

First of all, download and place the needed files:

*   [Download jquery directly][3] (I renamed the file to jquery.js to simplify it)
*   [Download rounded corners plug-in directly][4] (I renamed the file to rounded.js to simplify it)

 [3]: http://code.google.com/p/jqueryjs/downloads/detail?name=jquery-1.2.3.pack.js \"Download jquery\"
 [4]: http://jqueryjs.googlecode.com/svn/trunk/plugins/corner/jquery.corner.js \"Download rounded corners plug-in\"

Now place them in your desired folder, for this tutorial I\'ll be using \"js/\"

## Usage:

In a html document, you would paste the following code in the head:

    1.  &nbsp;
    
    2.  [
    
    3.  [
    
    4.  [
    
    5.  
        
        *   
        
        
        And anywhere in your website\'s body, whenever you place a div with a class=\"round\", its corners will be rounded.
        
        
        To create special corners, or achieve special effects, visit my [demo page][6], full of special tricks.
        
        
        ## Special cases:
        
        
        The round command fills the \"rounded\" area with the body background color, so if you place this inside somewhere with a different background-color you must specify what color you want the corner to have.  
        Here you have an example:
        
        
            1.  &nbsp;
            
            2.          $&#40;\'div.round\'&#41;.corner&#40;\"cc:#F1F1F1\"&#41;;
        
        
        If you want a bigger radius for your corners, just write the pixel radius in the parameters of corner():
        
        
            1.  &nbsp;
            
            2.         $&#40;\'div.round\'&#41;.corner&#40;\"10px\"&#41;;
        
        
        ## Example and demo page:
        
        
        I\'ve set up an example and [demo page][6], with all possible ways to do this, just [go and see.][6]
        
        
        If you find any problems or suggestions feel free to comment!

 [5]: http://december.com/html/4/element/script.html
 [6]: http://urbanoalvarez.es/rounded/demo.htm \"Demo page\"