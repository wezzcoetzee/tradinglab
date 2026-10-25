import { describe, expect, test, afterEach, beforeAll } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfitCalculator } from './profit-calculator';

beforeAll(() => {
  if (typeof global.requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0) as unknown as number;
  }
});

afterEach(() => {
  cleanup();
});

function getInput(name: string) {
  return document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
}

type Fields = Partial<Record<'entry' | 'leverage' | 'stopLoss' | 'positionSize' | 'tp1' | 'tp2' | 'tp3', string>>;

async function fillAndSubmit(fields: Fields, tradeType: 'LONG' | 'SHORT' = 'LONG') {
  const user = userEvent.setup();
  render(<ProfitCalculator />);

  if (tradeType === 'SHORT') {
    await user.click(document.querySelector<HTMLInputElement>('input[value="SHORT"]')!);
  }
  for (const [name, value] of Object.entries(fields)) {
    if (value !== undefined) await user.type(getInput(name), value);
  }
  await user.click(screen.getByRole('button', { name: /calculate profit/i }));
}

async function alertMessages() {
  const alerts = await screen.findAllByRole('alert');
  return alerts.map((a) => a.textContent ?? '');
}

const validLong: Fields = { entry: '100', leverage: '10', stopLoss: '90', positionSize: '500', tp1: '120' };

describe('ProfitCalculator', () => {
  test('should_default_to_long_with_no_results', () => {
    render(<ProfitCalculator />);

    expect(document.querySelector<HTMLInputElement>('input[value="LONG"]')!.checked).toBe(true);
    expect(getInput('tp1').getAttribute('aria-required')).toBe('true');
    expect(screen.queryByText('Total Profit')).toBeNull();
  });

  test('should_select_short_radio_when_short_is_clicked', async () => {
    const user = userEvent.setup();
    render(<ProfitCalculator />);
    const shortRadio = document.querySelector<HTMLInputElement>('input[value="SHORT"]')!;

    await user.click(shortRadio);

    expect(shortRadio.checked).toBe(true);
  });

  describe('form validation', () => {
    test('should_show_required_errors_on_empty_submission', async () => {
      await fillAndSubmit({});

      expect((await alertMessages()).length).toBeGreaterThan(0);
    });

    test('should_require_tp1_when_other_fields_are_filled', async () => {
      await fillAndSubmit({ ...validLong, tp1: undefined });

      expect((await alertMessages()).some((m) => m.includes('Take profit 1 is required'))).toBe(true);
    });

    test.each([
      { name: 'leverage_below_minimum', leverage: '0', message: 'at least 1x' },
      { name: 'leverage_above_maximum', leverage: '101', message: 'cannot exceed 100x' },
    ])('should_show_error_when_$name', async ({ leverage, message }) => {
      await fillAndSubmit({ leverage });

      expect((await alertMessages()).some((m) => m.includes(message))).toBe(true);
    });

    test.each([
      { name: 'long_tp1_below_entry', tradeType: 'LONG', stopLoss: '90', tp1: '80' },
      { name: 'short_tp1_above_entry', tradeType: 'SHORT', stopLoss: '110', tp1: '120' },
    ] as const)('should_show_invalid_price_levels_when_$name', async ({ tradeType, stopLoss, tp1 }) => {
      await fillAndSubmit({ ...validLong, stopLoss, tp1 }, tradeType);

      expect((await alertMessages()).some((m) => m.includes('Invalid price levels'))).toBe(true);
    });
  });

  describe('successful calculation', () => {
    test('should_display_result_cards_and_single_breakdown_row_for_long', async () => {
      await fillAndSubmit(validLong);

      await screen.findByRole('region', { name: /profit analysis results/i });
      for (const label of ['Total Profit', 'Average Profit', 'ROI', 'Maximum Loss', 'Primary R:R', 'Average R:R', 'TP1']) {
        expect(screen.getByText(label)).toBeDefined();
      }
      expect(screen.getAllByRole('listitem').length).toBe(1);
    });

    test('should_display_one_breakdown_row_per_take_profit', async () => {
      await fillAndSubmit({ ...validLong, tp2: '130', tp3: '140' });

      expect((await screen.findAllByRole('listitem')).length).toBe(3);
    });

    test('should_display_results_for_valid_short_trade', async () => {
      await fillAndSubmit({ entry: '100', leverage: '5', stopLoss: '110', positionSize: '500', tp1: '80' }, 'SHORT');

      expect(await screen.findByText('Total Profit')).toBeDefined();
    });
  });
});
