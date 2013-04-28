---
title: Play a sound via JavaScript
author: Alex
layout: post
permalink: /blog/2010/05/03/play-a-sound-via-javascript/
categories:
  - Javascript
  - Programming
tags:
  - javascript
  - js
  - pause
  - play
  - sound
---
# 

Working in a project recently I found myself in the need of playing a sort of “alert” sound with JavaScript. It turns out there are not so many good options out there. The first thing that came to my mind was to use an embed and the Play and Stop JavaScript controls.

Well that only works in IE and some versions of Netscape so let’s just forget about all those tags (*embed*, *bgsound*… etc)

So in my search for an easy solution I came across a very neat jQuery plugin that does exactly that job, the jQuery Sound Plugin by [Jorn Zaefferer][1]. I have been completely unable to find the plugin Website, so I will post it’s code myself here. This plugin is a port from scriptaculous’ version by Jules Gravinese.

 [1]: http://bassistance.de

## How to use:

Using this to play a sound couldn’t be easier, let’s see an example with no parameters except for the file we want to play:

    $.sound.play('files/sample.mp3')

This way the mp3 file sample will start playing. If we prefer the sound to start playing stopping the previous one, we can use *tracks*, this way we can play one sound per track, and every time we set a new sound for a certain track it stops the current sound there:

    $.sound.play('files/sample.mp3',{
       track: "track1"
    });

Other options are:

    // timeout: Specify for how long the sound can play in milliseconds
    $.sound.play('files/sample.mp3', {
       timeout: 4000
    });

We can store a sound reference in an object so that we can later on stop it:

    var sound = $.sound.play('files/sample.mp3');
    sound.remove();

And finally we have the option to enable/disable sounds at all:

    $.sound.enabled = false;
    $.sound.enabled = true

## The plugin code:

    (function($) {
    $.sound = {
    	tracks: {},
    	enabled: true,
    	template: function(src) {
    		return '';
    	},
    	play: function(url, options){
    		if (!this.enabled)
    			return;
    		var settings = $.extend({
    			url: url,
    			timeout: 2000
    		}, options);
    		if(settings.track){
    			if (this.tracks[settings.track]) {
    				var current = this.tracks[settings.track];
    				current.Stop && current.Stop();
    				current.remove();  
    			}
    		}
    		var element = $.browser.msie
    		  	? $('').attr({
    		        src: settings.url,
    				loop: 1,
    				autostart: true
    		      })
    		  	: $(this.template(settings.url));
    		element.appendTo("body");
    		if (settings.track) {
    			this.tracks[settings.track] = element;
    		}
    		setTimeout(function() {
    			element.remove();
    		}, options.timeout)
    		return element;
    	}
    };
    })(jQuery);

I will probably minify this code before I upload it to the production server, so if I don’t forget I will also post here the minified version,

Hope you found it useful,  
Alex