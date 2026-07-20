---
title: "Technical Knowledge Floor"
description: "Tools and technologies in active use. The working knowledge base for everything in this series."
part: 0
post: 1
section: playbook
group: "Foundations"
draft: false
tags: ["tooling", "stack"]
---

You don't need to write this stuff fluently. You need enough to review what the AI produces, detect drift, catch when something looks wrong, and know which layer broke. Probably deep in one area, working knowledge across the rest.

The ability to code isn't the full skill set — not by a long stretch. The emerging skill is being able to architect and design the system: knowing how the pieces should connect, feeling when they don't, directing execution rather than performing it. That's a different job than writing code. It's also a more interesting one — intellectually harder in the ways that matter, more creative, and considerably less repetitive.

If that resonates — you're in the right place.

## Orchestration

**Claude Code** — Terminal agent. Reasoning across the whole codebase, infrastructure, deploys, prompt work, session management. Runs in YOLO mode with GitHub CLI and AWS CLI access — handles deploys end to end.

**Cursor** — IDE. Every new UI surface, schema migration, full vertical slice. Executes against runbooks written in Claude Code. No larger feature gets built outside Cursor.

**OpenAI Codex** — Rapidly becoming a serious Claude Code contender. Worth watching.

## The Stack You Need to Know

### Database
Read and write SQL. Understand schemas, migrations, and why a destructive migration is a problem. The AI generates queries confidently — your job is knowing when the schema doesn't match reality and why data integrity lives in the database, not in application code. Raw SQL beats an ORM here because there's nothing hiding what's happening.

### Python (or pick one and go deep)
You need genuine depth in at least one programming language. Not "I've read some tutorials" — depth. Enough to read unfamiliar code and understand what it's doing. Enough to know when AI output is plausible but wrong. Pick one and commit. I'd pick Python. It's readable, it's everywhere, and the fundamentals transfer cleanly to almost everything else you'll touch.

What depth actually means: variables, types, control flow, functions, classes. How to import and use a library. What a virtual environment is and why it exists. How to read a stack trace. How to write a loop that does what you think it does. None of this requires being a Python developer — it requires being someone who can open a `.py` file and not feel lost.

### Full-Stack Framework
Pick one — Remix, Next.js, SvelteKit, whatever fits your build. Know it well enough to read a route, a loader, and an auth flow without getting lost. Understand where server code runs vs. client code. The framework is yours. The approach transfers.

### Frontend / Browser Debugging
DevTools. Network tab, failed requests, response bodies, DOM inspection. Tell the difference between a styling bug, a data bug, and a JavaScript error. Know which layer caused it before you tell the AI where to look.

### Backend Debugging
Server logs, error traces, stack traces. The key tool is AWS CloudWatch — we give Claude Code direct CLI access so it can pull logs and diagnose production issues without manual log-hunting. When production breaks, you're reading logs, not writing code.

### CI/CD
Read a GitHub Actions workflow and know what it's doing. We give Claude Code CLI access — it triggers runs, checks status, reads output directly. Know what a failed step means: build error, test failure, missing secret, permissions problem. And understand the difference between dev, staging, and production — it's remarkable how few people actually do. This isn't DevOps expertise, it's basic hygiene.

### Docker
Images, containers, what a Dockerfile is doing at a high level. When the app works locally but fails in production, it's almost always Docker: missing env var, wrong base image, unpinned dependency. Stop saying "it works on my machine."

### AWS Fundamentals
ECS, RDS, S3 + CloudFront, IAM. IAM especially — permissions, roles, least-privilege. Critical when you're giving AI tools CLI access in YOLO mode. Know what you're granting and what the blast radius is if it goes wrong.

### DevOps Basics
Environment variables, secrets, health checks, rollback. Know the difference between a secret and a config value. Know what a health check is and why a failing one takes down your service. Know which lever to pull when production breaks.

---

**Repo:** Full stack in context — `CLAUDE.md`, runbooks, process docs — at [killdate.dev](https://killdate.dev).
