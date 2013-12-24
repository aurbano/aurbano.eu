---
title: Procedurally generated trees in JavaScript
author: Alex
layout: post
permalink: /blog/2013/01/14/procedurally-generated-trees-in-javascript/
categories:
  - HTML5
  - Javascript
  - Programming
tags:
  - canvas
  - generator
  - html5
  - javascript
  - procedural
  - procedurally
  - tree
--- 

> This article was imported to Jekyll from my old Wordpress blog using a plugin, and it may have some errors.
> All images were stripped from the post in the process, I'll try to get them back as soon as I can.

Over the past year I\'ve been more and more interested in HTML5 canvas, since it allows very fast development of graphical animations using JavaScript.

Another thing that has always amazed me was procedurally generated content. Check out [Steven Wittens\' \"Making worlds\"][1], a wonderful article on generating planets from orbit to aerial zoom.

[1]: http://acko.net/blog/making-worlds-introduction/

So I decided to create a 2D tree generator in JavaScript, you can [take a look at it][2] to know exactly what I am talking about.

[2]: http://lab.nuostudio.com/treegenerator "Tree generator"

Before we move any further let me say that this article is aimed at people with experience using HTML5\'s canvas and JavaScript.

## Starting up

I don\'t have any template for starting a new canvas project, but I do have some guidelines I like to follow. Below is the usual starting point


{% highlight javascript linenos anchorlinenos=True %}
$(document).ready(function(e) {
	var ctx;
	var WIDTH;
	var HEIGHT;
	
	var canvasMinX;
	var canvasMaxX;
	
	var canvasMinY;
	var canvasMaxY;
	
	var ms = {x:0, y:0}; // Mouse speed
	var mp = {x:0, y:0}; // Mouse position
	
	var fps = 0, now, lastUpdate = (new Date)*1 - 1;
	var fpsFilter = 100;
	
	ctx = $('#bg')[0].getContext("2d");

	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;
	
	WIDTH = $("#bg").width();
  	HEIGHT = $("#bg").height();
	resizeCanvas();
	
	canvasMinX = $("#bg").offset().left;
  	canvasMaxX = canvasMinX   WIDTH;
	
	canvasMinY = $("#bg").offset().top;
  	canvasMaxY = canvasMinY   HEIGHT;

	function clear() {
		ctx.clearRect(0, 0-HEIGHT/2, WIDTH, HEIGHT);
	}
	
	function circle(x,y,rad,color){
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x,y,rad,0,Math.PI*2,true);
		ctx.closePath();
		ctx.fill();
	}
	
	function fade() {
		ctx.fillStyle="rgba(0,0,0,0.01)";
		ctx.fillRect(0, 0, WIDTH, HEIGHT);
	}
	
	function resizeCanvas(e) {
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;
		
		$("#bg").attr('width',WIDTH);
		$("#bg").attr('height',HEIGHT);
	}
	
	function mouseMove(e) {
		ms.x = Math.max( Math.min( e.pageX - mp.x, 40 ), -40 );
		ms.y = Math.max( Math.min( e.pageY - mp.y, 40 ), -40 );
		
		mp.x = e.pageX - canvasMinX;
		mp.y = e.pageY - canvasMinY;
	}
	$(document).mousemove(mouseMove);
	$(window).resize(resizeCanvas);
});
{% endhighlight %}

I know this is not optimized, and defines all variables inside the global namespace, but I like to start with a very quick prototype before I improve code design. I also use jQuery, although only for event binding such as window resize. As for the HTML, I simply start with a blank page containing a canvas element.

## The idea

The goal is to have JavaScript generate 2D trees. At first I will generate only \"naked\" trees, with no leaves. Canvas doesn\'t really have many drawing methods, we can create lines, curves, and basic shapes. Since trees aren\'t really curvy but tend to suddenly turn and then go straight for a while (I am thinking of [this kind of tree][3]) I have decided to use lines.

[3]: http://fanart.tv/fanart/music/ff6e677f-91dd-4986-a174-8db0474b1799/albumcover/in-between-dreams-4e5163ef8782f.jpg

Another requirement is that we start with a thick line, until we reach final branches which should be really thin. In order to fulfill these requirements and still use a simple method I have come up with the idea of stacking lines, as if they were rectangles. The nice thing about that is that we don\'t need to calculate the corners, only the initial and ending point, and if we use a very small length, stacking very thin rectangles, it will almost look line one long line that is twisting.

## Getting this to work

So off we go, just for now I will test the idea with a loop that draws small segments all in a row, introducing a little variation on the next point\'s coordinates, with an initial width of 20 for example, and reducing it by a small quantity on each iteration. We should get a long wiggly line getting thinner until it \"dies\" at the end. I have extracted all useful variables to outside the function so that we can easily configure it.

{% highlight javascript %}
var loss = 0.1;		// Width loss per cycle
var sleep = 10;		// Min sleep time (For the animation)
var branchLoss = 0.9;	// % width maintained for branches
var mainLoss = 0.9;	// % width maintained after branching
var speed = 0.3;	// Movement speed
var scatterRange = 5;	// Area around point where leaf scattering should occur

// Starts a new branch from x,y. w is initial w
// lifetime is the number of computed cycles
function branch(x,y,dx,dy,w,lifetime){
	ctx.lineWidth = w-lifetime*loss;
	ctx.beginPath();
	ctx.moveTo(x,y);
	// Calculate new coords
	x = x dx;
	y = y dy;
	// Change dir
	dx = dx Math.sin(Math.random() lifetime)*speed;
	dy = dy Math.cos(Math.random() lifetime)*speed;
	//
	ctx.lineTo(x,y);
	ctx.stroke();
	if(w-lifetime*loss>=1) setTimeout(function(){ branch(x,y,dx,dy,w,  lifetime); },sleep);
}
{% endhighlight %}

<div style="float:right" class="caption">
<img src="http://i1.wp.com/urbanoalvarez.es/blog/wp-content/uploads/2013/01/tree1.png?resize=216%2C311" /><br />
Figure 1: Initial developmentTo execute we simply need to call
</div> 

`branch(WIDTH/2,HEIGHT,0,-1,15,0)`, although you can change however you want the first 4 arguments. `lifetime` should start in 0, since it is the cycle counter. I\'ve used the `sleep` variable to control how long it waits before drawing the next line, this way you get a sense of real drawing. If you set it to 0 the tree simply appears.

As you can see in Figure 1 the technique of stacking lines works very well, it even gives a little texture to the tree. We should now add some branches, the idea here is to treat the branches as new \"trees\", thus reusing the function branch.

In order to generate a new branch we must wait until the tree has grown enough, branches usually start 1-2 meters above ground. Since this a recursive function we don\'t know much on each iteration, that\'s why I\'m using the variable lifetime. If we use lifetime along with the current width of the tree, we can know exactly the percentage of growth, in order to start a new branch.

After some testing I\'ve ended up with this condition: `w-lifetime\*loss < 9`. If that is met we will start a new branch, although that would mean that after that point is reached we will always start a new branch. To avoid that we add a little randomness by using: `Math.random() > 0.7`, supposing Math.random() returns a real random number the chances of that being true are almost 30%.


{% highlight javascript %}
if(w-lifetime*loss < 9 &#038;&#038; lifetime > 30 Math.random()*250){
	setTimeout(function(){
		branch(x,y,2*Math.sin(Math.random() lifetime),2*Math.cos(Math.random() lifetime),(w-lifetime*loss)*branchLoss,0);
		// When it branches, it loses a bit of width
		w *= mainLoss;
	},sleep*Math.random() sleep);
}
{% endhighlight %}

<div style="float:right" class="caption">
	<img src="http://i1.wp.com/urbanoalvarez.es/blog/wp-content/uploads/2013/01/tree2.png?resize=250%2C379" /><br />
	Figure 2: Fully developed treeI have added some randomness to the direction in which branches start to grow by using a sine and cosine along with a random number and the current lifetime. That should give us a random direction from -1 to 1 in both axis. 
</div> 

`mainLoss` is a coefficient that determines how much width is lost by the main branch.

We should now have a working tree generator, although some variable tweaking is required to get the shape right. Once I got the variables and function a little improved I moved everything to an object, so that I could use [dat.gui][6] and control the variables more easily (and also because JS people love experiments with dat.gui)

[6]: http://code.google.com/p/dat-gui/

By now branches work fine (Figure 2), I\'ve added a little jQuery snippet that will call the function branch whenever I click, generating a new tree at the x coordinate of the click.

Now that it is working pretty well I have finished improving the code, and ensuring that almost everything is configurable via variables controlled by dat.gui. In that sense it is a very good framework for prototyping and experimenting with your tests. I would like to use some sort of genetic algorithm to find the best combination of values for tree generation, but writing the fitness function is quite challenging in this case.

Please check out the final version at [nuostudio\'s lab][7], it has many options that are quite fun to play with.

[7]: http://lab.nuostudio.com/treegenerator

The next thing I\'d like to do would be to use some 3D library (probably [three.js][8]) to create a \"forest\", and probably improve the realism of the generated trees.

[8]: http://mrdoob.github.com/three.js/

<div style="clear:both"></div>
<hr />

![Colorful forest](http://i2.wp.com/urbanoalvarez.es/blog/wp-content/uploads/2013/01/tree3.png "Colorful forest")