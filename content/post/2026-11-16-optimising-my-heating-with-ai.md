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

What I did have was data. I'd had the parts to look into this for a while: [Home Assistant][home-assistant] on a [Raspberry Pi 4][raspberry-pi], [tado smart radiator thermostats][tado] on every radiator, and an [EMS-ESP][ems-esp] gateway from [BBQKees][bbqkees] on the boiler's own data bus, which publishes flow and return temperatures, burner state, power level and counters every ten seconds. That's a few hundred thousand data points a week, and I had no idea how to read them.

So I asked an AI agent to do the reading: work out how the boiler actually behaves, explain it to me in plain terms, and propose changes, each one backed by the data and checked afterwards against a prediction written down first. I'd make the decisions and turn the dial. It found two problems. This is how it fixed them, and what that has been worth so far.

## The setup

The agent works from a git repository on my Mac. It has SSH into the Pi and a [Home Assistant MCP server](https://github.com/homeassistant-ai/ha-mcp) for live state, history, dashboards and service calls. Every change it makes is committed with what and why; every finding goes into a markdown file. The rules are short: read and diagnose freely, back up before anything risky, and ask me before touching the boiler, restarting anything, or deleting anything.

That last rule matters more than it sounds. Most of the useful work here is reading, and an agent can read for hours without getting bored. The changes are few and physical, so I want to make them myself.

## First, the agent checks its own tools

Before trusting any finding, the agent built per-room trackers: how fast each room warms up, how fast it loses heat overnight, how hard each radiator works. Then it validated them against the raw history, and found three bugs in its own automations.

{{< chart "posts/heating-with-ai/rooms.svg" "What the trackers see, for the three rooms we actually heat: temperature every 15 minutes, red while the room's radiator valve was open and grey while it was closed. The bedroom's radiator is on far longer than the others, which matters later." >}}

The best one: the sensor that decides whether a room is "calling for heat" used a threshold of exactly zero with no hysteresis. When a valve closed to 0 %, the value sat right on the threshold and Home Assistant kept the previous state. Once a room asked for heat, it asked forever. That quietly broke the overnight heat-loss measurements (they never started) and made the dashboard claim the living room had been heating for 18 hours. Another bug double-counted valve opening time, and gave one room a mean valve position of 155 %.

None of these would have crashed. They'd have produced plausible-looking numbers that were wrong. The agent caught them because I asked it to recompute every recorded value from raw history and compare. That has become the default: every metric gets reproduced by hand at least once before it goes on a dashboard.

## Problem one: a condensing boiler that wasn't condensing

The first finding needed some explaining. Burning gas produces water vapour, and that vapour carries heat out of the flue. A condensing boiler has an extra heat exchanger that cools its exhaust until the vapour turns back into water, and puts the heat it recovers into the water going to the radiators. That's where most of its efficiency advantage over an older boiler comes from.

{{< chart "posts/heating-with-ai/condensing.svg" "What happens inside the boiler. The exhaust rises through two heat exchangers, and the water coming back from the radiators enters at the top one. If that water is cool enough, the exhaust's vapour condenses on it and hands over its heat. If not, the heat goes up the flue." >}}

The catch is that it only works when the water coming back from the radiators, the return, is cool enough to chill the exhaust that far: below roughly 55 °C. Any hotter and the boiler behaves like an old non-condensing one, and that heat goes out of the flue.

A well set-up condensing boiler should spend nearly all of its heating time condensing, and since 2022 new and fully replaced heating systems in England have to be designed to run at a flow temperature of 55 °C or lower ([Approved Document L][adl], section 5). My boiler's dial was set to 69 °C. The agent found that the return was above 55 °C for about 70 % of the time the burner was heating, so it condensed less than a third of the time. I had a condensing boiler that mostly wasn't condensing, and no idea until the agent pointed it out.

### The fix: 69 → 60 °C

The agent's method was to change one thing at a time, give each change three days, and adjust for the weather so a cold snap doesn't look like a regression. Its first proposal: lower the flow temperature, the temperature of the water sent out to the radiators, from 69 to 60 °C. Cooler water out means cooler water back. It couldn't make that change itself. Tado only switches the boiler on and off through a relay, so the flow temperature is whatever the dial on the front says. On 13 November I turned the dial.

The condensing problem went away almost overnight.

{{< chart "posts/heating-with-ai/trace.svg" "The water coming back to the boiler, midnight to 3 am, on a night before and a night after the change. Each band is the burner running, and the line is coloured the same way: green while the return is below 55 °C and the boiler condenses, orange while it's above and it doesn't, grey while the burner is off. After the change most of it turns green, but there are still a lot of bands, which is the next problem." >}}

{{< chart "posts/heating-with-ai/daily.svg" "Share of heating time with the return below 55 °C, per day. Friday is the change day: the dial went to 60 °C at 13:19. The blue days come after the second change, on Monday afternoon." >}}

The return temperature distribution shows why: almost the whole hump moved below the line.

{{< chart "posts/heating-with-ai/return-temps.svg" "Return temperature while the burner was heating, as a share of firing time." >}}

### The trade-off: slower rooms

Cooler radiators give out less heat. The agent's textbook estimate for going from about 61 °C mean water temperature to 54 °C was roughly 20 % less output, and the rooms noticed. The living room used to warm about a degree an hour with its valve fully open. At 60 °C it managed 0.4 to 0.7, on milder mornings. There's no standard figure for how fast a room should warm up, since it depends on the room and the radiator, so the agent compared each room with itself.

{{< chart "posts/heating-with-ai/heatup.svg" "Living Room warming up in the morning with its valve fully open, measured from the moment the valve hit 100 %." >}}

The bedroom is the real limit; its radiator was already the one on longest in the room chart above. The agent's rule of thumb is that a radiator big enough for its room should rarely be wide open and still behind. Before the change the bedroom's was wide open and still more than half a degree below target 13 % of the time. After, 37 %. The agent's original plan was to go down to 55 °C if the rooms kept up. They didn't, so it recommended staying at 60. The efficiency gain from 60 to 55 is small now that the boiler condenses almost all the time, and the rooms would lose another 15 % or so of radiator output they can't spare. I like that this came out of the data rather than a rule of thumb.

## Problem two: short-cycling

The trace above shows the second problem: even after the fix, the burner keeps lighting and going out. The agent called this short-cycling. UK heating guidance puts a healthy run at 8 to 15 minutes, with 3 or 4 starts an hour in mild weather; switching on and off every few minutes, 5 to 10 times an hour, is short-cycling ([City Plumbing][cityplumbing]). On a mild day, around 8 °C outside, my boiler lit about 60 times for heating alone. Its runs averaged 6 minutes, and 72 % of them lasted less than five. By its own lifetime counters, its heating runs used to average 13 minutes.

The agent explained why it happens. The burner can't turn itself down below about 30 % of its power, roughly 7 kW, and on those days the house needed about 2.3 kW on average. Even at its lowest setting the boiler is three times too big for the job, so all it can do is light, overshoot, switch off, cool down and light again.

And why it's bad: every start begins with the fan blowing air through the boiler to clear it before it lights, which carries some heat up the flue, and each one wears the parts that do the starting, like the igniter, the fan and the gas valve. A boiler is designed for long, steady runs, and short ones are where it's least efficient.

Lowering the flow temperature didn't help with this at all. It moved the boiler's on/off band down by nine degrees, from roughly 61–72 °C to 53–63 °C, but didn't make it any wider, so the burner still covered the same ten degrees in the same few minutes and switched off. About three quarters of runs were under five minutes either way: 72 % before, 73 % after.

### The fix: a wider restart band

The agent's next lever was the restart band, which sets how far the water has to cool before the burner lights again. On 16 November it widened the band from −6 K to −10 K: the burner now waits until the water has cooled to about 50 °C before lighting again, instead of about 54 °C, and still stops at about 64 °C. Unlike the flow temperature, this one the boiler accepts over its data bus, so the agent made the change through Home Assistant once I'd said yes.

{{< chart "posts/heating-with-ai/band.svg" "What the restart band does. The water heats up while the burner runs and cools while it rests; the burner stops at 64 °C and lights again at the restart point. A wider band means longer runs and longer rests, so fewer starts. The run and rest lengths are the medians measured at each setting; real runs vary a lot more." >}}

The agent wrote its expectations down before the change: about 25 % fewer starts, seven or more minutes per run, condensing still above 90 %, and rooms no slower than at 60 °C. Long heat-up runs never cool down to the restart point, so they shouldn't notice; the change mostly stretches the short on-off cycles in between. If the rooms suffered, it would go back to −6 K. The boiler dashboard now shows each change, what the agent expects from it, and how each day measures up.

Three days later, the agent ran its review. The clearest change is the pause between runs: the median off time went from 3.8 minutes to 9.8, so the burner now rests for ten minutes instead of lighting again almost straight away. Runs shorter than three minutes halved, from 54 % of all runs to 26 %, and the average run grew from 5.4 to 6.7 minutes. That's just short of the seven the agent had predicted, and still short of the 8 to 15 minutes of a healthy run: the boiler is still too big for a mild day, and no setting changes that.

{{< chart "posts/heating-with-ai/cycles.svg" "Length of each burner run at each setting. Lowering the flow temperature barely changed it; widening the restart band moved most of the very short runs up to three minutes and longer." >}}

Starts fell by about a quarter, as predicted. Per degree of difference between indoors and outdoors, the boiler lit 8.5 times a day at 60 °C with the old band and 6.5 times with the new one, fewer even than the 7.4 at the original settings. Burner time per degree barely moved, 45.8 minutes against 43.6. That's the point: the same heat, in fewer and longer pieces.

Condensing slipped a little, from 93 % to 90 %, right on the agent's threshold. Tuesday was 96 %. Wednesday dropped to 76 % because of two stretches of almost continuous firing, around midday and in the evening, that pushed the return to 56–57 °C. Long runs at high demand are where a 60 °C flow runs out of headroom, and they aren't what this change was about.

The rooms didn't notice. On Tuesday morning the living room warmed at 0.8 °C an hour with its valve fully open, against 0.4–0.7 before the change, and the bedroom spent 13 % of the time wide open and still behind, down from 37 %. It was a milder week, about 9 °C outside against 5 °C, so the agent didn't give the boiler credit for the rooms, but nothing got worse. Its verdict: keep the wider band.

## Is it saving gas?

This is the question that matters, and the hardest one to answer. The usual way to compare heating across different weather is gas per degree day, and it's too blunt here. It assumes the house is always kept at the same temperature, and ours isn't. This November we're keeping it about a degree cooler than in November 2024, and that alone shifts the figure more than any boiler setting.

So the agent built a model of what the house *should* have used at the old settings. It predicts daily gas from four things: the average gap between indoor and outdoor temperature (indoor from the tado sensors in all six rooms), sunshine, wind, and whether it's a weekend. It's fitted on November 2024 plus two days from this November, all at 69 °C. The agent tried simpler versions first and kept the one that predicted best on days it hadn't seen: plain degree days missed by 14 kWh a day, this one by 9.7, about 18 %. Heating hours, the obvious extra input, were left out on purpose. At a lower flow temperature the valves stay open longer for the same heat, so a model built on them would invent a saving.

{{< chart "posts/heating-with-ai/model.svg" "How expected gas is worked out. The numbers are what the model learned from the old-settings days: for example, each extra degree between indoors and outdoors costs about 6 kWh a day." >}}

{{< chart "posts/heating-with-ai/gas-expected.svg" "Measured gas against what the old settings would have used on the same day, one dot per day. The grey dots are November 2024, each predicted with that day left out of the fit; the coloured dots are this November, only days with complete data. The shaded band is the model's typical daily error." >}}

10 and 11 November, still at 69 °C, land on the line, so the model still describes this year's house. So far only one day at the new settings has complete data: Tuesday 17 November, which used 63 kWh against 59 expected. That's 4.5 kWh more, about 8 %, well inside the band, so on its own it says nothing either way. More days go on this chart as they come in: dots below the band mean the tuning is saving gas.

The boiler dashboard keeps the running total. Each morning it compares yesterday's metered gas with the model and adds the difference, skipping days with gaps in the data.

## What it's been worth so far

Before is the original 69 °C flow with a −6 K restart band; now is 60 °C with −10 K.

| | Before | Now | Good |
|---|---|---|---|
| Heating time spent condensing | 28 % | 90 % | nearly all of it |
| Average burner run | 6.0 min | 6.7 min | 8–15 min |
| Runs shorter than three minutes | 45 % | 26 % | few |
| Median pause between runs | 3.5 min | 9.8 min | longer is better |
| Burner starts per degree of indoor–outdoor difference, per day | 7.4 | 6.5 | fewer is better |
| Living room warm-up, valve fully open | about 1 °C an hour | 0.6–0.8 °C an hour | no standard; compared with itself |
| Gas against the old settings | baseline | not provable yet: one clean day, +8 % | 3–6 % less (the agent's estimate) |

- **Efficiency.** The boiler now condenses for most of its heating time instead of a quarter of it. The agent's estimate is that this is typically worth 3–6 % of heating gas, roughly £20–45 over a winter at my tariff. That's an estimate from typical efficiency curves, not a measurement. Each day's gas is noisy (±10 kWh) and the model carries about ±1.5 kWh a day of error that more days don't remove, so it will take about a month of clean days to see a 6 % change, and a 3 % one may never be provable this way.
- **Wear.** About an eighth fewer ignitions than at the original settings, for the same heat, and the very short runs have halved. Starts are what wear the igniter, fan and gas valve, so this should help the boiler last. Nobody can put a number of years on that, and the agent didn't try.
- **Comfort.** Heating isn't faster; it's a little slower. That was the price of condensing, and the agent measured it rather than assumed it away. The rooms still reach their targets, and the bedroom, the one that struggles, was kept out of any further cuts.

## What the agent was good at

- **Explaining.** I started out not knowing what short-cycling or a return temperature was. Every finding came with the why, in plain terms, and with the number that backed it up, so I could follow the reasoning well enough to say yes or no.
- **Reading everything.** It went through days of ten-second history for a dozen sensors, matched it against valve positions and outdoor temperature, and kept the definitions consistent across days. I would have looked at three charts and guessed.
- **Predicting before changing.** Each proposal came with numbers it expected to see and a condition for undoing it, written down before anything changed. The review then simply checks them.
- **Distrusting its own numbers.** The tracker bugs, and a mistake it made in this week's review (it briefly concluded the living room "never reached 20 °C" at 60 °C; the 20 °C target only lasts an hour, so that was an artefact), were both caught by going back to the raw data.
- **Writing everything down.** The repo has a decision log, a tuning log with a baseline and a review date for each change, and a backlog. When a session picks up three days later, it starts from the notes, not from memory.

## What it needed me for

- **Turning the dial.** Physical changes, and anything that could leave the house cold, are mine.
- **Judgement about the house.** The bedroom runs humid, so lowering its target to save gas is a bad trade. That's not in the data.
- **Unblocking the plumbing.** At one point macOS quietly withdrew the terminal's permission to talk to anything on my local network, and every connection to the Pi failed with "No route to host". The agent eventually worked out that processes started by `launchd` aren't covered by that permission and built itself a small proxy. But noticing that the permission had gone was a human-in-the-loop moment.

## Notes on the charts

The boiler charts come from Home Assistant's recorder database: raw ten-second history from the EMS-ESP gateway and the tado integration, between 10 and 19 November 2026. "Heating" means the burner was on, the boiler was in heating mode and the hot-water valve was closed, so hot water doesn't muddy the figures. Hours when the heating controls were offline are left out of every figure. The gas chart uses hourly smart-meter readings, room and outdoor temperatures from Home Assistant's long-term statistics, and sunshine and wind from the [Open-Meteo](https://open-meteo.com/) historical weather archive. The SVGs are generated by a small script from a JSON export that lives next to this post.

[home-assistant]: https://www.home-assistant.io/
[raspberry-pi]: https://www.raspberrypi.com/products/raspberry-pi-4-model-b/
[tado]: https://www.tado.com/gb-en/smart-radiator-thermostat
[ems-esp]: https://emsesp.org/
[bbqkees]: https://bbqkees-electronics.nl/
[adl]: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
[cityplumbing]: https://www.cityplumbing.co.uk/blog/boiler-short-cycling
