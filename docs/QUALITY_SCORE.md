# Quality Score

## Quality Gates

### Prebuild Gate

`bun run build` triggers `prebuild` script which runs:

```bash
bun test && eslint
```

Both must pass before the build proceeds. CI enforces this on every push to `main`.

### CI Pipeline

GitHub Actions (`cloudflare-pages.yml`):
1. `bun run lint` — ESLint with Next.js config
2. `bun test` — All test suites
3. `bun run build` — Static export (re-runs prebuild gate)
4. Deploy to Cloudflare Pages (only if all above pass)

## Type Safety

- `strict: true` in `tsconfig.json`
- No `any` without explicit justification
- No `@ts-ignore` or `@ts-expect-error` without explanation
- Exhaustive switch statements (see `fee-calculator.ts` for pattern)
- Literal union types for constrained values (`AtrConfig` uses `10 | 14 | 20`, not `number`)

## Test Coverage

### Test Distribution

| Area | Files | What's Tested |
|------|-------|---------------|
| Backtest engine | 10 test files | Runner, position manager, SMA/ATR calculators, fee calculator, trailing stops, leverage configs, top-k heap, baseline |
| Lib utilities | 6 test files | CSV validator, strategy validator, format functions, calculations (position size, profit metrics, validation), chart data, downsampling |
| Components | 7 test files | Results table, optimization progress, day-by-day table, optimal strategy card, SMA comparison, position-size-calculator, profit-calculator |
| Hooks | 1 test file | useOptimization |

### Testing Stack

- **Runner:** Bun test
- **DOM:** happy-dom (lightweight, fast)
- **Component testing:** @testing-library/react + @testing-library/user-event
- **Pattern:** Tests colocated with source (`foo.ts` → `foo.test.ts`)

## Lint Configuration

ESLint 9 with `eslint-config-next`. No custom rules beyond Next.js defaults.

## Dimensions to Improve

| Dimension | Current | Target |
|-----------|---------|--------|
| Hook test coverage | useOptimization only | Add usePagination tests |
| Component test coverage | 7 of ~20 feature components | Cover backtest-setup, strategy-config, performance-chart |
| E2E tests | None | Consider Playwright for full flow |
| Bundle analysis | Not tracked | Add `@next/bundle-analyzer` |
| Accessibility | ShadCN defaults (Radix) | Audit keyboard navigation, screen reader |
