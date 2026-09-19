---
title: "Storage is not memory"
date: 2026-05-31
draft: true
tags: ["AI", "Agents", "Platform Engineering"]
description: "I built a first version of long-term memory for my agents. Storing things was the easy part. The real work was organising them, getting the right one back, and eventually retrieving by intent rather than similarity. This is the start of a build log."
---

Most writing about agent memory jumps straight to security: poisoning, drift, agents that get quietly corrupted over time. It's a real problem and I'll get to it. But it's not the problem I hit first, and I don't think it's the one most people hit first either.

I've built an initial version of long-term memory for the agents I work with. The thing that actually ate my time was boring: how do you organise what the agent has seen, and how do you get the right piece of it back at the right moment? Storage was a non-issue. Retrieval and organisation were the work. Trust came second, and you only get there once the first part works well enough to matter.

This is the start of a build log. I'll update it as I run evals and find out which of my decisions were wrong.

## What I wanted the agent to remember

Two kinds of agent at work. Coding agents, where success is clean: tests pass, the PR merges, you know it worked. And investigation agents that poke at infrastructure, where success is murkier and often never confirmed.

The thing worth remembering isn't facts so much as how to get things done here. Which tool to reach for, in what order, keyed on what signal, with which gotchas. The classic case: it took ten tool calls to work out that the thing I needed lived in tool A, so next time just go straight there. For the coding agent it's closer to procedure, how this codebase does things. For the investigation agent it's tool choreography plus a slowly growing pile of facts about systems that keep changing under me.

I assumed recall would be the hard part. Recall is maybe a fifth of it. The rest is deciding what's worth keeping, how to shape it so it's findable later, and how to surface it without the agent having to ask.

## Storage is the easy part

A vector store will remember anything you throw at it. That's not the win it sounds like. The first version I built did roughly what everyone's first version does: embed each session, dump it in, pull back nearest neighbours at the start of the next session. It worked in the demo and was useless in practice, for two reasons that have nothing to do with storage.

First, the agent didn't know what it had. It would never think to search for a memory it didn't know existed, so a huge fraction of what I'd stored just sat there. Second, nearest-neighbour over raw sessions returns things that are *textually* similar to the current task, which is often not the same as *useful* for it. A past session full of the same error messages looks relevant and frequently isn't.

So the real questions turned out to be organisational:

- What's the unit of memory? A whole session is too coarse to reuse. A single message is too fine to mean anything.
- How do you separate the durable lesson from the throwaway detail of the run it came from?
- How do you get the right thing back when the agent doesn't know to ask?

None of those are storage questions. They're the actual problem.

![Placeholder: my first-version pipeline (embed session, dump, nearest-neighbour retrieval) next to where it ended up. I'll add this once the second iteration is stable.](#)

## Organisation: typed memory, not one big pile

The change that helped most was to stop treating memory as one undifferentiated store and start typing it. Different kinds of knowledge have different shapes and different shelf lives, and collapsing them into one retrieval problem is what made the first version feel random.

| Kind of memory | Example | How it behaves |
|---|---|---|
| Durable domain fact | "this service's failures are usually permissions, not network" | Long-lived, slow to expire |
| Tool fact or quirk | "this data source is rate-limited and returns stale results" | Short-lived, re-checked against reality before use |
| Procedure | "localise a latency regression: aggregate spans, pull the slowest trace, correlate with recent deploys" | Earns or loses its place by track record |
| Raw episode | the full trace of one investigation | Append-only, the source everything else derives from |

The split between the raw episode and the derived memory matters more than I expected. I keep the raw trajectory of every session append-only and never edit it. Everything else, the facts and procedures and conclusions, is derived from those episodes and can be re-derived. When a derived memory turns out to be wrong, I don't surgically edit it out of a pile of embeddings. I fix the derivation and rebuild.

The other organisational decision was to extract lessons at the right granularity. A procedure is a sequence of tool *roles* and the conditions it applies under, not a frozen recording of one run. The point of remembering "ten calls became one" is the shortcut, not the ten calls. The recent research on pulling structured lessons out of agent trajectories ([Trajectory-Informed Memory Generation](https://arxiv.org/abs/2603.10600) is a good example) makes the same split: a clean success teaches a strategy, a failure-and-recovery teaches a recovery, and an inefficient-but-successful run teaches an optimisation. That last category is exactly the shortcut case, and it's worth pulling out on its own rather than hoping it falls out of generic success.

## Retrieval: the agent won't ask

The biggest jump in how useful memory felt came from changing *when* it gets surfaced.

If you only retrieve at the start of a session, you're betting the agent knows what it needs before it starts, which for investigation work it almost never does. The useful moment is usually reactive. The agent runs a tool, sees a result, and that result is the cue that there's something in memory worth pulling in. The agent doesn't request it; the system notices the result looks relevant to something it's seen before and surfaces it. This lines up with [ImplicitMemBench](https://arxiv.org/abs/2604.08064), which makes the case that the memory behaviour that matters is the implicit kind, applying a past lesson without being reminded, and that the usual recall benchmarks don't measure it. That last point shaped my eval plan: I'm not optimising for conversational-recall scores, because they reward the wrong behaviour.

There's a longer-term retrieval idea I find compelling and haven't built yet. The record of what the agent did is also training data for the retriever. What it looked at and then ignored is a signal about what was actually relevant, and you can train retrieval on that, [including from runs that failed](https://arxiv.org/abs/2604.04949). I'm starting with plain heuristic retrieval, but because I'm keeping the raw episodes from day one, the material to make retrieval smarter later is already accumulating. That reframed the append-only record from good hygiene into the most valuable thing in the design.

## Where I actually want this to go: intent, not similarity

Here's the part I care most about, and it's why I don't think embedding search is the finish line.

Similarity is not relevance. The memory that's most textually similar to what the agent is looking at is often the wrong one: the same error string from an unrelated incident, the right tool recalled for a different task. Nearest-neighbour search can't tell those apart, because it doesn't know what you're trying to do. It only knows what you typed looks like what it stored.

What I want instead is a system that retrieves against *intent*. Not "what's near this in vector space" but "what's useful given the goal, the kind of work, and the things in play right now." This isn't only a preference of mine; the effect shows up in the numbers. [STITCH](https://arxiv.org/abs/2601.10702) indexes memory by contextual intent (the latent goal, the action type, the entities that matter) and filters out the semantically-similar-but-context-wrong matches that plain retrieval surfaces. They report a 35.6% improvement over the strongest baseline, and the gains grow the longer the trajectory gets, which is exactly the investigation case I care about. There's a parallel line of work ([PASK](https://arxiv.org/abs/2604.08000), [ContextAgent](https://arxiv.org/abs/2505.14668)) on inferring latent needs from ongoing context and offering help proactively rather than waiting to be asked.

The experience I'm chasing is the one where the memory feels like a colleague who's been watching you work: "I can see you're in this service, debugging this kind of failure, on this stack. Here's the thing that bit you last time." Delivered unprompted, and right.

The shape I'm exploring for that is a memory system that isn't a function you call but a small stateful loop that runs alongside the session, keyed by a shared id. It keeps receiving context as the agent works, maintains a running picture of what's going on, searches and judges memories on its own between the agent's steps, and surfaces something only when it decides the moment is right. A recall *session* rather than a recall *call*.

I want to be honest that this is the speculative end of the plan, and I don't think it's solved anywhere yet. It also has obvious ways to go wrong. An always-on reasoning loop costs tokens while you think, so it needs a cheap gate on when it's even worth waking up, which is the same lesson the [proactive-retrieval work](https://arxiv.org/abs/2604.20572) already learned. A confidently-wrong proactive suggestion is worse than silence, because it teaches you to ignore the thing. And if it misreads your intent, it doesn't just fail to help, it actively hides the right memory because that memory didn't match the goal it wrongly inferred. So I'm building the cheap version first: infer intent per step, retrieve against it, measure whether it beats similarity. The live companion is the thing I graduate to only if the numbers say the continuity is worth its cost.

## Then you hit trust

Once retrieval works well enough that the agent is actually leaning on memory, the second problem shows up, and it's the one everyone wants to talk about first.

When the agent relies on what it remembered, a wrong memory stops being inert and starts steering behaviour. An agent finishes a messy investigation, draws a slightly wrong conclusion, writes it down, and a later session retrieves it as fact and builds on it. The error compounds quietly, because everything still looks like it's working. There's no stack trace for "the agent believes something that used to be true."

This is where the security framing earns its place. A writable store that influences what an agent does next is exactly what an attacker wants to write to, which is why it now has its own entry in the [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/) as memory and context poisoning. The version that made me pay attention is [Memory Control Flow Attacks](https://arxiv.org/abs/2603.15125): a planted memory dominating which tool the agent picks, against the user's stated intent, persisting across sessions. The capability I'm building is the thing being attacked.

Two findings shaped how I'm handling it, both of which I'd have got wrong on instinct. One, a trust label the model is supposed to reason about isn't enough on its own; the model can reason its way past it. Two, [correcting a bad memory by telling the agent in conversation barely works](https://arxiv.org/abs/2603.11768), the relapse rate is close to total, because the bad entry is still sitting in the store. The correction has to happen to the data, not the chat.

My current answer is the same append-only-plus-governance shape: capture is cheap and always happens, but trusting a memory is a separate, gated step. Nothing is treated as reliable until it's corroborated, and until then it's usable but flagged as unverified. The agent never gets to be the sole author and validator of its own trusted knowledge in one motion. I haven't stress-tested any of this yet, which is the honest status of the whole trust layer right now.

## What's next

The first version exists and is good enough to be worth measuring. The next entry will be about the eval: the same tasks run with memory on and off, in isolation, to see whether memory actually moves accuracy and step count or just feels like it does.

I also want this to be useful in my day-to-day coding, not just in my own harness, which means making it work with Claude Code. The constraint there is that you don't get to drive the agent loop, but you do get [lifecycle hooks](https://code.claude.com/docs/en/hooks-guide) that can inject context: at session start, after a tool runs, when a prompt is submitted. That's enough for the reactive surfacing I described, as long as the expensive thinking happens in a background service and the hook just does a fast read of whatever that service has already worked out. The nice property is that it's the same memory service either way. Claude Code is just the most constrained client it has to satisfy, so if the design survives that, it survives anywhere.

The question I most want to answer is about scoring. If a fact shows up across a hundred internal Slack threads, is it more true or just more repeated? Corroboration is a fine signal right up until it rewards consensus over correctness, and I don't think you can reason your way to the answer. You measure it. So I'll measure it, and report what broke.
