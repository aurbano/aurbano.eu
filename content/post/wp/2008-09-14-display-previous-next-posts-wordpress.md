---
author: Alex
categories:
- Technical
date: "2008-09-14"
tags:
- WordPress
title: Display previous/next posts in single or category in WordPress
aliases: [ /blog/2008/09/14/display-previous-next-posts-wordpress/ ]
outdated: true
---

This is a really good option in WordPress, yet very few know how to do it. Well the code is relatively simple, and it gives a good navigation point for users that, if they liked your article, might want to keep reading your stuff.

If you want to plainly display the next post after the one the user is reading, use the following function:

``` php
next_post_link();
```   

Now this function has several (very useful) parameters, which are:

``` php
next_post_link('format', 'link', in_same_cat, 'excluded_categories');
```    

- `Format` For example **bold**, *italics*... And so on, you can add here divs, p, span or anything you want to apply css classes or ids.
- `Link` To display a custom text instead of the post title, for example if you want \"Next post\" use:

``` php
next_post_link('%link', 'Next post in category', TRUE);
```  

- `in_same_cat` A very handy parameter if you want to display only the next post of the same category. Set to TRUE if you want it that way, or FALSE if you simply want the next post.

You can use one more parameter to exclude categories, for example:

``` php
next_post_link('%link', 'Next post in category', TRUE, '13');
```  

And now the next post will be from the same category, unless that category is 13 (The id, check in the administration panel)

If you want to exclude multiple categories you\'ll have to use the \"and\" separator. It will work like this:  
*\'1 and 5 and 15\'*  
Note: If you are using WordPress **2.2**, the concatenation method was a comma (\',\'). So you would use:  
*\'1,5,15\'*

Of course to display previous posts substitute `next` by `previous`, with everything else being the same.

Enjoy,
