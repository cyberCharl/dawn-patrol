# CLAUDE.md — Coding Agent Guide

## Project

Surf Check — multi-spot, multi-source surf forecast aggregator. Bun monorepo with Turborepo.

## Structure

- `apps/web` — Vite + React + shadcn/ui frontend
- `packages/schema` — Drizzle ORM schema + Zod validators (single source of truth for types)
- `packages/api` — Hono API server (port 3220)
- `packages/cli` — Commander CLI for agents
- `packages/ui` — Shared shadcn/ui components
- `skills/` — Agent skill docs (not code)

## Key Conventions

- **Type-safety chain:** Schema package defines all types. API, CLI, and web import from `@workspace/schema`. Never duplicate types.
- **Database:** SQLite via Drizzle ORM. DB file at `~/.local/share/surf-check/surf-check.db`
- **Config:** `~/.config/surf-check/config.json` (XDG-compliant)
- **Runtime:** Bun (not Node)
- **UI components:** Use shadcn/ui via `@workspace/ui`. Add new components with `bunx --bun shadcn@latest add <component> -c apps/web`

## Commands

```bash
bun install                    # Install all deps
bun dev                        # Dev mode (all packages)
bun run build                  # Build all
bun run typecheck              # Type check all packages
bun run --filter @workspace/api dev    # API only
bun run --filter web dev               # Web only
```

## API Port

Default: 3220 (env: `SURF_CHECK_API` / `SURF_CHECK_PORT`)

## Branch Strategy

Use Graphite (`gt`) for all branch/PR operations. Never `git rebase` or `git push --force`.
