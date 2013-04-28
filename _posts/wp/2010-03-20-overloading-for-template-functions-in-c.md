---
title: 'Overloading << and >> for template functions in C++'
author: Alex
layout: post
permalink: /blog/2010/03/20/overloading-for-template-functions-in-c/
categories:
  - Cpp
  - Programming
tags:
  - istream
  - operators
  - ostream
  - overload
  - stl
  - templates
  - vector
---
# 

You probably know that the ostream and istream operators (>) can be overloaded for your custom classes, but let’s take a look at how to overload them for template classes like the vector class.

## Overloading for template functions

The way this is done is by placing the keyword *template *before the function. After template we have to specify the type, or we can use a generic type T. Let me illustrate this with an example:

    // Overloading for a template of type int. For example vector
    template myFunction(){}
    
    // Overloading for any type
    template myFunction(){}

Alright so now that you know how to overload a template function, let’s see how to overload them for the ostream and istream operators.

For this example I will assume we are working with the STL Vector library, and the way I will modify the operators is the following:

*   For the ostream operator () I will ask first for the size and then each of it’s elements.

Let’s see those functions:

    template ostream &#038; operator <  holder;
               v.push_back(holder);
          }
          return i; 
    }

The only thing to take into account here is the holder variable I have created in the istream overloaded operator. Instead of directly using i >> v[a]; because that would throw an error, I created a variable holder of type T (The same as the vector) and then we “hold” the vector element before adding it to the vector v.

Notice that in the istream operator we don’t create the vector and then return it, because we already have it’s reference in v. We use push_back because v could have no elements.

## In practice:

Let me show you a rather simple main using this two operators with two vectors of type int and float to show you that it works with any type of data.

    #include 
    #include 
    using namespace std;
    
    template ostream &#038; operator <  holder;
               v.push_back(holder);
          }
          return i; 
    }
    
    int main(){
        // Creamos dos vectores a y b
        vector a;
        vector b;
        
        // Usando el operador sobrecargado de extraccion les damos valores:
        cout < < "Please enter the size of a vector of integers, then its elements: ";
        cin >> a;
        cout < < "nNow the same with floats for another vector: ";
        cin >> b;
        
        // Y finalmente los mostramos por pantalla:
        cout < < "nThe values of both vectors (First the size then the elements): ";
        cout 