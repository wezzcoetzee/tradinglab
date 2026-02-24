# Core Beliefs

## 1. Client-Side First

All computation happens in the browser. No data leaves the user's machine. This is a privacy guarantee, a cost guarantee (zero server spend), and a simplicity guarantee (no backend to maintain).

## 2. Exhaustive Over Heuristic

Users trust brute-force optimization over genetic algorithms or gradient descent. When someone sees "967,140 configurations tested," they know nothing was missed. This is the core differentiator.

## 3. Comparison Is Clarity

Every result is compared against buy-and-hold. A strategy returning 200% means nothing if holding returned 300%. The baseline card and vs-hold columns exist because absolute numbers lie without context.

## 4. Complexity Is Opt-In

ATR trailing stops multiply the search space by 60×. They're behind a toggle. The default experience (SMA × leverage) runs in seconds and covers the common case. Power users opt into the 1M+ config search.

## 5. No Premature Abstraction

One strategy type (SMA crossover). One optimization method (exhaustive). One data format (OHLC CSV). Adding EMA or MACD would be additive work, not a refactor of existing abstractions. The engine isn't generic-for-the-sake-of-generic.

## 6. Performance Budget via Architecture

Web Workers prevent UI freezes. Pre-computed indicators avoid redundant math. Top-K heaps cap memory. LTTB downsampling caps chart points. These aren't optimizations bolted on — they're structural decisions.
