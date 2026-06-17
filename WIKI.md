# LLM Wiki — Schema & Maintenance Guide

This repository follows the [Karpathy LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f): a **persistent, compounding knowledge base** maintained by LLM agents for faster onboarding, feature work, and debugging.

## Three layers

| Layer | Path | Owner | Purpose |
|-------|------|-------|---------|
| **Raw sources** | `raw/` | Humans + git | Immutable catalog of planning docs, schema, and code entry points. Never edit for synthesis — only add new sources. |
| **Wiki** | `wiki/` | LLM agents | Structured, interlinked markdown. Updated on ingest, query, and lint. |
| **Schema** | `WIKI.md` (this file) + `CLAUDE.md` | Co-evolved | Conventions, workflows, and coding commands. |

## Directory conventions

```
raw/
  index.md              ← catalog of all raw sources (paths + one-line summary)
wiki/
  index.md              ← content-oriented catalog of every wiki page
  log.md                ← append-only chronological log
  overview.md           ← start here for product context
  architecture.md
  ...
```

Wiki pages use **relative links** (`[Deal pipeline](deal-pipeline.md)`). Every new page must be added to `wiki/index.md`.

Optional YAML frontmatter on wiki pages:

```yaml
---
tags: [api, business]
updated: 2026-06-17
sources: [docs/02-architecture.md, lib/queries.ts]
---
```

## Operations

### Ingest (new code, docs, or features)

When significant code or planning docs change:

1. Read the changed raw sources (see `raw/index.md`).
2. Update affected wiki pages — not just one summary; touch entity pages, cross-links, and `implementation-status.md`.
3. Append an entry to `wiki/log.md` with prefix `## [YYYY-MM-DD] ingest | <subject>`.
4. Update `wiki/index.md` if pages were added or renamed.

### Query (answer a development question)

1. Read `wiki/index.md` to locate relevant pages.
2. Drill into linked pages; cite wiki paths in answers.
3. If the answer is reusable (comparison, decision record, how-to), **file it as a new wiki page** and link from `index.md`.

### Lint (periodic health check)

Ask the agent to lint the wiki:

- Contradictions between wiki and `CLAUDE.md` / code
- Stale claims vs current implementation
- Orphan pages (no inbound links from `index.md`)
- Missing pages for important concepts (new API route, new table)
- `docs/tasks/*.md` checkboxes out of sync with `wiki/implementation-status.md`

## Page types

| Type | Naming | Example |
|------|--------|---------|
| Overview | `overview.md` | Product vision, users, MVP scope |
| Architecture | `architecture.md` | Stack, data flow, env layers |
| Entity | `business-app.md`, `creator-app.md` | One major subsystem |
| Reference | `api-reference.md`, `data-model.md` | Lookup tables |
| Guide | `development-guide.md` | How to run, test, extend |
| Status | `implementation-status.md` | Done vs planned (source of truth for progress) |
| Map | `file-map.md` | Where to edit for a given feature |

## Relationship to other docs

- `docs/` — original planning PRD, architecture notes, granular task checklists. **Raw input**; may lag the code.
- `CLAUDE.md` — agent coding guide (commands, patterns, file pointers). Keep in sync with wiki; wiki is richer and navigable.
- `wiki/` — **compiled synthesis** optimized for traversal and feature work.

## Tips

- Prefer updating existing wiki pages over creating duplicates.
- When fixing a bug, note the pitfall in the relevant wiki page (one sentence).
- Link from `file-map.md` using `path:startLine` style pointers to key files.
- The wiki is version-controlled markdown — diffs show knowledge evolution.
