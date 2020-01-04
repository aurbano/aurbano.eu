---
author: Alex
categories:
- Experiments
date: "2013-01-14T00:00:00Z"
tagline: Why not?
tags:
- JavaScript
- Procedural Generation
title: Procedurally generated trees in JavaScript
aliases: [ /blog/2013/01/14/procedurally-generated-trees-in-javascript/ ]
---

Over the past year I\'ve been more and more interested in HTML5 canvas, since it allows very fast development of graphical animations using JavaScript.

Another thing that has always amazed me was procedurally generated content. Check out [Steven Wittens\' \"Making worlds\"][1], a wonderful article on generating planets from orbit to aerial zoom.

[1]: http://acko.net/blog/making-worlds-introduction/

So I decided to create a 2D tree generator in JavaScript, you can [take a look at it][2] to know exactly what I am talking about.

[2]: https://aurbano.github.io/TreeGenerator/ "Tree generator"

Before we move any further let me say that this article is aimed at people with experience using HTML5\'s canvas and JavaScript.

### Preview:

<div class="caption" id="treeContainer" style="width:100%;">
	<canvas id="bg" style="color:#09F"></canvas><br />
	Click anywhere to generate trees (for some reason they tend to be small when embedding like this, so click several time until you get a big one!)
</div>

## The idea

The goal is to have JavaScript generate 2D trees. At first I will generate only \"naked\" trees, with no leaves.

Canvas doesn\'t really have many drawing methods, we can create lines, curves, and basic shapes. Since trees aren\'t really curvy but tend to suddenly turn and then go straight for a while (See inspiration below)

<div class="caption">
	<img src="http://thumbs.dreamstime.com/x/naked-tree-14208046.jpg" alt="Inspiration" style="max-height:200px; display:inline" class="img-responsive" /><br />
	Insipiration for the generator
</div>

Another requirement is that we start with a thick line, until we reach final branches which should be really thin. In order to fulfill these requirements and still use a simple method I have come up with the idea of **stacking lines**, as if they were rectangles. The nice thing about that is that we don\'t need to calculate the corners, only the initial and ending point, and if we use a very small length, stacking very thin rectangles, it will almost look line one long line that is twisting.

## Getting this to work

So off we go, just for now I will test the idea with a loop that draws small segments all in a row, introducing a little variation on the next point\'s coordinates, with an initial width of 20 for example, and reducing it by a small quantity on each iteration. We should get a long wiggly line getting thinner until it \"dies\" at the end. I have extracted all useful variables to outside the function so that we can easily configure it.

``` javascript
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
```

To execute we simply need to call `branch(WIDTH/2,HEIGHT,0,-1,15,0)`, although you can change however you want the first 4 arguments. `lifetime` should start in 0, since it is the cycle counter. I\'ve used the `sleep` variable to control how long it waits before drawing the next line, this way you get a sense of real drawing. If you set it to 0 the tree simply appears.

As you can see in Figure 1 the technique of stacking lines works very well, it even gives a little texture to the tree. We should now add some branches, the idea here is to treat the branches as new \"trees\", thus reusing the function branch.

In order to generate a new branch we must wait until the tree has grown enough, branches usually start 1-2 meters above ground. Since this a recursive function we don\'t know much on each iteration, that\'s why I\'m using the variable lifetime. If we use lifetime along with the current width of the tree, we can know exactly the percentage of growth, in order to start a new branch.

After some testing I\'ve ended up with this condition: `w-lifetime*loss < 9`. If that is met we will start a new branch, although that would mean that after that point is reached we will always start a new branch. To avoid that we add a little randomness by using: `Math.random() > 0.7`, supposing Math.random() returns a real random number the chances of that being true are almost 30%.

``` javascript
if(w-lifetime*loss < 9 &amp;&amp; lifetime > 30 Math.random()*250){
	setTimeout(function(){
		branch(x,y,2*Math.sin(Math.random() lifetime),2*Math.cos(Math.random() lifetime),(w-lifetime*loss)*branchLoss,0);
		// When it branches, it loses a bit of width
		w *= mainLoss;
	},sleep*Math.random() sleep);
}
```

I have added some randomness to the direction in which branches start to grow by using a sine and cosine along with a random number and the current lifetime. That should give us a random direction from -1 to 1 in both axis. `mainLoss` is a coefficient that determines how much width is lost by the main branch.

We should now have a working tree generator, although some variable tweaking is required to get the shape right. Once I got the variables and function a little improved I moved everything to an object, so that I could use [dat.gui][6] and control the variables more easily (and also because JS people love experiments with dat.gui)

[6]: http://code.google.com/p/dat-gui/

By now branches work fine (Figure 2), I\'ve added a little jQuery snippet that will call the function branch whenever I click, generating a new tree at the x coordinate of the click.

Now that it is working pretty well I have finished improving the code, and ensured that almost everything is configurable via variables controlled by dat.gui. In that sense it is a very good framework for prototyping and experimenting with your tests. I would like to use some sort of genetic algorithm to find the best combination of values for tree generation, but writing the fitness function is quite challenging in this case.

Please check out the [final version][7], it has many options that are quite fun to play with. You can also browse [its source code][8] at Github.

[7]: https://aurbano.github.io/TreeGenerator/
[8]: https://github.com/aurbano/TreeGenerator

The next thing I\'d like to do would be to use some 3D library (probably [three.js][8]) to create a \"forest\", and probably improve the realism of the generated trees.

[8]: http://mrdoob.github.com/three.js/

<hr style="clear:both" />

Playing with the parameters of the tree generator you can generate some pretty cool things, below is simply a colorful forest, but you can end up having something similar to fireworks, or just random lines going everywhere...

Take a look at the <a href="https://aurbano.github.io/TreeGenerator/">live experiment</a> on its repository.

<script type="text/javascript" src="https://aurbano.github.io/TreeGenerator/src/TreeGenerator.js" ></script>
<script type="text/javascript">
	$(document).ready(function(){
		console.log("Init Tree generator");
		var canvas = $('#bg'),
			container = $('#treeContainer');

		// Resize the canvas to fit the container
		function resizeCanvas(){
			canvas.attr('width',container.width());
			canvas.attr('height', 300);
		}
		$(window).resize(function(){
 			resizeCanvas();
		});
		resizeCanvas();

		var tree = new TreeGenerator(canvas, {
			fitScreen: false,
			bgColor: [245, 245, 245],
			treeColor: '#000000',
			spawnInterval: 1500,
			initialWidth: 6
		});
		tree.start();

		canvas.click(function(e){
			var parentOffset = $(this).parent().offset(); 
		    var relX = e.pageX - parentOffset.left;
		    var relY = e.pageY - parentOffset.top;

			tree.branch(relX, canvas.height(), 0, -Math.random()*3, Math.random()*tree.settings.initialWidth,5,0,'#000',tree);
		});
	});
</script>
