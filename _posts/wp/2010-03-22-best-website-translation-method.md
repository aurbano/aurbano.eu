---
title: Best website translation method
author: Alex
layout: post
permalink: /blog/2010/03/22/best-website-translation-method/
categories:
  - PHP
  - Programming
tags:
  - gettext
  - localisation
  - translate
  - _()
---
# 

Ok your website has grown. You want it in different languages but let’s face it, it is a challenging task. I have worked on the process of translating several websites, ground up, and it really isn’t hard. It is just quite boring, but easy after all.

My preferred method is by using PHP’s built in function [gettext()][1]. If you are using a shared domain most chances are it is installed. If it isn’t, or you run a VPS or dedicated hosting, ask your hosting administrator to install it.

 [1]: http://php.net/manual/en/book.gettext.php

To check whether you have the getttext module installed run the following script:

    // Check if gettext is ready to use
    if(!function_exists("gettext")){
        echo "gettext isn't installed";
    }else{
        echo "gettext is supported!";
    }

Well once you see the message *gettext is supported!* you can carry on

## Setting up localisation:

We need php to determine the current language. There are many many ways of doing so, however my preferred method is by using subdomains. From the point of view of a Search Engine, your content is new and it has it’s own URL, and from your point of view it takes almost no extra effort.

So go to your website control panel if it is shared, if not simply create a new subdomain for each language and point it to the root. I recommend you use the standard [two-letter code from the ISO 639][2] for each subdomain. For example if my website is http://djs-music.com, I would create the new subdomain for a Spanish version: http://es.djs-music.com (These links are from the latest website I developed, in different languages, so that you can see a working example)

 [2]: http://urbanoalvarez.es/blog/2008/03/17/iso-639-2-letter-codes/

If the default language is English, I wouldn’t create a subdomain for that, I would simply leave it as default when there is no subdomain selected.

Now let’s create a new php file called *local.php,* it will handle all this, at the top, we will set up an array with the available languages, the default one… etc

Inside *local.php* place the following code, it is ready to use so you shouldn’t have to change anything:

    

Everything is explained in comments, so you shouldn’t have any problems setting the file up. You should include this as high as possible in your code, but after you start a session with *session_start();*

Of course at the moment it will not work since we are missing all the important files! So let’s move on.

## Setting up our website for translation:

We now need to indicate which portions of our website are going to be translated. We will do this by wrapping the desired pieces of text in the gettext function, which has an abbreviated name **_()**:

    echo _('Text to be translated');

If you need more advanced strings, like text strings that contain variables inside them consider the following example:

I have in my website a text string that reads: *echo “You are $years old”;* This string is special, we cannot translate *You are*, and then *old*, because in other languages (Such as Spanish it wouldn’t make sense). For cases like this we will use PHP’s function [sprintf][3]:

 [3]: http://php.net/manual/en/function.sprintf.php

(By the way, *sprintf **returns **the string, *printf **prints **the string, we use sprintf because we **need** the string **returned** in order to have it translated with gettext)

This function takes at least 2 parameters, the string, and one substitution. How it works is you place “Identifiers” inside the string, that sprintf changes for the corresponding value: Take a look at the previous example with printf:

    echo _(sprintf("You are %d old",$years));

Now we can have it translated with the age in the exact position in other languages ![:)][4] 

 [4]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_smile.gif

## Creating the translation folders and files:

We now need the .mo files that php’s gettext uses for the translations. It is very easy as you will see:

If you have already checked the configuration at the top of the *local.php* file, there were two variables called *$localePath* and *$translationFile*, leave these to the defaults for now.

Go to the root of your website and create a new folder called *locale*, inside this folder, you will have to create one new folder for each language except for the default. So if your website is already in English, and you are going to translate it to Spanish, you should create a new folder inside *locale *called *es_ES*.

Now inside each of these folders (In my example inside the folder es\_ES) you will have to create another folder called LC\_MESSAGES. So your folder structure for the example would look like this:

./

*   locale 
    *   es_ES 
        *   LC_MESSAGES
*   Other folders and files in your root…

Now that the folder structure is set up, we need to get a gettext translation program. Download and install [Poedit][5] (Note that it has Windows, Mac and Linux versions, and that it’s free)

 [5]: http://www.poedit.net/download.php

Once in Poedit, go to File -> **Catalogs manager.** A pop-up window will appear, in it click the blank page icon to create a **New Translations Project**. This is useful to have all your Catalogs for one website under the same project.

When you click on **New Translation project**, a new window appears, enter the name you desire, and in the directories, click on **New Item**, and once there enter the exact path to your project root (i.e. *C:UsernameprojectsDJs-Music* ) And click **Ok**.

Now close that and go to File -> **New Catalog**, a new window will pop up, this is a very important window:

Start in the tab **Project Info** (Default tab)

*   Project name and version: This is just to help track the translation. You can enter for now *Your Website 1.0*
*   Team: Only useful for translations with multiple teams. For example *Spanish 1*
*   Email address: Same as before… *spanish@yourwebsite.com*
*   Language: Select the language you are going to translate now (For example Spanish)
*   Charset: **IMPORTANT** Make sure it matches the charset in your website (Preferably UTF-8)
*   Source code charset: Your code charset (It’s in the configuration area, preferably UTF-8)
*   Plural forms: Leave it blank for now, that is quite advanced for now)

Now click on the tab **Paths:** Here you will have to add the paths inside your project where the php files containing strings you want to translate are. Click on the **New Item** icon to add one. If you want to add your root folder for example type **.**

If you want all files inside a folder called* /more-files/,* enter *more-files.*

Forget the tab keywords for now, it is also for more advanced translations.

Click **Ok,** and now click on the** Earth icon, **in the left column (Original string) you should see all the text strings you enclosed between the function *_()*, if you don’t see them go back and check all the previous steps.

Now go on and translate all the strings. To translate simply click on a string on the left column and enter the translation on the box at the bottom of the screen. At the bottom left you will see the translated percentage.

When you are done go to File -> **Save as,** and save it as *messages.po* inside the *LC_MESSAGES* folder for the corresponding language locale (So if this was the Spanish translation you would save this file inside *locale/es\_ES/LC\_MESSAGES/*)

As well as the *messages.po* file, you will see if you go to that folder another file called *messages.mo,* that is the one that you have to upload to your server in order for this to work.

## Check everything:

Alright so let me walk you through all the steps you should have taken:

1.  Create the file local.php and include it in every file you want to translate
2.  Create the subdomains and point them to the root
3.  Configure all the variables in local.php
4.  Wrap all the text you want to translate in _(‘*Your text here*‘)
5.  Create the folder structure and the messages.mo files using Poedit
6.  Upload everything to the server

If you did all of this, everything should work fine. You can see a working example of this in DJs Music for example: [English version][6], [Spanish version][7]

 [6]: http://djs-music.com
 [7]: http://es.djs-music.com

### How did this go? Tell me in the comments and ask me any doubt ![:)][4]