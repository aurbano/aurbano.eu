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

My boiler has started 311,903 times. That's the lifetime counter on a 24 kW Worcester Bosch combi, and it was the first number that made me think something was off. A boiler that starts that often is short-cycling: it lights, overshoots, switches off, cools, and lights again, burning gas on every ignition and never settling into the long, gentle runs it's designed for.

I'd had the parts to look into this for a while: [Home Assistant][home-assistant] on a [Raspberry Pi 4][raspberry-pi], [tado smart radiator thermostats][tado] on every radiator, and an [EMS-ESP][ems-esp] gateway from [BBQKees][bbqkees] on the boiler's own data bus, which publishes flow and return temperatures, burner state, modulation and counters every ten seconds. What I didn't have was the patience to turn a few hundred thousand data points into a decision.

So I handed the job to an AI agent. This is the story so far.

## The setup

The agent works from a git repository on my Mac. It has SSH into the Pi and a [Home Assistant MCP server](https://github.com/homeassistant-ai/ha-mcp) for live state, history, dashboards and service calls. Every change it makes is committed with what and why; every finding goes into a markdown file. The rules are short: read and diagnose freely, back up before anything risky, and ask me before touching the boiler, restarting anything, or deleting anything.

That last rule matters more than it sounds. Most of the useful work here is reading, and an agent can read for hours without getting bored. The changes are few and physical, so I want to make them myself.

## What the data said

The first pass was blunt. Heating cycles averaged about five minutes, and **77 % of them were shorter than five minutes**, against a lifetime average of 13 minutes per start. The burner spent most of its time at its minimum output, around 30 %, which on this boiler is about 7 kW. The average heat the house actually needed over those days was closer to 2.3 kW. Even turned all the way down, the boiler is three times too big for a mild November day, so it can't do anything except switch on and off.

The second finding was about condensing. A condensing boiler only gets its efficiency bonus when the water coming back from the radiators is cool enough, below roughly 55 °C, to condense the steam in its own exhaust. My flow temperature was set to 69 °C on the front dial. The return was above 55 °C for about 70 % of the time the burner was heating. I'd been paying for a condensing boiler and mostly not using that part of it.

## The agent checks its own work

Before trusting any of this, the agent built per-room trackers: how fast each room warms up, how fast it loses heat overnight, how hard each radiator works. Then it validated them against the raw history, and found three bugs in its own automations.

The best one: the sensor that decides whether a room is "calling for heat" used a threshold of exactly zero with no hysteresis. When a valve closed to 0 %, the value sat right on the threshold and Home Assistant kept the previous state. Once a room asked for heat, it asked forever. That quietly broke the overnight heat-loss measurements (they never started) and made the dashboard claim the living room had been heating for 18 hours. Another bug double-counted valve opening time, and gave one room a mean valve position of 155 %.

None of these would have crashed. They'd have produced plausible-looking numbers that were wrong. The agent caught them because I asked it to recompute every recorded value from raw history and compare. That has become the default: every metric gets reproduced by hand at least once before it goes on a dashboard.

## One change: 69 → 60 °C

The agent's recommendation was to change one thing at a time, give each change three days, and compare against degree days so a cold snap doesn't look like a regression. First change: lower the flow temperature to 60 °C. Tado only switches the boiler on and off through a relay, so the flow temperature is whatever the dial says. On 13 November I turned the dial.

The condensing problem went away almost overnight.

{{< chart "posts/heating-with-ai/trace.svg" "The water coming back to the boiler, midnight to 3 am, on a night before and a night after the change. Each band is the burner running, and the line is coloured the same way: green while the return is below 55 °C and the boiler condenses, orange while it's above and it doesn't, grey while the burner is off. After the change most of it turns green, but there are still a lot of bands, which is the next problem." >}}

{{< chart "posts/heating-with-ai/daily.svg" "Share of heating time with the return below 55 °C, per day. Friday is the change day: the dial went to 60 °C at 13:19." >}}

The return temperature distribution shows why: almost the whole hump moved below the line.

{{< chart "posts/heating-with-ai/return-temps.svg" "Return temperature while the burner was heating, as a share of firing time." >}}

## What didn't change

Short-cycling didn't improve at all. Lowering the flow temperature moved the boiler's on/off band down by nine degrees, from roughly 61–72 °C to 53–63 °C, but didn't make it any wider. So the burner still covers the same ten degrees in the same few minutes and switches off.

{{< chart "posts/heating-with-ai/cycles.svg" "Length of each burner run. Almost identical before and after: about three quarters of runs are under five minutes either way." >}}

That's the next lever: the restart band, which sets how far the water has to cool before the burner lights again. More on that below.

## The cost: slower rooms

Cooler radiators give out less heat. The textbook figure for going from about 61 °C mean water temperature to 54 °C is roughly 20 % less output, and the rooms noticed. The living room used to warm about a degree an hour with its valve fully open. At 60 °C it manages 0.4 to 0.7, on milder mornings.

{{< chart "posts/heating-with-ai/heatup.svg" "Living Room warming up in the morning with its valve fully open, measured from the moment the valve hit 100 %." >}}

The bedroom is the real limit. Before the change it spent 13 % of the time with its valve wide open and still more than half a degree below target. After, 37 %. That's why the agent's recommendation was to stay at 60 °C rather than go to 55 °C, as originally planned. The efficiency gain from 60 to 55 is small now that the boiler is condensing almost all the time, and the rooms would lose another 15 % or so of radiator output they can't spare.

I like that this came out of the data rather than a rule of thumb. The plan said "go to 55 if the rooms keep up". They didn't, so we don't.

## Second change: a wider restart band

Cycling was the one thing the first change didn't touch, so the second one went straight at it. On 16 November the agent widened the restart band from −6 K to −10 K: the burner now waits until the water has cooled to about 50 °C before lighting again, instead of about 53 °C, and still stops at about 64 °C. Unlike the flow temperature, this one the boiler accepts over its data bus, so the agent made the change through Home Assistant once I'd said yes.

The expectation was written down before the change: about 25 % fewer starts, seven or more minutes per run, condensing still above 90 %, and rooms no slower than at 60 °C. Long heat-up runs never cool down to the restart point, so they shouldn't notice; the change mostly stretches the short on-off cycles in between. If the rooms suffer, it goes back to −6 K. The boiler dashboard now shows each change, what we expect from it, and how each day measures up.

<!-- Draft: results of the 19 Nov review go here (starts per degree day, minutes per run, off time, rooms), with a before/after cycles chart. -->

## Gas, honestly

The usual way to compare heating across different weather is gas per degree day, and it's too blunt here. It assumes the house is always kept at the same temperature, and ours isn't. This November we're keeping it about a degree cooler than in November 2024, and that alone shifts the figure more than any boiler setting.

So the agent built a model of what the house *should* have used at the old settings. It predicts daily gas from four things: the average gap between indoor and outdoor temperature (indoor from the tado sensors in all six rooms), sunshine, wind, and whether it's a weekend. It's fitted on November 2024 plus two days from this November, all at 69 °C. The agent tried simpler versions first and kept the one that predicted best on days it hadn't seen: plain degree days missed by 14 kWh a day, this one by 9.7, about 18 %. Heating hours, the obvious extra input, were left out on purpose. At a lower flow temperature the valves stay open longer for the same heat, so a model built on them would invent a saving.

{{< chart "posts/heating-with-ai/model.svg" "How expected gas is worked out. The numbers are what the model learned from the old-settings days: for example, each extra degree between indoors and outdoors costs about 6 kWh a day." >}}

{{< chart "posts/heating-with-ai/gas-expected.svg" "Measured gas against what the old settings would have used on the same day, one dot per day. The grey dots are November 2024, each predicted with that day left out of the fit; the shaded band is the model's typical daily error." >}}

10 and 11 November, still at 69 °C, land on the line, so the model still describes this year's house. There is no usable day at 60 °C yet. The first ones arrive this week, and they go on this chart as they come in: dots below the band mean the tuning is saving gas.

What to expect: better condensing is typically worth 3–6 % of heating gas, roughly £20–45 over a winter at my tariff. Each day is noisy (±10 kWh), and the model itself carries about ±1.5 kWh a day of error that more days don't remove. It will take about a month of days to see a 6 % change, and a 3 % one may never be provable this way.

The boiler dashboard now keeps the running total. Each morning it compares yesterday's metered gas with the model and adds the difference, skipping days with gaps in the data.

## What the agent was good at

- **Reading everything.** It went through a week of ten-second history for a dozen sensors, matched it against valve positions and outdoor temperature, and kept the definitions consistent across days. I would have looked at three charts and guessed.
- **Distrusting its own numbers.** The tracker bugs, and a mistake it made in this week's review (it briefly concluded the living room "never reached 20 °C" at 60 °C; the 20 °C target only lasts an hour, so that was an artefact), were both caught by going back to the raw data.
- **Writing everything down.** The repo has a decision log, a tuning log with a baseline and a review date for each change, and a backlog. When a session picks up three days later, it starts from the notes, not from memory.

## What it needed me for

- **Turning the dial.** Physical changes, and anything that could leave the house cold, are mine.
- **Judgement about the house.** The bedroom runs humid, so lowering its target to save gas is a bad trade. That's not in the data.
- **Unblocking the plumbing.** At one point macOS quietly withdrew the terminal's permission to talk to anything on my local network, and every connection to the Pi failed with "No route to host". The agent eventually worked out that processes started by `launchd` aren't covered by that permission and built itself a small proxy. But noticing that the permission had gone was a human-in-the-loop moment.

## Notes on the charts

The boiler charts come from Home Assistant's recorder database: raw ten-second history from the EMS-ESP gateway and the tado integration, between 10 and 16 November 2026. "Heating" means the burner was on, the boiler was in heating mode and the hot-water valve was closed, so hot water doesn't muddy the figures. Hours when the heating controls were offline are left out of every figure. The gas chart uses hourly smart-meter readings, room and outdoor temperatures from Home Assistant's long-term statistics, and sunshine and wind from the [Open-Meteo](https://open-meteo.com/) historical weather archive. The SVGs are generated by a small script from a JSON export that lives next to this post.

[home-assistant]: https://www.home-assistant.io/
[raspberry-pi]: https://www.raspberrypi.com/products/raspberry-pi-4-model-b/
[tado]: https://www.tado.com/gb-en/smart-radiator-thermostat
[ems-esp]: https://emsesp.org/
[bbqkees]: https://bbqkees-electronics.nl/
