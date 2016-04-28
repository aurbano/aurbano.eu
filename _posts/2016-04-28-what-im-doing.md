---
layout: post
title: "2016 Q1 Update"
tagline: "Haven't posted in a while, and want to share thoughts"
description: "I guess this is just a long tweet"
categories:
  - Main
tags:
  - thoughts
---
{% include JB/setup %}

#### Actions

This past year I invested heavily in Angularjs - building a massive application at work (at least it feels massive to me, the front end is at about 20k LOC without dependencies).

At some point I realised that JS wasn't cutting it for *our size*, Angularjs provided the tools to build, but **not to maintain**. So I decided to refactor everything into **Typescript**. Three weeks and many late nights later we had type safety, coding without messing things up was easy and fun again!

#### Thoughts

Around May I started a new side project (as usual) and wanted to choose the best possible stack (as always). **Angular2** would've been awesome, but **React** seems to be the "winning framework" now, and learning is always a plus right?

On to the server side: Java is what we've been using at our work project, it's reliable and everyone knows it. "But NodeJS!!" some people would be screaming right now - yeah, I love it as well, but I wouldn't build (at the moment) a massive system with it. Maybe with Typescript... But no, I prefer the safety of mind I get when building a Java/Scala backend.

And then I came across this in HN last night: [Postgraphql](https://github.com/calebmer/postgraphql) - a project that sets up a Graphql server on top of Postgres! Seriously, I thought REST was **the coolest kid on the block**, but read a bit of Graphql's docs.


> Because of multiple round-trips and over-fetching, applications built in the REST style inevitably end up building ad hoc endpoints that are superficially in the REST style. These actually couple the data to a particular view which explicitly violates one of REST's major goals. Most REST systems of any complexity end up as a continuum of endpoints that span from “traditional” REST to ad hoc endpoints.
> *-- GraphQL docs*

Having **the client** decide which data, which format, and what **combinations** (JOINS) to do with it, just makes **maintainability** insanely easy! (And having an easy to maintain project **is** the best thing, way better than sliced bread)

I haven't used it extensively, so maybe its implementations are flawed, but the *idea* is brilliant. And that's what I care for right now. People are awesome and pull requests will fix the issues, but **the base ideas aren't fixable**. So yeah, good luck documenting your REST API automatically... (including authentication/authorisation, request/response formats, flows of requests, you get it)

#### And the point is?

No idea, probably that I wish everyone would just stop *creating* new frameworks and workflows for a second, so that we could all just step back, look at the mess we've done, and come up with **the actual, good solution**. But now I have to quote XKCD...

![XKCD](http://imgs.xkcd.com/comics/standards.png)

At the same time I love the feeling of "mind blown" that you get when reading how **the new** framework does things, and it's so obvious it's better that you just don't understand what the hell we were thinking before!

Maybe the whole point of this blog will be to write about what excites me, twice a year or so, so that I can look back later on and realise how stupid hypes are...
