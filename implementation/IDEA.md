# Idea

The current implementation does not align with what I have backtested, so we will start with the basics.

Remove all the calculation logic you've added. Keep the UI input elements for now.

Remove all the UI elements that show the backtest results.

We are going to start with just adding the SMA and EMA logic to the application, no leverage and no ATR yet.

Excel location ./btc.xlsm

Data (Sheet 1)

Images to note are data_sheet.png

This contains 3 fixed columns

A - The day since the start, the first record is Day 1
B - Unix Timestamp
C - Close Price for that day
D - Date as a readable string

The rest of the fields are calculated

F - This is the calculated SMA at that given date, i.e if it's June 1st 2020 and the SMA it is calculating is the 10 day, it'll look back at 10 days of data and work out the SMA.
G - This is the calculated EMA at that given date

J - This is stating if we should be LONG or SHORT, 1 means LONG and 0 means SHORT. We are short if the close price is below the SMA and LONG above the SMA
K - This is stating if we should be LONG or SHORT, 1 means LONG and 0 means SHORT. We are short if the close price is below the EMA and LONG above the EMA

N - This is the portfolio value if we just held the amount of BTC we bought at the start and multiplied that by the current price. If we bought 1 BTC at the start for $1000 and the price of BTC is now $2000, this field would say $2000
O - This field represents the balance of the trading against the SMA. As we Switch from LONG to SHORT our initial amount of BTC will be increasing/decreasing.
P - This field represents the balance of the trading against the EMA. As we Switch from LONG to SHORT our initial amount of BTC will be increasing/decreasing.

Inputs and Tables (Sheet 2)

Images to note are inputs_and_tables.png

The table shown between columns B - F

B - Duration of the EMA/SMA - this shows from the 2 day to the value specified in K3
C - How much profit/loss was made over that duration for the SMA
D - How much profit/loss was made over that duration for the EMA
F - The profit made if you just held BTC for the duration from the first buy

K3 - This is the duration we want to back test until, if this is 200 it means we want to test from the 2D to 200D
K5 - The number of Datapoints per year
K6 - Datapoints in the data sheet
K7 - Years, worked by by doing K6 / K5

K9 - Shows the best calculated SMA
K10 - Shows the best calcualted EMA

K15 - Indicates if we should go LONG (1) when above or just sit in cash (0)
K16 - Indicates if we should go SHORT (1) when we are below the MA or just sit in cash (0)

K20 - This is the initial capital the backtest starts with
K21 - Ignore this field
K22 - This is the fee we pay each time we open and close a trade. A note, if we are LONG and move to SHORT, that incurs two trade fees

K22 - Return factor if we just bought and held
K23 - Return factor from SMA trading
K24 - Return factor from EMA trading

L22 - K22 as a percent
L23 - K23 as a percent
L24 - K24 as a percent

Charts (Sheet 3)

We will ignore this sheet for now as we will add charts later.

## Your Task

Using the existing inputs that are still remaining in the solution, replicate these back tests and visualize these outputs by creating two tables

Table 1 should show the values represented in Sheet 2, Columns B, C, D, F which is each Moving Average duration, showing the percent made as the SMA, EMA and HODL (holding will yield the same value for every Moving average as we don't trade against this)

Table 2 will show same values as the data sheet (Sheet 1)

Ensure you use the CLAUDE.md file in the ~/.claude location. ENsure you use the Frontend Design Skill as well.

You can use the xlsx skill in order to analyze the btc.xlsm file

Please create a PRD with User Stories that you will follow to implement this feature, including the clean up. Put this in the /sma_only folder
