---
author: Alex
categories:
- WordPress
- Main
date: "2008-09-11T00:00:00Z"
tags:
- assign
- image
- php
- post
- WordPress
thumbnail: /assets/files/thumbnails/wordpress.png
title: Easily assign an image to a post in WordPress
url: /blog/2008/09/11/assign-image-to-wordpress-post/
---
 

Have you ever wondered how to assign an image to a certain post using WordPress? Surely there are some plugins that try to do this, and maybe they accomplish it, but probably slowing down your blog.

Well, here is a way of doing it without slowing the blog or installing any sort of additional plugins. When you are done writing your post, upload an image to a directory that you will use for this, for example: \"www.yoursite.com/post_images/\". And I recommned that you name the image something that has to do with the post, it will help you if you need to edit it.

Now in the writing are scroll down until you see the tab \"Custom fields\":

![Assigning images to posts][1]

And fill in the following information:

 [1]: http://static.urbanoalvarez.es/img/blog/assigning_images.gif

    Key: post_image
    Value: image_name.jpg
    

The key must be always the same, in this example it will be post\_image. And the value will be the name of the image that we uploaded. In the example it is assigning\_images.jpg

And that\'s it for now. The next step is including this images into our template.

## Add the image to the template:

As you can see under the tab Custom Fields there is [a link to the WordPress codex][2], where they explain the functions we\'ll use for this, so consult that if you have any doubts.

 [2]: http://codex.wordpress.org/Using_Custom_Fields

So here is the code to display the image (It must be inserted inside [the Loop][3]):

 [3]: http://codex.wordpress.org/The_Loop
 
{{< highlight php "linenos=table,startinline" >}}
if(get_post_meta($post->ID, 'post_image',true)){
	//There is an image assigned:
	echo '<img src="http://yourblog.com/post_images/'.get_post_meta($post-/>ID,'.
		 'post_image',true).'" />';
}
{{< / highlight >}}

Note that if you copy and paste the code before you\'ll have to delete a / in `$post->ID` because WordPress is adding it automatically.  
Of course this is the most basic approach, but hopefully you will understand the method and will be able to work on it.  
At the moment I am using it to display thumbnails on the archive excerpts (They are not live yet, I\'m still testing) and it is a very easy and fast way of doing it.

If you ever need to edit either the image or the meta-data simply re-upload the picture or edit the post.

Cheers,