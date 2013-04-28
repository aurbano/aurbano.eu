---
title: Understanding C++ time complexity
author: Alex
layout: post
permalink: /blog/2010/04/21/understanding-c-time-complexity/
categories:
  - C++
  - Programming
tags:
  - C++
  - constant
  - cpp
  - exponential
  - factorial
  - logarithmic
  - time
---
# 

What functions are faster? Which ones are the most efficient? Understanding this will help you optimise your code and impove it’s performance.

Each C function has a run time, and knowing that will allow you to combine the best methods always.

Here you have the different possible run times, explained and with an example of a function. *(Note that they are ordered from fastest to slowest)*

## Constant time:

This is the fastest a function can work. An example is to measure an array’s length:

    // Using namespace std;
    int a[32];
    cout 