---
title: 'Get full domain from user&#8217;s URL in php'
author: Alex
layout: post
permalink: /blog/2008/05/28/get-full-domain-from-users-url-in-php/
categories:
  - PHP
---
 > This article was imported to Jekyll from my old Wordpress blog using a plugin, and it may have some errors.

What I\'m going to post here is a php function that will create a standard url from a user-inputted url so that any string will be converted to a functioning url.

First it will convert all characters to lowercase:

{% highlight php  %}
    $url = strtolower($url);
{% endhighlight  %}

Now add http:// if it is not at the beggining:

{% highlight php  %}
    if(strncasecmp('http://',$url,7) !== 0){
    	//There is no http:// at the beginning:
    	$url = 'http://'.$url;
    }
{% endhighlight  %}  

What `strncasecmp` does is it takes a string, and then a number. It then checks to see if that string is contained within the first (That second parameter) characters contain it. It returns 0 if it is found.  
So in the example it checks to see if http:// is there, and if it is not, it adds it.

Now strip all folders (This is optional, but here I will show how to make sure only the main domain is left

{% highlight php  %}
    $parts = explode('/',$url);
	if(sizeof($parts) !== 1){
		//no / in the string: (No http, no ending /)
		$url = $parts[2];
	}
{% endhighlight  %}

So now we\'ve got something like \"http://{user_input}/\".  
Let\'s make sure it has (or not) www. And if not, let\'s add it (Just for consistency)

{% highlight php  %}
    if(strncasecmp('www.',$url,4) !== 0){
    	//There is no www.
    	return 'http://www.'.$url.'/';
    }else{
    	return 'http://'.$url.'/';
    }
{% endhighlight  %}

Now we have \"http://www.{user input}/\" , we are basically done!  
If you really want to this this correctly you could check if the URL exists, but this is just a waste of bandwidth and opens a door for attacks from my point of view...  
So if you want to do this, create the following function:

{% highlight php linenos %}
    function url_exists($strURL) {
        $resURL = curl_init();
        curl_setopt($resURL, CURLOPT_URL, $strURL);
        curl_setopt($resURL, CURLOPT_BINARYTRANSFER, 1);
        curl_setopt($resURL, CURLOPT_HEADERFUNCTION, 'curlHeaderCallback');
        curl_setopt($resURL, CURLOPT_FAILONERROR, 1);
    
        curl_exec ($resURL);
    
        $intReturnCode = curl_getinfo($resURL, CURLINFO_HTTP_CODE);
        curl_close ($resURL);
    
        if ($intReturnCode != 200 &#038;&#038; $intReturnCode != 302 &#038;&#038; $intReturnCode != 304) {
           return false;
        }Else{
            return true ;
        }
    } 
{% endhighlight %}

And call it from our previous script:

{% highlight php linenos %}
    If(url_exists($url)) {
         return true;
    }else{
        return false;
    }
{% endhighlight %}

### Full code now: 

So the whole thing would be something like this: 

{% highlight php  %}
    //Function to make main domain from url:
    function url_exists($strURL) {
        $resURL = curl_init();
        curl_setopt($resURL, CURLOPT_URL, $strURL);
        curl_setopt($resURL, CURLOPT_BINARYTRANSFER, 1);
        curl_setopt($resURL, CURLOPT_HEADERFUNCTION, 'curlHeaderCallback');
        curl_setopt($resURL, CURLOPT_FAILONERROR, 1);
    
        curl_exec ($resURL);
    
        $intReturnCode = curl_getinfo($resURL, CURLINFO_HTTP_CODE);
        curl_close ($resURL);
    
        if ($intReturnCode != 200 &#038;&#038; $intReturnCode != 302 &#038;&#038; $intReturnCode != 304) {
           return false;
        }Else{
            return true ;
        }
    } 
    //And now the function
	function domain($url,$checkIfExists=0){
		//This function creates a url in the form http://www.domain.com/
		$url = strtolower($url);
		if(strncasecmp('http://',$url,7) !== 0){
			//There is no http:// at the beginning:
			$url = 'http://'.$url;
		}
		$parts = explode('/',$url);
		if(sizeof($parts) !== 1){
			//no / in the string: (No http, no ending /)
			$url = $parts[2];
		}
		//Now check if the url has or not www. in it:
		if(strncasecmp('www.',$url,4) !== 0){
			//There is no www.
			return 'http://www.'.$url.'/';
		}else{
			return 'http://'.$url.'/';
		}
		if($checkIfExists !== 0){
			//User wanted to check if exists:
			If(url_exists($url)) {
				return $url;
			}else{
				return false;
			}
		}
	}
{% endhighlight %}
