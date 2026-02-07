import { describe, expect, test } from 'bun:test';
import { downsampleLTTB } from './downsample';

const makePoints = (values: number[]) => values.map((y) => ({ y }));
const yAccessor = (p: { y: number }) => p.y;

describe('downsampleLTTB', () => {
  test('should_return_all_indices_when_threshold_equals_length', () => {
    // #given
    const data = makePoints([1, 2, 3, 4, 5]);

    // #when
    const result = downsampleLTTB(data, 5, yAccessor);

    // #then
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });

  test('should_return_all_indices_when_threshold_exceeds_length', () => {
    const data = makePoints([1, 2, 3]);
    const result = downsampleLTTB(data, 10, yAccessor);
    expect(result).toEqual([0, 1, 2]);
  });

  test('should_return_all_indices_when_threshold_below_3', () => {
    const data = makePoints([1, 2, 3, 4, 5]);
    const result = downsampleLTTB(data, 2, yAccessor);
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });

  test('should_always_include_first_and_last_index', () => {
    const data = makePoints(Array.from({ length: 100 }, (_, i) => i));
    const result = downsampleLTTB(data, 10, yAccessor);

    expect(result[0]).toBe(0);
    expect(result[result.length - 1]).toBe(99);
  });

  test('should_return_exactly_threshold_count', () => {
    const data = makePoints(Array.from({ length: 100 }, (_, i) => i));
    const result = downsampleLTTB(data, 20, yAccessor);
    expect(result.length).toBe(20);
  });

  test('should_handle_uniform_data', () => {
    const data = makePoints(Array.from({ length: 50 }, () => 5));
    const result = downsampleLTTB(data, 10, yAccessor);

    expect(result.length).toBe(10);
    expect(result[0]).toBe(0);
    expect(result[result.length - 1]).toBe(49);
  });

  test('should_preserve_spike_in_data', () => {
    // #given - flat data with a single spike
    const values = Array.from({ length: 100 }, () => 1);
    values[50] = 1000;
    const data = makePoints(values);

    // #when
    const result = downsampleLTTB(data, 10, yAccessor);

    // #then - spike index should be selected
    expect(result).toContain(50);
  });

  test('should_return_indices_in_ascending_order', () => {
    const data = makePoints(Array.from({ length: 200 }, (_, i) => Math.sin(i / 10)));
    const result = downsampleLTTB(data, 30, yAccessor);

    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1]);
    }
  });

  test('should_work_with_custom_accessor', () => {
    const data = [{ val: 10 }, { val: 20 }, { val: 30 }, { val: 40 }, { val: 50 }];
    const result = downsampleLTTB(data, 5, (d) => d.val);
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });
});
