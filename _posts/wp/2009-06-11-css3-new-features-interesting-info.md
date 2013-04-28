---
title: 'CSS3 New features &#8211; Interesting info ;)'
author: Alex
layout: post
permalink: /blog/2009/06/11/css3-new-features-interesting-info/
categories:
  - CSS
  - Graphic Design
  - Layout/Styling
  - Web-related
tags:
  - corners
  - css
  - css3
  - rounded
  - transparency
---
# 

Hello fellow developers,  
I’m sure all of you have heard of the “new” CSS3 stuff, it’s been around for a while now, and it certainly has some very interesting new features.

First, I’ll review some of the things that were the hardest to develop, yet they looked so damn well:

*   **Rounded corners** – We all love them, but how hard is to find a good way to do them?
*   **Alpha transparency** – PNGs, JavaScript tweaks… I must admit they are hard…

### **Plus, I’ll show you how to create rounded transparent borders!**

Conclusion: The world needs new CSS features:

Solution: CSS3

### Let’s get going

Now before we get too exited, take into account that these new features “work” on major browsers, except obviously IE. So I would never use them for client sites… Meaning that you should only use these for personal designer portfolios, where you want to impress colleagues.

So now that this was clear, let’s see how the new stuff goes:

## Rounded corners:

For this you only have to select the element and use the following CSS code:

    #example{
    	-moz-border-radius: 20px;
    	-webkit-border-radius: 20px;
    }
    

**Demonstration:**

Example Div (CSS code for it below)

CSS for the example:

    background-color:#FFFFFF;
    	border:#CCCCCC solid 2px;
    	-moz-border-radius: 20px;
    	-webkit-border-radius: 20px;
    	padding:30px;
    	text-align:center;
    

For more options go to the [official CSS3 specs page for rounded corners][1]

 [1]: http://www.css3.info/preview/rounded-border/

## Transparency

This one is one of my favorites, combined with rounded corners ![:)][2] 

 [2]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_smile.gif

The way it works is simple, you can make any background color transparent by using one of several methods, I will show you the one I consider the easiest.

You know how in *normal* CSS we can select colors via the RGB color code, as in:

    color: rgb(0,0,0);
    

Well, in CSS3 we can now add a fourth parameter, that will contain the alpha information, from 0 to 1.

**Demonstration:**

Example div. CSS for it below

CSS for the example above:

    background-color:rgba(0,0,0,0.5);
    	color:#000;
    	padding:30px;
    	margin:20px;
    	border:#CCCCCC solid 2px;
    	text-align:center;
    

This effect won’t look as cool here, because the background is a plain color. Use it over textured backgrounds for a great effect!

## Rounded transparent borders!

These really look amazing, rounded, transparent borders! [Take a look at a live example][3]

 [3]: http://apuntalo.djs-music.com/

Unluckily, we cannot use rbga() colors on borders, but there is a simple workaround, embed the div you want with another one, with a padding of the size of the border (It looks better with larger borders)

**Demonstration:**

Example CSS below

CSS for the example above:  
DIV 1 (Outer div) – Note the bigger radius

    margin:20px;
    padding:20px;
    background-color:rgba(0,0,0,0.5);
    -moz-border-radius: 30px;
    -webkit-border-radius: 30px; 
    

DIV 2 (Inner div)

    padding:20px;
    text-align:center;
    background-color:#FFFFFF;
    color:#333333;
    -moz-border-radius: 20px;
    -webkit-border-radius: 20px;
    

Well, I hope you found this interesting!

## Show us your uses!

Have you already implemented any of these techniques? Please show us!  
Comment below with the URL of the site where you used the new features of CSS3