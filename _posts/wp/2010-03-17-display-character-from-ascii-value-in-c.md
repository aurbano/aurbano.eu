---
title: Display character from ASCII value in C++
author: Alex
layout: post
permalink: /blog/2010/03/17/display-character-from-ascii-value-in-c/
categories:
  - C++
  - Programming
tags:
  - ascii
  - cpp
  - static_cast
---
# 

I don’t know whether this is useful or merely entertaining, but it is quite simple to display the character representation of any ASCII number in C 

We will use the static_cast function to perform this operation, converting from int to char.  
Let me show you this sample program that does just that (Looping until you enter 0)

    #include 
    using namespace std;
    
    int main(){
        int r;
        cout < < "Enter a number to see its character: n" > r;
        while(r!=0){
            cout < < "nCharacter: " > r;
        }
        return 0;
    }

As you can see we simply ask for a number, and while that number is not 0 we keep on asking for more, as well as displaying its character representation by using the static_cast function.

Hope you enjoyed this ![;)][1]  
Alex

 [1]: http://urbanoalvarez.es/blog/wp-includes/images/smilies/icon_wink.gif