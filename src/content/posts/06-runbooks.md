---
title: "Building a feature: runbook, Cursor, Strangler Fig"
description: "The runbook for feature work. Five blocks. Strangler Fig when you're replacing something live. Claude Code reviews every task before the next one starts."
part: 2
post: 3
draft: false
tags: ["runbooks", "cursor", "strangler-fig", "build-process", "drift-prevention"]
---

The lock is filled. The invariants are named. The blast radius is understood. The mock is approved. That's the scope — now the runbook is what turns it into something Cursor can execute without interpretation.

The runbook for feature work uses the same five-block structure as the MVB runbook. The discipline is identical. What changes is the context: you're working inside an existing codebase. Cursor can see every file, not just the ones in scope. Without explicit boundaries it will reach into adjacent code it notices, improve something that wasn't in the task, and hand you a diff you didn't ask for. The structure that was helpful during the MVB is non-negotiable here.

## The five blocks — in a live codebase

**FILES** — the explicit allowlist of every file Cursor is permitted to modify. In the MVB, most files were new. In feature work, Cursor can see the entire codebase and will drift into adjacent files if they're not locked out. This block is the single highest-leverage constraint in any runbook.

**TYPES** — the exact data contracts the task produces or consumes. TypeScript interfaces, Pydantic models, API response shapes — whatever your stack uses to define structure. Write them explicitly. Cursor matches against declared types reliably; it invents field names when left to infer them from context. Feature work often extends existing types — the TYPES block specifies both what's new and what the existing contracts must look like.

**SKELETON** — the exact shape of the output. Not a description — the actual structure. Function signatures, component trees, schema definitions. Hand Cursor a shape to fill in, not a description to interpret. The difference between "build a card with a list of items" and handing Cursor a precise component skeleton with the exact structure defined is the difference between Cursor guessing and Cursor filling in a known shape. Prose produces drift. Skeletons don't.

**PROHIBITED** — the explicit list of what this task must not do. For feature work, this always includes: "Do not modify any file not in the FILES block. Do not refactor existing code. Do not rename variables in files you import from." Beyond that, name the specific things Cursor tends to add for this class of task. Vague constraints produce vague compliance. Specific names produce specific enforcement.

**VALIDATE** — concrete checks that must pass before the task is considered done. "The endpoint returns a 200 with this exact response shape" is a validation criterion. "Confirm it looks right" catches nothing and passes everything. For feature work, VALIDATE also includes a spot-check from the lock's invariants inventory — at least one surface listed as unchanged, verified explicitly.

## Strangler Fig: replacing something live

When the feature replaces an existing surface rather than adding something net-new, the Strangler Fig pattern keeps it safe:

1. **Build alongside** — the new surface is built adjacent to the old one. No traffic reaches it yet.
2. **Route behind a flag** — a per-user or per-environment flag directs traffic to the new surface. Zero users initially.
3. **Test with yourself first** — flip the flag for your own account. Validate the full surface in production with real data.
4. **Expand gradually** — increase exposure as confidence builds. Everyone else remains on the old surface.
5. **Delete when legacy traffic is zero** — write the sunset criterion and kill date before you flip the first user. Not after.

At every moment during rollout the system is in a valid state. Rollback is flipping the flag — no redeploy, no migration, no incident. The legacy code doesn't get deleted when the new surface ships. It gets deleted when the sunset criterion is met. That distinction is what separates a clean migration from an emergency revert.

## The review loop

After every Cursor task, before the next one starts:

**FILES check** — every file Cursor modified must be in the task's FILES block. If it touched something outside, stop. The specific change may be benign. The habit of expanding scope is not.

**VALIDATE check** — run the criterion from the runbook. Don't proceed on the assumption it passed.

**Invariants check** — spot-check one or two surfaces from the lock. Feature builds drift into adjacent code. Catch it at the task boundary, not after five tasks.

When something looks wrong, bring it to Claude Code first — not Cursor. Point to the specific file, describe what you're seeing, ask Claude Code to check it against the runbook and mock. Let Claude Code produce the precise correction, then hand that to Cursor. Vague corrections produce vague fixes.

The loop per task: Cursor executes → FILES check → VALIDATE check → invariants check → drift found: Claude Code diagnoses, Cursor re-executes → clean: approve, next task.

## When to skip the hardened pattern

The full five-block structure is overkill for:
- Single-file bug fixes
- Isolated backend functions with exact logic provided
- Cosmetic changes within an existing component
- Small additions to an existing surface with no new data or state

Use the hardened pattern for anything involving new UI surfaces, state management, data schema changes, or multi-step flows. The judgment is explicit — you make it per task. You don't silently skip the structure on complex tasks because writing the skeleton feels slow.

---

**In the repo:** The runbook template is pre-populated with the five-block structure. Two prompts for the build phase:

> Read the runbook for [feature name]. Walk me through task [N]. Confirm every file in the FILES block exists in the repo, and tell me exactly how to verify the VALIDATE criterion when Cursor is done.

After each task:

> Read the output of task [N] in [file]. Check it against the runbook spec and the mock. Check the invariants from the lock — does anything outside the FILES block look like it changed? Tell me if anything diverges and what the precise correction is.
