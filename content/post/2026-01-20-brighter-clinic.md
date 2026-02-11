---
title: "Building a full SaaS app in days"
description: How I built a complete clinic management system using LLMs in a fraction of the usual time
date: "2026-01-20"
thumbnail: brighterclinic.png
categories:
  - Side Project
tags:
  - JavaScript
  - TypeScript
  - AI
  - Claude
---

If you had asked me a year ago how long it would take to build a fully-featured clinic management system from scratch, I would have said at least a month. And then a few more months to fix bugs, and I would've recommended starting small, and using third party products at the start just to validate the business at first. We're talking authentication, booking systems, payment processing, third-party integrations, a CMS, PDF generation... the list goes on.

Now with Claude I thought I'd give it a chance, and built all of that in a few days.

This isn't a story about cutting corners or shipping something half-baked though, I approched this as a proper work project that I wanted to deliver. [Brighter Clinic](https://brighterclinic.co.uk) is a real product, now live, handling real bookings and payments.

## The Mission

The goal was ambitious: **a fully integrated clinic management system**. The clinic operates online-only with virtual assessments, which simplifies some aspects (no need for room booking or physical resource management), but the core requirements were still substantial:

- A polished public landing page
- Analytics to track the conversion funnel
- Customer conversion flow with Stripe integration
- A booking system that actually works
- A complete backoffice for clinic operations (mainly payroll, but I ended up adding a whole lot of additional functionality)

Normally I'd scope this down aggressively for an MVP. But I wanted to test what was actually possible when AI handles most of the implementation grunt work.

## The Tech Stack

I picked a stack I'm comfortable with, optimised for type safety and developer experience:

- **Next.js + React + TypeScript** for the frontend
- **Koa** for the backend API
- **tRPC with React Query** for type-safe frontend/backend communication
- **Postgres with TypeORM** and migrations
- **Turborepo** for monorepo management

The tRPC choice was particularly important. Having end-to-end type safety means the AI can make changes to API endpoints and immediately see type errors propagate to the frontend. It catches issues that would otherwise only surface at runtime which is crucial for LLM development.

## The Approach

As we know: **the planning phase is everything**. I like to joke that using LLMs forces us to be better engineers, I now spend a lot more time planning, documenting, and preparing detailed specs for all features.

So before writing any code, I spent time documenting the full spec, discussing options with Claude. Every feature, every integration, every edge case I could think of, and preparing markdown docs for each feature or development phase.
This might seem counterintuitive when you have an AI that can just start coding, but it's actually the opposite: the better your spec, the better the AI performs.

Then I built bottom-up using Cursor's plan mode:

1. **Monorepo setup** with Turborepo and a working Next.js scaffold, TypeScript and Biome for linting
2. **Initial frontend/backend** with tRPC and some mock endpoints wired up
3. **Database setup** with TypeORM and the initial schema
4. **Authentication** (this touches everything, so it had to come early)
5. **Features in logical order**, each one building on the last, unless they were orthogonal - in which case I'd build them in parallel using git worktrees whenever I needed code separation

The discipline that made this work: **maintaining linting and typechecking after every step**, and using TDD for complex features. Write the test first, review properly, and let the LLM work on the implementation. This worked surprisingly well for things like the scheduling logic where there are several edge cases to cover.

## What Got Built

Here's where it gets a bit ridiculous thinking back to pre-LLM days! The final system includes:

### Booking and Scheduling

A complete booking system with:

- Full scheduling capabilities with configurable working hours per person
- Out-of-office overrides for holidays and blocked time
- Third-party calendar integration so appointments sync externally and busy periods are imported

The edge cases around time zones, recurring availability, and conflict detection are surprisingly tricky, but thanks to the TDD approach I'm confident in the features that are there. We'll see with real production use, and adjust the test suite as we go, but it looks solid.

Without an LLM I would've never attempted this for launch and instead would've integrated with a third-party scheduling system.

### Financial Integrations

- **Xero integration** to automatically submit invoices for completed appointments. At the end of each month, doctors get paid for the hours they worked without any manual effort.
- **Banking integration** to transfer amounts automatically once accounts are approved. The whole payment flow from patient booking to doctor payment is automated.

### Operations

- **Slack integration** for event notifications. Certain actions trigger messages so the team stays informed without constantly checking the dashboard.
- **Audit log system** with a read-only event table. Every important action is logged.
- **GDPR compliance** with dedicated API endpoints for patients to request their data export or deletion. Not glamorous, but legally required and often forgotten.

### Content and Communication

- **PDF report generation** with a rich text editor in the backoffice system that mimics the Google Docs UI. Clinicians can write reports with formatting, and they export as clean PDFs.
- **Built-in CMS** for editable content pages and a blog. I could have used a third-party headless CMS, but having everything in one place simplifies deployment and means one less service to manage.

### Security and Auth

- **Multiple auth methods**: Sign in with Google, magic link, or traditional password
- **Cloudflare Turnstile** for invisible captcha protection on public forms

### Quality and Deployment

- **Storybook with Chromatic** for visual regression testing. Component changes get screenshotted and diffed automatically. I also configured an MCP for chrome control so the LLM can request screenshots of components as it works on them, allowing it to "see" the UI.
- **Unit tests** for the backend
- **CI pipeline** with auto-deploy to Railway on merge to main

## The Results

The system went from zero to production in days of actual work. Not continuous days, life still happened, but the total time invested was a fraction of what it would have been.

The [landing page is live](https://brighterclinic.co.uk). The backoffice handles the full clinic workflow: from a patient booking an appointment, through the consultation, to invoicing and payment.

Is it perfect? No. There are rough edges I'm still smoothing out. But it's _working_, in production. That's a very different starting point than a half-finished side project languishing on my machine.

## A few observations

**The planning phase becomes more valuable, not less.** When implementation is cheap, the bottleneck shifts to knowing what to build. Time spent on specs and requirements pays off and compounds as the scope grows.

**Scope calculations change.** Features I would have cut for an MVP became feasible. The GDPR endpoints, the audit logging, the Chromatic integration, these would normally be "nice to haves" that never get built. Now they're in from day one.

**You still need to understand the code.** Claude wrote most of it, but I reviewed everything. Debugging still requires knowing what's happening. The AI is a force multiplier, not a replacement for engineering judgment. This would've been a very different story if I wasn't there to guide every step of the process.

I can finally focus on features and not get slowed down by implementation, which also makes the whole process so much more FUN!
