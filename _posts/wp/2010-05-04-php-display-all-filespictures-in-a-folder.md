---
title: 'PHP: Display all files/pictures in a folder'
author: Alex
layout: post
permalink: /blog/2010/05/04/php-display-all-filespictures-in-a-folder/
categories:
  - PHP
  - Programming
tags:
  - gallery
  - handle
  - opendir
---

If we want to create a quick gallery of files/pictures, it is quite a pain to do so manually. And since this is some code I\'m always reusing I thought I might share it here with everyone else:

Let\'s suppose we are in the base directory (*www.mysite.com/gallery.php*) and the pictures are in a folder named pictures (*www.mysite.com/pictures/*), open gallery.php and where you want the pictures to appear, use this code:

{% highlight php linenos startinline %}
$handle = opendir(dirname(realpath(__FILE__)).'/pictures/');
while($file = readdir($handle)){
	if($file !== '.' &#038;&#038; $file !== '..'){
		echo 'pictures/'.$file;
	}
}
{% endhighlight %}

This code is really easy to understand, we first define a variable `$handle`, which will contain the handle to the absolute path of the folder (I always go for absolute paths since I find them much safer)  
`dirname(realpath(__FILE__))` returns the absolute path to the current file (*gallery.php*) and then we add to the end of it /pictures/

Then, we loop through all the files in the directory, that simple if statement I used is to prevent some the function returning . or .. as file names sometimes. We then display the image in standard html

Take care!  
Alex