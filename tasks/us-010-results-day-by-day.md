# US-010: Results Display - Day-by-Day Performance Table

**Description:** As a user, I want to see daily portfolio progression for the optimal strategy so I can understand how the account value changed over time.

## Acceptance Criteria

- [ ] Table with columns: Date, Close Price, SMA Value, Position (LONG/SHORT/NONE), Portfolio Value, Buy-Hold Value
- [ ] Show data for optimal strategy only
- [ ] Skip first 160 days (warmup period), start from day 161
- [ ] Format dates as DD-MM-YYYY
- [ ] Format currency values with $ and 2 decimals
- [ ] Make table scrollable/virtualized for performance with large datasets
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Table Columns

| Column | Description | Format | Example |
|--------|-------------|--------|---------|
| Date | Trading date | DD-MM-YYYY | "01-06-2024" |
| Close Price | Daily close price | $X,XXX.XX | "$52,345.67" |
| SMA Value | SMA for optimal period | $X,XXX.XX | "$51,200.00" |
| Position | Current position type | Badge | "LONG" / "SHORT" / "NONE" |
| Portfolio Value | Strategy portfolio value | $X,XXX.XX | "$11,234.56" |
| Buy-Hold Value | Baseline comparison | $X,XXX.XX | "$10,500.00" |

## Data Structure

```typescript
interface DayByDayRow {
  date: string; // DD-MM-YYYY
  closePrice: number;
  smaValue: number;
  position: 'LONG' | 'SHORT' | 'NONE';
  portfolioValue: number;
  buyHoldValue: number;
}

function generateDayByDayData(
  priceData: PriceData[],
  optimalResult: BacktestResult,
  startingCapital: number
): DayByDayRow[] {
  const rows: DayByDayRow[] = [];
  const smaValues = calculateSMA(
    priceData.map((d) => d.close),
    optimalResult.config.sma
  );

  // Start from day 161 (index 160)
  for (let i = 160; i < priceData.length; i++) {
    const day = priceData[i];
    const sma = smaValues[i];
    const position = day.close > sma ? 'LONG' : day.close < sma ? 'SHORT' : 'NONE';

    // Calculate portfolio value at this point
    const portfolioValue = calculatePortfolioValueAtDay(i, optimalResult);

    // Calculate buy-hold value at this point
    const buyHoldValue =
      (startingCapital / priceData[160].close) * day.close;

    rows.push({
      date: day.date,
      closePrice: day.close,
      smaValue: sma,
      position,
      portfolioValue,
      buyHoldValue,
    });
  }

  return rows;
}
```

## Position Badge Styling

```typescript
function PositionBadge({ position }: { position: 'LONG' | 'SHORT' | 'NONE' }) {
  const variants = {
    LONG: 'bg-green-100 text-green-800 border-green-300',
    SHORT: 'bg-red-100 text-red-800 border-red-300',
    NONE: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <Badge className={variants[position]}>
      {position}
    </Badge>
  );
}
```

## Virtualization

Use `@tanstack/react-virtual` for efficient rendering of large datasets:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function DayByDayTable({ data }: { data: DayByDayRow[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45, // Row height in pixels
    overscan: 10, // Render 10 extra rows above/below viewport
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = data[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TableRow row={row} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## Formatting Helpers

```typescript
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string): string {
  // Already in DD-MM-YYYY format, return as-is
  return dateStr;
}
```

## Table Row Component

```typescript
function TableRow({ row }: { row: DayByDayRow }) {
  const isOutperforming = row.portfolioValue > row.buyHoldValue;

  return (
    <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b hover:bg-gray-50">
      <div>{formatDate(row.date)}</div>
      <div>{formatCurrency(row.closePrice)}</div>
      <div>{formatCurrency(row.smaValue)}</div>
      <div>
        <PositionBadge position={row.position} />
      </div>
      <div className={isOutperforming ? 'text-green-600 font-semibold' : ''}>
        {formatCurrency(row.portfolioValue)}
      </div>
      <div className="text-gray-600">{formatCurrency(row.buyHoldValue)}</div>
    </div>
  );
}
```

## Header Row

```typescript
function TableHeader() {
  return (
    <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-gray-100 font-semibold border-b-2 border-gray-300 sticky top-0 z-10">
      <div>Date</div>
      <div>Close Price</div>
      <div>SMA Value</div>
      <div>Position</div>
      <div>Portfolio Value</div>
      <div>Buy-Hold Value</div>
    </div>
  );
}
```

## Performance Considerations

- Virtualize for datasets > 100 rows
- Memoize row components with `React.memo`
- Use `useMemo` for data calculations
- Lazy load table when tab/accordion is opened
- Consider pagination as alternative to virtualization

## Export Functionality (Optional)

```typescript
function exportToCSV(data: DayByDayRow[], filename: string) {
  const headers = ['Date', 'Close Price', 'SMA Value', 'Position', 'Portfolio Value', 'Buy-Hold Value'];
  const rows = data.map((row) => [
    row.date,
    row.closePrice,
    row.smaValue,
    row.position,
    row.portfolioValue,
    row.buyHoldValue,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
```
