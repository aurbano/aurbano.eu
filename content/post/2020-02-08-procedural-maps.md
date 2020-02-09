---
title: Procedural Map Generation
description: Simplex noise + Webgl
date: "2020-02-08"
categories:
- Learning
tags:
- JavaScript
- Procedural
---

At [#socialgorithm](https://socialgorithm.org) we recently started working on a new game, let's call it "**Ant Colony**" for now. It's a bit like simplified Age of Empires, where you write the code that drives a bunch of ants, and they need to survive and ultimately be the only ones alive in the map.

We needed to generate map procedurally, which is [nothing](https://www.redblobgames.com/maps/terrain-from-noise/) new [really](https://github.com/Azercoco/3D-Earth-Like-Planet-Procedural-Generator), but it was new to me when I started writing the code for it, so it's been a fun opportunity to learn something new!

I've seen plenty of noise based terrain generators but unfortunately couldn't find anything where I could quickly test different parameters and ways to use the noise functions, so I decided to build a simple generator with a GUI to control the parameters:

[Procedural Map Generator](https://aurbano.github.io/procedural-maps/)

Here are some examples of maps produced using this tool:

<table class="images">
    <tr>
        <td width="33%">
          {{< resource "posts/procedural-maps/img/regular.png" >}}
          Grasslands with some rocks/mountains
        </td>
        <td width="33%">
          {{< resource "posts/procedural-maps/img/islands.png" >}}
          Islands (scaled using the tool itself)
        </td>
        <td width="33%">
          {{< resource "posts/procedural-maps/img/forest.png" >}}
          Forest
        </td>
    </tr>
</table>

Our requirement for this game is to have at least 3 types of terrain: **Rocks** (block moving), **Grass** (can move freely), and **Water** (slows ants down). It's also important to make something that *looks good*, because when games are being played everyone will see the map on a big projector.

The starting point is going to be [Perlin](https://en.wikipedia.org/wiki/Perlin_noise) or [Simplex](https://en.wikipedia.org/wiki/Simplex_noise) noise. I'll be using [simplex-noise.js](https://github.com/jwagner/simplex-noise.js) for this project. Simplex noise was also developed by Ken Perlin, and as far as I know it just has a lower computational complexity.

If I generate some Simplex 2D noise I get something like the figure below. I have animated the x-axis to highlight the fact that Simplex noise is a continuous function. Another useful property is that it produces exactly the same output for a given seed and coordinate pair. It actually takes too long to generate the noise to be able to have a smooth animation, but in this case it's fine because on each frame I only need to render a [1 x height] rectangle to add on the right, and just shift all the other pixels 1 to the left.

<canvas id="noise" style="height: 200px; width: 100%; border: #ccc solid 1px; margin: 1em 0"></canvas>

This means that there's a chance that are you are the only living being to have ever seen the noise distribution moving in front of your eyes right now :)

## Turning noise into terrain

This is where it gets slightly complicated. If we were working in 3D we could use the noise values as altitude values, producing pretty cool results.

{{< resourceFigure "posts/procedural-maps/img/3d-terrain.png" "3D elevation mapped from noise" >}}

In 2D we can only play with colors though. A naive approach would be to define some color stops for each noise value, so let's say we normalize our noise to output values in the range [0, 100] and then apply the following color map:

* <span style="color: #0a90d8">Water</span> < 20
* <span style="color: #cea244">Sand</span> < 22
* <span style="color: #59b513">Grass</span> < 80
* <span style="color: #393f3e">Mountain</span> < 100

Here you can play with the elevations for each color:

<canvas id="terrainBasic" style="height: 200px; width: 100%; border: #ccc solid 1px; margin: 1em 0"></canvas>

<form>
  <div class="form-group">
    <label for="waterMax">Water</label><br>
    <input type="range" class="form-control-range terrainSlider" id="waterMax" min="0" max="100" value="20">
  </div>
  <div class="form-group">
    <label for="sandMax">Sand</label><br>
    <input type="range" class="form-control-range terrainSlider" id="sandMax" min="0" max="100" value="22">
  </div>
  <div class="form-group">
    <label for="grassMax">Grass</label><br>
    <input type="range" class="form-control-range terrainSlider" id="grassMax" min="0" max="100" value="80">
  </div>
</form>

This is a reasonable approach, but if we want to add different types of terrain (dry areas, forest... ) it becomes too obviously based on noise and won't look realistic. An easy way to get around this is to use two noise maps: elevation and moisture. I got this idea from this [amazing blog post by Red Blob Games](https://www.redblobgames.com/maps/terrain-from-noise/). The idea is that elevation controls mountains and water, but is then combined with a moisture map to determine the type of terrain **in between**.

The algorithm that I ended up using to generate realistic terrain is this:

{{< highlight typescript >}}
/**
 * Terrain is generated using two noise values, one for elevation and one for moisture
 * Elevation determines rocks and water. Moisture is used to introduce variance in the
 * space between water and rocks.
 *
 * Around mountains there should be tall grass
 * Forests should appear far from rocks, in places where moisture is not too large
 */
function getTerrain(o: Options, elevation: number, moisture: number) {
  const e = elevation * 100; // elevation [0, 100]
  const m = moisture * 100;  // moisture [0, 100]

  if (e < o.waterMaxElevation / 3)
    return CELL_TYPES.DEEP_WATER;
  if (e < o.waterMaxElevation)
    return CELL_TYPES.WATER;
  if (e < o.waterMaxElevation + o.sandMaxElevation)
    return CELL_TYPES.SAND;

  if (e > o.rockMinElevation)
    return CELL_TYPES.ROCK;
  if (e > o.rockMinElevation - o.sandMaxElevation)
    return CELL_TYPES.TALL_GRASS;

  if (m < o.grassMinMoisture)
    return CELL_TYPES.DRY_GRASS;
  if (e < o.forestMaxElevation && m > o.forestMinMoisture && m < o.forestMaxMoisture)
    return CELL_TYPES.FOREST;
  if (e > o.tallGrassMinElevation && m > o.tallGrassMinMoisture)
    return CELL_TYPES.TALL_GRASS;

  return CELL_TYPES.GRASS;
}
{{< /highlight >}}

## Variations

I got curious now about whether I could use noise to generate realistic looking topographic maps. So off we go! First I need an example to try to replicate:

{{< resourceFigure "posts/procedural-maps/img/topographic.jpg" "Some topographic map I found as reference" >}}

Will this be useful? <del>Probably</del>Definitely not. Will it be a fun way to spend a couple hours today Sunday while it rains outside? Definitely yes!

First I will try to replicate the elevation lines. These should be easy, I could turn the noise output into discrete steps, and just render them as lines. It's not going to be very efficient because I'd only be able to draw them pixel by pixel... I'll think of a solution after.

One thing that looks very distinctive from the reference map is that there are soft hills and sharp changes in elevation. This obviously depends on the real world terrain and type of landscape, but since I'm trying to replicate this reference image I think I'll need to multiply/combine together a couple of different noise maps in order to make it harsher.

<canvas id="elevation" style="height: 400px; width: 100%; border: #ccc solid 1px; margin: 1em 0"></canvas>

Well, it's not too bad really! It sometimes generates small areas full of the line color, and sometimes the lines are not as thin as I'd like them to be. So if I want to actually replicate that sample I'm going to need a different approach...

This is the bit that generates the lines right now:

{{< highlight js >}}
var value1 = (simplexNoise.noise2D(
  x / elevationScale,
  y / elevationScale
) / 2 + 0.5);

var value2 = (simplexNoise.noise2D(
  (x + elevationCanvas.width * 2) / elevationScale,
  (y + elevationCanvas.height * 2) / elevationScale
) / 2 + 0.5);

var value = value1 * value2 * 100;

// draw a line on 10, 20, 30...
if (value > 0 && Math.floor(value) % 10 < 1) {
  elevationCtx.fillStyle = lineColor;
  elevationCtx.fillRect(x, y, 1, 1);
}

// draw grass sometimes
if (value % 10 > 4) {
  elevationCtx.fillStyle = grassColor;
  elevationCtx.fillRect(x, y, 1, 1);
}
{{< /highlight >}}

On top of the problem with the lines not being actually lines I have the fact that this can only generate very "smooth" shapes. Multiplying two maps together fixed it a bit, but still doesn't generate sharp turns like the reference. I'm thinking using a different scale for the other noise values?

Two things here: I thought it would be easier to get the elevation lines by drawing pixels at a certain noise level. Turns out it won't look smooth so I'd have to first render the image as b&w noise and then maybe "walk" the image drawing lines at certain transitions? I actually don't know but it feels like it would take ages to get a good result so I'm going to continue in a new direction:

Wild idea: What if I use a noise map as the scale factor for another noise map?

{{< highlight js >}}
var value1 = (simplexNoise.noise2D(
  x / elevationScale,
  y / elevationScale
) / 2 + 0.5);

var value2 = (simplexNoise.noise2D(
  // multiply each coordinate by value1 to scale it by it
  (x + elevationCanvas.width * 2) * value1 / elevationScale,
  (y + elevationCanvas.height * 2) * value1 / elevationScale
) / 2 + 0.5);
{{< /highlight >}}

Only one way to know how it'll look! :) I also decided to give this one a more fun color scheme, using the HSL color space and mapping the noise to a number 0-360 so that I can use it directly as the Hue parameter.

<canvas id="scaled" style="height: 300px; width: 100%; border: #ccc solid 1px; margin: 1em 0"></canvas>

<form>
  <div class="form-group">
    <label for="scaledScale">Scale</label><br>
    <input type="range" class="form-control-range paramSlider" id="scaledScale" min="100" max="1000" value="200">
  </div>
</form>

Ok at this point I have to admit that I'm just having pointless fun, I would love to turn the above into an animation but when I was doing the noise scrolling horizontally at the start of this post I realised that generating the noise took too long for a smooth animation. So there's no way I'm getting away with it here, at least not without some tricks.

## Next steps

Soon we'll start using this generator in our new game, so I'll update this post if we come up with any improvements.

You can also follow updates at [#socialgorithm](https://socialgorithm.org), or get in touch if you want to run a coding workshop/competition in your uni, company, school, meetup...

{{< resource "posts/procedural-maps/js/simplex-noise.js" >}}
{{< resource "posts/procedural-maps/js/render.js" >}}
