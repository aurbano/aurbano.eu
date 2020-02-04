---
title: When do you fix bugs?
description: Tomorrow?
date: "2020-01-21"
tags:
- Agile
---

At work we have a decently sized pile of bugs in our backlog. Most of them are not business impacting or critical, so they just sit there.

Unfortunately we've never had a process to handle bugs consistently - until now!

This may seem obvious to some, and others will probably have an even better system - I'd love to hear from you if that's the case!

### Our new process

There are two parts to it:

1. How severe is a bug - this must be a simple scale where each step is well defined.
1. When **exactly** do bugs get fixed.

### Determining Bug Severity

There must be a well defined system to calculate this, which depends on each product and team. Our use case is an internal tool used by two groups of people: us (the team building the tool), and the end users (people outside our team).

We've classified bugs as follows:

* **Critical:**
  It prevents any type of user from performing the core business purpose of the tool. For this we have identified a list of workflows that we consider our core business.

  For example if we were building a simple mail client, reading incoming emails and sending emails might be our core business functionality, whereas a suggestions dropdown for the "To" field might not be.

* **High:**
  It impacts our end users, although it's not business critical.

* **Medium:**
  Bugs affecting us (internal users), with no known workaround.

* **Low**
  Bug affecting us (internal users), with a known workaround.

This way everyone in our team can quickly assess the complexity of our bugs. This system works well for us because it doesn't really matter what the bug **is**, as long as you know **who** is impacted.

### When do we fix them?

Again, this will vary by team, but we wanted to have a defined process on when to tackle this bugs. Our current approach is:

* **Critical:**
  Fix asap. Ideally work on the fix the day it's found, test it, and as soon as the fix is   good deploy to production.

* **High:**
  If possible, fix in the current sprint. The product owner and dev lead will decide what items get removed to make space for this.

* **Medium:**
  Fix in the next sprint.

* **Low:**
  These wait in our backlog. We then allocate a percentage of every sprint's work to bug fixing. So if we decide that 10% of the work in each sprint must be bug fixes we'll fill it with medium bugs when we have them, and then pick low severity bugs when those are fixed.

  In general we've seen that low severity bugs tend to also be fairly easy to fix, so they don't last too long in our backlog.


We're now testing this approach, so I'll update this post if I learn anything new in a few months.
