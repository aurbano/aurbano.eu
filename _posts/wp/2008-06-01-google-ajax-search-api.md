---
title: Google AJAX search API
author: Alex
layout: post
permalink: /blog/2008/06/01/google-ajax-search-api/
categories:
  - General talk
  - Javascript
  - Programming
  - Reviews
tags:
  - ajax
  - api
  - google
  - search
---
# 

Discover a great way to embed really customized searches in your site, use the Google search API (Using AJAX)

Here I\"ll show you how to develop a simple \"Hello world\" sort of program, using the Google API and AJAX to search.  
There are 2 requirements though you need to fulfill in order to access the API:

1.  Your web site must be freely accessible to end users. 
2.  Google will upgrade this API periodically, and you must update your site to use new versions of the API as they become available. The Gogle AJAX Search API team will post notifications of updates on the Google AJAX Search API Blog. (http://googleajaxsearchapi.blogspot.com/). 

The second one is not that much of a requirement, but something you must take care of for your search to work properly...  
So [apply for your API key][1], and take into account that a single AJAX Search API key is valid within a single directory on your web server, including any subdirectories.  
[More information on the subject][2]

 [1]: http://code.google.com/apis/ajaxsearch/signup.html
 [2]: http://code.google.com/apis/ajaxsearch/

So let\"s get going:  
This is the HTML code of a website running the AJAX search:

    < !DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    
      
      
        Loading
      
    

So that is a simple page using the search, I\"ll now go through the code explaining it:

First of all, we import Google\"s CSS style sheet from its location:

http://www.google.com/uds/css/gsearch.css

Next we import the Google AJAX search library from its location:

http://www.google.com/uds/api?file=uds.js&v=1.0

And now with the search controls:  
For the configuration we will create a function, in this case OnLoad(). This function sets up the controls for our search, and draws the searcher inside the specified div.

To start, we need a new search control, which we set up as follows:

    var searchControl = new GSearchControl();
    

So we have initialized the searcher, now define which areas we want to search in, in this case most of them:

    searchControl.addSearcher(localSearch);
          searchControl.addSearcher(new GwebSearch());
          searchControl.addSearcher(new GvideoSearch());
          searchControl.addSearcher(new GblogSearch());
          searchControl.addSearcher(new GnewsSearch());
          searchControl.addSearcher(new GimageSearch());
          searchControl.addSearcher(new GbookSearch());
    

We are using local, web, video, blog, news, image, and book searchers.

For the local search to work you need to set a \"center point\". For it to work perfectly you could use php for example and geoip to detect the location of the user and use that as center point... In the example we\"ll be using NY:

    localSearch.setCenterPoint("New York, NY");
    

Now display the searcher in the specified div (This could be any div in your site, simply reference it and it will draw the searcher inside it). In this case \"searchcontrol\":

    searchControl.draw(document.getElementById("searchcontrol"));
    

This is optional, but if you want to see it working you can set up an initial search. If you want this to work from your own search text fields, use GET or POST vars and php to set up the script to search for a given variable...  
In this case we will be searching for \"Urbano\"s Blog\":

    searchControl.execute("Urbano's Blog");
    

Be careful with the above to always strip \", because it would brake your script!

And you are basically done, simply call the OnLoad function and you are good to go!

    GSearch.setOnLoadCallback(OnLoad);
    

Hope you enjoyed it!  
Read more about this:

*   [Developer Documentation][3] @ Google Code
*   [Class and function reference][4] @ Google Code

 [3]: http://code.google.com/apis/ajaxsearch/documentation/
 [4]: http://code.google.com/apis/ajaxsearch/documentation/reference.html