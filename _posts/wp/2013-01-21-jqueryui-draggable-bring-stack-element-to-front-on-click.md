---
title: 'jQueryUI Draggable: Bring stack element to front on click'
author: Alex
layout: post
permalink: /blog/2013/01/21/jqueryui-draggable-bring-stack-element-to-front-on-click/
categories:
  - Javascript
  - Programming
tags:
  - draggable
  - jquery
  - jqueryui
  - stack
--- 

> This article was imported to Jekyll from my old Wordpress blog using a plugin, and it may have some errors.

If you are developing window-like elements on HTML using jQueryUI Draggable, you are probably using the [stack][1] option to ensure that the dragged element will always be on top. But the actual goal would be for that element to be on top onFocus, and that means whenever the user clicks on the element.

 [1]: http://api.jqueryui.com/draggable/#option-stack

Exploring the jqueryUI [source code][2] for the Draggable widget we can extract the function that puts the element on top of the stack and bind it onClick for example.

 [2]: https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.draggable.js

Here is the function (Tweaked to work as a standalone function)

{% highlight javascript %}
    function bringFront(elem, stack){
    	// Brings a file to the stack front
    	var min, group = $(stack);
    	
    	if(group.length < 1) return;
    	min = parseInt(group[0].style.zIndex, 10) || 0;
    	$(group).each(function(i) {
    		this.style.zIndex = min   i;
    	});
    	
    	if(elem == undefined) return;
    	$(elem).css({'zIndex' : min   group.length});
    }
{% endhighlight %}

**elem** should be the clicked element and **stack** should be the same you put in jQueryUI draggable's options. If you wanted that to happen on click, you could use:

{% highlight javascript %}
    $('.drag').bind('click',function(){ bringFront($(this), '.drag'); });
{% endhighlight %}

I hope this helps