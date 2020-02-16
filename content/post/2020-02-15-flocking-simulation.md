---
title: Flocking Behaviour Simulations
description: Different approaches
date: "2020-02-08"
draft: true
categories:
- Learning
tags:
- JavaScript
- Procedural
---

I've always been fascinated by flocks of birds flying in the sky, when they create patterns like the ones you can see in this video:

{{< youtube V4f_1_r80RY >}}

And as usual I've thought, how hard can it be to recreate? So off we go into the next learning adventure!

## State of the Art: Boid, Vicsek, Three-Circle, Social force...

There is tons of research into this topic already, which is great because it should make the work a lot simpler! Ideally I can focus on rendering enough points in the screen to achieve a visual effect similar to the video above. I might try each of the models to see how they look and feel, or at least the ones that don't require a ton of work to implement.

The first paper that I could find on flocking modelling was publised by [Craig Reynolds in 1986](http://www.red3d.com/cwr/boids/) with a fairly simple model based on three rules that seem to have become "the standard": *Alignment-Cohesion-Separation*.

Reynolds called each particle in the simulation a *boid* (bird-oid object), so I'll use that term throughout this post and in [my code](https://github.com/aurbano/flock-webgl). His three rules mean that when the boids are far from each other they'll fly towards other boids. When they're close they'll follow each other's directions, and if they get too close they'll separate.

So I set out to implement this and see how it looks!

### First Iteration: Reynolds' Boids

To keep things simple initially, I decided to simulate it in 2D, make the speed of the boids fixed and have the rules determine their flight direction only (the algorithm is detailed below the visualization). 

Although my end goal is to generate a visualization that looks like the reference video, so I'll eventually need to go 3D and a few thousand boids.

My initial algorithm is:

1. For each boid {{<math-inline>}}z_i{{</math-inline>}} find all neighbours {{<math-inline>}}z_{ij}{{</math-inline>}} within each of the radii (cohesion {{<math-inline>}}z_{ij_c}{{</math-inline>}} , alignment {{<math-inline>}}z_{ij_a}{{</math-inline>}}, and separation {{<math-inline>}}z_{ij_s}{{</math-inline>}})
1. For each group of neighbours {{<math-inline>}}z_{ij_k}{{</math-inline>}} calculate the center of mass {{<math-inline>}}C_k = z_i - z_{ij_k}{{</math-inline>}} and the angle between it and each boid: {{<math-inline>}}\theta_k = atan2(\dfrac{z_i}{C_k}){{</math-inline>}}
1. Update the boid's direction {{<math-inline>}} \theta_i(t+1) = \theta_i(t) + c_k(\theta_k - \theta_i) {{</math-inline>}} where {{<math-inline>}}c_k{{</math-inline>}} is the coefficient for that rule.

Below I have embedded a CodePen with the code I have at this stage: (Green indicates that a boid is aligned to others. The mouse behaves like a predator, so boids will try to avoid it and turn red while doing so)

{{< codepen aurbano abONWZr "Basic version of Reynolds' algorithm" 350 >}}

The algorithm clearly doesn't work that well yet, unsurprisingly since I've made a lot of simplifications to Reynold's rules in order to quickly get something done that I can play with - but the good thing is that now I have the project setup (WebGL renderer setup, 2D boids arranged, turning of the sprites as they fly... ) so I can iterate fast <del title="Wait, wrong context!">and break things</del>.

At least there is *some* flocking behaviour though. I can clearly see the effects of cohesion, alignment, and separation so it's not a bad start!

Alhough I need a better way to *see* what the boids are doing, something that will give me an idea of what's happening **over time** in case there are other obvious problems with the algorithm, so I modified the code slightly to also render a heatmap based on the boids locations: 

{{< codepen aurbano RwPajeY "Heat map of the boids' locations over time" 450>}}

Thanks to the heatmap I can quickly identify a big issue with my simulation: I've made the boids *wrap* around the edges of the simulation window as if it were a projected sphere. But boids on the opposite side are not currently taken into account for the distance when finding neighbours, meaning that the algorithm breaks near the edges of the simulation. Before I improve the algorithm I'd like to fix that problem so that I get accurate visual feedback.

I have two options:

* Keep the wrapping, and include boids on the other side of the window (potentially more realistic).
* Disable wrapping and instead make the boids prefer the center of the screen with another weak force (less realistic?).

Calculating the distance either in a straight line or wrapping around the edges sounds complicated but it really isn't, since we can just use negative x/y values in the distance function.

{{< resourceFigure "posts/flocking/img/wrapping.png" "Include boids wrapping around the simulation when calculating the distance to neighbours" >}}

#### Next steps

If I want to continue with this model I'd need to make a modification so that each neighbour's contribution to the center of mass is scaled by the distance to the boid. The other issue is that this approach allows instant changes in direction, whereas in real life there should always be some delay - this makes me think that each boid should have the current direction, the desired direction, and perhaps *how much* they want to go in that direction. I also need to solve the problem with wrapping around the window, I might just remove that later and instead always make the boids *prefer* being closer to the center with a weak attraction.

Using this new approach, if there is a predator the desired direction will be to go away from it, and the *how much* part will be very high, depending on the predator's distance.

The other change I should make is that right now neighbours are calculated using only the distance. But real life animals can't see in 360 degrees, so I need to implement the concept of **field of view**.

So to recapitulate, for my second attempt I need:

* Boids Field of View
* Desired Direction & Desire Strength

I'll still simulate constant speed for now.

### Second Iteration: Boids with FoV and Non-Instant turning

I'll start with the visualiation of the new model:


<!-- CodePen Embed Library -->
<script async src="https://assets.codepen.io/assets/embed/ei.js"></script>
