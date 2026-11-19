---
title: I let an AI agent tune my boiler
description: I know nothing about boilers. An AI agent read ten days of data from mine, found two problems, proposed a fix for each, and checked both against its own predictions.
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

I know almost nothing about boilers. Mine is a 24 kW Worcester Bosch combi, it heats the house and the hot water, and the gas bill goes up every winter. That was about the extent of it.

What I did have was data. I'd had the parts to look into this for a while: [Home Assistant][home-assistant] on a [Raspberry Pi 4][raspberry-pi], [tado smart radiator thermostats][tado] on every radiator, and an [EMS-ESP][ems-esp] gateway from [BBQKees][bbqkees] on the boiler's own data bus, which publishes its temperatures, burner state, power level and counters every ten seconds. That's a few hundred thousand data points a week, and I had no idea how to read them.

So I asked an AI agent to do the reading. It found two problems I didn't know I had, explained both, and proposed a fix for each. This is what they were, what changed, and what that has been worth so far.

## What I asked the agent to do

The brief was short: work out how the boiler actually behaves, explain it to me in plain terms, and propose changes, each one backed by the data. I'd make the decisions.

{{< chart "posts/heating-with-ai/setup.svg" "Who does what. The boiler sends hot water out to the radiators (the flow) and gets cooler water back (the return)." >}}

The agent works from a git repository on my Mac. It can log into the Pi and it talks to Home Assistant through an [MCP server](https://github.com/homeassistant-ai/ha-mcp), which gives it live readings, history and dashboards. Every finding goes into a markdown file, and every change it makes is committed with what and why.

The rules are short too: read and diagnose freely, back up before anything risky, and ask me before touching the boiler, restarting anything, or deleting anything. Most of the useful work here is reading, and an agent can read for hours without getting bored. The changes are few and physical, so I want to make those myself.

Its method was the same for each problem: change one thing at a time, write down beforehand what should happen, then wait three days and check, adjusting for the weather so a cold snap doesn't look like a step backwards.

Everything below comes from raw ten-second history between 10 and 19 November 2026. "Heating" means the burner was on for the radiators, not for hot water, so showers don't muddy the figures. Hours when the heating controls were offline are left out of every figure. The gas figures use hourly smart-meter readings, and sunshine and wind from the [Open-Meteo](https://open-meteo.com/) weather archive.

## Problem one: a condensing boiler that wasn't condensing

Two words first. The *flow* is the hot water the boiler sends out to the radiators; the *return* is the cooler water that comes back. The dial on the front of the boiler sets the flow temperature.

The first finding needed some explaining. Burning gas produces water vapour, and that vapour carries heat out of the flue. A condensing boiler has an extra heat exchanger that cools its exhaust until the vapour turns back into water, and puts the heat it recovers into the water going to the radiators. That's where most of its efficiency advantage over an older boiler comes from.

{{< chart "posts/heating-with-ai/condensing.svg" "Inside the boiler. The exhaust rises through two heat exchangers, and the return water enters at the top one. If that water is cool enough, the vapour condenses on it and hands over its heat. If not, the heat goes up the flue." >}}

The catch is that it only works when the return is cool enough to chill the exhaust that far: below roughly 55 °C, the figure the agent used as its threshold. Any hotter and the boiler behaves like an old non-condensing one.

So what does good look like? A well set-up condensing boiler should have a return below 55 °C nearly all the time it's heating. The building regulations for England say new or fully replaced heating systems should be designed for a flow temperature of 55 °C or lower ([Approved Document L][adl], 2021 edition, section 5).

My boiler's dial was set to 69 °C. The agent found that the return was below 55 °C for only 28 % of the time the burner was heating. I had a condensing boiler that mostly wasn't condensing, and no idea until the agent pointed it out.

### The fix: flow temperature from 69 to 60 °C

The agent's proposal was to lower the flow temperature from 69 to 60 °C. Cooler water out means cooler water back. Its plan was to go on to 55 °C afterwards if the rooms kept up.

The agent didn't make this change itself. Tado only switches the boiler on and off, and although the boiler accepts settings over its data bus, the related heating setting is known to snap back to the dial within minutes, so the dial was the safe route. On 13 November I turned it.

### The result: condensing 93 % of the time

The condensing problem went away almost overnight. The share of heating time spent condensing went from 28 % to 93 %.

{{< chart "posts/heating-with-ai/daily.svg" "Share of heating time with the return below 55 °C, per day. Friday 13 was the change day: the dial went to 60 °C at 13:19. Monday 16 was the day of the second change, described below." >}}

Here is what that looks like over three hours of a night, before and after.

{{< chart "posts/heating-with-ai/trace.svg" "The return temperature from midnight to 3 am. Each band is the burner running: green while the return is below 55 °C and the boiler condenses, orange while it doesn't. The line is grey while the burner is off." >}}

After the change most of the bands are green. There are still a lot of bands, though: 22 starts in three hours, against 17 before, on a colder night. That is the second problem, and I'll come back to it.

### The trade-off: slower rooms

Cooler radiators give out less heat. The agent's textbook estimate was roughly 20 % less output, and the rooms noticed.

The living room used to warm up at about 1 °C an hour with its radiator valve fully open. At 60 °C it managed 0.4 to 0.7 °C an hour, and that was on milder mornings. There's no standard for how fast a room should warm up, since it depends on the room and the radiator, so the agent compared each room with itself.

{{< chart "posts/heating-with-ai/heatup.svg" "The living room warming up in the morning, measured from the moment its valve was fully open. The right-hand column gives the flow and outdoor temperature on each morning." >}}

The bedroom is the real limit. Its radiator already worked far harder than the others: about 12 hours a day, against 7 for the living room and 3 for the office.

{{< chart "posts/heating-with-ai/rooms.svg" "The three rooms we heat, 10 to 18 November. The line is the room temperature, coloured and banded while its radiator valve was open, grey while it was closed." >}}

There's no standard here either, so the agent used a rule of thumb of its own: a radiator that's big enough for its room should rarely be wide open and still behind. Before the change the bedroom's was wide open and still more than half a degree below its target 13 % of the time. After, 36 %.

That settled the question of 55 °C. The rooms hadn't kept up, so the agent recommended staying at 60. With the boiler already condensing 93 % of the time there was little left to gain, and by its estimate the radiators would lose another 15 % or so of output that the bedroom can't spare. So my boiler runs 5 °C above the design figure for a new system. The agent's explanation is that my radiators were sized for hotter water. I like that this came out of my own house's data rather than a general rule.

## Problem two: short-cycling

Look at the night trace again: even after the fix, the burner keeps lighting and going out every few minutes. The agent called this short-cycling.

Here good is easier to pin down. UK heating guidance puts a healthy burner run at 8 to 15 minutes; switching on and off every few minutes, 5 to 10 times an hour, is short-cycling ([City Plumbing][cityplumbing]). In mild weather a boiler that's working normally starts about 3 or 4 times an hour ([Boiler Cover UK][boilercover]).

Before any changes, my boiler's heating runs averaged 6 minutes, and 72 % of them lasted less than five. On a mild day, around 8 °C outside, it lit about 60 times for heating alone. By the boiler's own lifetime counters, its heating runs used to average 13 minutes, so it hadn't always been like this.

The agent explained why it happens. The burner can't turn itself down below about 30 % of its power, roughly 7 kW; the agent read that floor off the boiler's own power readings. On a mild day the house needs about 2.3 kW on average, by the agent's estimate. Even on its lowest flame the boiler makes three times too much heat, so all it can do is light, overshoot, switch off, cool down and light again.

{{< chart "posts/heating-with-ai/sizing.svg" "Why it cycles: the burner's lowest flame is about three times what the house needs on a mild day. Both figures are the agent's estimates from the boiler's data." >}}

And why it's bad. Every start begins with the fan blowing air through the boiler to clear it before it lights, which carries some heat up the flue. Every start also wears the parts that do the starting: the igniter, the fan and the gas valve. A boiler is at its best on long, steady runs.

### Why the first fix didn't help

The agent's explanation: the boiler switches its burner off when the water gets a few degrees hotter than the dial setting, and lights it again once the water has cooled by a set amount. Lowering the flow temperature moved that on/off band down by about nine degrees, from roughly 61–72 °C to 53–63 °C. It didn't make the band any wider, so the burner still covered the same ten degrees in the same few minutes. Runs under five minutes: 72 % before, 73 % after.

### The fix: a wider restart band

The setting that controls the bottom of that band is called the restart band: how far the water has to cool before the burner lights again. It was −6 K (K is kelvin; a gap of 1 K is the same as 1 °C). There's no standard figure for this setting; it depends on the boiler and the house. The agent proposed −10 K: the burner still stops at about 64 °C, but waits until the water has cooled to about 50 °C before lighting again, instead of about 54 °C.

{{< chart "posts/heating-with-ai/band.svg" "What the restart band does. The water heats up while the burner runs and cools while it rests. A wider band means longer runs and longer rests, so fewer starts. The lengths are the typical (median) run and rest measured at each setting; real ones vary a lot more." >}}

Unlike the flow temperature, this is a setting the boiler keeps when it's sent over its data bus. On 16 November I said yes and the agent made the change through Home Assistant.

It wrote its predictions down first: about 25 % fewer starts, seven or more minutes per run, condensing still above 90 %, and rooms no slower than before. Long warm-up runs never cool down to the restart point, so they shouldn't notice; the change stretches the short on-off cycles in between. If the rooms suffered, it would go back to −6 K.

### The result: fewer, longer runs

Three days later the agent ran its review, prediction by prediction.

**Starts: down by about a quarter, as predicted.** The agent counts starts per degree of difference between indoors and outdoors, so that a cold day isn't blamed for needing more heat. On that measure the boiler lit 8.5 times a day for each degree with the old band and 6.5 with the new one, 24 % fewer. That's also fewer than the 7.4 at the original settings. There's no standard for this figure; it's the boiler compared with itself.

**Runs: longer, but not yet healthy.** The average run grew from 5.4 to 6.7 minutes, just short of the seven the agent predicted and still short of the healthy 8 to 15. Runs shorter than three minutes halved, from 54 % of all runs to 26 %. The boiler is still too big for a mild day, and no setting changes that.

{{< chart "posts/heating-with-ai/cycles.svg" "Length of each burner run at each setting. Lowering the flow temperature barely changed it. Widening the restart band moved most of the very short runs up to three minutes and longer." >}}

**Pauses: much longer.** This is the clearest change. There's no standard for a pause, but longer means fewer starts. The typical pause between runs went from 3.8 minutes to 9.8, so the burner now rests for ten minutes instead of lighting again almost straight away. A typical run plus a typical pause now takes about 14 minutes, which works out at about four starts an hour while it's cycling, down from nearer ten. That's back in the normal range and out of the 5-to-10 the guidance calls short-cycling, though the runs themselves are still shorter than a healthy 8 minutes.

**Same heat.** Burner time per degree barely moved: 45.8 minutes a day before, 43.6 after. That's the point: the same heat, in fewer and longer pieces.

**Condensing: 90 %, right on the line.** It slipped from 93 %. Tuesday was 96 %. Wednesday dropped to 76 % because of two stretches of almost continuous firing, around midday and in the evening, that pushed the return to 56–57 °C. Long runs at high demand are where a 60 °C flow runs out of room, and they aren't what this change was about.

**Rooms: no slower.** The living room warmed at 0.6 to 0.8 °C an hour with its valve fully open, against 0.4 to 0.7 before, and the bedroom was wide open and still behind 13 % of the time, down from 36 %. It was a milder week, about 9 °C outside against 5 °C, so the agent didn't give the boiler credit for that. But nothing got worse.

Its verdict: keep the wider band.

## What it's been worth so far

Before is the original 69 °C flow with a −6 K restart band. Now is 60 °C with −10 K.

| | Before | Now | Good |
|---|---|---|---|
| Heating time spent condensing | 28 % | 90 % | nearly all of it (the agent's target: over 90 %) |
| Average burner run | 6.0 min | 6.7 min | 8–15 min |
| Runs shorter than three minutes | 45 % | 26 % | few; no standard figure |
| Typical pause between runs | 3.5 min | 9.8 min | no standard figure; longer is better |
| Burner starts per degree of indoor–outdoor difference, per day | 7.4 | 6.5 | no standard figure; fewer is better |
| Living room warm-up, valve fully open | about 1 °C an hour | 0.6–0.8 °C an hour | no standard; compared with itself |
| Gas against the old settings | baseline | too early to tell | 3–6 % less (the agent's estimate) |

- **Efficiency.** The boiler now condenses for nine tenths of its heating time instead of barely more than a quarter. The agent's estimate, from typical efficiency curves, is that this is worth 3–6 % of heating gas. It's an estimate, not a measurement.
- **Wear.** About an eighth fewer starts than at the original settings for the same heat, and far fewer very short runs. Starts are what wear the igniter, fan and gas valve, so this should be kinder to the boiler. Nobody can put a number of years on that, and the agent didn't try.
- **Cost.** Nothing I can show yet. If the 3–6 % holds, it's roughly £20–45 over a winter at my tariff, and proving it will take about a month of complete days (more on that below). The changes themselves cost nothing.
- **Comfort.** Heating isn't faster; it's a little slower. That was the price of condensing, and the agent measured it rather than assumed it away. The rooms still reach their targets, and the bedroom, the one that struggles, is the reason the flow stayed at 60 °C.

## Working with the agent

What it was good at:

- **Explaining.** I started out not knowing what short-cycling or a return temperature was. Every finding came with the why, in plain terms, and with the number behind it, so I could follow the reasoning well enough to say yes or no.
- **Reading everything.** It went through days of ten-second history for a dozen sensors, matched it against valve positions and outdoor temperature, and kept the definitions consistent from one review to the next. I would have looked at three charts and guessed.
- **Predicting before changing.** Each proposal came with the numbers it expected to see and a condition for undoing it, written down before anything changed. The review then simply checks them.
- **Writing everything down.** The repo has a decision log, a tuning log with a baseline and a review date for each change, and a backlog. When a session picks up three days later, it starts from the notes, not from memory.
- **Distrusting its own numbers.** Before trusting any finding, it built a tracker for each room: how fast it warms up, how fast it loses heat overnight, how hard its radiator works. I then asked it to recompute every recorded value from the raw history and compare, and it found three bugs in its own work. The best one: the sensor that decides whether a room is "calling for heat" compared the valve opening with a threshold of exactly zero, so when a valve closed to 0 % the value sat on the threshold and Home Assistant kept the previous state. Once a room asked for heat, it asked forever, and the dashboard claimed the living room had been heating for 18 hours. Another bug counted valve time twice and gave one room an average valve position of 155 %. None of these would have crashed anything; they'd have produced plausible numbers that were wrong. Every figure now gets reproduced from raw data at least once before it goes on a dashboard.

What it needed me for:

- **Turning the dial.** Physical changes, and anything that could leave the house cold, are mine.
- **Judgement about the house.** The bedroom runs humid, so lowering its target to save gas is a bad trade. That's not in the data.
- **Unblocking it.** At one point macOS quietly withdrew the terminal's permission to talk to anything on my local network, and every connection to the Pi failed with "No route to host". The agent eventually found a way round it, but noticing that the permission had gone took a human.

## Next steps

Both changes so far were about how well the boiler runs. Neither goes after the gas bill directly, and the agent's view is that the boiler settings worth changing are now changed. What's left is proving the saving, and then reducing how much heat the house asks for.

### What we're waiting for

- **Enough complete days to judge the gas.** Each morning the agent compares the day's metered gas with what the old settings would have used in the same weather and at the same indoor temperatures, using a model it fitted on last November. A single day's prediction is typically off by about 18 %, so seeing a 6 % saving takes about a month of complete days. So far there's one, 17 November, and it came out 8 % above: inside the noise, so no verdict yet.
- **A steadier connection to the heating controls.** On six of the first nine days they dropped offline for an hour or more, and those days can't be compared. I've moved some hardware that may have been interfering, and the agent is watching for a week to see whether that fixed it.
- **The spare rooms.** Three rooms nobody uses (the entrance, a hobby room and the guest room) had schedules of 18 °C or more, and one of them was the warmest room in the house. I'm turning them down to 14–15 °C in the tado app. The agent's estimate is 3 to 7 kWh a day, £30–70 over a winter, rough because the rooms next door will keep them warmer than their setting. To measure it, the agent built a second model on only the three rooms we heat, since the first one would treat cooler spare rooms as a house that's less warm and give the change no credit. Cool rooms can get damp, so there's a rollback rule: if the dashboard's damp check flags any of the three rooms, or their humidity stays above 70 % (the agent's threshold, not a standard), they go back up to 16–17 °C.

### What we'll do after that

- **A flow temperature that follows the weather.** On a mild day the radiators don't need 60 °C water. The agent wants to trial Home Assistant lowering the flow when it's mild, for example to 55 °C above 8 °C outside. It first has to check that the boiler keeps a flow setting sent over its data bus rather than snapping back to the dial, and that the bedroom still keeps up. It expects 1–2 %, since the boiler already condenses most of the time.
- **A results chapter.** Once there's a gas verdict and the spare rooms have had their review, they'll get their own chapter here.

[home-assistant]: https://www.home-assistant.io/
[raspberry-pi]: https://www.raspberrypi.com/products/raspberry-pi-4-model-b/
[tado]: https://www.tado.com/gb-en/smart-radiator-thermostat
[ems-esp]: https://emsesp.org/
[bbqkees]: https://bbqkees-electronics.nl/
[adl]: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
[cityplumbing]: https://www.cityplumbing.co.uk/blog/boiler-short-cycling
[boilercover]: https://boilercoveruk.co.uk/blog/boiler-short-cycling
