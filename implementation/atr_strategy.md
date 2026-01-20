Add ATR-Based Trailing Stop Loss to existing BTC strategy

Context

- Timeframe: keep exactly the same as current strategy
- Entry logic: completely unchanged (long when Close > 44 SMA, short when Close < 44 SMA)
- This change affects exit logic only — no change to entries

ATR

- Use standard ATR(14)
- True Range = max(high-low, abs(high-prev_close), abs(low-prev_close))
- ATR = 14-period moving average (usually RMA/Wilder) of True Range

Trailing Stop – Long positions

- On entry bar: highest_since_entry = close    (or high if you prefer classic Chandelier style)
- On every subsequent bar while long:
  highest_since_entry = max(highest_since_entry, close)   (or high)
  stop_price = highest_since_entry - k * current_ATR(14)
- If close < stop_price → exit long
- The stop must only move up (tighten), never down

Trailing Stop – Short positions

- On entry bar: lowest_since_entry = close    (or low)
- On every subsequent bar while short:
  lowest_since_entry = min(lowest_since_entry, close)   (or low)
  stop_price = lowest_since_entry + k * current_ATR(14)
- If close > stop_price → exit short
- Stop must only move down (tighten), never up

Parameters

- k (ATR multiplier): configurable, default = 2.5

Rules

- Use close price to check against stop_price (not intrabar prices)
- No partial exits
- Do not loosen the stop — pure ratchet behavior
- Keep full compatibility with existing backtest & live automation

Output

- Show the updated complete strategy logic/pseudocode
- Add clear inline comments explaining the trailing stop calculation
- (Optional) suggest 2–3 alternative k values to test on BTC (e.g. 2.0, 3.0, 4.0)
