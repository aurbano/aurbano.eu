---
author: Alex
categories:
- Computers
- Main
date: "2008-09-12T00:00:00Z"
tags:
- BIOS
- bypass
- flash
- password
thumbnail: /assets/files/thumbnails/bios.jpg
title: 'Bypass/Flash BIOS password:'
url: /blog/2008/09/12/bypassflash-bios-password/
---

Have you ever tried to access a computer\'s BIOS settings to find they are protected? Or maybe it was you and forgot the password. Either way don\'t worry since bypassing this simple password is as simple as following the following solutions:

## Solution 1

The simplest solution, although it may not work on some computers. This solution is called a keystroke backdoor, and it bypasses the password check (Meaning that you won\'t change it or get to know it)

When prompted with the auth box, press:

    Control Shift F8
    Control Shift F8
    Backspace
    Enter
    

And if this worked you will enter normally the BIOS settings page. If you can\'t enter try a couple times to make sure or switch to the next method.

## Solution 2

Flashing the BIOS, this might be dangerous if it is the first time you do it, but it shouldn\'t be a problem if you follow this steps carefully.  
The easiest method of doing this is by removing the battery and waiting a couple minutes to ensure that it has completely turned off. Since the memory is ROM (usually flash memory), in the moment you take the battery off the data will disappear. Now put the battery back in place and switch the computer ON again.

There shouldn\'t be any problem, except for the time and date (You\'ll have to set it again).

You can flash the BIOS using the jumper you\'ll find nearby, but it depends on the manufacturer so I won\'t go into detail.

For other types of passwords you can check [ScratchDrive ][1] for some good information and free programs, although I won\'t go into detail here.  

 [1]: http://scratchdrive.com/downloads.php