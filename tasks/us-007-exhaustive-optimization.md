# US-007: Exhaustive Optimization Execution

**Description:** As a user, I want the app to test all combinations of SMA periods, leverage ratios, and ATR configurations to find the optimal strategy.

## Acceptance Criteria

- [ ] Test all combinations: 141 SMAs × 9 LONG leverage × 9 SHORT leverage = 11,421 base configs
- [ ] If ATR enabled, test each ATR configuration: 3 periods × 5 multipliers × 4 percentages = 60 ATR configs per base
- [ ] Total: 11,421 without ATR, or 11,421 × 60 = 685,260 with ATR
- [ ] Show live progress: "Testing configuration 1,234 of 11,421 (10.8%)"
- [ ] Include progress bar with percentage and estimated time remaining
- [ ] Run optimization in background (non-blocking UI)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Configuration Space

### Base Parameters
- **SMA periods**: 20, 21, 22, ..., 160 (141 values)
- **LONG leverage**: 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0 (9 values)
- **SHORT leverage**: 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0 (9 values)
- **Total base**: 141 × 9 × 9 = 11,421

### ATR Parameters (if enabled)
- **Period**: 10, 14, 20 (3 values)
- **Multiplier**: 2, 2.5, 3, 3.5, 4 (5 values)
- **Close %**: 10, 25, 50, 100 (4 values)
- **Total ATR**: 3 × 5 × 4 = 60

### Total Configurations
- **Without ATR**: 11,421
- **With ATR**: 11,421 × 60 = 685,260

## Progress Tracking

```typescript
interface ProgressUpdate {
  current: number;
  total: number;
  percentage: number;
  estimatedTimeRemaining: string; // "2m 30s"
  currentConfig: {
    sma: number;
    longLeverage: number;
    shortLeverage: number;
    atr?: string; // "ATR(14, 3, 50%)"
  };
}
```

### Progress Display
```
Testing configuration 1,234 of 11,421 (10.8%)
[████████░░░░░░░░░░░░░░░░░░░░] 10.8%
Estimated time remaining: 8m 15s

Current: SMA(45), Long(2x), Short(1.5x)
```

### Update Frequency
- Update UI every 100 configurations
- Don't update on every single configuration (performance)
- Always update on completion

## Web Worker Implementation

```typescript
// backtest.worker.ts
self.onmessage = (e) => {
  const { priceData, config } = e.data;

  const results = [];
  let completed = 0;
  const total = calculateTotalConfigs(config);

  for (const combination of generateCombinations(config)) {
    const result = runBacktest(priceData, combination);
    results.push(result);
    completed++;

    if (completed % 100 === 0 || completed === total) {
      self.postMessage({
        type: 'progress',
        current: completed,
        total,
        percentage: (completed / total) * 100,
      });
    }
  }

  self.postMessage({
    type: 'complete',
    results,
  });
};
```

## Performance Optimization

### Memoization
- Pre-calculate all SMAs once (141 arrays)
- Reuse SMA arrays across configurations
- Cache ATR calculations per period

### Early Exit
- Skip remaining leverage combos if SMA liquidates all
- Track fastest-liquidating configs to test last

### Batch Processing
- Process in batches of 1,000 configs
- Allow UI updates between batches
- Prevent browser freezing
