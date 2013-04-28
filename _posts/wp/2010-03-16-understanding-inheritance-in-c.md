---
title: Understanding inheritance in C++
author: Alex
layout: post
permalink: /blog/2010/03/16/understanding-inheritance-in-c/
categories:
  - C++
  - Programming
tags:
  - class
  - cpp
  - inheritance
---
# 

If you know nothing about classes in C you should probably go read a bit on that, although if you know Java or a similar OO language you can go ahead.

In C , as with most modern OO languages we have encapsulation, inheritance, and polymorphism. I won’t go into much detail as this is just a quick reference on inheritance hierarchy and priorities.

## How inheritance works:

Skip this if you already know, I just want to make sure you can follow me here. Basically a class can inherit methods and attributes from a parent class. Why would we want to do this? Well, to avoid extra work, which is the **main priority** of every coder!

We will start with public inheritance. So let’s start with our parent class *car*

    #include 
    using namespace std;
    
    class car{
         bool engine, roof;
    public:
         car();
         car(int p) : passengers(p){};
         car(int p,int p1);
         bool hasEngine()const{ return roof; }
         bool hasRoof()const{ return roof; }
         int maxP()const{ return passengers; }
    
    protected:
         int price;
         int passengers;     
    };
    
    car::car(){
         engine=roof=true;
         passengers=5;
    }
    car::car(int p,int p1){
         passengers=p;
         price = p1;
    }

As you can see I have added some attributes and methods as well as two constructors for testing purposes.

Each *car* has an engine (Or not), can have roof or be convertible (roof=false) and have different passenger count and price.

I’ve set the price and passengers as protected because when a class inherits from a parent class, it will be able to modify protected attributes. Although from the rest of the code they will act as private.

Now the good thing about inheritance is that we can add, modify and reuse the code from car. Let’s say we want to have sports cars, which have some differences with normal cars. Let’s imagine sports cars have a new attribute that is racing (true or false)

So now I will create a new class, that will inherit from *car. *After that we will be able to start testing,

    class sportsCar : public car{
          bool racing;
    public:
          sportsCar();
    };
    
    sportsCar::sportsCar(){
          car::passengers=2;
    }

Now to see what happens, let’s do a simple main with a couple constructors:  
(Note: This is the full code)

    #include 
    using namespace std;
    
    class car{
         bool engine, roof;
    public:
         car();
         car(int p) : passengers(p){};
         car(int p,int p1);
         bool hasEngine()const{ return roof; }
         bool hasRoof()const{ return roof; }
         int maxP()const{ return passengers; }
    protected:
         int price;
         int passengers;     
    };
    
    car::car(){
         engine=roof=true;
         passengers=5;
    }
    car::car(int p,int p1){
         passengers=p;
         price = p1;
    }
    
    class sportsCar : public car{
          bool racing;
    public:
          sportsCar();
    };
    
    sportsCar::sportsCar(){
          car::passengers=2;
    }
    
    int main(){
        car myCar(5,20000);
        cout 