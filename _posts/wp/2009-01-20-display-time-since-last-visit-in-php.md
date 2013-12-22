---
title: Display time since last visit in PHP
author: Alex
layout: post
permalink: /blog/2009/01/20/display-time-since-last-visit-in-php/
categories:
  - PHP
tags:
  - last
  - since
  - time
  - visit
---
# 

Have you ever seen those social networking sites that display the time since your last visit? They do it in a very neat way actually, that is a lot more friendlier that simply \"Last login date...\"

Well, this little php snippet will allow you to display messages like \"Last visit was 4 days ago\" or \"2 weeks ago\" or whatever it was, up to a year.

To use simply include the function in your code and then you\'ll need two timestamps to compare. One is the one that should be in the database, and it should be the date of the last user activity on the site, or the last time user logged in. The other would be normally the current time ( time() )

    function timeBetween($start,$end,$after=' ago',$color=1){
    	//both times must be in seconds
    	$time = $end - $start;
    	if($time < = 60){
    		if($color==1){
    			return 'Online';
    		}else{
    			return 'Online';
    		}
    	}
    	if(60 < $time &#038;&#038; $time 