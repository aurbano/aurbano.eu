---
draft: true
title: "The Last Tool the Platform Team Should Build"
description: Why the highest-leverage thing a platform team can build is a managed runtime wrapper that lets anyone ship internal tools
date: "2026-03-13"
categories:
  - Engineering
tags:
  - Platform Engineering
  - AI
  - Developer Experience
---

I've spent the past year building internal tools — Slack bots that kick off inference jobs, dashboards that surface cluster health, agents that investigate incidents autonomously. Useful stuff. People use them. But lately I've been stuck on a question that makes all of it feel transitional:

**What if the highest-leverage thing I can build is the thing that makes me stop being the person who builds things?**

The cost of building software is collapsing. Not slowly — in lurches. Agentic coding tools are getting good enough that the gap between "having an idea" and "having a working prototype" is shrinking to hours, sometimes minutes. And that changes what it means to be a platform engineer in ways I'm still working through.

## The current model is a bottleneck

Right now, when a researcher at my company wants a tool — a Slack command that triggers a pipeline, a web UI for browsing experiment results, a webhook that reacts to GitHub PRs — they come to me, or someone like me. The platform team builds it, maintains it, iterates on it based on feedback.

This works, but it doesn't scale. Not because we're slow, but because we're a funnel. Every tool request competes for the same small team's attention. And worse, by the time we've built and shipped something, the researcher's needs have often moved on. The latency between "I wish I had a tool that..." and "here's your tool" is the real cost, and it's measured in weeks, not compute hours.

The obvious next step is to make it easier for anyone to spin up a service — templates, cookiecutter repos, a Claude Code skill that knows your org's conventions. We're doing this. It helps. But it doesn't solve the actual hard problem.

## The hard problem isn't building. It's everything around building.

Here's what I've noticed: when someone outside the platform team tries to build their own tool, the code is rarely what stops them. It's everything else.

Setting up infrastructure. Getting a database provisioned. Wiring up a Slack webhook so the bot actually receives events. Configuring auth. Setting up a deployment pipeline. Connecting to object storage. Getting access to an LLM endpoint. Making the thing trigger on a GitHub PR or a Linear status change.

Each of these is individually solvable. Collectively, they're a wall. A researcher who could write the core logic of their tool in an afternoon will spend days — or give up entirely — on the infrastructure surrounding it.

This is the real bottleneck, and it's the one I think the platform team should be obsessing over.

## The wrapper

I keep arriving at the same idea from different angles, so I'm starting to trust it: the most valuable thing the platform team can build is an application wrapper — a managed runtime environment that provides all the hard infrastructure pieces out of the box.

You deploy your code into the wrapper, and you get:

- **Slack integration** — incoming webhooks, slash commands, event subscriptions, all pre-wired
- **Triggers** — react to GitHub PRs, Linear ticket changes, cron schedules, custom events
- **Persistence** — a database and object storage, provisioned and accessible, no Terraform required
- **Compute** — appropriate environments, including GPU access for ML workloads
- **LLM access** — authenticated endpoints to your org's model APIs
- **A web UI framework** — so your tool has a real interface without you building one from scratch
- **Auth and permissions** — handled at the wrapper level, not per-app

Your code handles the logic. The wrapper handles the plumbing.

Now pair this with a Claude Code skill that understands the wrapper's APIs and conventions. A researcher describes what they want — "a Slack bot that takes a model name and a prompt, runs inference on our cluster, and posts the result back to the channel" — and the agent writes the code, deploys it into the wrapper, and it works. Not because the agent is magic, but because the environment it's deploying into has already solved the hard parts.

## Why this changes the adoption problem

One of the things that happens when building gets cheap is an explosion of internal tools that nobody uses. Every team builds their own, nothing integrates with anything else, and you end up with a graveyard of Streamlit apps and orphaned Slack bots.

The wrapper changes this dynamic in a subtle but important way. Because every tool deployed into it shares the same infrastructure — the same Slack workspace integration, the same database layer, the same auth model — they're composable by default. One tool's output can be another tool's trigger. A researcher's quick experiment-browser can talk to another team's data-labelling workflow without anyone writing glue code.

Individual tool adoption matters less when the tools aren't isolated islands. They're features within a shared environment. The wrapper is what people adopt. The tools are just what it can do.

## What the platform team becomes

This reframes the platform team's job entirely. We stop being the people who build tools and start being the people who build the environment where tools get built. Our users aren't end-users of specific applications — they're the builders themselves.

The success metric changes too. It's not "how many tools did we ship" but "how many tools did other people ship, and how long did it take them to go from idea to working product?"

I find this more interesting and more sustainable than the current model. The platform team's leverage becomes multiplicative rather than additive. Every capability we add to the wrapper — a new trigger type, a new integration, a better deployment model — benefits every tool built on top of it, including tools that don't exist yet.

## What I'm still figuring out

I don't think everyone will want to build their own tools, even if they can. There's a difference between removing the barriers and assuming everyone walks through the door. Some people want to describe what they need and have it appear. Others want to tinker. The wrapper needs to serve both — low-floor for the agent-assisted builders, enough depth for the people who want control.

And there's a harder question underneath all of this: when building is genuinely cheap and fast, how do you decide what's worth building at all? The constraint used to be engineering bandwidth. Soon it'll be something else — attention, maybe, or the ability to see clearly what's actually needed versus what's just easy to make.

I think that's the real skill that survives this shift. Not building. Not even platform engineering in the way I currently practice it. But the judgment to know what should exist — and the craft to build the environments where those things can emerge.
