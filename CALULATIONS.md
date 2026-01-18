# Calcualtions

This file explains how the calculations should work in the application.

The only static data is

- Daily Close
- Timestamp
- Unix Timestamp

The daily close is the UTC price of the asset.

These are stored as PriceData, in the PriceData table.

To calcualte the best SMA and EMA, the input data is needed to calculate each SMA/EMA from the 1 day all the way to the 200 day. While calculating this, we need to take into account a few things

- Trading fee, which should be an input field. This will be calculated each time a trade is open and close.
- When the price is above the MA we should be in a LONG position, when the price is below the MA we should be in a SHORT position. When we move from a LONG to a SHORT, that is two trades, one closing the LONG and one opening the SHORT and vice versa.
- When we have leverage we should multiple our capital by the leverage amount when we open a trade, so if we have $1000 and we go long with 2x leverage, we should open a $2000 trade. Leverage should be from 1x to 5x, going in increments of 0.25.

We need to compare these outputs vs just buying and holding. So we need to also plot just buying the asset for the starting amount and holding it over the duration.

Once the best SMA/EMA is calculated. We need to let the user simulate buying vs this strategy from any point in time. We calculate the best SMA/EMA from the beginning of all data, but we might only start buying much later. For example the data starts in 2014, but we want to simulate buying against this strategy from 2018.

We might also want to find the best EMA/SMA while just going LONG or just going SHORT, so this should be taken into consideration as well.

Once the best values have been found, these should be saved to the database so they can be used again later.