---
title: Extract HTML from XML in a jQuery AJAX request
author: Alex
layout: post
permalink: /blog/2010/05/25/extract-html-from-xml-in-a-jquery-ajax-request/
categories:
  - AJAX
  - XML
tags:
  - ajax
  - html
  - jquery
  - XML
---
# 

This is a bit tricky when you are parsing XML with jQuery. As you will realize, all HTML passed is ignored, and only the text is displayed. I have seen many people do this, which unfortunately **won’t work**!

    $(xml).find('element').each(function(){
    	if($(this).text() < 0){
    		alert($(this).text())
    	}
    });

Now this will throw an error, you **can't **take HTML from XML attributes like that!, you have to use *$(this).text() *as your function. So how will we do this?

The solution is very simple, where you generate the XML, make sure you wrap the html code with the CDATA marker as follows:

    Some HTML code here

And that will work perfectly!