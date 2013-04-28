---
title: Parse links in user comments
author: Alex
layout: post
permalink: /blog/2009/09/13/parse-links-in-user-comments/
categories:
  - PHP
  - Programming
tags:
  - link
  - parse
  - parser
  - php
  - regexp
  - url
---
# 

When you allow users to comment and post stuff to your website, it is interesting and useful allowing them to post links and other stuff. But how can we do so easily?  
Surely there is BBCode, phpBB, allowing only some HTML tags… etc but how *easy* is this approach for the end user? Of course some users will be familiar with BB code, or with HTML; others will be curious enough to learn how to use it, but most won’t. And we want our users to be able to do so.

## The solution: URL Parsing

How about this: They simply post the URL of whatever they want to include (A link, a picture, a YouTube video… ) and we detect that, and take the corresponding action.

First of all we need something that detects links, I have written a simple regexp to do so:

    function parse($text){
    		return preg_replace_callback('@(https?://([-w.] ) (:d )?(/([w/_.-]*(?S )?)?)?)@', 'parseUrl', $text);
    	}
    

This is valid for almost all URLs, as long as http is the beggining. This function calls a *callback function* whenever a URL is found, called parseURL, which will then take care of the URL.

### parseURL

Now that the URL is found, we need to take care of it: The url is stored in a parameter returned from the function preg\_replace\_callback. It is contained in the first element of the returned array.

    function parseURL($url){
           $link = $url[0];
    }
    

We will parse the full url with a built-in function called parse_url(), which will return the following data:

*   scheme – e.g. http
*   host
*   port
*   user
*   pass
*   path
*   query – after the question mark ?
*   fragment – after the hashmark #

To get the file format we will check the extension:

    $ext = substr(strrchr($url['path']),'.'),1);
    

Image formats:

    $imgs = array('jpg','jpeg','gif','png','tif'); // You can write more if you want, this is only an example
    

Now let’s check if it is or not an image:

    if(in_array($ext,$imgs)){
              return '![This is a picture][1]';
    }
    

 [1]: '.$link.'

This way if a user inserts a link to a picture, the picture is displayed. You can now add a link, or change in any way the result of this.

If it is a YouTube video it would also be good to embed it, so we will first check if it is:

    if(eregi('^(www.)*(youtube.).{2,3}$',$url['host'])){ // Check for youtube video
    	return youtubeEmbed($url['query']);
    }
    

As you can see, if the link comes from youtube, we will embed it using our custom function youtubeEmbed:  
youtubeEmbed()

    function youtubeEmbed($params){
    		parse_str($params);
    		if(substr($v , strlen($v)-3 ,3) == '