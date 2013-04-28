---
title: 'iPhone web development [Part 1]'
author: Alex
layout: post
permalink: /blog/2010/05/05/iphone-web-development-full-guide/
categories:
  - CSS
  - iPhone
tags:
  - apple
  - compatible
  - design
  - development
  - iPhone
  - ipod
  - mobile
  - smartphone
  - web
---
# 

[![][2]][2]Even if websites look great when seen on iPhones, having an iPhone-specific website improves a lot your site’s usability, and in spite of what you may think, it doesn’t take that long to develop it, here I will show all the necessary steps to develop a great site for iPhones, and making it look as if it were just another iPhone App.

 []: http://urbanoalvarez.es/blog/wp-content/uploads/2010/04/iphone3g.jpg

## How to differentiate both versions:

There are several ways of setting up the iPhone version, the most common one is by using a subdomain like m.urbanoalvarez.es, iphone.urbanoalvarez.es… etc

You could also use a subdirectory like urbanoalvarez.es/iphone/ or simply do nothing, and just change the display. This last option is no recommended because it won’t allow your users to easily switch between iPhone version and full version when on their phones.

For this example I will go with a subdomain, of the sort iphone.urbanoalvarez.es. The next thing we need is to send iPhone users directly there, here is the PHP code for that:

    if(ereg('iPhone',$_SERVER['HTTP_USER_AGENT']) || ereg('iPod',$_SERVER['HTTP_USER_AGENT'])) {
         header('Location: iphone.urbanoalvarez.es');
    }

Basically we are searching for iPhone or iPod in the [user agent][2] which for the iPhone is “*Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420 (KHTML, like Gecko) Version/3.0 Mobile/1A543a Safari/419.3*” and if we find that one, or the iPod one, we send them over to the mobile version.

 [2]: http://wikipedia.org/wiki/Agente_de_usuario

## The basic HTML:

[![iPhone screenshot][4]][4]
iPhone screenshot

  
For an iPhone version of a website, I think the best idea is to make it look as if our website is just a regular App. So we won’t allow Zoom, or horizontal scroll. This part is very easy, as Apple has enabled a meta tag that does just that:

 []: http://urbanoalvarez.es/blog/wp-content/uploads/2010/05/IMG_0983.png

    

I don’t think there is much need to explain each variable as their names are pretty self-explanatory. This was the only real “iPhone-specific code” we will be using, except for a few CSS tricks I’ll show you below.

Now that we have that set up, let’s go with the body content, as you may have noticed in iPhone Apps, there is a header bar, with the Website name and/or logo, and usually a “back” navigation button. Then in the center we find a background and the content displayed in nice white boxes with rounded corners. And at the bottom of the screen we see a secondary bar with navigation items, usually the main categories. This is nice, but when using Mobile Safari, that would create a duplicated bar, since Safari has it’s one one at the bottom.

So I suggest we keep the top bar for the website name and/or logo, and we put the navigation right below it. With a bit of clever JavaScript we will be able to keep that nav bar always at the top of the screen solving the problem of navigation.

This is a little preview of the HTML structure:

    
    
    
    
    
    	
    # My Website
        
    
    
        	
    ## About this website:
        	
    
    
                Some text in a nice rounded box
            
            
    
    ## Some links:
            
    
    
                
    
                    
    *   [Element 1][4]
                    
    *   [Element 2][4]
                    
    *   [Element 3][4]
                    
    *   [Element 4][4]
                    
    *   [Element 5][4]
                
            
            
    
    &copy; UrbanoAlvarez.es
        
    
    

 [4]: #

Here you can see a very simple HTML markup, with all the content inside a wrap, and then inside boxes. To create the effects such as rounded corners, shadows… etc we can make use of Webkit’s advanced [CSS3][5] features, which all work on the iPhone luckily!

 [5]: http://www.css3.info/

So let’s start styling all of that!

## The CSS:

If we want to stay with an iPhone-like design, we will have a top bar with the logo, and maybe a search button, and below that with a light background our content. Each “box” of content will be of white background and with nice rounded corners. This will make our website resemble a lot the look of a real iPhone.

    

As you can see this CSS code uses a lot of CSS3 selectors and properties, since they are fully supported on the iPhone. This makes our live a lot easier, specially when dealing with rounded corners, shadows, alternating row colors… etc

I have just designed [a very simple site][6] to show you how this can be achieved.  
The background image and the arrows are from the great [WP Touch plugin][7].

 [6]: http://urbanoalvarez.es/blog/iphone/index.htm
 [7]: http://www.bravenewcode.com/products/wptouch/

## Next release:

This was Part 1 of my Full guide to web development on the iPhone, and it was the basics. In my next part we will add some JavaScript functionality to ensure a smooth user interaction with the site, different CSS rules for landscape and portrait mode, and some other advanced things we can do to make our site stand out from the crowd,

Take care!  
Alex