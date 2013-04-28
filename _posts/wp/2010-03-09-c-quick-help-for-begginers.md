---
title: C++? Quick help for begginers
author: Alex
layout: post
permalink: /blog/2010/03/09/c-quick-help-for-begginers/
categories:
  - C++
tags:
  - begginers
  - cpp
  - guide
  - starter
---
# 

Alright I’ve seen many people who are struggling to understand C , students, developers… and many more. I will publish here an amazing a decent guide to get you started. I’m assuming you have “some” knowledge of programming (i.e. what is a variable, an integer… )

## The basics:

If you know a little about C , you can probably skip this short introduction. Basically C is a multi-purpose programming language. It is used for all sorts of applications, from simple command-line ones, to large statistical programs or videogames.

For know, you should know that you code in C using any editor you like, and then you must run a compiler to generate machine code (a .exe file) which is called an executable. But don’t worry about that yet.

## Starting up: “Hello world!”

Enough of the boring stuff, let’s get started doing some real stuff. For now I recommend you download a source code editor, like [Dev-C ][1].

 [1]: http://www.bloodshed.net/devcpp.html "Dev-C  "

First steps in Dev C :

1.  Install and open the program
2.  Close the Tips that will open up
3.  Go to File > New > Source code (Or click **Ctrl N**)

You will now see an empty page where we will write our code ![:)][2] 

 [2]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_smile.gif

### Base structure:

Our C programs will always have the same base structure for now: First we will include necessary files (I will explain later on what they are), then we will declare our *functions,* and then will go the main code.

So first things first, we will include the necessary files. In order to display on the screen “Hello World!” we are not going to set up an interface, that’s more advanced stuff. We will be using the system console (Yes, that black thing with white text on it). The file that will allow us to do that is *iostream.* So our first line will be:

    #include 

Now that we hace access to the input and output functions, we will tell the compiler that all functions we use are from there, we do that by declaring a *namespace:*

    #include 
    using namespace std;

And that is all we need in the *header*. We can now move on to the main code. In C the program executes always the code found inside a function called *main*. Whether you are on Linux, Windows, Mac, or other OS, it will be of one type or another. For Windows users it will be **int**

So let’s set up an empty main for now:

    #include 
    using namespace std;
    
    int main(){
         return 0;
    }

And finally the Hello world code, we want to display it on the screen, and the function for that is *cout* (If you are a programmer in other languages, equivlents would be *echo* or *printf*)

We must remember to add a “pause” after we display the message, to leave the console open. If we develop in a Windows environment, we can use the command *system(“pause”); *but I recommend using a more global solution like *cin.get();*

So the final program would be:

    #include 
    using namespace std;
    
    int main(){
         cout 