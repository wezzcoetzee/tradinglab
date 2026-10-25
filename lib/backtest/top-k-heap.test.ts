import { describe, expect, test } from 'bun:test';
import { TopKHeap } from './top-k-heap';
import type { BacktestResultSummary, BacktestConfig } from './types';

function makeResult(totalReturn: number, isLiquidated = false): BacktestResultSummary {
  const config: BacktestConfig = {
    smaPeriod: 20,
    longLeverage: 1,
    shortLeverage: 1,
    startingCapital: 1000,
    feeRate: 0.0005,
  };

  return {
    config,
    finalBalance: 1000 * (1 + totalReturn / 100),
    totalReturn,
    totalFees: 10,
    totalTrades: 5,
    atrTriggerCount: 0,
    isLiquidated,
    liquidationDay: isLiquidated ? 50 : undefined,
    liquidationDate: isLiquidated ? '15/01/2024' : undefined,
  };
}

function fill(k: number, returns: number[]): number[] {
  const heap = new TopKHeap(k);
  returns.forEach((r) => heap.insert(makeResult(r)));
  return heap.getResults().map((r) => r.totalReturn);
}

describe('TopKHeap', () => {
  test('should_skip_liquidated_results', () => {
    const heap = new TopKHeap(5);

    heap.insert(makeResult(50, true));
    heap.insert(makeResult(100));
    heap.insert(makeResult(150, true));

    expect(heap.getResults().map((r) => r.totalReturn)).toEqual([100]);
  });

  test('should_return_empty_array_when_empty', () => {
    expect(new TopKHeap(5).getResults()).toEqual([]);
  });

  test('should_keep_all_results_below_capacity_sorted_descending', () => {
    expect(fill(5, [30, 10, 50])).toEqual([50, 30, 10]);
  });

  test.each([
    { name: 'better_replaces_minimum', incoming: 400, expected: [400, 300, 200] },
    { name: 'worse_is_ignored', incoming: 50, expected: [300, 200, 100] },
    { name: 'equal_to_minimum_is_ignored', incoming: 100, expected: [300, 200, 100] },
  ])('should_at_capacity_when_$name', ({ incoming, expected }) => {
    expect(fill(3, [100, 200, 300, incoming])).toEqual(expected);
  });

  test('should_keep_only_best_when_k_is_1', () => {
    expect(fill(1, [10, 50, 30, 40])).toEqual([50]);
  });

  test('should_order_negative_and_decimal_returns', () => {
    expect(fill(4, [-20, 1.5, -5, 1.25, -40])).toEqual([1.5, 1.25, -5, -20]);
  });

  test('should_not_mutate_heap_when_returned_array_is_modified', () => {
    const heap = new TopKHeap(3);
    [10, 20, 30].forEach((r) => heap.insert(makeResult(r)));

    const results = heap.getResults();
    results.pop();

    expect(results).not.toBe(heap.getResults());
    expect(heap.getResults().length).toBe(3);
  });

  test('should_match_naive_top_k_for_any_insertion_order', () => {
    const k = 50;
    const values = Array.from({ length: 500 }, (_, i) => (i * 7919) % 1009);

    const expected = [...values].sort((a, b) => b - a).slice(0, k);

    expect(fill(k, values)).toEqual(expected);
    expect(fill(k, [...values].reverse())).toEqual(expected);
    expect(fill(k, [...values].sort((a, b) => a - b))).toEqual(expected);
  });
});
