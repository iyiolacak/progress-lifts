# Schema & DB changes (temporary report)

Date: 2025-10-10

This document records the schema-related edits made while troubleshooting DB initialization errors (RxDB / Dexie). It is a short, actionable record so you and collaborators can review, test, and decide next steps.

## Summary (what changed)

- `src/localdb/schema/jobs.ts`
  - Added `multipleOf: 1` to integer fields used in or relevant to indexing: `priority`, `attempts`, `maxAttempts` (and ensured timestamps have `multipleOf`).
  - Simplified composite indexes to avoid optional fields (Dexie limitation). Old composite index that included optional fields (`scheduledAt`, `lockedUntil`, `priority`) was replaced with safer indexes that only use required fields:
    - New indexes: `["status", "id"]`, `"entryId"`, `"createdAt"`.

- `src/localdb/schema/log.ts`
  - Made `createdAt` a validated integer with `multipleOf: 1` and a sensible `maximum`.
  - Added `maxLength` to indexed string fields (`entity.type`, `entity.id`, `correlationId`, `level`).
  - Removed composite indexes that included optional fields (e.g. `entity.id`, `correlationId`) and kept indexes using only required fields:
    - New indexes: `["entity.type", "createdAt"]`, `["level", "createdAt"]`, `"createdAt"`.

- `src/app/debug/page.tsx` (new)
  - Added a lightweight client-side debug UI to exercise DB init, create/list entries and jobs, view logs, and reset the DB during development.
  - Type fixes: replaced many `any` usages with concrete types (`EntryDocType`, `JobDocType`) and improved error handling to avoid lint/TS complaints.

## Why these changes were necessary

- RxDB enforces schema constraints to make indexes reliable across storage adapters. The errors observed were:
  - SC35: integer fields used in indexes must set `multipleOf`.
  - SC34: string fields used in indexes must set `maxLength`.
  - DXE1: Dexie (RxDB's Dexie storage) disallows composite indexes that include non-required (optional) fields.

- Without these schema constraints, RxDB refuses to initialize the database (DB creation fails) — so the app cannot run. The edits are minimal, focused changes to make schemas compatible with RxDB + Dexie while preserving the data model as much as possible.

## Practical impact & tradeoffs

- DB initialization should now succeed in development.
- Composite indexes that included optional fields were removed. That means some previously possible indexed query plans (e.g., querying by `status` + `scheduledAt` + `priority`) are no longer covered by a single composite index and may be slower.
- Options going forward:
  - Keep the schema as-is (safer, no breaking migrations) and accept smaller indexes; redesign queries to use the available indexes.
  - Make formerly-optional fields required (or always write sentinel values) and add the composite indexes back — this is breaking and requires a migration for existing data.

## Recommended next steps

1. Run a local typecheck and start dev server, then open the debug page at `/debug` and exercise init/create/list/reset to confirm behavior:

```bash
# from repo root
npm install   # if needed
npm dev
```

2. Verify query performance for critical codepaths that previously relied on the removed composite indexes. If performance regressions are unacceptable, choose one of:
   - Introduce sentinel/default values for optional fields so they are effectively present on every doc (non-breaking write path), then re-add composite indexes.
   - Make the fields required in the schema and perform a migration to populate missing values.

3. Optionally run an automated scan of other schema files to ensure any field used in an index follows RxDB rules (`string` → `maxLength`; `integer`/`number` → `multipleOf`). I can prepare an automated patch for that if you want.

4. If you decide to change requiredness of fields, add a migration path and tests. For local development, `resetDBForTests()` exists and will drop the DB (do not use on production).

## How to revert

- Revert the git changes for the specific files you want to go back to. Example:

```bash
git checkout -- src/localdb/schema/jobs.ts src/localdb/schema/log.ts src/app/debug/page.tsx
```

Note: reverting schema changes may cause DB init to fail again.

## Tests I ran (manual)

- Created the debug page to exercise DB init and quick insert/find flows. Use it to reproduce that DB init completes and basic operations work.

## Contact points in repo

- Jobs schema: `src/localdb/schema/jobs.ts`
- Logs schema: `src/localdb/schema/log.ts`
- Debug UI: `src/app/debug/page.tsx`

---

If you want, I can now:
- run a full typecheck and dev server and report any remaining errors;
- scan and patch other schema files automatically for SC34/SC35/DXE1 compliance;
- or prepare a migration plan to reintroduce composite indexes by making fields required.

Tell me which of those you want next.
