---
title: The best platform team ships zero tools
description: When building software is nearly free, what should a platform team actually build?
date: 2026-03-13
thumbnail: ''
categories:
  - Engineering
tags:
  - Platform Engineering
  - AI
  - Developer Experience
draft: false
outdated: false
---

Instead of one tool that keeps getting more and more features crammed into, imagine twelve that each perfectly serve the people who asked for them.

That's where I think internal tooling is heading. As the cost of building software drops, the natural endpoint isn't fewer, better applications. It's many more built for a narrow audience, maybe even a single team or workflow. 

But that only works if building and deploying them is nearly free, and right now, it isn't.

I've built a bunch of internal apps and tools since LLMs became good at coding (also before, but not at this rate): Slack bots that kick off jobs, k8s monitoring dashboards, agents that investigate incidents autonomously. Useful stuff, and people use them. But lately I've been stuck on a question that makes all of it feel transitional: what if the thing to build is the environment that lets everyone else build things instead?

## The current model is a bottleneck

Making it easy to build and deploy secure, well-architected systems has always been a core goal of platform engineering. Paved paths, golden templates, sensible defaults for auth, observability, and deployment. None of this is new. What's new is that agentic coding tools like Claude Code are amplifying this goal dramatically. When someone can go from "I have an idea" to "I have working code" in an afternoon, the infrastructure and operational barriers become the only thing standing in the way.

Right now, when someone at our company needs something built, they come to the platform team. We build it, maintain it, and iterate on it based on feedback.

This makes us a funnel. Every request competes for the same small team's attention. The latency between "I wish I had a way to..." and "here you go" is the real cost, and it's currently measured in days or weeks, not compute hours.

## The hard problem isn't building. It's everything around building

When someone outside the platform team tries to build something themselves, the code is rarely what stops them.

Setting up infrastructure. Getting a database provisioned. Creating a Slack app, wiring up a Slack webhook so the bot actually receives events. Configuring auth. Setting up a deployment pipeline. Connecting to object storage. Getting access to an LLM endpoint. Making the thing trigger on a GitHub PR or a Linear status change.

Each of these is individually solvable, but collectively they're a wall that will discourage most people.

And there's a second problem: letting people vibe-code whatever they want, however they want, is genuinely risky. No observability. No centralised auth. Secrets hardcoded or committed to a repo. No consistent deployment pattern, so no consistent way to audit, rotate credentials, or respond to incidents.

If we're going to make building easy, we need to make building safely the path of least resistance. Heavy infrastructure (networking, GPU clusters, core data stores) still goes through the standard Terraform-and-PR path. But the long tail of internal apps shouldn't need to.

## The "Tool CLI"

What we need is to give Claude Code (or similar) the tools to do this properly. My idea is to give it a cli that automates deploying apps. People can still use it manually of course, but it will mean Claude Code will know how get you from zero to a working app in one session.

We provide this cli, and ensure that it can bootstrap an app, add all necessary components (auth, db, third party integrations... ) and an associated Claude Code skill that people can use to work with these apps.

If this CLI sounds familiar, it should. Heroku, Railway, Vercel, and internal developer platforms like Backstage have all worked this seam before. The difference is the agentic angle. When the primary consumer of your platform isn't a person reading docs but an AI agent that needs well-defined commands and predictable outputs, the design constraints change. You need extremely good documentation, a simple and predictable api surface, stricter conventions, and clear conventions. 

You write your logic, and the CLI takes care of the rest:

- **Slack integration**: incoming webhooks, slash commands, event subscriptions, all pre-wired
- **Triggers**: react to GitHub PRs, Linear ticket changes, cron schedules, custom events
- **Persistence**: a database and object storage, provisioned and accessible, no Terraform required
- **Compute**: appropriate environments, including GPU access for ML workloads
- **LLM access**: authenticated endpoints to your org's model APIs
- **A web UI framework**: so what you build has a real interface without starting from scratch
- **Auth, secrets, and observability**: handled by the CLI, not per-app. Every deployment gets centralised authentication, managed secret injection, and structured logging and metrics from day one.

Your code handles the logic. The CLI handles the plumbing. And crucially, it handles the governance too.

In practice, it looks something like this:

```bash
$ tool new inference-bot
  Created inference-bot/ with default config

$ tool add slack --command "/generate"
  Registered slash command /generate

$ tool deploy
  Running checks...
  Building...
  Deployed to https://inference-bot.internal.co
  Slack command /generate is live
```

That's it. Someone wanted a Slack bot that takes a model checkpoint path and a prompt, spins up a GPU node to run inference, and posts the result back to the channel. The interesting code is the twenty lines of application logic. The CLI handled everything else.

## What the platform team becomes

This reframes the platform team's job entirely. We stop being the people who build things and start being the people who remove barriers safely.

Our users are agents that represent users.

The success metric changes too. It's not "how much did we ship" but "how much did other people ship", and "how long did it take them to go from idea to working product?"

The platform team's leverage becomes multiplicative rather than additive. Every capability we add to the CLI (a new trigger type, a new integration, a better deployment model) benefits everything built on top of it, including things that don't exist yet.

## So, did this work? - 6 months update

It’s hard to convey how big of a success this has been. It has pretty much reshaped the day to day of many people, it has empowered every single person to make what they needed and wanted - and creativity is through the roof!

We have approximately 2.5 apps/user (although as you can imagine a few users have built way more and some haven’t at all)

I highly encourage anyone reading this to implement something similar wothin their companies!
