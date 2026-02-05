import { describe, expect, test } from 'bun:test';
import type { CsvRow } from '../types';
import type { Position, TrailingStopState } from './types';
import {
  executePartialClose,
  initTrailingStop,
  shouldTriggerStop,
  updateExtremePrice,
} from './trailing-stop-manager';

describe('initTrailingStop', () => {
  test('should_initialize_long_trailing_stop_with_high', () => {
    const row: CsvRow = {
      date: '2024-01-01',
      time: 100,
      high: 105,
      low: 95,
      close: 102,
      RSI: 1000,
    };

    const result = initTrailingStop(row, 'LONG');

    expect(result.extremePrice).toBe(105);
    expect(result.triggered).toBe(false);
  });

  test('should_initialize_short_trailing_stop_with_low', () => {
    const row: CsvRow = {
      date: '2024-01-01',
      time: 100,
      high: 105,
      low: 95,
      close: 102,
      RSI: 1000,
    };

    const result = initTrailingStop(row, 'SHORT');

    expect(result.extremePrice).toBe(95);
    expect(result.triggered).toBe(false);
  });

  test('should_set_triggered_to_false', () => {
    const row: CsvRow = {
      date: '2024-01-01',
      time: 100,
      high: 110,
      low: 90,
      close: 105,
      RSI: 1000,
    };

    const longResult = initTrailingStop(row, 'LONG');
    const shortResult = initTrailingStop(row, 'SHORT');

    expect(longResult.triggered).toBe(false);
    expect(shortResult.triggered).toBe(false);
  });

  test('should_handle_equal_high_and_low', () => {
    const row: CsvRow = {
      date: '2024-01-01',
      time: 100,
      high: 100,
      low: 100,
      close: 100,
      RSI: 1000,
    };

    const longResult = initTrailingStop(row, 'LONG');
    const shortResult = initTrailingStop(row, 'SHORT');

    expect(longResult.extremePrice).toBe(100);
    expect(shortResult.extremePrice).toBe(100);
  });

  test('should_handle_large_range', () => {
    const row: CsvRow = {
      date: '2024-01-01',
      time: 100,
      high: 200,
      low: 50,
      close: 150,
      RSI: 1000,
    };

    const longResult = initTrailingStop(row, 'LONG');
    const shortResult = initTrailingStop(row, 'SHORT');

    expect(longResult.extremePrice).toBe(200);
    expect(shortResult.extremePrice).toBe(50);
  });

  test('should_handle_fractional_prices', () => {
    const row: CsvRow = {
      date: '2024-01-01',
      time: 100.5,
      high: 105.75,
      low: 95.25,
      close: 102.5,
      RSI: 1000,
    };

    const longResult = initTrailingStop(row, 'LONG');
    const shortResult = initTrailingStop(row, 'SHORT');

    expect(longResult.extremePrice).toBe(105.75);
    expect(shortResult.extremePrice).toBe(95.25);
  });
});

describe('updateExtremePrice', () => {
  describe('long positions', () => {
    test('should_update_extreme_when_new_high_reached', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const row: CsvRow = {
        date: '2024-01-02',
        time: 100,
        high: 110,
        low: 95,
        close: 105,
        RSI: 1000,
      };

      const result = updateExtremePrice(state, row, 'LONG');

      expect(result.extremePrice).toBe(110);
      expect(result.triggered).toBe(false);
    });

    test('should_not_update_when_high_is_lower', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const row: CsvRow = {
        date: '2024-01-02',
        time: 95,
        high: 98,
        low: 90,
        close: 95,
        RSI: 1000,
      };

      const result = updateExtremePrice(state, row, 'LONG');

      expect(result.extremePrice).toBe(100);
      expect(result.triggered).toBe(false);
    });

    test('should_not_update_when_high_equals_extreme', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const row: CsvRow = {
        date: '2024-01-02',
        time: 98,
        high: 100,
        low: 95,
        close: 99,
        RSI: 1000,
      };

      const result = updateExtremePrice(state, row, 'LONG');

      expect(result.extremePrice).toBe(100);
      expect(result === state).toBe(true);
    });

    test('should_not_update_when_already_triggered', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: true,
      };
      const row: CsvRow = {
        date: '2024-01-02',
        time: 110,
        high: 120,
        low: 105,
        close: 115,
        RSI: 1000,
      };

      const result = updateExtremePrice(state, row, 'LONG');

      expect(result.extremePrice).toBe(100);
      expect(result.triggered).toBe(true);
      expect(result === state).toBe(true);
    });

    test('should_return_new_state_object_when_updated', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const row: CsvRow = {
        date: '2024-01-02',
        time: 100,
        high: 105,
        low: 95,
        close: 102,
        RSI: 1000,
      };

      const result = updateExtremePrice(state, row, 'LONG');

      expect(result !== state).toBe(true);
      expect(result.extremePrice).toBe(105);
    });
  });

  describe('short positions', () => {
    test('should_update_extreme_when_new_low_reached', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const row: CsvRow = {
        date: '2024-01-02',
        time: 95,
        high: 105,
        low: 90,
        close: 92,
        RSI: 1000,
      };

      const result = updateExtremePrice(state, row, 'SHORT');

      expect(result.extremePrice).toBe(90);
      expect(result.triggered).toBe(false);
    });

    test('should_not_update_when_low_is_higher', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const row: CsvRow = {
        date: '2024-01-02',
        time: 105,
        high: 110,
        low: 102,
        close: 108,
        RSI: 1000,
      };

      const result = updateExtremePrice(state, row, 'SHORT');

      expect(result.extremePrice).toBe(100);
      expect(result.triggered).toBe(false);
    });

    test('should_not_update_when_low_equals_extreme', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const row: CsvRow = {
        date: '2024-01-02',
        time: 102,
        high: 105,
        low: 100,
        close: 103,
        RSI: 1000,
      };

      const result = updateExtremePrice(state, row, 'SHORT');

      expect(result.extremePrice).toBe(100);
      expect(result === state).toBe(true);
    });

    test('should_not_update_when_already_triggered', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: true,
      };
      const row: CsvRow = {
        date: '2024-01-02',
        time: 90,
        high: 95,
        low: 85,
        close: 88,
        RSI: 1000,
      };

      const result = updateExtremePrice(state, row, 'SHORT');

      expect(result.extremePrice).toBe(100);
      expect(result.triggered).toBe(true);
      expect(result === state).toBe(true);
    });

    test('should_return_new_state_object_when_updated', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const row: CsvRow = {
        date: '2024-01-02',
        time: 98,
        high: 105,
        low: 95,
        close: 97,
        RSI: 1000,
      };

      const result = updateExtremePrice(state, row, 'SHORT');

      expect(result !== state).toBe(true);
      expect(result.extremePrice).toBe(95);
    });
  });

  test('should_handle_large_price_movements', () => {
    const state: TrailingStopState = {
      extremePrice: 100,
      triggered: false,
    };
    const row: CsvRow = {
      date: '2024-01-02',
      time: 200,
      high: 250,
      low: 50,
      close: 150,
      RSI: 1000,
    };

    const longResult = updateExtremePrice(state, row, 'LONG');
    const shortResult = updateExtremePrice(state, row, 'SHORT');

    expect(longResult.extremePrice).toBe(250);
    expect(shortResult.extremePrice).toBe(50);
  });

  test('should_handle_fractional_values', () => {
    const state: TrailingStopState = {
      extremePrice: 100.5,
      triggered: false,
    };
    const row: CsvRow = {
      date: '2024-01-02',
      time: 100,
      high: 105.75,
      low: 95.25,
      close: 102,
      RSI: 1000,
    };

    const longResult = updateExtremePrice(state, row, 'LONG');
    const shortResult = updateExtremePrice(state, row, 'SHORT');

    expect(longResult.extremePrice).toBe(105.75);
    expect(shortResult.extremePrice).toBe(95.25);
  });
});

describe('shouldTriggerStop', () => {
  describe('long positions', () => {
    test('should_trigger_when_price_below_stop_level', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 89;
      const atr = 5;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

      expect(result).toBe(true);
    });

    test('should_not_trigger_when_price_above_stop_level', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 91;
      const atr = 5;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

      expect(result).toBe(false);
    });

    test('should_trigger_when_price_exactly_at_stop_level', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 90;
      const atr = 5;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

      expect(result).toBe(true);
    });

    test('should_not_trigger_when_already_triggered', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: true,
      };
      const price = 80;
      const atr = 5;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

      expect(result).toBe(false);
    });

    test('should_not_trigger_when_atr_is_nan', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 80;
      const atr = NaN;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

      expect(result).toBe(false);
    });

    test('should_use_multiplier_2', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 90;
      const atr = 5;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

      expect(result).toBe(true);
    });

    test('should_use_multiplier_2_5', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 87.5;
      const atr = 5;
      const multiplier = 2.5;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

      expect(result).toBe(true);
    });

    test('should_use_multiplier_3', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 85;
      const atr = 5;
      const multiplier = 3;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

      expect(result).toBe(true);
    });

    test('should_use_multiplier_3_5', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 82.5;
      const atr = 5;
      const multiplier = 3.5;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

      expect(result).toBe(true);
    });

    test('should_use_multiplier_4', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 80;
      const atr = 5;
      const multiplier = 4;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

      expect(result).toBe(true);
    });
  });

  describe('short positions', () => {
    test('should_trigger_when_price_above_stop_level', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 111;
      const atr = 5;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'SHORT');

      expect(result).toBe(true);
    });

    test('should_not_trigger_when_price_below_stop_level', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 109;
      const atr = 5;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'SHORT');

      expect(result).toBe(false);
    });

    test('should_trigger_when_price_exactly_at_stop_level', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 110;
      const atr = 5;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'SHORT');

      expect(result).toBe(true);
    });

    test('should_not_trigger_when_already_triggered', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: true,
      };
      const price = 120;
      const atr = 5;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'SHORT');

      expect(result).toBe(false);
    });

    test('should_not_trigger_when_atr_is_nan', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 120;
      const atr = NaN;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'SHORT');

      expect(result).toBe(false);
    });

    test('should_use_multiplier_2', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 110;
      const atr = 5;
      const multiplier = 2;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'SHORT');

      expect(result).toBe(true);
    });

    test('should_use_multiplier_2_5', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 112.5;
      const atr = 5;
      const multiplier = 2.5;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'SHORT');

      expect(result).toBe(true);
    });

    test('should_use_multiplier_3', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 115;
      const atr = 5;
      const multiplier = 3;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'SHORT');

      expect(result).toBe(true);
    });

    test('should_use_multiplier_3_5', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 117.5;
      const atr = 5;
      const multiplier = 3.5;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'SHORT');

      expect(result).toBe(true);
    });

    test('should_use_multiplier_4', () => {
      const state: TrailingStopState = {
        extremePrice: 100,
        triggered: false,
      };
      const price = 120;
      const atr = 5;
      const multiplier = 4;

      const result = shouldTriggerStop(state, price, atr, multiplier, 'SHORT');

      expect(result).toBe(true);
    });
  });

  test('should_handle_small_atr_values', () => {
    const state: TrailingStopState = {
      extremePrice: 100,
      triggered: false,
    };
    const price = 99.5;
    const atr = 0.1;
    const multiplier = 2;

    const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

    expect(result).toBe(true);
  });

  test('should_handle_large_atr_values', () => {
    const state: TrailingStopState = {
      extremePrice: 100,
      triggered: false,
    };
    const price = 70;
    const atr = 10;
    const multiplier = 2;

    const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

    expect(result).toBe(true);
  });

  test('should_handle_fractional_values', () => {
    const state: TrailingStopState = {
      extremePrice: 100.5,
      triggered: false,
    };
    const price = 90.25;
    const atr = 5.1;
    const multiplier = 2;

    const result = shouldTriggerStop(state, price, atr, multiplier, 'LONG');

    expect(result).toBe(true);
  });
});

describe('executePartialClose', () => {
  describe('long positions', () => {
    test('should_close_10_percent_with_profit', () => {
      const position: Position = {
        type: 'LONG',
        entryPrice: 100,
        entryValue: 2000,
        leverage: 2,
        trailingStop: { extremePrice: 110, triggered: false },
      };
      const price = 110;
      const closePercent = 10;
      const feeRate = 0.1;

      const result = executePartialClose(position, price, closePercent, feeRate);

      // closedCapital = 200 / 2 = 100, fees = 100 * 2 * 0.1 / 100 = 0.2
      expect(result.newPosition.entryValue).toBe(1800);
      expect(result.closedCapital).toBe(100);
      expect(result.pnl).toBeCloseTo(20, 10);
      expect(result.fees).toBeCloseTo(0.2, 10);
      expect(result.sidelineValue).toBeCloseTo(119.8, 10);
      expect(result.newPosition.trailingStop?.triggered).toBe(true);
    });

    test('should_close_25_percent_with_profit', () => {
      const position: Position = {
        type: 'LONG',
        entryPrice: 100,
        entryValue: 2000,
        leverage: 2,
      };
      const price = 110;
      const closePercent = 25;
      const feeRate = 0.1;

      const result = executePartialClose(position, price, closePercent, feeRate);

      // closedCapital = 500 / 2 = 250, fees = 250 * 2 * 0.1 / 100 = 0.5
      expect(result.newPosition.entryValue).toBe(1500);
      expect(result.closedCapital).toBe(250);
      expect(result.pnl).toBeCloseTo(50, 10);
      expect(result.fees).toBeCloseTo(0.5, 10);
      expect(result.sidelineValue).toBeCloseTo(299.5, 10);
    });

    test('should_close_50_percent_with_profit', () => {
      const position: Position = {
        type: 'LONG',
        entryPrice: 100,
        entryValue: 2000,
        leverage: 2,
      };
      const price = 110;
      const closePercent = 50;
      const feeRate = 0.1;

      const result = executePartialClose(position, price, closePercent, feeRate);

      // closedCapital = 1000 / 2 = 500, fees = 500 * 2 * 0.1 / 100 = 1
      expect(result.newPosition.entryValue).toBe(1000);
      expect(result.closedCapital).toBe(500);
      expect(result.pnl).toBeCloseTo(100, 10);
      expect(result.fees).toBeCloseTo(1, 10);
      expect(result.sidelineValue).toBeCloseTo(599, 10);
    });

    test('should_close_100_percent_with_profit', () => {
      const position: Position = {
        type: 'LONG',
        entryPrice: 100,
        entryValue: 2000,
        leverage: 2,
      };
      const price = 110;
      const closePercent = 100;
      const feeRate = 0.1;

      const result = executePartialClose(position, price, closePercent, feeRate);

      // closedCapital = 2000 / 2 = 1000, fees = 1000 * 2 * 0.1 / 100 = 2
      expect(result.newPosition.entryValue).toBe(0);
      expect(result.closedCapital).toBe(1000);
      expect(result.pnl).toBeCloseTo(200, 10);
      expect(result.fees).toBeCloseTo(2, 10);
      expect(result.sidelineValue).toBeCloseTo(1198, 10);
    });

    test('should_handle_loss_scenario', () => {
      const position: Position = {
        type: 'LONG',
        entryPrice: 100,
        entryValue: 2000,
        leverage: 2,
      };
      const price = 95;
      const closePercent = 50;
      const feeRate = 0.1;

      const result = executePartialClose(position, price, closePercent, feeRate);

      // closedCapital = 1000 / 2 = 500, fees = 500 * 2 * 0.1 / 100 = 1
      expect(result.newPosition.entryValue).toBe(1000);
      expect(result.closedCapital).toBe(500);
      expect(result.pnl).toBeCloseTo(-50, 10);
      expect(result.fees).toBeCloseTo(1, 10);
      expect(result.sidelineValue).toBeCloseTo(449, 10);
    });
  });

  describe('short positions', () => {
    test('should_close_10_percent_with_profit', () => {
      const position: Position = {
        type: 'SHORT',
        entryPrice: 100,
        entryValue: 2000,
        leverage: 2,
        trailingStop: { extremePrice: 90, triggered: false },
      };
      const price = 90;
      const closePercent = 10;
      const feeRate = 0.1;

      const result = executePartialClose(position, price, closePercent, feeRate);

      // closedCapital = 200 / 2 = 100, fees = 100 * 2 * 0.1 / 100 = 0.2
      expect(result.newPosition.entryValue).toBe(1800);
      expect(result.closedCapital).toBe(100);
      expect(result.pnl).toBeCloseTo(22.22, 2);
      expect(result.fees).toBeCloseTo(0.2, 10);
      expect(result.sidelineValue).toBeCloseTo(122.02, 2);
      expect(result.newPosition.trailingStop?.triggered).toBe(true);
    });

    test('should_close_25_percent_with_profit', () => {
      const position: Position = {
        type: 'SHORT',
        entryPrice: 100,
        entryValue: 2000,
        leverage: 2,
      };
      const price = 90;
      const closePercent = 25;
      const feeRate = 0.1;

      const result = executePartialClose(position, price, closePercent, feeRate);

      // closedCapital = 500 / 2 = 250, fees = 250 * 2 * 0.1 / 100 = 0.5
      expect(result.newPosition.entryValue).toBe(1500);
      expect(result.closedCapital).toBe(250);
      expect(result.pnl).toBeCloseTo(55.56, 2);
      expect(result.fees).toBeCloseTo(0.5, 10);
      expect(result.sidelineValue).toBeCloseTo(305.06, 2);
    });

    test('should_close_50_percent_with_profit', () => {
      const position: Position = {
        type: 'SHORT',
        entryPrice: 100,
        entryValue: 2000,
        leverage: 2,
      };
      const price = 90;
      const closePercent = 50;
      const feeRate = 0.1;

      const result = executePartialClose(position, price, closePercent, feeRate);

      // closedCapital = 1000 / 2 = 500, fees = 500 * 2 * 0.1 / 100 = 1
      expect(result.newPosition.entryValue).toBe(1000);
      expect(result.closedCapital).toBe(500);
      expect(result.pnl).toBeCloseTo(111.11, 2);
      expect(result.fees).toBeCloseTo(1, 10);
      expect(result.sidelineValue).toBeCloseTo(610.11, 2);
    });

    test('should_close_100_percent_with_profit', () => {
      const position: Position = {
        type: 'SHORT',
        entryPrice: 100,
        entryValue: 2000,
        leverage: 2,
      };
      const price = 90;
      const closePercent = 100;
      const feeRate = 0.1;

      const result = executePartialClose(position, price, closePercent, feeRate);

      // closedCapital = 2000 / 2 = 1000, fees = 1000 * 2 * 0.1 / 100 = 2
      expect(result.newPosition.entryValue).toBe(0);
      expect(result.closedCapital).toBe(1000);
      expect(result.pnl).toBeCloseTo(222.22, 2);
      expect(result.fees).toBeCloseTo(2, 10);
      expect(result.sidelineValue).toBeCloseTo(1220.22, 2);
    });

    test('should_handle_loss_scenario', () => {
      const position: Position = {
        type: 'SHORT',
        entryPrice: 100,
        entryValue: 2000,
        leverage: 2,
      };
      const price = 105;
      const closePercent = 50;
      const feeRate = 0.1;

      const result = executePartialClose(position, price, closePercent, feeRate);

      // closedCapital = 1000 / 2 = 500, fees = 500 * 2 * 0.1 / 100 = 1
      expect(result.newPosition.entryValue).toBe(1000);
      expect(result.closedCapital).toBe(500);
      expect(result.pnl).toBeCloseTo(-47.62, 2);
      expect(result.fees).toBeCloseTo(1, 10);
      expect(result.sidelineValue).toBeCloseTo(451.38, 2);
    });
  });

  test('should_preserve_position_properties', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 2000,
      leverage: 2.5,
    };
    const price = 110;
    const closePercent = 50;
    const feeRate = 0.1;

    const result = executePartialClose(position, price, closePercent, feeRate);

    expect(result.newPosition.type).toBe('LONG');
    expect(result.newPosition.entryPrice).toBe(100);
    expect(result.newPosition.leverage).toBe(2.5);
  });

  test('should_set_trailing_stop_triggered', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 2000,
      leverage: 2,
      trailingStop: { extremePrice: 110, triggered: false },
    };
    const price = 110;
    const closePercent = 50;
    const feeRate = 0.1;

    const result = executePartialClose(position, price, closePercent, feeRate);

    expect(result.newPosition.trailingStop?.triggered).toBe(true);
    expect(result.newPosition.trailingStop?.extremePrice).toBe(110);
  });

  test('should_initialize_trailing_stop_if_missing', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 2000,
      leverage: 2,
    };
    const price = 110;
    const closePercent = 50;
    const feeRate = 0.1;

    const result = executePartialClose(position, price, closePercent, feeRate);

    expect(result.newPosition.trailingStop?.triggered).toBe(true);
    expect(result.newPosition.trailingStop?.extremePrice).toBe(110);
  });

  test('should_calculate_fees_on_notional_value', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 3000,
      leverage: 3,
    };
    const price = 110;
    const closePercent = 100;
    const feeRate = 0.1;

    const result = executePartialClose(position, price, closePercent, feeRate);

    // closedCapital = 3000 / 3 = 1000
    // fees = closedCapital * leverage * feeRate / 100 = 1000 * 3 * 0.1 / 100 = 3
    const closedCapital = 1000;
    const expectedFees = (closedCapital * 3 * 0.1) / 100;
    expect(result.closedCapital).toBe(closedCapital);
    expect(result.fees).toBeCloseTo(expectedFees, 10);
  });

  test('should_handle_zero_fee_rate', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 2000,
      leverage: 2,
    };
    const price = 110;
    const closePercent = 50;
    const feeRate = 0;

    const result = executePartialClose(position, price, closePercent, feeRate);

    expect(result.fees).toBe(0);
  });

  test('should_handle_high_leverage', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 3000,
      leverage: 3,
    };
    const price = 110;
    const closePercent = 50;
    const feeRate = 0.1;

    const result = executePartialClose(position, price, closePercent, feeRate);

    expect(result.newPosition.entryValue).toBe(1500);
    expect(result.pnl).toBeCloseTo(150, 10);
  });

  test('should_handle_fractional_leverage', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 1750,
      leverage: 1.75,
    };
    const price = 110;
    const closePercent = 50;
    const feeRate = 0.1;

    const result = executePartialClose(position, price, closePercent, feeRate);

    expect(result.newPosition.entryValue).toBe(875);
    expect(result.pnl).toBeCloseTo(87.5, 10);
  });

  test('should_calculate_sideline_value_correctly', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 2000,
      leverage: 2,
    };
    const price = 110;
    const closePercent = 50;
    const feeRate = 0.1;

    const result = executePartialClose(position, price, closePercent, feeRate);

    // closedCapital = 1000 / 2 = 500
    // pnl = (110/100 - 1) * 1000 = 100
    // fees = 500 * 2 * 0.1 / 100 = 1
    const closedCapital = 500;
    const pnl = 100;
    const fees = 1;
    const expectedSideline = closedCapital + pnl - fees;

    expect(result.closedCapital).toBe(closedCapital);
    expect(result.sidelineValue).toBeCloseTo(expectedSideline, 10);
  });

  test('should_handle_small_close_percent', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 2000,
      leverage: 2,
    };
    const price = 110;
    const closePercent = 10;
    const feeRate = 0.1;

    const result = executePartialClose(position, price, closePercent, feeRate);

    expect(result.newPosition.entryValue).toBe(1800);
    expect(result.pnl).toBeCloseTo(20, 10);
  });

  test('should_handle_large_price_movement', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 2000,
      leverage: 2,
    };
    const price = 150;
    const closePercent = 50;
    const feeRate = 0.1;

    const result = executePartialClose(position, price, closePercent, feeRate);

    expect(result.pnl).toBe(500);
  });

  test('should_handle_fractional_prices', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100.5,
      entryValue: 2000,
      leverage: 2,
    };
    const price = 110.75;
    const closePercent = 50;
    const feeRate = 0.1;

    const result = executePartialClose(position, price, closePercent, feeRate);

    const expectedPnl = ((110.75 / 100.5) - 1) * 1000;
    expect(result.pnl).toBeCloseTo(expectedPnl, 2);
  });
});
