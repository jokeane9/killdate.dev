import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const CORE_QUESTIONS: Record<string, string[]> = {
  '25-mcp-server-technical-deep-dive': [
    'What is the actual wire format of MCP — what bytes travel over stdio during an initialize handshake and a tool call?',
    'Why does asyncpg return JSONB columns as raw Python strings, and what is the exact fix — where does it go and why does placement matter?',
    'How does FastMCP turn a Python function into an MCP tool — what does the decorator read, what does it generate, and what does mcp.run() actually start?',
    'What are the four test tiers for a custom MCP server and what class of failure does each one catch that the others miss?',
    'Why are tool docstrings routing logic rather than documentation — what goes wrong when two similar tools have vague descriptions?',
  ],
  '24-building-an-mcp-server': [
    'How do you build a custom MCP server from scratch — what files, what structure, what framework?',
    'What is the right architectural separation between MCP tools and Claude reasoning, and why does it matter for latency and cost?',
    'What do unit tests miss that integration tests catch when building an MCP server against a real database?',
    'Why do tool descriptions determine whether a custom MCP server works in practice — and what makes a description route correctly vs incorrectly?',
    'What is the spike branch + dangerous mode pattern for autonomous AI builds, and when should you use it?',
  ],
  '23-mcp-servers': [
    'Which MCP servers are actually useful during a production SaaS build, and which are noise?',
    'How do you wire MCP servers into Claude Code — what file, what format, what scope?',
    'What changes about the debugging and deploy loop once Claude can query live infrastructure state directly?',
  ],
  '00-what-is-agentic-orchestration': [
    'What is agentic orchestration precisely — not the buzzword, but the working definition a practitioner can act on?',
    'What three structural elements separate reliable agentic AI from unpredictable prompting?',
    'What is the difference between orchestration, vibe coding, and just using a chat window?',
  ],
  '01-stack': [
    'What technical depth do you actually need to use agentic tools without losing control of your codebase?',
    'Which parts of the stack require genuine expertise vs. working knowledge, and why does the distinction matter?',
  ],
  '01-the-tools': [
    'What is each tool actually for, and what goes wrong when you use it for the wrong job?',
    'How do you enforce the Claude Code / Cursor boundary in practice — what does each one touch and what does it not?',
  ],
  '02-claude-md-is-your-os': [
    'What is CLAUDE.md and why is it your operating system — not a readme, not documentation, but the agent\'s persistent context layer?',
    'What is the Core / Reference split and why does loading everything every session make things worse, not better?',
    'How does the session rhythm preserve context between sessions, and what happens to state that isn\'t written down?',
  ],
  '03-canonical-first': [
    'Why do you need a product definition doc before any code is written, and what does it do that a PRD doesn\'t?',
    'What is the difference between the marketing truth doc and the product behavior doc, and why does combining them break both?',
    'What happens to a codebase when AI agents work without a stable product definition — what does the drift actually look like?',
  ],
  '04-initial-build-scope': [
    'What is the minimum viable build (distinct from MVP) and why does scope width directly determine whether drift is visible or invisible?',
    'How do you write a lock that actually prevents AI agents from expanding into adjacent code — what does the invariants table do?',
    'What does a mock need to contain before Cursor can implement against it without guessing?',
  ],
  '05-running-the-runbook': [
    'What is a runbook and why does every task need exactly five blocks — what failure does each block prevent?',
    'What does the task-by-task review loop check, and why does handing the whole runbook to Cursor at once always produce worse output?',
    'What does "done" actually mean when you\'re shipping to production — why isn\'t CI passing sufficient?',
  ],
  '04-pre-build-lock': [
    'How does a feature session work on a live product — what does Claude Code read at session open, and why?',
    'What is the V(N+1) = V(N) + exactly one surgical change rule, and what breaks when you bundle two changes into one build?',
    'What is the tool boundary on a live product, and what does scope creep from AI actually look like in practice?',
  ],
  '05-claude-code-vs-cursor': [
    'What is a pre-build lock and why is naming what does NOT change more important than naming what does?',
    'How do you audit blast radius before writing code — what does the matrix reveal that a scope statement doesn\'t?',
    'What does the mock do for feature work specifically — how is it different from the MVB mock?',
  ],
  '06-runbooks': [
    'How do the five runbook blocks work differently in a live codebase vs. a greenfield build?',
    'What is the Strangler Fig pattern, when do you use it, and how does the kill date for the legacy surface get written?',
    'What does the per-task review loop check, and when do you bring a problem to Claude Code vs. correcting Cursor directly?',
  ],
  '07-kill-dates-and-shipping': [
    'What does staging validate that localhost doesn\'t, and what runs first — automated suite or manual walkthrough?',
    'How do feature flags work as the rollback mechanism, and why is flag-level rollback fundamentally different from a redeploy?',
    'What is the N-1 rule, and what are the sunset criterion and kill date — why must both be written before the feature ships?',
  ],
  '08-testing-90-10': [
    'What always gets tested — what three categories get tests in every build, and what is the shared code boundary?',
    'What is a golden fixture, why do all validators run against the same file, and what does the drift signal catch that the fixture doesn\'t?',
    'How does contract testing across a language boundary work — what are the three validation layers and what does each one catch?',
  ],
  '09-contract-testing': [
    'What is the 90/10 testing rule — what gets tests and what doesn\'t, and why does the rule live in CLAUDE.md not in your head?',
    'What do production failures teach that passing tests don\'t — what are the production data failure modes that clean fixtures miss?',
    'Why is your own understanding of the codebase the ultimate test — what does a green suite not tell you?',
  ],
  '10-figma-and-claude': [
    'What are the three tools, their three distinct jobs, and where does drift enter when the boundary between them is blurred?',
    'Why do UX state diagrams have to be drawn before Figma frames are designed — what does a missing state diagram force the AI to do?',
    'When do you use a Claude Code prototype vs. a Figma mock, and what does the prototype tell you that a Figma frame doesn\'t?',
  ],
  '11-building-ui-with-ai': [
    'How does the full process (Figma → state map → prototype → lock → Cursor build → tests → production) play out on a complex real surface?',
    'What did the task-by-task review loop catch that automated tests wouldn\'t have caught — what are the three specific bugs and why did each require a human read?',
    'Why is manual staging walkthrough a different thing from automated testing — what does end-to-end testing in a real environment surface that the test suite cannot?',
  ],
  '12-learning-resources': [
    'Which resources actually build the foundational understanding of LLMs that makes the rest of this methodology land correctly?',
  ],
  '17-building-shelf': [
    'What does a production LLM pipeline actually look like end to end — what are the layers, and what does each one do?',
    'What went wrong with prompt V1 and V2 for a real AI briefing product, and what did the V3 rewrite change structurally?',
    'What did build discipline (lock documents, kill dates, CLAUDE.md session state) give a two-person team that ad hoc AI coding wouldn\'t have?',
  ],
  '18-remix-route-visualizer': [
    'Why is a Remix app hard to hold in your head, and what does a route visualizer show that reading the file tree doesn\'t?',
    'How does the outlet chain / nested containment view work, and what does it make immediately visible about a Remix app\'s layout architecture?',
    'What can be auto-parsed from Remix file conventions, and what requires manual mapping or static analysis for the ecosystem cross-layer view?',
  ],
  '19-long-prompting': [
    'What are large context window sessions actually useful for on a production codebase — what jobs earn their cost?',
    'How do you frame a 250K context session to get a senior engineer\'s perspective rather than a generic answer?',
    'When should you not use large context sessions — what tasks belong to Cursor with a tight runbook instead?',
  ],
  '20-langflow-postgres': [
    'What does the Langflow template library reveal about how a marketing operator thinks — and why does it map to a pipeline architecture?',
    'Where is the boundary between automatable pattern-matching and human judgment in a marketing workflow, and how do you find it?',
    'How do you use an agentic tool for customer research before writing a line of pipeline code?',
  ],
  '21-v2-to-v3-learnings': [
    'What does a real LLM prompt eval stack look like — what tools, what checks, what process governs who can approve a prompt edit?',
    'What did the V2 to V3 migration on Shelf actually find — what broke, what the fuzzer caught, and what passed all checks but was still wrong?',
    'When does testing correctness stop being the right question and business value become the measurement that matters?',
  ],
  '22-vizstack-2': [
    'What does embedding Claude in an architecture diagram change — how does a static tool become a reasoning tool?',
    'Why did VizStack become an onboarding tool when it was built as a documentation tool — what was the unplanned use case?',
    'What is the proxy friction problem and why is it the real adoption blocker for embedded Claude tooling?',
  ],
  'mission-control': [
    'What tool shows the live git status of all my projects in one window?',
    'Is there a local, private dashboard for multiple git repos with no server, account, or telemetry?',
    'When should you combine developer tools into one app instead of keeping them standalone?',
  ],
};

export const GET: APIRoute = async () => {
  const allPosts = await getCollection('posts', ({ data }) => !data.draft);
  const posts = allPosts.sort((a, b) => a.data.post - b.data.post);

  const slug = (p: (typeof posts)[0]) => p.id.replace(/\.md$/, '');

  let sections: string[] = [];

  sections.push(`\
# killdate.dev — Full content

This file contains the complete text of every post on killdate.dev, preceded by the core questions each post answers. Generated automatically from the content collection.

Site: https://killdate.dev
Authors: John and Dave, Prima Digital (Vancouver)
Repo: https://github.com/jokeane9/killdate.dev

Use llms.txt for the site index and key concepts. Use this file when you need the full arguments, specific process details, or exact quotes from any post.
`);

  for (const post of posts) {
    const id = slug(post);
    const url = `https://killdate.dev/posts/${id}`;
    const questions = CORE_QUESTIONS[id] ?? [];

    let section = `---

## ${post.data.title}
URL: ${url}
`;

    if (questions.length > 0) {
      section += `\n### Core questions this post answers\n\n`;
      section += questions.map(q => `- ${q}`).join('\n');
      section += '\n';
    }

    section += `\n### Full text\n\n`;
    section += post.body ?? '';

    sections.push(section);
  }

  return new Response(sections.join('\n\n').trim(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
