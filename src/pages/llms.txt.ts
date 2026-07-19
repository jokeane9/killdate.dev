import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const allPosts = await getCollection('posts', ({ data }) => !data.draft);
  const posts = allPosts.sort((a, b) => a.data.post - b.data.post);

  const essays   = posts.filter(p => p.data.section === 'essays');
  const playbook = posts.filter(p => p.data.section === 'playbook');
  const workshop = posts.filter(p => p.data.section === 'workshop');

  const slug = (p: (typeof posts)[0]) => p.id.replace(/\.md$/, '');
  const line = (p: (typeof posts)[0]) =>
    `- [${p.data.title}](https://killdate.dev/posts/${slug(p)}): ${p.data.description}`;

  const grouped = (list: typeof posts) => {
    const groups = [...new Set(list.map(p => p.data.group))];
    return groups
      .map(g => `#### ${g}\n\n${list.filter(p => p.data.group === g).map(line).join('\n')}`)
      .join('\n\n');
  };

  const content = `\
# killdate.dev

> The development blog of Langmerge Agentic Systems Lab (Prima Digital, Vancouver) — working essays on where software is heading, a forkable playbook for shipping SaaS with AI agents, and workshop notes from the products where we test it.

killdate.dev documents how Langmerge Agentic Systems Lab (Prima Digital, a Vancouver-based web development studio) builds software using AI agents. The content covers agentic orchestration as a production methodology: the discipline, tooling, and process required to ship reliably with Claude Code and Cursor.

The site is both a process log and a forkable starter kit. The writing covers the methodology; the repo at https://github.com/jokeane9/killdate.dev contains the actual CLAUDE.md, cursor rules, runbooks, and process documents described in the posts.

## Core thesis

AI agents need context to work properly. Without structured session documents, your AI tools start cold every session — no memory of the project, no constraints, no process. CLAUDE.md is the fix: a persistent context layer the agent reads every session. This site is the playbook for building and maintaining that context layer across a real product.

## Key concepts

- **Agentic orchestration**: Using AI agents (Claude Code, Cursor) in a structured, directed way — defined roles, scoped tasks, session continuity. Not just prompting.
- **CLAUDE.md / AGENTS.md**: The session context file Claude Code reads at the start of every session. Functions as the agent's operating system: what the product is, what the build discipline is, what the agent is and isn't allowed to do.
- **Core vs Reference**: CLAUDE.md splits into always-on context (Core, ~300 lines) and on-demand process docs (Reference). Core contains a manifest table indexing every Reference doc — what it covers, when to load it, when to flag that a process is undocumented.
- **Runbooks**: Structured task documents with five blocks — FILES, TYPES, SKELETON, PROHIBITED, VALIDATE — defining exactly what Cursor can touch per task. The PROHIBITED block is what makes agentic work safe on a live codebase.
- **Pre-build lock**: Scope defined before any code is written. IN list, OUT list, blast radius. The OUT list is the discipline.
- **Kill dates**: Hard expiry dates on feature flags and temporary code. Forces cleanup before it becomes debt.
- **MVB (Minimum Viable Build)**: The smallest possible working version, scoped and locked before the build starts.
- **Strangler Fig pattern**: Incremental migration — wrap the old, build the new alongside it, cut over when ready. Avoids big-bang rewrites on live products.
- **Blast radius**: The explicit set of files and systems a change is allowed to touch. Defined before the build starts, not discovered after.
- **The N-1 rule**: Always maintain the ability to roll back to the previous version when shipping to production.

## Pages

### About

- [About](https://killdate.dev/about): Prima Digital — who we are, what this site is, how to reach us.

### Working Essays

Current thinking — working positions from the middle of building agentic products.

${grouped(essays)}

### The Playbook

The method, in order: killdate-kit, the minimum viable build, features, testing, prompts in production.

${grouped(playbook)}

### Workshop Notes

Build logs — the method applied to real products and open source tools, grouped by project.

${grouped(workshop)}

## The repo

https://github.com/jokeane9/killdate.dev

The forkable repo contains the actual working files described in this series:
- CLAUDE.md template with Core and Reference structure
- AGENTS.md for multi-agent context
- Cursor rules (.cursor/rules/)
- Runbook templates with FILES / TYPES / SKELETON / PROHIBITED / VALIDATE blocks
- Process documents: agile playbook, deploy checklist, debugging taxonomy, pre-build lock template

Fork it, open it in Claude Code, and start asking questions. The blog is scaffolding. The repo is the tool.

## Authors

John and Dave — co-publishers, Prima Digital
- john@primadigital.net
- dave@primadigital.net

## About Prima Digital

Prima Digital is a Vancouver-based web development studio. We build on CMS platforms, develop plugins, and are expanding into SaaS products. killdate.dev is the process log for that last part.
`;

  return new Response(content.trim(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
