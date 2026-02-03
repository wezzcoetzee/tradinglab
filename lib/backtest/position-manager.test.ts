import { describe, expect, test } from 'bun:test';
import {
  determinePositionType,
  determineAction,
  calculateLongProfit,
  calculateShortProfit,
  calculatePositionProfit,
  openPosition,
} from './position-manager';
import type { Position, PositionType } from './types';

describe('determinePositionType', () => {
  test('should_return_long_when_price_above_sma', () => {
    const result = determinePositionType(105, 100);

    expect(result).toBe('LONG');
  });

  test('should_return_short_when_price_below_sma', () => {
    const result = determinePositionType(95, 100);

    expect(result).toBe('SHORT');
  });

  test('should_return_none_when_price_equals_sma', () => {
    const result = determinePositionType(100, 100);

    expect(result).toBe('NONE');
  });

  test('should_handle_large_price_difference', () => {
    const result = determinePositionType(200, 100);

    expect(result).toBe('LONG');
  });

  test('should_handle_small_price_difference', () => {
    const result = determinePositionType(100.01, 100);

    expect(result).toBe('LONG');
  });

  test('should_handle_negative_values', () => {
    const resultLong = determinePositionType(-50, -100);
    const resultShort = determinePositionType(-150, -100);

    expect(resultLong).toBe('LONG');
    expect(resultShort).toBe('SHORT');
  });
});

describe('determineAction', () => {
  describe('from no position', () => {
    test('should_open_long_when_target_is_long', () => {
      const result = determineAction(null, 'LONG');

      expect(result).toBe('OPEN_LONG');
    });

    test('should_open_short_when_target_is_short', () => {
      const result = determineAction(null, 'SHORT');

      expect(result).toBe('OPEN_SHORT');
    });

    test('should_hold_when_target_is_none', () => {
      const result = determineAction(null, 'NONE');

      expect(result).toBe('HOLD');
    });
  });

  describe('from long position', () => {
    const longPosition: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 1000,
      leverage: 2,
    };

    test('should_hold_when_target_is_long', () => {
      const result = determineAction(longPosition, 'LONG');

      expect(result).toBe('HOLD');
    });

    test('should_close_long_when_target_is_none', () => {
      const result = determineAction(longPosition, 'NONE');

      expect(result).toBe('CLOSE_LONG');
    });

    test('should_transition_long_to_short_when_target_is_short', () => {
      const result = determineAction(longPosition, 'SHORT');

      expect(result).toBe('TRANSITION_LONG_TO_SHORT');
    });
  });

  describe('from short position', () => {
    const shortPosition: Position = {
      type: 'SHORT',
      entryPrice: 100,
      entryValue: 1000,
      leverage: 2,
    };

    test('should_hold_when_target_is_short', () => {
      const result = determineAction(shortPosition, 'SHORT');

      expect(result).toBe('HOLD');
    });

    test('should_close_short_when_target_is_none', () => {
      const result = determineAction(shortPosition, 'NONE');

      expect(result).toBe('CLOSE_SHORT');
    });

    test('should_transition_short_to_long_when_target_is_long', () => {
      const result = determineAction(shortPosition, 'LONG');

      expect(result).toBe('TRANSITION_SHORT_TO_LONG');
    });
  });

  describe('from none position', () => {
    const nonePosition: Position = {
      type: 'NONE',
      entryPrice: 100,
      entryValue: 1000,
      leverage: 1,
    };

    test('should_open_long_when_target_is_long', () => {
      const result = determineAction(nonePosition, 'LONG');

      expect(result).toBe('OPEN_LONG');
    });

    test('should_open_short_when_target_is_short', () => {
      const result = determineAction(nonePosition, 'SHORT');

      expect(result).toBe('OPEN_SHORT');
    });

    test('should_hold_when_target_is_none', () => {
      const result = determineAction(nonePosition, 'NONE');

      expect(result).toBe('HOLD');
    });
  });
});

describe('calculateLongProfit', () => {
  test('should_calculate_profit_when_price_increases', () => {
    const entryPrice = 100;
    const exitPrice = 110;
    const positionValue = 1000;

    const result = calculateLongProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBeCloseTo(100, 10);
  });

  test('should_calculate_loss_when_price_decreases', () => {
    const entryPrice = 100;
    const exitPrice = 90;
    const positionValue = 1000;

    const result = calculateLongProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBeCloseTo(-100, 10);
  });

  test('should_return_zero_when_price_unchanged', () => {
    const entryPrice = 100;
    const exitPrice = 100;
    const positionValue = 1000;

    const result = calculateLongProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBe(0);
  });

  test('should_handle_large_price_increase', () => {
    const entryPrice = 100;
    const exitPrice = 200;
    const positionValue = 1000;

    const result = calculateLongProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBe(1000); // (200/100 - 1) * 1000 = 1 * 1000 = 1000
  });

  test('should_handle_small_position_value', () => {
    const entryPrice = 100;
    const exitPrice = 110;
    const positionValue = 10;

    const result = calculateLongProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBeCloseTo(1, 10);
  });

  test('should_handle_fractional_prices', () => {
    const entryPrice = 100.5;
    const exitPrice = 105.5;
    const positionValue = 1000;

    const result = calculateLongProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBeCloseTo(49.75, 2);
  });

  test('should_handle_leveraged_position_value', () => {
    const entryPrice = 100;
    const exitPrice = 110;
    const positionValue = 3000; // balance * leverage = 1000 * 3

    const result = calculateLongProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBeCloseTo(300, 10);
  });
});

describe('calculateShortProfit', () => {
  test('should_calculate_profit_when_price_decreases', () => {
    const entryPrice = 100;
    const exitPrice = 90;
    const positionValue = 1000;

    const result = calculateShortProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBeCloseTo(111.11, 2); // (100/90 - 1) * 1000
  });

  test('should_calculate_loss_when_price_increases', () => {
    const entryPrice = 100;
    const exitPrice = 110;
    const positionValue = 1000;

    const result = calculateShortProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBeCloseTo(-90.91, 2); // (100/110 - 1) * 1000
  });

  test('should_return_zero_when_price_unchanged', () => {
    const entryPrice = 100;
    const exitPrice = 100;
    const positionValue = 1000;

    const result = calculateShortProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBe(0);
  });

  test('should_handle_large_price_decrease', () => {
    const entryPrice = 100;
    const exitPrice = 50;
    const positionValue = 1000;

    const result = calculateShortProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBe(1000); // (100/50 - 1) * 1000 = 1 * 1000 = 1000
  });

  test('should_handle_small_position_value', () => {
    const entryPrice = 100;
    const exitPrice = 90;
    const positionValue = 10;

    const result = calculateShortProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBeCloseTo(1.11, 2);
  });

  test('should_handle_fractional_prices', () => {
    const entryPrice = 105.5;
    const exitPrice = 100.5;
    const positionValue = 1000;

    const result = calculateShortProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBeCloseTo(49.75, 2);
  });

  test('should_handle_leveraged_position_value', () => {
    const entryPrice = 100;
    const exitPrice = 90;
    const positionValue = 3000; // balance * leverage = 1000 * 3

    const result = calculateShortProfit(entryPrice, exitPrice, positionValue);

    expect(result).toBeCloseTo(333.33, 2);
  });
});

describe('calculatePositionProfit', () => {
  test('should_calculate_long_position_profit', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 1000,
      leverage: 2,
    };
    const exitPrice = 110;

    const result = calculatePositionProfit(position, exitPrice);

    expect(result).toBeCloseTo(100, 10);
  });

  test('should_calculate_short_position_profit', () => {
    const position: Position = {
      type: 'SHORT',
      entryPrice: 100,
      entryValue: 1000,
      leverage: 2,
    };
    const exitPrice = 90;

    const result = calculatePositionProfit(position, exitPrice);

    expect(result).toBeCloseTo(111.11, 2);
  });

  test('should_return_zero_for_none_position', () => {
    const position: Position = {
      type: 'NONE',
      entryPrice: 100,
      entryValue: 1000,
      leverage: 1,
    };
    const exitPrice = 110;

    const result = calculatePositionProfit(position, exitPrice);

    expect(result).toBe(0);
  });

  test('should_handle_long_position_with_loss', () => {
    const position: Position = {
      type: 'LONG',
      entryPrice: 100,
      entryValue: 2000,
      leverage: 2,
    };
    const exitPrice = 95;

    const result = calculatePositionProfit(position, exitPrice);

    expect(result).toBeCloseTo(-100, 10);
  });

  test('should_handle_short_position_with_loss', () => {
    const position: Position = {
      type: 'SHORT',
      entryPrice: 100,
      entryValue: 2000,
      leverage: 2,
    };
    const exitPrice = 105;

    const result = calculatePositionProfit(position, exitPrice);

    expect(result).toBeCloseTo(-95.24, 2);
  });
});

describe('openPosition', () => {
  test('should_open_long_position_with_correct_values', () => {
    const type: PositionType = 'LONG';
    const price = 100;
    const balance = 1000;
    const leverage = 2;

    const result = openPosition(type, price, balance, leverage);

    expect(result.type).toBe('LONG');
    expect(result.entryPrice).toBe(100);
    expect(result.entryValue).toBe(2000); // 1000 * 2
    expect(result.leverage).toBe(2);
  });

  test('should_open_short_position_with_correct_values', () => {
    const type: PositionType = 'SHORT';
    const price = 100;
    const balance = 1000;
    const leverage = 2.5;

    const result = openPosition(type, price, balance, leverage);

    expect(result.type).toBe('SHORT');
    expect(result.entryPrice).toBe(100);
    expect(result.entryValue).toBe(2500); // 1000 * 2.5
    expect(result.leverage).toBe(2.5);
  });

  test('should_handle_leverage_1', () => {
    const type: PositionType = 'LONG';
    const price = 100;
    const balance = 1000;
    const leverage = 1;

    const result = openPosition(type, price, balance, leverage);

    expect(result.entryValue).toBe(1000);
    expect(result.leverage).toBe(1);
  });

  test('should_handle_max_leverage_3', () => {
    const type: PositionType = 'SHORT';
    const price = 100;
    const balance = 1000;
    const leverage = 3;

    const result = openPosition(type, price, balance, leverage);

    expect(result.entryValue).toBe(3000);
    expect(result.leverage).toBe(3);
  });

  test('should_handle_fractional_leverage', () => {
    const type: PositionType = 'LONG';
    const price = 100;
    const balance = 1000;
    const leverage = 1.75;

    const result = openPosition(type, price, balance, leverage);

    expect(result.entryValue).toBe(1750);
    expect(result.leverage).toBe(1.75);
  });

  test('should_handle_small_balance', () => {
    const type: PositionType = 'LONG';
    const price = 100;
    const balance = 10;
    const leverage = 2;

    const result = openPosition(type, price, balance, leverage);

    expect(result.entryValue).toBe(20);
  });

  test('should_handle_large_balance', () => {
    const type: PositionType = 'SHORT';
    const price = 100;
    const balance = 100000;
    const leverage = 2.25;

    const result = openPosition(type, price, balance, leverage);

    expect(result.entryValue).toBe(225000);
  });

  test('should_handle_fractional_price', () => {
    const type: PositionType = 'LONG';
    const price = 123.45;
    const balance = 1000;
    const leverage = 2;

    const result = openPosition(type, price, balance, leverage);

    expect(result.entryPrice).toBe(123.45);
    expect(result.entryValue).toBe(2000);
  });

  test('should_open_none_position', () => {
    const type: PositionType = 'NONE';
    const price = 100;
    const balance = 1000;
    const leverage = 1;

    const result = openPosition(type, price, balance, leverage);

    expect(result.type).toBe('NONE');
    expect(result.entryPrice).toBe(100);
    expect(result.entryValue).toBe(1000);
    expect(result.leverage).toBe(1);
  });

  test('should_handle_all_leverage_values', () => {
    const leverages = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];
    const balance = 1000;

    for (const leverage of leverages) {
      const result = openPosition('LONG', 100, balance, leverage);
      expect(result.entryValue).toBe(balance * leverage);
      expect(result.leverage).toBe(leverage);
    }
  });
});
