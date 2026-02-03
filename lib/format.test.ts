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
    expect(getReturnColorClass(10)).toBe('text-green-600');
  });

  test('should_return_green_for_zero', () => {
    expect(getReturnColorClass(0)).toBe('text-green-600');
  });

  test('should_return_red_for_negative', () => {
    expect(getReturnColorClass(-10)).toBe('text-destructive');
  });
});

describe('getVsHoldColorClass', () => {
  test('should_return_green_when_above_5', () => {
    expect(getVsHoldColorClass(10)).toBe('text-green-600');
  });

  test('should_return_green_at_exactly_5_point_01', () => {
    expect(getVsHoldColorClass(5.01)).toBe('text-green-600');
  });

  test('should_return_yellow_at_exactly_5', () => {
    expect(getVsHoldColorClass(5)).toBe('text-yellow-600');
  });

  test('should_return_yellow_within_range', () => {
    expect(getVsHoldColorClass(0)).toBe('text-yellow-600');
  });

  test('should_return_yellow_at_exactly_minus_5', () => {
    expect(getVsHoldColorClass(-5)).toBe('text-yellow-600');
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
      expect(getVsHoldBackgroundClass(50)).toBe('bg-green-100 dark:bg-green-900/30');
    });

    test('should_return_darkest_green_above_50', () => {
      expect(getVsHoldBackgroundClass(75)).toBe('bg-green-100 dark:bg-green-900/30');
    });

    test('should_return_darkest_green_at_100', () => {
      expect(getVsHoldBackgroundClass(100)).toBe('bg-green-100 dark:bg-green-900/30');
    });

    test('should_return_darkest_green_at_extreme_positive', () => {
      expect(getVsHoldBackgroundClass(1000)).toBe('bg-green-100 dark:bg-green-900/30');
    });
  });

  describe('threshold at 20 percent', () => {
    test('should_return_light_green_at_exactly_20', () => {
      expect(getVsHoldBackgroundClass(20)).toBe('bg-green-50 dark:bg-green-900/20');
    });

    test('should_return_light_green_between_20_and_50', () => {
      expect(getVsHoldBackgroundClass(35)).toBe('bg-green-50 dark:bg-green-900/20');
    });

    test('should_return_light_green_at_49_point_99', () => {
      expect(getVsHoldBackgroundClass(49.99)).toBe('bg-green-50 dark:bg-green-900/20');
    });

    test('should_not_return_light_green_at_19_point_99', () => {
      expect(getVsHoldBackgroundClass(19.99)).not.toBe('bg-green-50 dark:bg-green-900/20');
    });
  });

  describe('threshold at 0 percent', () => {
    test('should_return_yellow_at_exactly_0', () => {
      expect(getVsHoldBackgroundClass(0)).toBe('bg-yellow-50 dark:bg-yellow-900/20');
    });

    test('should_return_yellow_between_0_and_20', () => {
      expect(getVsHoldBackgroundClass(10)).toBe('bg-yellow-50 dark:bg-yellow-900/20');
    });

    test('should_return_yellow_at_19_point_99', () => {
      expect(getVsHoldBackgroundClass(19.99)).toBe('bg-yellow-50 dark:bg-yellow-900/20');
    });

    test('should_return_yellow_at_0_point_01', () => {
      expect(getVsHoldBackgroundClass(0.01)).toBe('bg-yellow-50 dark:bg-yellow-900/20');
    });
  });

  describe('threshold at minus 20 percent', () => {
    test('should_return_orange_at_exactly_minus_20', () => {
      expect(getVsHoldBackgroundClass(-20)).toBe('bg-orange-50 dark:bg-orange-900/20');
    });

    test('should_return_orange_between_minus_20_and_0', () => {
      expect(getVsHoldBackgroundClass(-10)).toBe('bg-orange-50 dark:bg-orange-900/20');
    });

    test('should_return_orange_at_minus_0_point_01', () => {
      expect(getVsHoldBackgroundClass(-0.01)).toBe('bg-orange-50 dark:bg-orange-900/20');
    });

    test('should_return_orange_at_minus_19_point_99', () => {
      expect(getVsHoldBackgroundClass(-19.99)).toBe('bg-orange-50 dark:bg-orange-900/20');
    });
  });

  describe('threshold below minus 20 percent', () => {
    test('should_return_red_at_minus_20_point_01', () => {
      expect(getVsHoldBackgroundClass(-20.01)).toBe('bg-red-50 dark:bg-red-900/20');
    });

    test('should_return_red_at_minus_50', () => {
      expect(getVsHoldBackgroundClass(-50)).toBe('bg-red-50 dark:bg-red-900/20');
    });

    test('should_return_red_at_minus_100', () => {
      expect(getVsHoldBackgroundClass(-100)).toBe('bg-red-50 dark:bg-red-900/20');
    });

    test('should_return_red_at_extreme_negative', () => {
      expect(getVsHoldBackgroundClass(-1000)).toBe('bg-red-50 dark:bg-red-900/20');
    });
  });

  describe('boundary value precision', () => {
    test('should_handle_exactly_50', () => {
      expect(getVsHoldBackgroundClass(50.0)).toBe('bg-green-100 dark:bg-green-900/30');
    });

    test('should_handle_exactly_20', () => {
      expect(getVsHoldBackgroundClass(20.0)).toBe('bg-green-50 dark:bg-green-900/20');
    });

    test('should_handle_exactly_0', () => {
      expect(getVsHoldBackgroundClass(0.0)).toBe('bg-yellow-50 dark:bg-yellow-900/20');
    });

    test('should_handle_exactly_minus_20', () => {
      expect(getVsHoldBackgroundClass(-20.0)).toBe('bg-orange-50 dark:bg-orange-900/20');
    });

    test('should_handle_very_small_positive', () => {
      expect(getVsHoldBackgroundClass(0.00001)).toBe('bg-yellow-50 dark:bg-yellow-900/20');
    });

    test('should_handle_very_small_negative', () => {
      expect(getVsHoldBackgroundClass(-0.00001)).toBe('bg-orange-50 dark:bg-orange-900/20');
    });
  });

  describe('edge cases', () => {
    test('should_handle_positive_infinity', () => {
      expect(getVsHoldBackgroundClass(Infinity)).toBe('bg-green-100 dark:bg-green-900/30');
    });

    test('should_handle_negative_infinity', () => {
      expect(getVsHoldBackgroundClass(-Infinity)).toBe('bg-red-50 dark:bg-red-900/20');
    });

    test('should_handle_very_large_positive', () => {
      expect(getVsHoldBackgroundClass(999999)).toBe('bg-green-100 dark:bg-green-900/30');
    });

    test('should_handle_very_large_negative', () => {
      expect(getVsHoldBackgroundClass(-999999)).toBe('bg-red-50 dark:bg-red-900/20');
    });
  });
});
