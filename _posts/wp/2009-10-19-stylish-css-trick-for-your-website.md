---
title: Stylish CSS trick for your Website
author: Alex
layout: post
permalink: /blog/2009/10/19/stylish-css-trick-for-your-website/
categories:
  - CSS
tags:
  - css
  - elegant
  - shadow
  - stylish
  - trick
---
# 

Maybe a few of you noticed this on some websites, maybe some of you even use it.  
Right now this works in *Safari*, *Opera*, and *Konqueror* and *Firefox 3.x*. (I think it doesn’t work in Firefox 1 or 2, correct me if I’m wrong)

What I’m talking about is the **text-shadow**, *wisely *applied to your design, it can give an great touch of elegance to your site.  
Here you have an example:

![Before -> After][1]

And here you have a coded example:

 [1]: http://urbanoalvarez.es/blog/wp-content/uploads/2009/10/bef-aft.gif "Before -> After"

Test shadow

## The code

The CSS for this is very simple, we will simply apply a slight text-shadow, of 1px with no blur, to the text:

    .elegant{
    text-shadow:#FFFFFF 0 1px;
    }
    

This effect works best with dark grey text over light grey background, and it is a very useful style for “2.0″ designs.

Hope you enjoyed it!  
Alex