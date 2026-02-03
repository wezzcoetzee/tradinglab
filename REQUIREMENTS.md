# Simply The Best

This is an application used to back test moving average based trading strategies for crypto currencies.

The user should enter their starting capital.

The applicaiton should also calculate the amount the user would end with if they had just bought and held the coin. Example, if you bought $1000 BTC at the start when BTC was $10000 and now it's $100000 per BTC, the user would have $10000.

The application will import a CSV file which will have the following headings

- time (ignore)
- high - the highest price the asset went to that day
- low - the lowest price the asset went to that day
- close - the price at which the asset closed on that day
- RSI - the relative strength index for the asset for the day
- date - the date, dd-mm-yyyy

The application will back test the SIMPLE MOVING AVERAGE from the 20D to the 160D. The trade is executed at 00:00 UTC everyday.

If the close price is ABOVE the SMA, the trade should be LONG.
If the close price is BELOW the SMA, the trade should be SHORT.
If the trade moves from LONG to SHORT, the LONG is closed first and then the SHORT is opened.
If the trade moves from SHORT to LONG, the SHORT is closed first and then the LONG is opened.

There is a fee that is charged for each trade and that needs to be an input field the user can specify.

The user should also be able to optimize for leverage use. To make this simple, the MINIMUM leverage that can be used is 1x, the MAXIMUM leverage that can be used is 3x. Leverage should be calcualted in increments of 0.25.

The leverage that is best for LONG could be different to the leverage that is used for going SHORT. This means you could have a strategy using 2.25x for LONG and 1.5 for SHORT.

If the user does not want to use leverage, they can specify a leverage of 1 for BOTH LONG and SHORT.

If the user's balance falls to $0 or below, they are liquidated and the strategy is a failure.

The user should have the option to also include an ATR Trailing Stop Loss. This should be a checkbox to specify if this should be included or not.

If included, the ATR Trailing Stop Loss has the following properties.

- ATR Period, which can be 10, 14 or 20
- Multipler, which can be 2, 2.5, 3, 3.5, 4
- Percentage of trade that should be closed, which can be 10%, 25%, 50%, 100%

The excel contains the HIGH and LOW to be able to calculate the ATR Trailing Stop Loss. When the trade is LONG the application needs to track the highest HIGH, until the application crosses the SMA and becomes SHORT, then it should track the lowest LOW. When the trade then moves back to LONG, the application will start tracking the highest HIGH since crossing the SMA. This pattern will continue.

When a trade is closed, that is the value that is used to open the new trade. This means that if the balance is $2000 and the SMA is crossed, the next trade should be started with $2000 (if 1x leverage is used), etc.

If the ATR Trailing Stop Loss is being tested and is hit, that should be kept so that it can be applied at the point the price crosses the SMA. For example, the trade is SHORT with a balance of $2000 and the ATR Trailing Stop Loss is 50% and is hit, $1000 is kept on the side and the trade keeps running, when the price crosses the SMA and becomes LONG, the open trade is valued at $500. The long trade will be opened with $500 + $1000 (held on the side), so with $1500 (assuming 1x leverage).

## Display

The UI should have an import button to load the data via excel

Once the calculation is done, there should be a section displaying the following

- Best SMA
- Best Leverage LONG and SHORT
- Best ATR Trailing Stop Loss
- Percentage made vs holding
- Percentage made from beginning

A table should be shown with the different SMAs and how much they made vs just holding, using a red to green color scale with the most red being the biggest loss and the most green being the biggest win

A table should be shown with the dat by day output of how the SMA did vs holding and how much value the account had at each day.

Technology choices

- NextJs
- ShadCN
- TailwindCSS

Ensure that you ask as many questions as you can about how this should be implemented, I've tried to include everything I can think of.
