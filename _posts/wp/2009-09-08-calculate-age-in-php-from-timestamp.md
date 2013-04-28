---
title: Calculate age in PHP from timestamp
author: Alex
layout: post
permalink: /blog/2009/09/08/calculate-age-in-php-from-timestamp/
categories:
  - PHP
  - Programming
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

If you ever wanted to calculate someone’s age in PHP from a birth timestamp, you must take into account that the age is more than the number of years, since days and months are also important, so I wrote a simple function that will return the exact age for a given timestamp:

    function getAge($birth){
    	$t = time();
    	$age = ($birth < 0) ? ( $t   ($birth * -1) ) : $t - $birth;
    	return floor($age/31536000);
    }
    

Basically we first get the current time and store it in a variable (To avoid having to call the function time more than once)  
Then we get the age in milliseconds (Taking into account that before 1969 timestamps are negative, thus the ternary operator)

Now we have the date in milliseconds, we divide it by the number of milliseconds in a year (60\*60\*24\*365)

And that is basically it !