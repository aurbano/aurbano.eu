---
title: "dotdot: A social experiment"
description: Group chat application aiming to help meet and get to know other people
date: "2020-04-13"
cover: thumbnail.png
categories:
- Side Project
tags:
- JavaScript
- Reactjs
- Project
---

About a month ago I had the idea to make a chat where you'd be put in a "room" with a group of people, not too big, so you can just have a chat. No complications, just that.

Then the isolation came, bringing with it a ton of free time and an even better reason to make this - people would be bored at home!

So we set out to make it, I managed to convince a couple of friends to give me a hand with this: [@prhcummins](https://github.com/prhcummins) and [@jaicab](https://github.com/jaicab) and off we went.

We decided to do this properly and determine our mission by picking a goal that we'd use to guide our decisions. 

## Goal

**For people to stay and chat, and as a secondary goal have them come back.**

Now we need to figure out how we'll measure success, so we picked a few data points that we could focus on improving:

* Time spent Chatting / Session
* Messages Sent / Session
* New / Returning users

(At the end I'll show our stats on the day we launched! - today, and I'll write a follow up post in a few days with the things I've learned about our analytics data gathering)

## Development

I started to write the backend in [Elixir](https://elixir-lang.org/), using [Phoenix](https://www.phoenixframework.org/) - because I had always heard it was amazing for realtime applications (It's the stack that powers WhatsApp as far as I know), but after several days of trying things I realised that the road to an MVP would be extremely long on this stack, and I did want to actually put this online at some point...

So we switched to good ol' NodeJS with [Socket.IO](https://socket.io/) and a React frontend (maybe I should link all of them, but I feel like people would only click on the unknown ones anyway.. )

Using this we were able to get an MVP up and running in about 2 weeks, we first listed all the features we thought were important for day 1 in production - and then used all the new free time isolation gave us to power through. And to be fair, TypeScript with React and our Socket.IO backend were like a breeze of fresh air in general!

## New Ideas (our value proposition)

We had a few ideas that would make [dotdot](https://dotdot.im) something new:

* users would be put in rooms automatically
* everyone will see what everyone else types

The second one is an idea I've had on my mind for years I think. It's something that makes it feel so much _closer_, like you are having an actual face to face conversation! I almost feel like this is the first major invention of my life hahah

Anyway, enough talking, more showing: Try [dotdot.im](https://dotdot.im) for yourself!

## Some Examples

To do a soft launch we [posted about it](https://www.reddit.com/r/reactjs/comments/g0qjxc/we_made_a_website_where_people_can_talk_to_others/) on the ReactJS subreddit, and soon after people started coming in!

The amazing thing about this launch was that everyone was a developer, and somehow that made everyone be so nice! Just trying it out, giving suggestions for improvement, finding bugs... but also having regular conversations like we wanted! :)

Here are a few screenshots of conversations I found really nice!

{{< resourceFigure "posts/dotdot/conversation.png" "'this actually feels like a conversation' :D" >}}

{{< resourceFigure "posts/dotdot/pip_child.png" "Someone telling us about the child they were about to have!" >}}

{{< resourceFigure "posts/dotdot/shower2.png" "Someone left, then had to come back from the middle of a shower to tell us something hahaha (continues below)" >}}

{{< resourceFigure "posts/dotdot/shower.png" "The rest of the convo from above" >}}

And finally an example of the admin panel!

{{< resourceFigure "posts/dotdot/admin.png" "Our admin panel for the MVP" >}}

So some stats from our launch:

* **200 people** came try it
* People spent **3 minutes** chatting on average (need to expose percentiles, because most people either chatted for >20 minutes, or a few seconds)
* We had a pretty constant average of **10 messages / user** (although this counts total users, need to calculate it per user who sent at least one message)

Heh just writing about the stats is giving me all these ideas to make them more useful! Being smart about stats is so useful, and we definitely want to keep iterating over these to make sure we're aligned with our mission!

So all in all the launch was a **MASSIVE** success, which felt amazing - and it also gave us more than 13 issues to work on :) 

Talk to you soon, you know where to find me :)
