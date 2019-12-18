---
author: Alex
categories:
- JavaScript
- Main
date: "2013-01-21T00:00:00Z"
tags:
- draggable
- jquery
- jqueryui
- stack
thumbnail: /assets/files/thumbnails/jqueryUI.png
title: 'jQueryUI Draggable: Bring stack element to front on click'
aliases: [ /blog/2013/01/21/jqueryui-draggable-bring-stack-element-to-front-on-click/ ]
outdated: true
---

If you are developing window-like elements on HTML using jQueryUI Draggable, you are probably using the [stack][1] option to ensure that the dragged element will always be on top. But the actual goal would be for that element to be on top onFocus, and that means whenever the user clicks on the element.

 [1]: http://api.jqueryui.com/draggable/#option-stack

Exploring the jqueryUI [source code][2] for the Draggable widget we can extract the function that puts the element on top of the stack and bind it onClick for example.

 [2]: https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.draggable.js

Here is the function (Tweaked to work as a standalone function)

{{< gist aurbano 9ce7e689d8138f341aea "jqueryBringFront.js" >}}

`elem` should be the clicked element and `stack` should be the same you put in jQueryUI draggable's options. If you wanted that to happen on click, you could use:

{{< gist aurbano 9ce7e689d8138f341aea "demo.html" >}}
