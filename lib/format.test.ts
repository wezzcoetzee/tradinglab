import { describe, expect, test } from 'bun:test';
import {
  formatCurrency,
  formatPercent,
  formatTime,
  formatNumber,
  getReturnColorClass,
  getVsHoldColorClass,
  formatAtrConfig,
  calculateVsHold,
  getVsHoldBackgroundClass,
  formatDateTick,
  currencyTickFormatter,
  calculateCollateralValue,
  calculateBuyHoldValue,
} from './format';

describe('formatCurrency', () => {
  test('should_format_positive_value', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  test('should_format_zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('should_format_negative_value', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  test('should_format_large_value', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });
});

describe('formatPercent', () => {
  test('should_format_positive_with_plus_sign', () => {
    expect(formatPercent(15.456)).toBe('+15.46%');
  });

  test('should_format_negative_without_plus_sign', () => {
    expect(formatPercent(-12.345)).toBe('-12.35%');
  });

  test('should_format_zero_with_plus_sign', () => {
    expect(formatPercent(0)).toBe('+0.00%');
  });
});

describe('formatTime', () => {
  test('should_format_seconds_only', () => {
    expect(formatTime(5000)).toBe('5s');
  });

  test('should_format_minutes_and_seconds', () => {
    expect(formatTime(125000)).toBe('2m 5s');
  });

  test('should_format_zero', () => {
    expect(formatTime(0)).toBe('0s');
  });
});

describe('formatNumber', () => {
  test('should_format_with_commas', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });

  test('should_round_decimals', () => {
    expect(formatNumber(1234.56)).toBe('1,235');
  });
});

describe('getReturnColorClass', () => {
  test('should_return_green_for_positive', () => {
    expect(getReturnColorClass(10)).toBe('text-[var(--profit-green)]');
  });

  test('should_return_green_for_zero', () => {
    expect(getReturnColorClass(0)).toBe('text-[var(--profit-green)]');
  });

  test('should_return_red_for_negative', () => {
    expect(getReturnColorClass(-10)).toBe('text-destructive');
  });
});

describe('getVsHoldColorClass', () => {
  test('should_return_green_when_above_5', () => {
    expect(getVsHoldColorClass(10)).toBe('text-[var(--profit-green)]');
  });

  test('should_return_green_at_exactly_5_point_01', () => {
    expect(getVsHoldColorClass(5.01)).toBe('text-[var(--profit-green)]');
  });

  test('should_return_yellow_at_exactly_5', () => {
    expect(getVsHoldColorClass(5)).toBe('text-muted-foreground');
  });

  test('should_return_yellow_within_range', () => {
    expect(getVsHoldColorClass(0)).toBe('text-muted-foreground');
  });

  test('should_return_yellow_at_exactly_minus_5', () => {
    expect(getVsHoldColorClass(-5)).toBe('text-muted-foreground');
  });

  test('should_return_red_at_minus_5_point_01', () => {
    expect(getVsHoldColorClass(-5.01)).toBe('text-destructive');
  });

  test('should_return_red_when_below_minus_5', () => {
    expect(getVsHoldColorClass(-10)).toBe('text-destructive');
  });
});

describe('formatAtrConfig', () => {
  test('should_format_with_all_values', () => {
    const atr = { period: 14, multiplier: 3, closePercent: 50 };
    expect(formatAtrConfig(atr)).toBe('14/3/50%');
  });

  test('should_format_with_decimal_multiplier', () => {
    const atr = { period: 20, multiplier: 2.5, closePercent: 25 };
    expect(formatAtrConfig(atr)).toBe('20/2.5/25%');
  });

  test('should_return_dash_when_undefined', () => {
    expect(formatAtrConfig(undefined)).toBe('-');
  });

  test('should_return_custom_empty_value', () => {
    expect(formatAtrConfig(undefined, 'None')).toBe('None');
  });
});

describe('calculateVsHold', () => {
  test('should_calculate_positive_difference', () => {
    const result = calculateVsHold(1500, 1200);
    expect(result).toBe(25);
  });

  test('should_calculate_negative_difference', () => {
    const result = calculateVsHold(900, 1200);
    expect(result).toBe(-25);
  });

  test('should_calculate_zero_difference', () => {
    const result = calculateVsHold(1200, 1200);
    expect(result).toBe(0);
  });

  test('should_handle_decimal_values', () => {
    const result = calculateVsHold(1300, 1200);
    expect(result).toBeCloseTo(8.33, 2);
  });
});

describe('getVsHoldBackgroundClass', () => {
  describe('threshold at 50 percent', () => {
    test('should_return_darkest_green_at_exactly_50', () => {
      expect(getVsHoldBackgroundClass(50)).toBe('bg-[var(--profit-green)]/10');
    });

    test('should_return_darkest_green_above_50', () => {
      expect(getVsHoldBackgroundClass(75)).toBe('bg-[var(--profit-green)]/10');
    });

    test('should_return_darkest_green_at_100', () => {
      expect(getVsHoldBackgroundClass(100)).toBe('bg-[var(--profit-green)]/10');
    });

    test('should_return_darkest_green_at_extreme_positive', () => {
      expect(getVsHoldBackgroundClass(1000)).toBe('bg-[var(--profit-green)]/10');
    });
  });

  describe('threshold at 20 percent', () => {
    test('should_return_light_green_at_exactly_20', () => {
      expect(getVsHoldBackgroundClass(20)).toBe('bg-[var(--profit-green)]/5');
    });

    test('should_return_light_green_between_20_and_50', () => {
      expect(getVsHoldBackgroundClass(35)).toBe('bg-[var(--profit-green)]/5');
    });

    test('should_return_light_green_at_49_point_99', () => {
      expect(getVsHoldBackgroundClass(49.99)).toBe('bg-[var(--profit-green)]/5');
    });

    test('should_not_return_light_green_at_19_point_99', () => {
      expect(getVsHoldBackgroundClass(19.99)).not.toBe('bg-[var(--profit-green)]/5');
    });
  });

  describe('threshold at 0 percent', () => {
    test('should_return_yellow_at_exactly_0', () => {
      expect(getVsHoldBackgroundClass(0)).toBe('bg-muted/50');
    });

    test('should_return_yellow_between_0_and_20', () => {
      expect(getVsHoldBackgroundClass(10)).toBe('bg-muted/50');
    });

    test('should_return_yellow_at_19_point_99', () => {
      expect(getVsHoldBackgroundClass(19.99)).toBe('bg-muted/50');
    });

    test('should_return_yellow_at_0_point_01', () => {
      expect(getVsHoldBackgroundClass(0.01)).toBe('bg-muted/50');
    });
  });

  describe('threshold at minus 20 percent', () => {
    test('should_return_orange_at_exactly_minus_20', () => {
      expect(getVsHoldBackgroundClass(-20)).toBe('bg-[var(--loss-red)]/5');
    });

    test('should_return_orange_between_minus_20_and_0', () => {
      expect(getVsHoldBackgroundClass(-10)).toBe('bg-[var(--loss-red)]/5');
    });

    test('should_return_orange_at_minus_0_point_01', () => {
      expect(getVsHoldBackgroundClass(-0.01)).toBe('bg-[var(--loss-red)]/5');
    });

    test('should_return_orange_at_minus_19_point_99', () => {
      expect(getVsHoldBackgroundClass(-19.99)).toBe('bg-[var(--loss-red)]/5');
    });
  });

  describe('threshold below minus 20 percent', () => {
    test('should_return_red_at_minus_20_point_01', () => {
      expect(getVsHoldBackgroundClass(-20.01)).toBe('bg-[var(--loss-red)]/10');
    });

    test('should_return_red_at_minus_50', () => {
      expect(getVsHoldBackgroundClass(-50)).toBe('bg-[var(--loss-red)]/10');
    });

    test('should_return_red_at_minus_100', () => {
      expect(getVsHoldBackgroundClass(-100)).toBe('bg-[var(--loss-red)]/10');
    });

    test('should_return_red_at_extreme_negative', () => {
      expect(getVsHoldBackgroundClass(-1000)).toBe('bg-[var(--loss-red)]/10');
    });
  });

  describe('boundary value precision', () => {
    test('should_handle_exactly_50', () => {
      expect(getVsHoldBackgroundClass(50.0)).toBe('bg-[var(--profit-green)]/10');
    });

    test('should_handle_exactly_20', () => {
      expect(getVsHoldBackgroundClass(20.0)).toBe('bg-[var(--profit-green)]/5');
    });

    test('should_handle_exactly_0', () => {
      expect(getVsHoldBackgroundClass(0.0)).toBe('bg-muted/50');
    });

    test('should_handle_exactly_minus_20', () => {
      expect(getVsHoldBackgroundClass(-20.0)).toBe('bg-[var(--loss-red)]/5');
    });

    test('should_handle_very_small_positive', () => {
      expect(getVsHoldBackgroundClass(0.00001)).toBe('bg-muted/50');
    });

    test('should_handle_very_small_negative', () => {
      expect(getVsHoldBackgroundClass(-0.00001)).toBe('bg-[var(--loss-red)]/5');
    });
  });

  describe('edge cases', () => {
    test('should_handle_positive_infinity', () => {
      expect(getVsHoldBackgroundClass(Infinity)).toBe('bg-[var(--profit-green)]/10');
    });

    test('should_handle_negative_infinity', () => {
      expect(getVsHoldBackgroundClass(-Infinity)).toBe('bg-[var(--loss-red)]/10');
    });

    test('should_handle_very_large_positive', () => {
      expect(getVsHoldBackgroundClass(999999)).toBe('bg-[var(--profit-green)]/10');
    });

    test('should_handle_very_large_negative', () => {
      expect(getVsHoldBackgroundClass(-999999)).toBe('bg-[var(--loss-red)]/10');
    });
  });
});

describe('formatDateTick', () => {
  test('should_format_dd_mm_yyyy_to_mm_yy', () => {
    expect(formatDateTick('15/06/2024')).toBe('06/24');
  });

  test('should_handle_single_digit_day', () => {
    expect(formatDateTick('1/12/2023')).toBe('12/23');
  });

  test('should_handle_january', () => {
    expect(formatDateTick('01/01/2020')).toBe('01/20');
  });
});

describe('currencyTickFormatter', () => {
  test('should_format_millions', () => {
    expect(currencyTickFormatter(1_500_000)).toBe('$1.5M');
  });

  test('should_format_exactly_one_million', () => {
    expect(currencyTickFormatter(1_000_000)).toBe('$1.0M');
  });

  test('should_format_thousands', () => {
    expect(currencyTickFormatter(5_000)).toBe('$5K');
  });

  test('should_format_exactly_one_thousand', () => {
    expect(currencyTickFormatter(1_000)).toBe('$1K');
  });

  test('should_format_values_below_thousand', () => {
    expect(currencyTickFormatter(500)).toBe('$500');
  });

  test('should_format_zero', () => {
    expect(currencyTickFormatter(0)).toBe('$0');
  });

  test('should_format_large_thousands', () => {
    expect(currencyTickFormatter(250_000)).toBe('$250K');
  });
});

describe('calculateCollateralValue', () => {
  test('should_return_portfolio_value_at_1x_leverage', () => {
    // #given
    const day = { portfolioValue: 1000, balance: 800, position: { leverage: 1 } };

    // #then
    expect(calculateCollateralValue(day)).toBe(1000);
  });

  test('should_reduce_unrealized_pnl_by_leverage', () => {
    // #given - balance=800, portfolioValue=1000, leverage=2
    // unrealizedPnl = 1000 - 800 - 0 = 200
    // collateral = 800 + 200/2 + 0 = 900
    const day = { portfolioValue: 1000, balance: 800, position: { leverage: 2 } };

    // #then
    expect(calculateCollateralValue(day)).toBe(900);
  });

  test('should_include_sideline_value', () => {
    // #given - balance=800, portfolioValue=1200, sidelineValue=100, leverage=2
    // unrealizedPnl = 1200 - 800 - 100 = 300
    // collateral = 800 + 300/2 + 100 = 1050
    const day = { portfolioValue: 1200, balance: 800, sidelineValue: 100, position: { leverage: 2 } };

    // #then
    expect(calculateCollateralValue(day)).toBe(1050);
  });

  test('should_default_leverage_to_1_when_no_position', () => {
    const day = { portfolioValue: 1000, balance: 800, position: null };
    expect(calculateCollateralValue(day)).toBe(1000);
  });

  test('should_default_sideline_to_0_when_undefined', () => {
    const day = { portfolioValue: 1000, balance: 600, position: { leverage: 2 } };
    // unrealizedPnl = 1000 - 600 - 0 = 400, collateral = 600 + 200 + 0 = 800
    expect(calculateCollateralValue(day)).toBe(800);
  });
});

describe('calculateBuyHoldValue', () => {
  test('should_calculate_shares_times_current_price', () => {
    // #given - $1000 / $50 = 20 shares, at $100 = $2000
    expect(calculateBuyHoldValue(1000, 50, 100)).toBe(2000);
  });

  test('should_return_starting_capital_when_price_unchanged', () => {
    expect(calculateBuyHoldValue(1000, 100, 100)).toBe(1000);
  });

  test('should_handle_fractional_shares', () => {
    // $1000 / $3 = 333.33... shares, at $6 = $2000
    expect(calculateBuyHoldValue(1000, 3, 6)).toBeCloseTo(2000, 5);
  });

  test('should_handle_price_decrease', () => {
    // $1000 / $100 = 10 shares, at $50 = $500
    expect(calculateBuyHoldValue(1000, 100, 50)).toBe(500);
  });
});
