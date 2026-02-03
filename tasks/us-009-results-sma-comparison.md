# US-009: Results Display - SMA Comparison Table

**Description:** As a user, I want to see a table comparing all SMA periods so I can understand performance across different timeframes.

## Acceptance Criteria

- [ ] Table with columns: SMA Period, Final Value, % Gain, % vs Hold
- [ ] Sort by final value (descending) by default
- [ ] Color scale: red (biggest loss) → yellow (neutral) → green (biggest gain)
- [ ] Apply color scale based on % vs hold
- [ ] Show liquidated strategies with "LIQUIDATED" badge and red background
- [ ] Make table sortable by any column
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Table Columns

| Column | Description | Format | Sortable |
|--------|-------------|--------|----------|
| SMA Period | SMA period in days | "45 days" | Yes |
| Final Value | Final portfolio value | "$18,450.75" | Yes (default desc) |
| % Gain | Gain from starting capital | "+84.5%" | Yes |
| % vs Hold | Performance vs buy-hold | "+23.0%" | Yes |
| Status | Liquidated indicator | Badge or "-" | Yes |

## Color Scale Implementation

### Calculate Color Based on % vs Hold

```typescript
function getColorForPerformance(percentVsHold: number): string {
  if (percentVsHold <= -50) return 'rgb(239, 68, 68)'; // red-500
  if (percentVsHold <= -25) return 'rgb(251, 146, 60)'; // orange-400
  if (percentVsHold <= -10) return 'rgb(251, 191, 36)'; // amber-400
  if (percentVsHold <= 0) return 'rgb(250, 204, 21)'; // yellow-400
  if (percentVsHold <= 10) return 'rgb(163, 230, 53)'; // lime-400
  if (percentVsHold <= 25) return 'rgb(74, 222, 128)'; // green-400
  if (percentVsHold <= 50) return 'rgb(34, 197, 94)'; // green-500
  return 'rgb(22, 163, 74)'; // green-600
}

function getBackgroundColor(percentVsHold: number, opacity = 0.1): string {
  const color = getColorForPerformance(percentVsHold);
  return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
}
```

### Visual Scale
```
-50% and below:  ████████ (dark red)
-25% to -50%:    ████████ (red-orange)
-10% to -25%:    ████████ (orange)
0% to -10%:      ████████ (yellow)
0% to +10%:      ████████ (lime)
+10% to +25%:    ████████ (light green)
+25% to +50%:    ████████ (green)
+50% and above:  ████████ (dark green)
```

## Liquidated Indicator

```typescript
function StatusCell({ result }: { result: BacktestResult }) {
  if (result.liquidated) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive">LIQUIDATED</Badge>
        <span className="text-xs text-gray-500">
          {result.liquidationDate}
        </span>
      </div>
    );
  }
  return <span className="text-gray-400">-</span>;
}
```

### Liquidated Row Styling
- Background: `bg-red-50` (light red)
- Border: `border-l-4 border-red-500`
- Text: `text-gray-500` (dimmed)
- Sort: Move to bottom by default

## Sorting Behavior

### Default Sort
- Column: Final Value
- Direction: Descending (highest first)
- Secondary: SMA Period (ascending)

### Sort Priority for Liquidated
```typescript
function sortResults(results: BacktestResult[], sortBy: string, direction: 'asc' | 'desc') {
  return results.sort((a, b) => {
    // Always put liquidated at bottom unless explicitly sorting by status
    if (sortBy !== 'status') {
      if (a.liquidated && !b.liquidated) return 1;
      if (!a.liquidated && b.liquidated) return -1;
    }

    // Apply primary sort
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}
```

## Table Component

```typescript
interface SMAComparisonTableProps {
  results: BacktestResult[];
  buyHoldValue: number;
  startingCapital: number;
}

function SMAComparisonTable({
  results,
  buyHoldValue,
  startingCapital,
}: SMAComparisonTableProps) {
  const [sortBy, setSortBy] = useState('finalValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedResults = sortResults(results, sortBy, sortDirection);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort('sma')}>SMA Period</TableHead>
          <TableHead onClick={() => handleSort('finalValue')}>Final Value</TableHead>
          <TableHead onClick={() => handleSort('percentGain')}>% Gain</TableHead>
          <TableHead onClick={() => handleSort('percentVsHold')}>% vs Hold</TableHead>
          <TableHead onClick={() => handleSort('status')}>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedResults.map((result) => (
          <TableRow
            key={result.config.sma}
            className={result.liquidated ? 'bg-red-50 border-l-4 border-red-500' : ''}
            style={{
              backgroundColor: !result.liquidated
                ? getBackgroundColor(result.percentVsHold)
                : undefined,
            }}
          >
            <TableCell>{result.config.sma} days</TableCell>
            <TableCell>${result.finalValue.toLocaleString()}</TableCell>
            <TableCell>
              <span style={{ color: getColorForPerformance(result.percentGain) }}>
                {result.percentGain > 0 ? '+' : ''}
                {result.percentGain.toFixed(1)}%
              </span>
            </TableCell>
            <TableCell>
              <span style={{ color: getColorForPerformance(result.percentVsHold) }}>
                {result.percentVsHold > 0 ? '+' : ''}
                {result.percentVsHold.toFixed(1)}%
              </span>
            </TableCell>
            <TableCell>
              <StatusCell result={result} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Performance Considerations

- Show top 50 results by default with "Show All" button
- Virtualize table if showing all 141 rows
- Memoize color calculations
- Use React.memo for row components
