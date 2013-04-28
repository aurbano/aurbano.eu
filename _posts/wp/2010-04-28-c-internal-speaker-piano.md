---
title: C++ Internal Speaker Piano
author: Alex
layout: post
permalink: /blog/2010/04/28/c-internal-speaker-piano/
categories:
  - C++
  - Programming
tags:
  - cpp
  - internal
  - piano
  - speaker
---
# 

If you code in C you have probably used the internal speaker for some quick debug of your programs, in Windows, we can use the winapi header (windows.h) to access the built in function *Beep():*

    Beep(frequency,duration);

Where frequency is in Hertz and duration in milliseconds.

So here is a quick something I did on C out of boredom, it basically uses your keyboard as a piano, playing each note using the PC Internal Speaker

Here is the source code:

    #include
    #include 
    #include 
    
    using namespace std;
    
    void p(char note, bool s, int dur,int sc){
         float freq;
         switch(sc){
             case 4:
                  switch(note){
                      case 'C': (!s)?freq=130.81:freq=138.59; break;
                      case 'D': (!s)?freq=146.83:freq=155.56; break;
                      case 'E': (!s)?freq=164.81:freq=164.81; break;
                      case 'F': (!s)?freq=174.61:freq=185.00; break;
                      case 'G': (!s)?freq=196.00:freq=207.65; break;
                      case 'A': (!s)?freq=220.00:freq=233.08; break;
                      case 'B': (!s)?freq=246.94:freq=246.9; break;
                 }
                 break;
             case 5:
                 switch(note){
                      case 'C': (!s)?freq=261.63:freq=277.18; break;
                      case 'D': (!s)?freq=293.66:freq=311.13; break;
                      case 'E': (!s)?freq=329.63:freq=329.63; break;
                      case 'F': (!s)?freq=349.23:freq=369.99; break;
                      case 'G': (!s)?freq=391.00:freq=415.30; break;
                      case 'A': (!s)?freq=440.00:freq=466.16; break;
                      case 'B': (!s)?freq=493.88:freq=493.88; break;
                 }
                 break;
         }
         Beep(freq,dur);   
    }
    void piano(char n){
        switch(n){
              case 'a': p('E',false,200,4); break;
              case 's': p('F',false,200,4); break;
              case 'd': p('G',false,200,4); break;
              case 'f': p('A',false,200,4); break;
              case 'g': p('B',false,200,4); break;
              case 'h': p('C',false,200,5); break;
              case 'j': p('D',false,200,5); break;
              case 'k': p('E',false,200,5); break;
              case 'l': p('F',false,200,5); break;
              case 'ñ': p('G',false,200,5); break;
              case '´': p('A',false,200,5); break;
              case 'ç': p('B',false,200,5); break;
              // Mayor
              case 'q': p('D',true,200,4); break;
              case 'w': p('E',true,200,4); break;
              case 'e': p('F',true,200,4); break;
              case 'r': p('G',true,200,4); break;
              case 't': p('A',true,200,4); break;
              case 'y': p('B',true,200,5); break;
              case 'u': p('C',true,200,5); break;
              case 'i': p('D',true,200,5); break;
              case 'o': p('E',true,200,5); break;
              case 'p': p('F',true,200,5); break;
              case '`': p('G',true,200,5); break;
              case ' ': p('A',true,200,5); break;
         }
    }
    
    int main(){
        char m;
        while(m!='1'){
            if(kbhit()){
                m=getch();
                piano(m);
            }
        }
        return 0;
    }

This will only work in computers with an internal speaker installed, yours probably has one if it “beeps” when it turns on. Although it may have it even if that doesn’t happen, it doesn’t work on Windows Vista x64 and Windows XP 64-Bit Edition though

Best regards,  
Alex