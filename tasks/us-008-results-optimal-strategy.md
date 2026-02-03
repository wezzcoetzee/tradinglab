# US-008: Results Display - Optimal Strategy

**Description:** As a user, I want to see the best-performing strategy prominently displayed with key metrics so I can quickly understand which parameters worked best.

## Acceptance Criteria

- [ ] Display section at top showing: Best SMA period, Best LONG leverage, Best SHORT leverage, Best ATR config (if enabled)
- [ ] Show final portfolio value for optimal strategy
- [ ] Show percentage made from beginning: ((final - starting) / starting) × 100
- [ ] Show percentage made vs holding: ((strategy_final - hold_final) / hold_final) × 100
- [ ] Use large, readable typography for key numbers
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Display Layout

```
╔══════════════════════════════════════════════════════╗
║           OPTIMAL STRATEGY RESULTS                   ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Final Portfolio Value                               ║
║  $18,450.75                                          ║
║                                                      ║
║  Gain: +84.5%  |  vs Hold: +23.0%                   ║
║                                                      ║
╠══════════════════════════════════════════════════════╣
║  Strategy Parameters                                 ║
║  • SMA Period: 45 days                              ║
║  • LONG Leverage: 2.0x                              ║
║  • SHORT Leverage: 1.5x                             ║
║  • ATR Stop: 14-day, 3.0x, 50% close               ║
║                                                      ║
║  Performance                                         ║
║  • Total Trades: 127                                ║
║  • Win Rate: 58.3%                                  ║
║  • Max Drawdown: -12.4%                             ║
╚══════════════════════════════════════════════════════╝
```

## Component Structure

```typescript
interface OptimalStrategyProps {
  result: BacktestResult;
  buyHoldValue: number;
  startingCapital: number;
}

function OptimalStrategyDisplay({
  result,
  buyHoldValue,
  startingCapital,
}: OptimalStrategyProps) {
  const percentGain = ((result.finalValue - startingCapital) / startingCapital) * 100;
  const percentVsHold = ((result.finalValue - buyHoldValue) / buyHoldValue) * 100;

  return (
    <Card>
      <CardHeader>
        <h2>Optimal Strategy Results</h2>
      </CardHeader>
      <CardContent>
        {/* Final value - large text */}
        <div className="text-5xl font-bold">
          ${result.finalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>

        {/* Percentage metrics */}
        <div className="flex gap-4 text-xl mt-4">
          <Badge variant={percentGain > 0 ? 'success' : 'destructive'}>
            {percentGain > 0 ? '+' : ''}{percentGain.toFixed(1)}%
          </Badge>
          <Badge variant={percentVsHold > 0 ? 'success' : 'destructive'}>
            vs Hold: {percentVsHold > 0 ? '+' : ''}{percentVsHold.toFixed(1)}%
          </Badge>
        </div>

        {/* Strategy parameters */}
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold">Strategy Parameters</h3>
          <ul>
            <li>SMA Period: {result.config.sma} days</li>
            <li>LONG Leverage: {result.config.longLeverage}x</li>
            <li>SHORT Leverage: {result.config.shortLeverage}x</li>
            {result.config.atrEnabled && (
              <li>
                ATR Stop: {result.config.atrPeriod}-day, {result.config.atrMultiplier}x,{' '}
                {result.config.atrClosePercent}% close
              </li>
            )}
          </ul>
        </div>

        {/* Performance stats */}
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold">Performance</h3>
          <ul>
            <li>Total Trades: {result.trades}</li>
            {/* Additional metrics if available */}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Typography Scale

- **Final Value**: text-5xl (48px), font-bold
- **Percentage Metrics**: text-xl (20px)
- **Section Headers**: text-lg (18px), font-semibold
- **Parameter Labels**: text-base (16px)

## Color Coding

- **Positive Gains**: Green (#22c55e)
- **Negative Losses**: Red (#ef4444)
- **Neutral**: Gray (#6b7280)
- **vs Hold Outperformance**: Emerald (#10b981)
- **vs Hold Underperformance**: Orange (#f97316)
