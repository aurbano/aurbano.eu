---
title: Overloading input/output operators C++
author: Alex
layout: post
permalink: /blog/2010/03/17/overloading-inputoutput-operators-c/
categories:
  - Cpp
  - Programming
tags:
  - class
  - cpp
  - istream
  - ostream
  - overload
---
# 

As you might know, when we develop a simple program that runs in the system console, using the standard library *iostream*, we might want to have special ways of displaying a class object.

You have probably heard of the istream and ostream operators (>),  we can use overloading to change their behaviour.

Since they are not functions from our class, we must use a special keyword, *friend.* A friend function is neither public or private, our class doesn’t control it’s scope. They are classes that don’t belong to a class, but have access to its private members.

Let’s create a simple class to demonstrate this:

    class simple{
          int a,b;
    public:
          friend ostream &#038; operator <  s.a >> s.b;
                return i;
          } 
    };
    

This class has two private members, a and b. I haven’t created any constructors as we don’t really need them for the example. We will change the values of a and b using the input operator >> and we will display them using the output operator > obj;
           cout < < "nDisplay my simple object: ";
           cout  to give a and b some values.

After that we display the values using the output operator  s.b;
                return i;
          } 
    };
    
    main(){
           simple obj;
           cin >> obj;
           cout < < "nDisplay my simple object: ";
           cout 