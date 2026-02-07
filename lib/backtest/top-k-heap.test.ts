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
    finalCollateral: 1000 * (1 + totalReturn / 100),
    totalReturn,
    totalFees: 10,
    totalTrades: 5,
    atrTriggerCount: 0,
    isLiquidated,
    liquidationDay: isLiquidated ? 50 : undefined,
    liquidationDate: isLiquidated ? '15/01/2024' : undefined,
  };
}

describe('TopKHeap', () => {
  describe('liquidated results', () => {
    test('should_skip_liquidated_result', () => {
      // #given
      const heap = new TopKHeap(5);
      const liquidatedResult = makeResult(100, true);

      // #when
      heap.insert(liquidatedResult);

      // #then
      expect(heap.size).toBe(0);
    });

    test('should_skip_all_liquidated_results', () => {
      // #given
      const heap = new TopKHeap(3);

      // #when
      heap.insert(makeResult(50, true));
      heap.insert(makeResult(100, true));
      heap.insert(makeResult(150, true));

      // #then
      expect(heap.size).toBe(0);
    });

    test('should_only_insert_non_liquidated_results', () => {
      // #given
      const heap = new TopKHeap(5);

      // #when
      heap.insert(makeResult(50, true));
      heap.insert(makeResult(100, false));
      heap.insert(makeResult(150, true));
      heap.insert(makeResult(200, false));

      // #then
      expect(heap.size).toBe(2);
    });
  });

  describe('heap capacity', () => {
    test('should_fill_heap_below_capacity', () => {
      // #given
      const heap = new TopKHeap(5);

      // #when
      heap.insert(makeResult(10));
      heap.insert(makeResult(20));
      heap.insert(makeResult(30));

      // #then
      expect(heap.size).toBe(3);
    });

    test('should_fill_heap_to_exact_capacity', () => {
      // #given
      const heap = new TopKHeap(3);

      // #when
      heap.insert(makeResult(10));
      heap.insert(makeResult(20));
      heap.insert(makeResult(30));

      // #then
      expect(heap.size).toBe(3);
    });

    test('should_maintain_capacity_when_inserting_worse_result', () => {
      // #given
      const heap = new TopKHeap(3);
      heap.insert(makeResult(100));
      heap.insert(makeResult(200));
      heap.insert(makeResult(300));

      // #when
      heap.insert(makeResult(50));

      // #then
      expect(heap.size).toBe(3);
    });

    test('should_maintain_capacity_when_inserting_better_result', () => {
      // #given
      const heap = new TopKHeap(3);
      heap.insert(makeResult(100));
      heap.insert(makeResult(200));
      heap.insert(makeResult(300));

      // #when
      heap.insert(makeResult(400));

      // #then
      expect(heap.size).toBe(3);
    });
  });

  describe('size property', () => {
    test('should_return_zero_for_empty_heap', () => {
      // #given
      const heap = new TopKHeap(5);

      // #when
      const size = heap.size;

      // #then
      expect(size).toBe(0);
    });

    test('should_reflect_current_count', () => {
      // #given
      const heap = new TopKHeap(10);

      // #when
      heap.insert(makeResult(10));
      heap.insert(makeResult(20));
      heap.insert(makeResult(30));

      // #then
      expect(heap.size).toBe(3);
    });

    test('should_not_exceed_k', () => {
      // #given
      const heap = new TopKHeap(3);

      // #when
      heap.insert(makeResult(10));
      heap.insert(makeResult(20));
      heap.insert(makeResult(30));
      heap.insert(makeResult(40));
      heap.insert(makeResult(50));

      // #then
      expect(heap.size).toBe(3);
    });
  });

  describe('replacement logic', () => {
    test('should_replace_minimum_when_at_capacity_with_better_result', () => {
      // #given
      const heap = new TopKHeap(3);
      heap.insert(makeResult(100));
      heap.insert(makeResult(200));
      heap.insert(makeResult(300));

      // #when
      heap.insert(makeResult(400));

      // #then
      const results = heap.getResults();
      expect(results.map((r) => r.totalReturn)).toEqual([400, 300, 200]);
    });

    test('should_ignore_worse_result_when_at_capacity', () => {
      // #given
      const heap = new TopKHeap(3);
      heap.insert(makeResult(100));
      heap.insert(makeResult(200));
      heap.insert(makeResult(300));

      // #when
      heap.insert(makeResult(50));

      // #then
      const results = heap.getResults();
      expect(results.map((r) => r.totalReturn)).toEqual([300, 200, 100]);
    });

    test('should_ignore_equal_result_when_at_capacity', () => {
      // #given
      const heap = new TopKHeap(3);
      heap.insert(makeResult(100));
      heap.insert(makeResult(200));
      heap.insert(makeResult(300));

      // #when
      heap.insert(makeResult(100));

      // #then
      const results = heap.getResults();
      expect(results.map((r) => r.totalReturn)).toEqual([300, 200, 100]);
    });

    test('should_replace_multiple_times', () => {
      // #given
      const heap = new TopKHeap(3);
      heap.insert(makeResult(10));
      heap.insert(makeResult(20));
      heap.insert(makeResult(30));

      // #when
      heap.insert(makeResult(40));
      heap.insert(makeResult(50));
      heap.insert(makeResult(60));

      // #then
      const results = heap.getResults();
      expect(results.map((r) => r.totalReturn)).toEqual([60, 50, 40]);
    });
  });

  describe('getResults', () => {
    test('should_return_sorted_descending', () => {
      // #given
      const heap = new TopKHeap(5);
      heap.insert(makeResult(30));
      heap.insert(makeResult(10));
      heap.insert(makeResult(50));
      heap.insert(makeResult(20));
      heap.insert(makeResult(40));

      // #when
      const results = heap.getResults();

      // #then
      expect(results.map((r) => r.totalReturn)).toEqual([50, 40, 30, 20, 10]);
    });

    test('should_return_empty_array_when_empty', () => {
      // #given
      const heap = new TopKHeap(5);

      // #when
      const results = heap.getResults();

      // #then
      expect(results).toEqual([]);
    });

    test('should_return_sorted_copy_each_time', () => {
      // #given
      const heap = new TopKHeap(3);
      heap.insert(makeResult(10));
      heap.insert(makeResult(20));
      heap.insert(makeResult(30));

      // #when
      const results1 = heap.getResults();
      const results2 = heap.getResults();

      // #then
      expect(results1).not.toBe(results2);
      expect(results1.map((r) => r.totalReturn)).toEqual([30, 20, 10]);
      expect(results2.map((r) => r.totalReturn)).toEqual([30, 20, 10]);
    });

    test('should_not_affect_heap_when_mutating_returned_array', () => {
      // #given
      const heap = new TopKHeap(3);
      heap.insert(makeResult(10));
      heap.insert(makeResult(20));
      heap.insert(makeResult(30));

      // #when
      const results = heap.getResults();
      results.pop();
      results.pop();

      // #then
      expect(heap.size).toBe(3);
      expect(heap.getResults().length).toBe(3);
    });

    test('should_include_all_result_properties', () => {
      // #given
      const heap = new TopKHeap(1);
      heap.insert(makeResult(100));

      // #when
      const results = heap.getResults();

      // #then
      expect(results[0]).toHaveProperty('config');
      expect(results[0]).toHaveProperty('finalBalance');
      expect(results[0]).toHaveProperty('finalCollateral');
      expect(results[0]).toHaveProperty('totalReturn');
      expect(results[0]).toHaveProperty('totalFees');
      expect(results[0]).toHaveProperty('totalTrades');
      expect(results[0]).toHaveProperty('atrTriggerCount');
      expect(results[0]).toHaveProperty('isLiquidated');
    });

    test('should_not_include_days_property', () => {
      // #given
      const heap = new TopKHeap(1);
      heap.insert(makeResult(100));

      // #when
      const results = heap.getResults();

      // #then
      expect(results[0]).not.toHaveProperty('days');
    });
  });

  describe('edge case k equals 1', () => {
    test('should_maintain_only_best_result', () => {
      // #given
      const heap = new TopKHeap(1);

      // #when
      heap.insert(makeResult(10));
      heap.insert(makeResult(50));
      heap.insert(makeResult(30));
      heap.insert(makeResult(40));

      // #then
      expect(heap.size).toBe(1);
      expect(heap.getResults()[0].totalReturn).toBe(50);
    });

    test('should_update_when_better_result_comes', () => {
      // #given
      const heap = new TopKHeap(1);
      heap.insert(makeResult(10));

      // #when
      heap.insert(makeResult(100));

      // #then
      expect(heap.getResults()[0].totalReturn).toBe(100);
    });

    test('should_ignore_worse_results', () => {
      // #given
      const heap = new TopKHeap(1);
      heap.insert(makeResult(100));

      // #when
      heap.insert(makeResult(10));
      heap.insert(makeResult(20));
      heap.insert(makeResult(30));

      // #then
      expect(heap.getResults()[0].totalReturn).toBe(100);
    });
  });

  describe('negative returns', () => {
    test('should_handle_negative_returns', () => {
      // #given
      const heap = new TopKHeap(3);

      // #when
      heap.insert(makeResult(-50));
      heap.insert(makeResult(-10));
      heap.insert(makeResult(-30));

      // #then
      expect(heap.getResults().map((r) => r.totalReturn)).toEqual([-10, -30, -50]);
    });

    test('should_prioritize_positive_over_negative', () => {
      // #given
      const heap = new TopKHeap(3);
      heap.insert(makeResult(-50));
      heap.insert(makeResult(-10));
      heap.insert(makeResult(-30));

      // #when
      heap.insert(makeResult(5));

      // #then
      expect(heap.getResults().map((r) => r.totalReturn)).toEqual([5, -10, -30]);
    });

    test('should_handle_mix_of_positive_and_negative', () => {
      // #given
      const heap = new TopKHeap(5);

      // #when
      heap.insert(makeResult(-20));
      heap.insert(makeResult(50));
      heap.insert(makeResult(-5));
      heap.insert(makeResult(30));
      heap.insert(makeResult(-40));

      // #then
      expect(heap.getResults().map((r) => r.totalReturn)).toEqual([50, 30, -5, -20, -40]);
    });
  });

  describe('decimal returns', () => {
    test('should_handle_decimal_values', () => {
      // #given
      const heap = new TopKHeap(3);

      // #when
      heap.insert(makeResult(10.5));
      heap.insert(makeResult(10.6));
      heap.insert(makeResult(10.4));

      // #then
      expect(heap.getResults().map((r) => r.totalReturn)).toEqual([10.6, 10.5, 10.4]);
    });

    test('should_sort_decimals_correctly', () => {
      // #given
      const heap = new TopKHeap(5);

      // #when
      heap.insert(makeResult(1.1));
      heap.insert(makeResult(1.01));
      heap.insert(makeResult(1.001));
      heap.insert(makeResult(1.11));
      heap.insert(makeResult(1.111));

      // #then
      expect(heap.getResults().map((r) => r.totalReturn)).toEqual([
        1.111, 1.11, 1.1, 1.01, 1.001,
      ]);
    });
  });

  describe('large capacity', () => {
    test('should_handle_large_k', () => {
      // #given
      const heap = new TopKHeap(1000);

      // #when
      for (let i = 0; i < 500; i++) {
        heap.insert(makeResult(i));
      }

      // #then
      expect(heap.size).toBe(500);
    });

    test('should_maintain_top_k_with_large_k', () => {
      // #given
      const heap = new TopKHeap(100);

      // #when
      for (let i = 0; i < 200; i++) {
        heap.insert(makeResult(i));
      }

      // #then
      expect(heap.size).toBe(100);
      const results = heap.getResults();
      expect(results[0].totalReturn).toBe(199);
      expect(results[99].totalReturn).toBe(100);
    });
  });

  describe('insertion order independence', () => {
    test('should_produce_same_result_regardless_of_insertion_order', () => {
      // #given
      const heap1 = new TopKHeap(3);
      const heap2 = new TopKHeap(3);

      // #when
      heap1.insert(makeResult(10));
      heap1.insert(makeResult(50));
      heap1.insert(makeResult(30));

      heap2.insert(makeResult(50));
      heap2.insert(makeResult(30));
      heap2.insert(makeResult(10));

      // #then
      expect(heap1.getResults().map((r) => r.totalReturn)).toEqual(
        heap2.getResults().map((r) => r.totalReturn)
      );
    });

    test('should_handle_reverse_sorted_input', () => {
      // #given
      const heap = new TopKHeap(5);

      // #when
      heap.insert(makeResult(50));
      heap.insert(makeResult(40));
      heap.insert(makeResult(30));
      heap.insert(makeResult(20));
      heap.insert(makeResult(10));

      // #then
      expect(heap.getResults().map((r) => r.totalReturn)).toEqual([50, 40, 30, 20, 10]);
    });

    test('should_handle_sorted_input', () => {
      // #given
      const heap = new TopKHeap(5);

      // #when
      heap.insert(makeResult(10));
      heap.insert(makeResult(20));
      heap.insert(makeResult(30));
      heap.insert(makeResult(40));
      heap.insert(makeResult(50));

      // #then
      expect(heap.getResults().map((r) => r.totalReturn)).toEqual([50, 40, 30, 20, 10]);
    });
  });
});
