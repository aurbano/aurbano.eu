---
title: Fast and dirty CSS trick for IE
author: Alex
layout: post
permalink: /blog/2010/03/11/fast-and-dirty-css-trick-for-ie/
categories:
  - CSS
tags:
  - css
  - easy
  - fast
  - fix
  - ie
  - trick
---
# 

I actually think that we the developers need IE, it is like the bad guy in an action movie, the good guy wouldn’t have a life without him, although sometimes you really wish it never existed! Haha just kidding, we all wish it didn’t exist… But well, there are some times when we need something to work, we need it fast, and we just don’t have time to care for the standards at that moment. For those times, we can use a simple trick like this:

## Underscore to comment out lines

This is probably the simplest tip, you can use underscores preceding style definitions to set them as comments… for all good browsers out there, except of course IE. This way you can easily define specific IE rules by putting an underscore before the style.

    #underscore{
    	width:300px;
    	_width:320px; /* This rule is only for IE */
    }

This way we can easily add a different width, padding, or anything to an element in order to “get it right”

## The clean way:

Now we are not going to do that with every single rule we need fixed! When we are going to fix more things, it’s **much **better to put the fixes in a different stylesheet, and link it using a *conditional statement.* Basically, we want only IE6 for example to use those fixes, how is that done?

    

**But this doesn’t validate! ** We need to find a solution then, and it is not as hard as one could think ![:)][1] 

 [1]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_smile.gif

We are going to include that, inside another *conditional comment*, but this time inside one that is valid! So we would write it as follows:

    
    
    

Now it validates! We have achieved using valid *conditional comments* to do this! I will now explain a bit more about these and how they work:

## Conditional comments at a glance

You’re smart (I hope) So let’s race through this, conditional comments allow you to tell the browser to use some parts of your html only if a specific version is running (Or not) Let me show you the options we have: (Please note that this is the html valid version for each of them)

*    To select Internet Explorer
*    Only if the browser is **not **Internet Explorer
*    Only if it is Internet Explorer 5.01 (There are other options as well)
*    To select for IE 5.5 or 6 or 7.0

We also have some keywords that will allow for more control:

*   gt = Selects greater than
*   lt = Selects less than
*   gte = Selects greater than or equal to
*   lte = Selects less than or equal to
*   ! = Selects all but what the expression says (i.e. It *negates *the expression)

For more information on conditional comments check out [this guide by **Manfred Staudinger**][2]

 [2]: http://www.positioniseverything.net/articles/multiIE.html