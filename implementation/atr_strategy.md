Would it be possible to add an ATR Trailing Stop Loss to this tool as part of the backtests? THe idea would be that the ATR
Trailing Stop Loss is set from the pkea value after a LONG or SHORT Position is added.

If I LONG BTC at $90k and it rallies to $125k, the ATR is calcualted from $125k until the Price goes above that position
again, or the price crosses the MA and becomes a SHORT entry.

If I SHORT BTC at $90k and it drops to $70k, the ATR is calculated from $70k until the price falls bellow that position
again, or the price crosses the MA and becomes a LONG entry.

I want the ability to configure both the amount of profit I take as a percentage, the ATR value and the Multipler for the
ATR.

Since ATR uses a HIGH/LOW and we only have the close, use a close-only approximation

The ATR element should be able to be toggled on and off for strategies

ATRs are Fixed, the only ones that can be tested are

- 10
- 14
- 20

Multipliers are between 2 and 4, with 0.5 step increments.

Ensure you use the CLAUDE.md file in the ~/.claude location. ENsure you use the Frontend Design Skill as well.

Please create a PRD with User Stories that you will follow to implement this feature, including the clean up. Put this in the the same folder ast this file
