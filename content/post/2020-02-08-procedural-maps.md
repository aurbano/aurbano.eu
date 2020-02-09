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
          Islands
        </td>
        <td width="33%">
          {{< resource "posts/procedural-maps/img/forest.png" >}}
          Forest
        </td>
    </tr>
</table>

We need procedural map generation, which is [nothing](https://www.redblobgames.com/maps/terrain-from-noise/) new [really](https://github.com/Azercoco/3D-Earth-Like-Planet-Procedural-Generator), but it was new to me when I started writing the code for it, so it's been a fun opportunity to learn something new.

I've seen plenty of noise based terrain generators but unfortunately couldn't find anything where I could quickly test different parameters and ways to use the noise functions.

Our requirement for this game is to have at least 3 types of terrain: **Rocks** (block moving), **Grass** (can move freely), and **Water** (slows ants down). It's also important to make something that *looks good*, because when games are being played everyone will see the map on a big projector.

The starting point is going to be [Perlin](https://en.wikipedia.org/wiki/Perlin_noise) or [Simplex](https://en.wikipedia.org/wiki/Simplex_noise) noise. I'll be using [simplex-noise.js](https://github.com/jwagner/simplex-noise.js) for this project. Simplex noise was also developed by Ken Perlin, and as far as I know it just has a lower computational complexity.

If I generate some Simplex 2D noise I get something like the figure below. I have animated the x-axis to highlight the fact that Simplex noise is a continuous function. Another useful property is that it produces exactly the same output for a given seed and coordinate pair.

<canvas id="noise" style="height: 200px; width: 100%; border: #ccc solid 1px; margin: 1em 0"></canvas>

This means that there's a chance that are you are the only living being to have ever seen the noise distribution moving in front of your eyes right now :)

## Turning noise into terrain

This is where it gets slightly complicated. If we were working in 3D we could use the noise values as altitude values, producing pretty cool results.

{{< resourceFigure "posts/procedural-maps/img/3d-terrain.png" "3D elevation mapped from noise" >}}

In 2D though we can only play with colors. A naive approach would be to define some color stops for each noise value we'd get something that wouldn't look realistic. So let's say we normalize our noise to output values in the range [0, 100], we could apply the following color map:

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

This is a reasonable approach, but if we want to add different types of terrain (dry areas, forest... ) it becomes too obviously based on noise. An easy way to get around this is to use two noise maps: elevation and moisture. I got this idea from this [amazing blog post by Red Blob Games](https://www.redblobgames.com/maps/terrain-from-noise/). The idea is that elevation controls mountains and water, but is then combined with a moisture map to determine the type of terrain **in between**.

The algorithm I ended up using to choose which terrain to render without losing my hair over it is this:

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

Soon we'll start using this generator for our new game, so I'll update this post if we come up with any improvements to our procedural generator.

You can also follow updates at [#socialgorithm](https://socialgorithm.org), or get in touch if you want to run a coding workshop/competition in your uni, company, school, meetup...

{{< resource "posts/procedural-maps/js/simplex-noise.js" >}}
{{< resource "posts/procedural-maps/js/render.js" >}}
