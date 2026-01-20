# Simply The Best

## High Level

Using past data, compare a range of Simple Moving Averages as a signal to LONG or SHORT an asset. When above the SMA LONG and below you should SHORT.

## Features

- Take trading fees into account, when you switch from LONG to SHORT (vice versa), that incurs two trading fees
- Optimize using leverage, if our starting capital is $1000 and we use 2x leverage, we should start with $2000. Leverage also means that if we draw down by 50% with 2x leverage our account is wiped out.
- Take funding fees into account, this is tough and needs to be thought out more
- Work out returns of SMA vs just holding
- Have a base account value
- Work out max draw downs
- Each time a new trade is made, the amount that is left from the previous trade should be used. Example, we start at $1000 and go LONG, the price moves up and we eventually cross the MA to go short, but when we cross the MA our portfolio is valued at $1100, the short should start with $1100.
- If our account balance falls under $0, that strategy is instantly stopped as our account is wiped out

## Excel Explained

excel location - [btc 2025-10.xlsm](./btc%202025-10.xlsm)

### Data Sheet (Sheet 1)

Images for reference are:

- data_sheet_1.png
- data_sheet_2.png

Static Fields

- Unix TimeStamp
- Close Price
- Date

Calculated Fields

- SMA
- EMA - Ignore
- Long SMA? - This field is 1 if the Close price is above the SMA and is 0 if it's below the SMA
- Long EMA? - Ignore
- HODL - This is if you just bought BTC at the start date, and the amount of BTC you bought multiple by the close price
- SMA Trading - How much your capital balance is based on trading the SMA
- EMA Trading - Ignore this
- max drawdown trade - How much draw down from trading the SMA
- max drawdown hodl - How much draw down from just hodling

Cell R200 is the maximum drawdown experienced during trading
Cell S200 is the maximum hodl experienced during trading

### Inputs and tables (Sheet 2)

Images for reference are:

- input_and_tables_1.png
- input_and_tables_2.png

This sheet calculates all the SMAs from the 2D to the 200D.

This uses the macro in [iterateoverbuffer.md](./iterateoverbuffer.md)

- Buy on Long Signal? - 1 means yes, 0 means no
- Short on Short Signal? - 1 means yes, 0 means no
- Initial Capital (USD) - How much you start the strategy with
- Gas fee / trade (USD) - If trading on chain, there could be a gas fee. Mostly this is 0
- Exchange Fee (%) - this is the fee that's applied to every trade. To note if a trade is LONG and becomes SHORT, that incurrs a fee to close the tradea and a fee to open the trade

Leverage

- long + short (same leverage) - This is if you use the same leverage to go long and short
- short only - THis is the leverage used when Long
- long only - This is the leverage used when short

I THINK [macro4.md](./macro4.md) is used for calculating short and long. I could be wrong.

### Charts (sheet 3)

These are charts to show the output of the calculations visually.
