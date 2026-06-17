# Wiki Log

Append-only chronological record of wiki maintenance. Entries use the prefix `## [YYYY-MM-DD] <type> | <subject>` for grep-friendly parsing.

```bash
grep "^## \[" wiki/log.md | tail -5   # last 5 entries
```

---

## [2026-06-17] ingest | Design handoff Supabase compatibility guide

- Rewrote `designs/influenza/README.md` with prototype → production map, Supabase table mapping, anti-patterns, and compatibility checklist.
- Linked from `raw/index.md` and `wiki/file-map.md`.

## [2026-06-17] ingest | Initial LLM wiki bootstrap

- Created `raw/` source catalog and full `wiki/` page set from repository exploration.
- Synthesized implementation status from code (supersedes stale unchecked items in `docs/tasks/` for several areas).
- Updated root `README.md`, `docs/tasks/README.md`, and `WIKI.md` schema.
- Sources ingested: all paths listed in [raw/index.md](../raw/index.md); primary code read: `lib/queries.ts`, `BizApp.tsx`, `CreatorApp.tsx`, `deal-actions.ts`, migrations list, `CLAUDE.md`, planning docs `01`–`06`.
