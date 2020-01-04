---
author: Alex
categories:
- Technical
date: "2009-06-29T00:00:00Z"
tags:
- Radio
title: Online radio - Setting it up & hosting it
aliases: [ /blog/2009/06/29/online-radio-setting-it-up-hosting-it/ ]
outdated: true
---

Audio being broadcasted via the Internet. So that means that we generate an audio stream that listeners cannot control, other than pausing and resuming.  
To launch one we need several things, to start off, we need a server with streaming capabilities. Since setting up a streaming server might be difficult, we will use a standard radio management program. The main ones are [SHOUTcast][1], [IceCast][2], [Live365][3]...

 [1]: http://www.shoutcast.com/
 [2]: http://www.icecast.org/
 [3]: http://www.live365.com/

I will focus on SHOUTcast, since it is the most extended among web hosts.

## Radio server: SHOUTcast

First off, we need a server to host our radio. Radio servers are not the same as standard web hosting servers, since they require a static IP for the radio, and streaming capacity. Most radio servers use SHOUTcast to manage the radio, and I personally recommend it for its easy of use.  
From the SHOUTcast documentation:

> \"The magic of the SHOUTcast Radio system happens inside the SHOUTcast Radio Distributed Network Audio Software (DNAS). This software runs on a server attached to your IP network with lots of bandwidth, and is responsible for receiving audio from a broadcast source, updating the SHOUTcast Radio directory with information about what the broadcaster is sending, and sending the broadcast feed to listeners\"

## Finding a good hosting solution:

There are plenty of radio hostings out there, and finding the best one is almost impossible. There are some key things that we must always take into account:

*   **Bitrate**: This means bits per second, or kilobits normally (kbps) It represents the audio quality, and the higher the better. *128kbps* should be perfect for most stations.
*   **Bandwidth**: This is the same as a standard web hosting server, but you must realize that the radio will be constantly streaming audio, so a huge bandwidth will be needed. 100Gb should be the least, and 300-500Gb will be perfect.
*   **Listeners**: Online radios have a simultaneous listener limit, and that is a key factor when choosing a hosting plan. I strongly recommend a minimum of 50 listeners, although if you plan on growing 100-300 should be ok to start.

Disk space and other features such as PHP or MySQL are important as well, but nothing compared to the ones above. An ideal radio hosting plan should cost between 20-50$, have 128kbps, 300-500Gb, 500Gb bandwidth limit, and 400-600 listeners.

The one I prefer the most is [GlowHost][4], which offers a [great solution for SHOUTcast hosting][5], starting with a basic package at 25$/month, and 250 listeners.

 [4]: http://glowhost.com/
 [5]: http://glowhost.com/hosting/shoutcast/index.php

## Broadcasting

The nice thing about all this: Broadcasting from your home. And it is as simple as getting a program that works with broadcasting, there are 3 main ones:

*   [WinAmp][6]: (Free) A standard audio player, that will let you play music to your radio as well as talk though a mic.
*   [Virtual DJ][7]: (Commercial) Quite more sophisticated that WinAmp, it will allow you to do more complex mixes of the music, as well as talk via the mic.
*   [SAM Broadcaster][8]: (Commercial) Probably the most professional solution for online radios, packed with features and goodies!

 [6]: http://www.winamp.com/
 [7]: http://www.virtualdj.com/
 [8]: http://www.spacialaudio.com/?page=sam-broadcaster

If you are going to broadcast from WinAmp you will first need to install the [DSP plugin][9].

 [9]: http://yp.shoutcast.com/downloads/shoutcast-dsp-1-9-0-windows.exe

Also, take into account that when prompted for name and password, you can use any name you want, and then in the password field, you must write your username : and the password (i.e. *username:password*)

## Important features

When setting up an online radio station it is vital to ensure that there will be something playing 24/7, so something like [AutoDJ for SHOUTcast][10] is perfect. AutoDJ will take all mp3 files in a folder you specify, and play them as a playlist any time there is no one broadcasting in your station, so it will fill up perfectly the spaces between shows and the times when there is no one available.

 [10]: http://www.wavestreaming.com/servers/auto-dj/

It is enabled in most radio hosts by default, and if it isn\'t you can normally request it free of charge. Setting it up is very easy, and it only requires having some mp3 files in a folder, that\'s why it is convenient to have enough disk space.

## Playing the radio

SHOUTcast and most radio software include a set of scripts that will play the radio online, as well as showing information about current song, listener number... But they are not the best.  
Ideally, you will include the radio in your website using a flash player, so that you can blend it nicely in the design. For this task I recommend the JW Player.

### JW Player for online radio

In order to use it you must make sure SHOUTcast is set to stream in mp3. And then go to the link \"Setup Flash Player\". In the code they give you, you will find the radio address for the mp3 stream.

Where it says IP and PORT, the corresponding IP and PORT of your radio will appear. You can directly embed this, or customize it. In order to do so, you can use the skings in the JW Player\'s website, or simply create yourself one, providing you have enough knowledge of Flash.
