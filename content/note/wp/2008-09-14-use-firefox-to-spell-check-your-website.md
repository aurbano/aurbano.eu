---
author: Alex
categories:
- Tips
- Main
date: "2008-09-14T00:00:00Z"
tags:
- check
- Firefox
- spell
thumbnail: /assets/files/thumbnails/browsers.png
title: Use the browser to spell check your website
aliases: [ /blog/2008/09/14/use-firefox-to-spell-check-your-website/ ]
outdated: true
---
 

If you maintain a website, you will surely know how important it is to never have any spelling errors in your copy. And if you really care you will always run for sure a spell checker on all your text, but isn\'t that quite over work? Wouldn\'t it be much simpler if your browser did all the spell checking without you having to worry about anything?

<div class="text-center" style="margin:20px 0">
	<a href="javascript:document.body.contentEditable='true'; document.designMode='on'; void 0" title="Drag to bookmarks bar" class="btn btn-primary">Spell check</a> Drag this button to the bookmarks bar and you'll have it.
</div>

Well, there is a very simple way of doing so, simply copy the following javascript code and paste it into the address bar (On Google Chrome you may have to rewrite `javascript:`):

``` javascript
javascript:document.body.contentEditable='true'; document.designMode='on'; void 0
```

If you find it useful, I recommend that you store that code as a bookmark, I call it Spell Check for example.

Note: I\'m not sure whether this will work or not on all browsers, I have only used it on Firefox. And by the way, if you want to change the language right click over some text (Once the spell check was applied) and in Languages select another one, remember that you can download any dictionary that you might need.

This system basically makes all the text editable, and since Firefox automatically spells checks all user input (If you set the options to do so) it will spell check the whole page !
