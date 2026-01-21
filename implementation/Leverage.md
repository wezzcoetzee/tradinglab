# Leverage

I want to introduce Leverage optimization to the strategy.

The application should run with different LONG and SHORT leverage, meaning that LONG could be 2.75 and SHORT could be 1x

Leverage should go in 0.25 increments, starting with 0.5 and ending at a max leverage of 3

The strategy must test which is the best SMA and EMA INCLUDING leverage.

Remember, if you switch from LONG to SHORT, you incur 2 trading fees.

If your portfolio balance is at $1000 and you have a drawdown of 50% with 2x leverage, that means your portfolio is wiped out.



Ensure you use the CLAUDE.md file in the ~/.claude location. ENsure you use the Frontend Design Skill as well.

You can use the xlsx skill in order to analyze the btc.xlsm file

Please create a PRD with User Stories that you will follow to implement this feature, including the clean up. Put this in the /sma_only folder