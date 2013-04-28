---
title: 'C++ Quick guide: STL Vector'
author: Alex
layout: post
permalink: /blog/2010/03/21/c-quick-guide-stl-vector/
categories:
  - Cpp
  - Programming
tags:
  - cpp
  - functions
  - library
  - stl
  - template
  - vector
---
# 

In C we have what’s called the [Standard Template Library (STL)][1] which provides a lot of useful shortcut functions that will help us develop our code.

 [1]: http://www.cppreference.com/wiki/stl/start

Today I wanted to show you the basics of the vector library. How arrays will go from being a nightmare to the easiest thing ever in our C applications. If you have ever programmed anything in PHP, you’ll realize that with the vector template, arrays become something quite similar as those in PHP.

## Usage:

First, include the vector file using a normal include:

    #include 

We now have access to all of its functions. Let’s see them in a sort of logical order.

## Constructors:

We will use these to create our arrays, the way they work is very simple, we will use the keyword *vector*, followed by the type of data it will hold placed between < and >, for example *vector* and then the name of our array.

    // Creates a new vector a
    vector a;
    // Creates a new vector b, copy of a
    vector b(a);
    // Creates a new vector c, with 4 elements
    vector c(4);
    // Creates a new vector d, with 3 elements, each with a value of 10
    vector d(3,10);

Now that we have the vectors initialized, let’s learn how to do stuff with them:

## Basic operations:

Using our newly created vectors is very easy:

    // I'll be using our previously created vectors
    // Check this out, a hadn't any space assigned, but C   extends it so that I can do this! :
    a[0] = 4;
    b = a;
    // Now c[1] is 4! :
    c[1] = b[0];
    // c[0] is now 8:
    c[0] = c[1] b[0];

Well as you have seen it’s very easy to operate with them, let’s now move on to some more advanced stuff:

## Adding elements to our vector:

Before getting into vector functions I want to explain the use of iterators. An iterator is a pointer to an element in an array. We use them to walk through the array, element by element. This is how we set an iterator up:

    vector::iterator iter

There are a number of functions for this task, let’s see some of them:

### insert()

The function insert adds elements to a vector. There are several ways of doing so, I will show you each commented below:

    // Let's set iter to after the last element
    iter =  v.end();
    // Now insert a 5 at that position
    iter = v.insert(iter, 5);
    // We can also insert multiple elements:
    iter = v.insert(iter, 5, 3); // This inserts 5 integers of value 3 at iter position
    

### push_back()

This is more common than insert, it adds an element at the end of our vector:

    v.push_back(6); // This adds a 6 at the end of v, expanding it if necessary

### assign()

assign replaces elements in a vector, returning their position:

    iter = 	v.assign(4, 10); // This will replace all elements in v with 4 copies of the integer 10

## Removing elements from our vector:

Remember that for all my examples I am using the previously created vector v and the iterator iter. Let’s take a look now at some functions for removing elements from our vectors:

### erase()

Probably the most used function for this task, it usually takes one argument, an iterator pointing to the element we want to remove. We can also pass directly the number of that element:

    v.erase(2); // Removes element at position 2
    iter = v.erase(iter); // Removes element at position iter and then returns the next position

erase() can also be used with two iterators instead of one, to remove elements in that range, for example:

    v.erase(0,3); // To remove elements from 0 to 3

The same could be done with two iterators pointing to different elements.

### pop_back()

This function removes the last element of a vector.

    v.pop_back();

### clear()

Be careful with this function! As you can guess, it removes **all** elements from a vector,

    v.clear();

## A bit more information on **iterators**:

We also have some functions to work on iterators. I will keep on using the previously declared iterator iter for these examples, let’s take a look at the basics:

    iter = v.begin(); // Sets iter to first element
    iter = v.end(); // Sets it to the last element
    iter = v.rbegin(); //Sets it to the first element in reverse order (Same with rend() )
    // After iter is set to the start or end, both in normal and reverse order, we can use...:
    iter  ;
    iter--;
    // ...to increase or decrease the iterator
    // To get the value of the element the iterator is pointing to we can simply access the pointed memory spot:
    int value = *iter;

And this is the basics of the Vector STL, hope you enjoyed it !