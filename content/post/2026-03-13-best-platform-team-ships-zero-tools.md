---
title: "The best platform team ships zero tools"
description: "When building software is nearly free, what should a platform team actually build?"
date: "2026-03-13"
categories:
  - Engineering
tags:
  - Platform Engineering
  - AI
  - Developer Experience
---

Instead of one tool that half the company tolerates, imagine twelve that each perfectly serve the people who asked for them. That's where I think internal tooling is heading. As the cost of building software drops the natural endpoint isn't fewer, better applications - it's many more - each built for a narrow audience, maybe even a single team or workflow! 

But that only works if building and deploying them is nearly free, and right now, it isn't.

I've built a bunch of internal apps and tools since LLMs became good at coding (also before, but not at this rate): Slack bots that kick off jobs, k8s monitoring dashboards, agents that investigate incidents autonomously. Useful stuff, and people use them. But lately I've been stuck on a question that makes all of it feel transitional: what if the thing to build is the environment that lets everyone else build things instead?

## The current model is a bottleneck

Making it easy to build and deploy secure, well-architected systems has always been a core goal of platform engineering. Paved paths, golden templates, sensible defaults for auth, observability, and deployment. None of this is new. What's new is that agentic coding tools like Claude Code are amplifying this goal dramatically. When someone can go from "I have an idea" to "I have working code" in an afternoon, the infrastructure and operational barriers become the only thing standing in the way.

Right now, when someone at our company needs something built, they come to the platform team. We build it, maintain it, iterate on it based on feedback.

This makes us a funnel. Every request competes for the same small team's attention. The latency between "I wish I had a way to..." and "here you go" is the real cost, and it's currently measured in days or weeks, not compute hours.

## The hard problem isn't building. It's everything around building

When someone outside the platform team tries to build something themselves, the code is rarely what stops them. It's everything else.

Setting up infrastructure. Getting a database provisioned. Creating a Slack app, wiring up a Slack webhook so the bot actually receives events. Configuring auth. Setting up a deployment pipeline. Connecting to object storage. Getting access to an LLM endpoint. Making the thing trigger on a GitHub PR or a Linear status change.

Each of these is individually solvable. Collectively they're a wall. Someone who could write the core logic in an afternoon can easily spend days on the infrastructure surrounding it, or just give up entirely.

And there's a second problem: letting people vibe-code whatever they want, however they want, is genuinely risky. No observability. No centralised auth. Secrets hardcoded or committed to a repo. No consistent deployment pattern, so no consistent way to audit, rotate credentials, or respond to incidents. If we're going to make building easy, we need to make building safely the path of least resistance. Heavy infrastructure (networking, GPU clusters, core data stores) still goes through the standard Terraform-and-PR path. But the long tail of internal apps shouldn't need to.

## The "Tool CLI"

What we need is to give Claude Code (or similar) the tools to do this properly. In our case that's going to be a cli that automates deploying apps. People can still use it manually of course, but it will mean Claude Code will know how get you from zero to a working app in one session.

We provide this cli, and ensure that it can bootstrap an app, add all necessary components (auth, db, third party integrations... ) and an associated Claude Code skill that people can use to work with these apps.

If this CLI sounds familiar, it should. Heroku, Railway, Vercel, and internal developer platforms like Backstage have all worked this seam before. The difference is the agentic angle. When the primary consumer of your platform isn't a person reading docs but an AI agent that needs well-defined commands and predictable outputs, the design constraints change. You need fewer options, stricter conventions, and a surface area that an LLM can navigate without hand-holding. 

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

Someone describes what they want in plain English, the agent writes the application logic and calls the CLI to scaffold and deploy it, and it works. Not because the agent is magic, but because the CLI has already solved the hard parts. The CLI itself comes with a Claude Code skill, so the agent already knows the available commands and conventions without reading any docs.

Designing for agents first is what makes this powerful.

## The platform team benefits first

The platform team is the first and most frequent user of the CLI. Every internal tool we'd normally build the old way (provision infrastructure, write deployment configs, wire up integrations) now goes through the same path we're offering everyone else. This is the immediate payoff: what used to take us a week takes ten minutes.

Democratisation is the compounding benefit, not the launch story. Once the CLI is genuinely good enough that the platform team reaches for it by default, opening it up to the rest of the company is just marketing.

## Why this changes the adoption problem

One thing that tends to happen when building gets cheap is an explosion of internal apps that nobody uses.

However when things are cheap to build and share a common substrate, it's fine for something to serve three people. It doesn't need to justify a platform team's investment because the platform team didn't build it. It just needs to exist, do its job, and not become a security liability.

## What the platform team becomes

This reframes the platform team's job entirely. We stop being the people who build things and start being the people who build the environment where things get built. Our users aren't end-users of specific applications. They're the builders themselves, whether that's a person with an IDE or an agent with a task.

The success metric changes too. It's not "how much did we ship" but "how much did other people ship", and "how long did it take them to go from idea to working product?"

The platform team's leverage becomes multiplicative rather than additive. Every capability we add to the CLI (a new trigger type, a new integration, a better deployment model) benefits everything built on top of it, including things that don't exist yet.

## Day two

The interesting problems aren't in the initial build. They're in what happens after a hundred apps exist. Schema migrations across dozens of independent databases when a shared library changes. Garbage-collecting apps that nobody's touched in six months. Handling what happens when someone leaves the company and their bot is still serving a critical workflow. Observability across hundreds of small services that each do one thing but collectively form the nervous system of the org.

These are the problems I'm actively working through. They're not blockers, but they're where the real platform engineering starts: not making day one easy, but making day two hundred manageable.

And underneath all of this sits a question I keep coming back to. When building is genuinely cheap, how do you decide what's worth building at all? The constraint used to be engineering time. Soon it'll be something else: attention, maybe, or the ability to see what's actually needed versus what's just easy to make.
