---
title: Distributed agent knowledge isn’t a solved problem
description: Building a SOTA knowledge base system for agents, with intent-based recall and solid trust controls.
date: 2026-05-31
thumbnail: ''
categories: []
tags:
  - AI
  - Agents
  - Platform Engineering
draft: true
outdated: false
---

Most writing about agent memory jumps straight to security: poisoning, drift, agents that get quietly corrupted over time. It's a real problem and I'll get to it. But it's not the problem I hit first, and I don't think it's the one most people hit first either.

I've been building a long-term shared memory store for the agents we work with.

This is the start of a build log. I'll update it as I run evals and find out which of my decisions were wrong.

## What I wanted the agent to remember

The thing worth remembering isn't facts so much as how to get things done here. Which tool to reach for, in what order, keyed on what signal, with which gotchas. The classic case: it took ten tool calls to work out that the thing I needed lived in tool A, so next time just go straight there. For a coding agent it's closer to procedure, how this codebase does things. For the investigation agent it's tool choreography plus a slowly growing pile of facts about systems that keep changing under me.

I assumed recall would be the hard part. Recall is maybe a fifth of it. The rest is deciding what's worth keeping, how to shape it so it's findable later, and how to surface it without the agent having to ask.

## What’s the hard part?

As I started thinking about the problem I wrote down questions we’d need to answer:

- What's the unit of memory? A whole session is too coarse to reuse. A single message is too fine to mean anything.
- How do you separate the durable lesson from the throwaway detail of the run it came from?
- How do you get the right thing back at the right time?
- And most importantly, how do you it’s working?

None of those are storage questions. They're the actual problem.

![Placeholder: my first-version pipeline (embed session, dump, nearest-neighbour retrieval) next to where it ended up. I'll add this once the second iteration is stable.](#)

## Organisation: typed memory, not one big pile

Different kinds of knowledge have different shapes and different shelf lives:

| Kind of memory | Example | How it behaves |
| --- | --- | --- |
| Durable domain fact | "this service's failures are usually permissions, not network" | Long-lived, slow to expire |
| Tool fact or quirk | "this data source is rate-limited and returns stale results" | Short-lived, re-checked against reality before use |
| Procedure | "localise a latency regression: aggregate spans, pull the slowest trace, correlate with recent deploys" | Earns or loses its place by track record |
| Raw episode | the full trace of one investigation | Append-only, the source everything else derives from |

We keep the raw trajectory of every session append-only and never edit it. Everything else, the facts and procedures and conclusions, is derived from those episodes and can be re-derived. When a derived memory turns out to be wrong, we can then fix the derivation and rebuild.

The other organisational decision was to extract lessons at the right granularity. A procedure is a sequence of tool _roles_ and the conditions it applies under, not a frozen recording of one run. The point of remembering "ten calls became one" is the shortcut, not the ten calls.

The recent research on pulling structured lessons out of agent trajectories ([Trajectory-Informed Memory Generation](https://arxiv.org/abs/2603.10600) is a good example) makes the same split: a clean success teaches a strategy, a failure-and-recovery teaches a recovery, and an inefficient-but-successful run teaches an optimisation. That last category is exactly the shortcut case, and it's worth pulling out on its own rather than hoping it falls out of generic success.

## Retrieval: the agent won't (or shouldn’t have to) ask!

The useful retrieval moment is usually reactive. The agent runs a tool, sees a result, and that result is the cue that there's something in memory worth pulling in. The agent doesn't request it; the system notices the result looks relevant to something it's seen before and surfaces it.

This lines up with [ImplicitMemBench](https://arxiv.org/abs/2604.08064), which makes the case that the memory behaviour that matters is the implicit kind, applying a past lesson without being reminded, and that the usual recall benchmarks don't measure it. That last point shaped my eval plan: I'm not optimising for conversational-recall scores, because they reward the wrong behaviour.

There's a longer-term retrieval idea I find compelling: The record of what the agent did is also training data for the retriever. What it looked at and then ignored is a signal about what was actually relevant, and you can train retrieval on that, [including from runs that failed](https://arxiv.org/abs/2604.04949).

## Intent, not similarity

Similarity is not relevance. The memory that's most textually similar to what the agent is looking at is often the wrong one: the same error string from an unrelated incident, the right tool recalled for a different task. Nearest-neighbour search can't tell those apart, because it doesn't know what you're trying to do. It only knows that what you typed looks like what it stored.

What I want instead is a system that retrieves against _intent_. Not "what's near this in vector space" but "what's useful given the goal, the kind of work, and the things in play right now." [STITCH](https://arxiv.org/abs/2601.10702) indexes memory by contextual intent (the latent goal, the action type, the entities that matter) and filters out the semantically-similar-but-context-wrong matches that plain retrieval surfaces. They report a 35.6% improvement over the strongest baseline, and the gains grow the longer the trajectory gets, which is exactly the investigation case I care about. There's a parallel line of work ([PASK](https://arxiv.org/abs/2604.08000), [ContextAgent](https://arxiv.org/abs/2505.14668)) on inferring latent needs from ongoing context and offering help proactively rather than waiting to be asked.

The experience I'm chasing is the one where the memory feels like a colleague who's been watching you work: "I can see you're in this service, debugging this kind of failure, on this stack. Here's the thing that bit you last time."

The shape I'm exploring for that is a memory system that isn't a function you call but a small stateful loop that runs alongside the session. It keeps receiving context as the agent works, maintains a running picture of what's going on, searches and judges memories on its own between the agent's steps, and surfaces something only when it decides the moment is right. A recall _session_ rather than a recall _call_.

There are trade-offs to this obviously. An always-on reasoning loop costs tokens while you think, so it needs a cheap gate on when it's even worth waking up, which is the same lesson the [proactive-retrieval work](https://arxiv.org/abs/2604.20572) already learned. A confidently-wrong proactive suggestion is worse than silence, because it teaches you to ignore the thing. And if it misreads your intent, it doesn't just fail to help, it actively hides the right memory because that memory didn't match the goal it wrongly inferred.

## Will it learn the right things?

When the agent relies on what it remembered, a wrong memory stops being inert and starts steering behaviour, so it can easily become an error propagator. An agent finishes a messy investigation, draws a slightly wrong conclusion, writes it down, and a later session retrieves it as fact and builds on it. The error compounds quietly, because everything still looks like it's working. There's no stack trace for "the agent believes something that used to be true."

It turns out that [correcting a bad memory by telling the agent in conversation barely works](https://arxiv.org/abs/2603.11768), the relapse rate is close to total.

So we make the boundary between a “belief” and a “fact” something hard to cross. Nothing is treated as reliable until it's corroborated, and until then it's usable but flagged as unverified. The agent never gets to be the sole author and validator of its own trusted knowledge in one motion.

## What now?

I’ve been running an initial version of this system across a cohort of 50-100 users for around 6 months, both learning and offering recall.

I’m going to start evaluating all the massive amounts of data this has generated, and I’ll write a new post with the lessons.
