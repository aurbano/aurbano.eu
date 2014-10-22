---
layout: post
title: "Making of Nebula text"
tagline: "WebGL Experiment"
description: "Details on the process of making the WebGL experiment Nebula"
thumbnail: /assets/files/thumbnails/nebula.jpg
categories:
  - Main
tags:
  - apple
  - mac
---
{% include JB/setup %}

When I was doing the [Tree Generator](/blog/2013/01/14/procedurally-generated-trees-in-javascript/), I used [dat.gui](https://code.google.com/p/dat-gui/) for the first time, and on their workshop they have the following text to play with:

<div class="caption">
    <img src="/assets/files/posts/nebula/datgui.png" height="142" width="413" alt="dat.gui">
</div>

This gave me the idea to render text on the canvas using particles that would seem to be gravitating around, in such a way that when seen all together you would see the text.

###Example
<div class="caption caption-no-border">
    <div style="width:100%; height:300px" id="nebulaDemo"></div>
    Click for explosions
</div>

For this example I set a big `drag` force so that the particles would settle fast and you could read the text more easily. On larger sizes it actually looks better withouth any `drag` force.

#First steps
I initially did this experiment [on the canvas](http://urbanoalvarez.es/Nebula/canvas.html) without any rendering engine. This has the advantage of rapid prototyping, and the disadvantage of likely performance issues. I managed to make it work quite well though, but the number of nodes it could render was limited by the browser JavaScript interpreter.

The basic idea is to have a number of particles gravitate towards a point, in such a way that the points represent the text:

<div class="caption">
    <img src="/assets/files/posts/nebula/edges.png" alt="edges">
    Points around which the particles gravitate.
</div>

This was actually trickier than it seems, because there is no built in way to get a list of coordinates like that. So I did the following:

1. Create an empty canvas for processing.
2. Using `ctx.measureText` find the largest font size that fits it.
3. Use `ctx.fillText` to write the text, using white on black for better contrast.
4. Read the canvas pixels line by line, looking for white pixels. When found, set up a new particle gravitating towards it.

In order to allow for different resolution settings I didn't go pixel by pixel, instead I set up increments of `resolution` pixels, then calculated the average color of them, and compared that to my `tolerance` threshold.

The code for this is quite long, so I posted here the relevant parts only:

{% highlight javascript linenos %}
// Find the largest font size
var textSize;
do {
    canvas.ctx.font = "bold " + content.size + "px sans-serif";
    textSize = canvas.ctx.measureText(content.text);
    content.size++;
} while (textSize.width < canvas.WIDTH && content.size < canvas.HEIGHT);

// Now sweep the canvas finding the text
var pix = canvas.ctx.getImageData(0, 0, canvas.WIDTH, canvas.HEIGHT);
for (var y = 0; y < pix.height; y += nebula.settings.resolution) {
    for (var x = 0; x < pix.width; x += nebula.settings.resolution) {
        // Calculate averages
        var found = false, auxAvg = 0, points = 0;
        for (var x1 = 0; x1 < nebula.settings.resolution; x1++) {
            for (var y1 = 0; y1 < nebula.settings.resolution; y1++) {
                // I now have all needed pointers
                // Get the index inside pix array
                var pixIndex = ((y + y1) * pix.width + x + x1) * 4;
                auxAvg += (pix.data[pixIndex] + pix.data[pixIndex + 1] + pix.data[pixIndex + 2]) / 3;
                points++;
            }
            auxAvg = auxAvg / points;
            if (auxAvg > 0 && auxAvg < 255 - (255 * nebula.settings.tolerance)) {
                // Found a valid point
                break;
            }
        }
    }
}
{% endhighlight %}

With all this code I have the image before, with all the edges. Now it's just a matter of drawing some particles in random locations, and update their position based on gravity towards the calculated points.

Here is a live example where you can see the distance from each particle to the point where it wants to go (green), and the force (red):

<div class="caption">
    <div style="width:100%; height:300px" id="edgesDemo"></div>
</div>

For this example I set the `drag` force to 0 so that they would remain moving. Most of the particles' behavior can be changed with the settings, which allows for pretty cool effects.

On the [demo page](http://urbanoalvarez.es/Nebula/) for Nebula you can play with these settings using dat.gui.

<script type="text/javascript" src="http://urbanoalvarez.es/Nebula/lib/pixi/bin/pixi.js"></script>
<script type="text/javascript" src="http://urbanoalvarez.es/Nebula/src/nebula-pixi.js"></script>
<script type="text/javascript">
    $(document).ready(function(){

        var text = new Nebula({
            container: $('#nebulaDemo'),
            showDistance: false,
            showForce: false,
            showEdges: false,
            showNodes: true,
            variableLineWidth: false,
            resolution: 20,
            drag: 0.005,
            drawFn: 'rectangle',
            minRad: 5,
            maxRad: 9,
            bgColor: 0xf5f5f5,
            blendMode: 'NORMAL'
        });
        
        text.write('nebula', [0x7752FF, 0x4DA6F0]);

        $('#nebulaDemo').click(function(e){
            text.explosion(
                e.pageX - $(this).offset().left,
                e.pageY - $(this).offset().top
            );
        });

        // ---------------- //
        
        var edges = new Nebula({
            container: $('#edgesDemo'),
            showDistance: true,
            showForce: true,
            showEdges: true,
            showNodes: false,
            variableLineWidth: false,
            resolution: 20,
            maxSpeed: 2,
            drag: 0,
            drawFn: 'rectangle',
            bgColor: 0x000000,
            blendMode: 'NORMAL'
        });

        edges.write('nebula', [0x7752FF]);
    });
</script>