# AGENTS.md

## Project Overview

TradingLab is a client-side crypto trading strategy backtester. Static Next.js export deployed to Cloudflare Pages. No backend, no database, no auth.

**Live:** https://tradinglab.vip

## Commands

```bash
bun dev          # Start dev server (localhost:3000)
bun run build    # Production build (runs prebuild: test + lint first)
bun run lint     # ESLint
bun test         # Bun test runner with happy-dom
bun test <file>  # Single test file
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript 5 (strict mode) |
| Runtime | Bun |
| UI | React 19, ShadCN (new-york style), Radix UI |
| Styling | Tailwind CSS 4, CSS variables for theming |
| Charts | Recharts |
| CSV Parsing | PapaParse |
| Testing | Bun test runner, Testing Library, happy-dom |
| CI/CD | GitHub Actions → Cloudflare Pages |

## Architecture Quick Reference

```
app/                    # Single page SPA (page.tsx → Backtester)
components/             # Feature components + ui/ (ShadCN primitives)
hooks/                  # use-optimization (Web Worker), use-pagination
lib/                    # Validators, formatters, utilities
lib/backtest/           # Core engine: runner, position manager, calculators
lib/backtest/optimization.worker.ts  # Web Worker for parallel backtest execution
```

**Data flow:** CSV Upload → Validate → Configure Strategy → Web Worker runs all parameter combos → Top-K results displayed

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

## Context Documents

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, directory structure, data flow |
| [docs/FRONTEND.md](docs/FRONTEND.md) | Component hierarchy, state, conventions |
| [docs/PRODUCT_SENSE.md](docs/PRODUCT_SENSE.md) | What the product is, user flows |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system, theming, responsive |
| [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) | Quality gates, test coverage |
| [docs/PLANS.md](docs/PLANS.md) | Current priorities, deferred work |
| [docs/design-docs/](docs/design-docs/index.md) | Architectural decision records |
| [docs/product-specs/](docs/product-specs/index.md) | Feature specifications |
| [docs/exec-plans/](docs/exec-plans/tech-debt-tracker.md) | Tech debt tracker |

## Agent Roles

| Agent | Boundary |
|-------|----------|
| `clean-code-engineer` | Feature work, refactoring. Read ARCHITECTURE + FRONTEND first. |
| `test-architect` | Test coverage. Colocated test files, Bun runner, happy-dom. |
| `codebase-search` | Cross-module exploration. Start from this file's directory map. |
| `tech-docs-writer` | Documentation. Follow existing doc structure in `docs/`. |

## Constraints

- **No backend.** Everything runs client-side. No API routes, no server functions.
- **No database.** No Prisma, no migrations. Data is ephemeral (CSV uploaded per session).
- **No auth.** No user accounts. No cookies beyond theme preference.
- **Static export.** `next.config.ts` has `output: 'export'`. No SSR, no ISR.
- **Bun only.** No npm/yarn. Use `bun install`, `bun run`, `bunx`.
- **Prebuild gate.** `bun run build` runs `bun test && eslint` before building. Both must pass.
