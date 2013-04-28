---
title: 'Get full domain from user&#8217;s URL in php'
author: Alex
layout: post
permalink: /blog/2008/05/28/get-full-domain-from-users-url-in-php/
categories:
  - General talk
---
# 

If you are still interested after having read that huge title, sorry, I just couldn’t put that in fewer words…  
What I’m going to post here is a php function that will create a standard url from a user-inputted url so that any string will be converted to a functioning url.

First it will convert all characters to lowercase:

    $url = strtolower($url);
    

Now add http:// if it is not at the beggining:

    if(strncasecmp('http://',$url,7) !== 0){
    	//There is no http:// at the beginning:
    	$url = 'http://'.$url;
    }
    

What strncasecmp does is it takes a string, and then a number. It then checks to see if that string is contained within the first (That second parameter) characters contain it. It returns 0 if it is found.  
So in the example it checks to see if http:// is there, and if it is not, it adds it.

Now strip all folders (This is optional, but here I will show how to make sure only the main domain is left

    $parts = explode('/',$url);
    	if(sizeof($parts) !== 1){
    		//no / in the string: (No http, no ending /)
    		$url = $parts[2];
    	}
    

So now we’ve got something like “http://{user_input}/”.  
Let’s make sure it has (or not) www. And if not, let’s add it (Just for consistency)

    if(strncasecmp('www.',$url,4) !== 0){
    	//There is no www.
    	return 'http://www.'.$url.'/';
    }else{
    	return 'http://'.$url.'/';
    }
    

Now we have “http://www.{user input}/” , we are basically done!  
If you really want to this this correctly you could check if the URL exists, but this is just a waste of traffic from my point of view…  
So if you want to do this, create the following function:

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
    

And call it from our previous script:

    If(url_exists($url)) {
         return true;
    }else{
        return false;
    }
    

### Full code now: 

So the whole thing would be something like this: 

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
    

So that is basically it!  
(This function is used for example in [my SEO analysis tool SE Crawler][1], to search for all documents in your site)

 [1]: http://urbanoalvarez.es/crawler/test.php