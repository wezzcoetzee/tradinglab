Add an ATR-based trailing stop loss to my existing BTC trading strategy.
Context
Timeframe: same as current strategy (do not change)
Entry logic: unchanged (long when Close > 44-period SMA, short when Close < 44-period SMA)
This request is exit logic only
ATR Calculation
ATR stands for Average True Range
Use ATR(14) unless otherwise specified
True Range for each bar is:
TR = max(
  high - low,
  abs(high - previous_close),
  abs(low - previous_close)
)
ATR is the moving average of TR over 14 periods
Trailing Stop Logic (Long Positions)
When a long position is opened, initialize:
highest_close_since_entry = close
On every new bar while the position is open:
highest_close_since_entry = max(highest_close_since_entry, close)
stop_price = highest_close_since_entry - (k *ATR)
If:
close < stop_price
then exit the long position
Trailing Stop Logic (Short Positions)
When a short position is opened, initialize:
lowest_close_since_entry = close
On every new bar while the position is open:
lowest_close_since_entry = min(lowest_close_since_entry, close)
stop_price = lowest_close_since_entry + (k* ATR)
If:
close > stop_price
then exit the short position
Parameterization
Expose k (ATR multiplier) as a configurable parameter
Default value: k = 2.5
Additional Rules
The trailing stop must only tighten, never loosen
Do not modify entry logic
Do not introduce partial exits
Use close price, not intrabar price, for stop evaluation
Maintain compatibility with existing backtests and automation
Output
Provide the updated logic in code
Include brief inline comments explaining the stop calculation
