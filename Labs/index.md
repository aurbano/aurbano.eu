---
layout: page
title: "Labs"
description: ""
---
{% include JB/setup %}

Here are some of the experiments I work on during my free time, you can find most of them on my <a href="https://github.com/aurbano">Github profile</a>.

<hr />

<h2 class="dark-bg">WebGL experiments</h2>

<div class="row">
	<h2><a href="http://urbanoalvarez.es/Nebula">/Nebula</a></h2>
	<div class="col-md-4 col-xs-5">
		<a href="http://urbanoalvarez.es/Nebula/"><img src="https://raw.githubusercontent.com/aurbano/Nebula/master/misc/screenshot.png" class="img img-responsive" alt="Nebula"></a>
	</div>
	<div class="col-md-8 col-md-7">
		<p>An HTML5+JS nebulosa effect, it displays text by making circles float inside it. Using <a href="http://www.pixijs.com">Pixi.js</a> internally for the WebGL rendering.</p>
		<p>For more information read <a href="/blog/making-of-nebula-text/">the article</a> about it.</p>
	</div>
</div>

<hr />

<div class="row">
	<h2><a href="http://web-visualizer.urbanoalvarez.es/">/WebVisualizer</a></h2>
	<div class="col-md-4 col-xs-5">
		<a href="http://web-visualizer.urbanoalvarez.es/"><img src="http://urbanoalvarez.es/assets/files/thumbnails/webvisualizer.PNG" class="img img-responsive" alt="Tree Generator"></a>
	</div>
	<div class="col-md-8 col-md-7">
		<p>Watch the web using WebGL</p>
		<p>The aim of this experiment is to generate large graphs (10000+ nodes) about the web, such that each node is a website, and it's linked to other websites if they are related or something like that. Still under development, deployed into Heroku.</p>
		<p><em>The screenshot was taken on a very early version, it may have changed by now.</em></p>
	</div>
</div>

<hr />

<h2 class="dark-bg">Canvas experiments</h2>

<div class="row">
	<h2><a href="http://nuostudio.github.io/Line-Art">/Line-Art</a></h2>
	<div class="col-md-4 col-xs-5">
		<a href="http://nuostudio.github.io/Line-Art/"><img src="http://www.chromeexperiments.com/detail/line-art/img/ahZzfmNocm9tZXhwZXJpbWVudHMtaHJkchgLEg9FeHBlcmltZW50SW1hZ2UY6rTvBQw/large" class="img img-responsive" alt="Line Art"></a>
	</div>
	<div class="col-md-8 col-md-7">
		<p>JavaScript and HTML5 Canvas experiment, I wanted to learn about canvas rendering so I started doing some experiments</p>
		<p>Line-Art creates a sine wave (Only one period) using a number of points controlled by a slider at the bottom. The more points the more exact it will be. It then joins the corresponding points from each half period of the sine.</p>
	</div>
</div>

<hr />

<div class="row">
	<h2><a href="http://urbanoalvarez.es/HTML-Clock">/HTML-Clock</a></h2>
	<div class="col-md-4 col-xs-5">
		<a href="http://urbanoalvarez.es/HTML-Clock/" title="HTML Clock"><img src="http://urbanoalvarez.es/HTML-Clock/misc/html-clock.gif" class="img img-responsive" alt="HTML Clock"></a>
	</div>
	<div class="col-md-8 col-md-7">
		<p>HTML5+CSS3+JS functioning clock, the exact time is shown by the offset of each number.</p>
		<p>It uses some HTML+CSS3 to create the stripes, and then a little bit of JavaScript to animate the whole thing. I also want to try to achieve the same result using only CSS3, which might actually be possible.</p>
	</div>
</div>

<hr />

<div class="row">
	<h2><a href="http://urbanoalvarez.es/TreeGenerator">/TreeGenerator</a></h2>
	<div class="col-md-4 col-xs-5">
		<a href="http://urbanoalvarez.es/TreeGenerator/"><img src="https://camo.githubusercontent.com/407e8310323067eeabe879baaab98e9dfc5b3052/687474703a2f2f7374617469632e757262616e6f616c766172657a2e65732f626c6f672f77702d636f6e74656e742f75706c6f6164732f323031332f30312f74726565332e706e67" class="img img-responsive" alt="Tree Generator"></a>
	</div>
	<div class="col-md-8 col-md-7">
		<p>2D trees with JavaScript, just because why not? Although by tweaking the settings you can get pretty much any kind of drawing.</p>
		<p>I thought about it one day, and after some tweaking and coding I managed to get a recursive function to draw 2D trees. The different settings the function takes allow it to draw pretty much anything you want, so it's quite a lot of fun to play with. I also wrote an <a href="/blog/2013/01/14/procedurally-generated-trees-in-javascript/">article about it</a>.</p>
	</div>
</div>

<hr />

More to come... :)

<hr />