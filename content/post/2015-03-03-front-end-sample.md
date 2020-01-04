---
categories:
- Technical
date: "2015-03-03"
description: Sample web I've coded to get the latest front end technologies working
  together.
tagline: Angularjs, Requirejs, Grunt & Bower
tags:
- JavaScript
- AngularJS
title: Using the latest front-end tech
aliases: [ /blog/front-end-sample/ ]
---

There are so many new technologies popping up every week on **JavaScript front end** ways of doing things that it becomes really hard to stay on top of everything.

I was developing a couple of front ends lately, and decided to put everything together and get a nice environment working.
I basically wanted:

* **Dependency management** (Bower)
* **File injection** (Requirejs)
* **Both working nicely together** (Grunt)
* **MVC front end** (Angularjs)

It seems straight forward seeing the list this way, but it does *take a while* to get it running. After doing both I realized that the starting blocks were pretty much the same in both cases, so I took all that common code and put it on a sample website.

{{< figure src="https://aurbano.github.io/angular-requirejs-bower-grunt/assets/logo.png" title="Angular Requirejs Bower Grunt" >}}

Take a look at the *[sample website](https://github.com/aurbano/angular-requirejs-bower-grunt)* first to see what we will be building. Following here is a guide on how it works.

## Getting started
With all this setup we will avoid ideally **manually downloading** anything (Get a copy of [Nodejs](http://nodejs.org/download/) if you somehow don't have one yet)

[Fork/clone the repository]() and rename it to your project. Now let's get all the dependencies:

``` bash
$ npm install
$ bower install
$ grunt
```

This three steps are what power the whole thing:

#### `$ npm install`
We are using npm to get the main dependencies: **Grunt** and **Bower** mainly. In case you are new to this, npm is Nodejs' *package manager*.

**Bower** is a Nodejs package that allows us to install **front-end dependencies** very easily, with the added benefit of easily *upgrading* and *tracking changes* in them.

**Grunt** on the other hand is the worker that *puts everything together*. If you find yourself doing **the same task** more than **twice**, Grunt can do that for you.

#### `$ bower install`
There is a file called `bower.json` that tells Bower all the dependencies we need, so that when running `$ bower install` it knows what to install.

It will fetch all those dependencies and put them inside `bower_components/` so that we can use them in our website.
This includes things like `Bootstrap`, `Angularjs`, `Requirejs`...

#### `$ grunt`
Finally we call `grunt` with no arguments. This invokes the **default task**, which is the one we configured to tell Requirejs about the Bower components.

What this means is that all those dependencies that Bower downloaded for us, that are in `bower_components/` are still unkown to Requirejs, so Grunt takes them and puts them inside the `paths` of Requirejs.

If we take a look at the `config.js` file for Requirejs we'll now see:

``` javascript
//...
paths: {
  app: 'app',
  requirejs: '../bower_components/requirejs/require',
  angular: '../bower_components/angular/angular',
  'angular-bootstrap': '../bower_components/angular-bootstrap/ui-bootstrap-tpls',
  bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
  'angular-loader': '../bower_components/angular-loader/angular-loader',
  'angular-route': '../bower_components/angular-route/angular-route',
  almond: '../bower_components/almond/almond'
},
//...
```

All the ones that are located inside `bower_components/` have been automatically added by Grunt. Cool huh :)

From now on if we need a dependency anywhere in our files, we can use require and the shortname of the dependency to use it.

## Adding dependencies
Should you need any other dependency, just run:

``` bash
$ bower install <dependency>
$ grunt
```

And it will be downloaded and added to the `paths` so it's accesible.

## Getting Angularjs to work
An Angularjs app needs an `index.html` file, and an `app.js` entry point. One of the best things of this approach is that we no longer need to include every single JavaScript file manually.
So the file will simply be:

``` html
<!DOCTYPE html>
<html lang="en">

<head>
    <link rel="stylesheet" type="text/css" href="assets/styles.css">

    <title>Sample app</title>
    <link href="bower_components/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js">
        </script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js">
        </script>
    <![endif]-->
</head>

<body>

    <nav class="navbar navbar-inverse">
        <div class="container">
            <div class="navbar-header">
                <a class="navbar-brand" href="#">Sample web</a>
            </div>
        </div>
    </nav>

    <div class="container text-center" ng-view></div>

    <script type="text/javascript"
        src="bower_components/requirejs/require.js"
        data-main="app/config.js">
    </script>
</body>

</html>
```

The important part there is the `require.js` script tag. Using the attribute `data-main` we specify the Configuration file for Requirejs. 

At the end of `config.js` we put the Angularjs initialization code:

``` javascript
require([
  'angular',
  'app'
], function(angular, app) {

  console.info("Sample Web initialized");

  var $html = angular.element(document.getElementsByTagName('html')[0]);

  angular.element().ready(function() {
    // bootstrap the app manually
    angular.bootstrap(document, ['app']);
  });

});
```

There are other ways in which this can be done, but for the sake of simplicity we'll just do it this way.

As you can see all the JavaScript files will now be wrapped with a `require([], function(){})` function.
The first argument in an array of **dependencies** for this file, the ones we installed with bower, and the second is the actual code for this page wrapped in a function that takes those dependencies as arguments.

With this we are ready to run our Angularjs app, at the moment it doesn't have any functionality, I'll improve it over the next weeks and add a proper sample application.
