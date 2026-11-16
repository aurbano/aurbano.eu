---
title: I let an AI agent tune my boiler
description: A week of data from the boiler bus, one dial turned, and what an AI agent is (and isn't) good at when the system it's optimising is your house.
date: 2026-11-16
thumbnail: ''
categories: []
tags:
  - AI
  - Agents
  - Home Assistant
  - Heating
draft: true
outdated: false
---

My boiler has started 311,903 times. That's the lifetime counter on a 24 kW Worcester combi, and it was the first number that made me think something was off. A boiler that starts that often is short-cycling: it lights, overshoots, switches off, cools, and lights again, burning gas on every ignition and never settling into the long, gentle runs it's designed for.

I'd had the parts to look into this for a while. Home Assistant on a Raspberry Pi, tado valves on every radiator, and an EMS-ESP gateway on the boiler's own data bus that publishes flow and return temperatures, burner state, modulation and counters every ten seconds. What I didn't have was the patience to turn a few hundred thousand data points into a decision.

So I handed the job to an AI agent. This is the log of the first week.

## The setup

The agent works from a git repository on my Mac. It has SSH into the Pi and a [Home Assistant MCP server](https://github.com/homeassistant-ai/ha-mcp) for live state, history, dashboards and service calls. Every change it makes is committed with what and why; every finding goes into a markdown file. The rules are short: read and diagnose freely, back up before anything risky, and ask me before touching the boiler, restarting anything, or deleting anything.

That last rule matters more than it sounds. Most of the useful work here is reading, and an agent can read for hours without getting bored. The changes are few and physical, so I want to make them myself.

## What the data said

The first pass was blunt. Heating cycles averaged about five minutes, and **77 % of them were shorter than five minutes**, against a lifetime average of 13 minutes per start. The burner spent most of its time at its minimum output, around 30 %, which on this boiler is about 7 kW. The average heat the house actually needed over those days was closer to 2.3 kW. Even turned all the way down, the boiler is three times too big for a mild November day, so it can't do anything except switch on and off.

The second finding was about condensing. A condensing boiler only gets its efficiency bonus when the water coming back from the radiators is cool enough, below roughly 55 °C, to condense the steam in its own exhaust. My flow temperature was set to 69 °C on the front dial. The return was above 55 °C for about 70 % of the time the burner was heating. I'd been paying for a condensing boiler and mostly not using that part of it.

{{< chart "posts/heating-with-ai/trace.svg" "Flow and return temperature between midnight and 3 am, before and after the change. The bars along the top are burner runs. At 69 °C the return sits above the shaded condensing zone while the burner is cycling; at 60 °C most of the sawtooth drops into it, but the burner still starts every few minutes." >}}

## The agent checks its own work

Before trusting any of this, the agent built per-room trackers: how fast each room warms up, how fast it loses heat overnight, how hard each radiator works. Then it validated them against the raw history, and found three bugs in its own automations.

The best one: the sensor that decides whether a room is "calling for heat" used a threshold of exactly zero with no hysteresis. When a valve closed to 0 %, the value sat right on the threshold and Home Assistant kept the previous state. Once a room asked for heat, it asked forever. That quietly broke the overnight heat-loss measurements (they never started) and made the dashboard claim the living room had been heating for 18 hours. Another bug double-counted valve opening time, and gave one room a mean valve position of 155 %.

None of these would have crashed. They'd have produced plausible-looking numbers that were wrong. The agent caught them because I asked it to recompute every recorded value from raw history and compare. That has become the default: every metric gets reproduced by hand at least once before it goes on a dashboard.

## One change: 69 → 60 °C

The agent's recommendation was to change one thing at a time, give each change three days, and compare against degree days so a cold snap doesn't look like a regression. First change: lower the flow temperature to 60 °C. Tado only switches the boiler on and off through a relay, so the flow temperature is whatever the dial says. On 13 November I turned the dial.

The condensing problem went away almost overnight.

{{< chart "posts/heating-with-ai/daily.svg" "Share of heating time with the return below 55 °C, per day. Friday is the change day: the dial went to 60 °C at 13:19." >}}

The return temperature distribution shows why: almost the whole hump moved below the line.

{{< chart "posts/heating-with-ai/return-temps.svg" "Return temperature while the burner was heating, as a share of firing time. Only hours when the tado relay was online." >}}

## What didn't change

Short-cycling didn't improve at all. Lowering the flow temperature moved the boiler's on/off band down by nine degrees, from roughly 61–72 °C to 53–63 °C, but didn't make it any wider. So the burner still covers the same ten degrees in the same few minutes and switches off.

{{< chart "posts/heating-with-ai/cycles.svg" "Length of each burner run. Almost identical before and after: about three quarters of runs are under five minutes either way." >}}

That's the next lever: the restart hysteresis, which sets how far the water has to cool before the burner lights again. More on that below.

## The cost: slower rooms

Cooler radiators give out less heat. The textbook figure for going from about 61 °C mean water temperature to 54 °C is roughly 20 % less output, and the rooms noticed. The living room used to warm about a degree an hour with its valve fully open. At 60 °C it manages 0.4 to 0.7, on milder mornings.

{{< chart "posts/heating-with-ai/heatup.svg" "Living Room warming up in the morning with its valve fully open, measured from the moment the valve hit 100 %." >}}

The bedroom is the real limit. Before the change it spent 13 % of the time with its valve wide open and still more than half a degree below target. After, 37 %. That's why the agent's recommendation was to stay at 60 °C rather than go to 55 °C, as originally planned. The efficiency gain from 60 to 55 is small now that the boiler is condensing almost all the time, and the rooms would lose another 15 % or so of radiator output they can't spare.

I like that this came out of the data rather than a rule of thumb. The plan said "go to 55 if the rooms keep up". They didn't, so we don't.

## The thing nobody was looking for

The most useful finding was one neither of us was looking for.

Tado talks to the boiler through a small wireless relay. After the change, that relay kept dropping off tado's network: about 26 of the next 72 hours. When it's offline, every room shows as offline in the tado app, and nothing is really in charge of the boiler. What it does then is not consistent. Through the long outage on Friday night, at 1 °C outside, the burner ran 35 minutes an hour, against a 25-minute average with the relay online. Through the four-hour outage on Saturday afternoon it didn't run at all.

{{< chart "posts/heating-with-ai/relay.svg" "Burner minutes per hour after the change. The shaded spans are the tado relay's outages: sometimes the burner kept going, sometimes it stopped." >}}

Some of that may be wasted gas, and some may be a house that wasn't heating when it should have been. Home Assistant loses sight of every room during an outage, so there's no way to tell. Either way it spoils the experiment, because more than a third of the "after" period comes from a boiler nobody is controlling. Every comparison in this post uses only hours with the relay online. Fixing the relay comes before the next tuning step.

## Gas, honestly

I'd love to give you a percentage saved. I can't yet. Gas per degree day went from 7.5–9.3 kWh before to 7.3–10.0 after. The after days were a weekend with ten-plus hours of relay outage each, and there are only 26 clean hours with smart-meter data. The textbook says better condensing is worth a few percent. I'll know in a month, with the relay fixed and enough data to compare.

## What the agent was good at

- **Reading everything.** It went through a week of ten-second history for a dozen sensors, matched it against valve positions and outdoor temperature, and kept the definitions consistent across days. I would have looked at three charts and guessed.
- **Distrusting its own numbers.** The tracker bugs, and a mistake it made in this week's review (it briefly concluded the living room "never reached 20 °C" at 60 °C; the 20 °C target only lasts an hour, so that was an artefact), were both caught by going back to the raw data.
- **Writing everything down.** The repo has a decision log, a tuning log with a baseline and a review date for each change, and a backlog. When a session picks up three days later, it starts from the notes, not from memory.

## What it needed me for

- **Turning the dial.** Physical changes, and anything that could leave the house cold, are mine.
- **Judgement about the house.** The bedroom runs humid, so lowering its target to save gas is a bad trade. That's not in the data.
- **Unblocking the plumbing.** At one point macOS quietly withdrew the terminal's permission to talk to anything on my local network, and every connection to the Pi failed with "No route to host". The agent eventually worked out that processes started by `launchd` aren't covered by that permission and built itself a small relay. But noticing that the permission had gone was a human-in-the-loop moment.

## Next

Today I approved the second change: widening the restart band from −6 K to −10 K, so the burner waits until the water has cooled to about 50 °C before lighting again. The expectation, written down before the change, is about 25 % fewer starts, seven-plus minutes per run, condensing above 90 %, and no slower rooms. The review is on Thursday. If the rooms suffer, it goes back.

The boiler dashboard now shows exactly that: what changed, what we expect, and how each day measures up.

## Notes on the charts

The charts come from Home Assistant's recorder database: raw ten-second history from the EMS-ESP gateway and the tado integration, between 10 and 16 November 2026. "Heating" means the burner was on, the boiler was in heating mode and the hot-water valve was closed, so hot water doesn't muddy the figures. Unless noted, only hours with the tado relay online are counted. The SVGs are generated by a small script from a JSON export that lives next to this post.
