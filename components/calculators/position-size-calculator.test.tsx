import { describe, expect, test, afterEach, beforeAll } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PositionSizeCalculator } from './position-size-calculator';

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

type Fields = Partial<Record<'entry' | 'leverage' | 'stopLoss' | 'riskAmount', string>>;

async function fillAndSubmit(fields: Fields, tradeType: 'LONG' | 'SHORT' = 'LONG') {
  const user = userEvent.setup();
  render(<PositionSizeCalculator />);

  if (tradeType === 'SHORT') {
    await user.click(document.querySelector<HTMLInputElement>('input[value="SHORT"]')!);
  }
  for (const [name, value] of Object.entries(fields)) {
    if (value !== undefined) await user.type(getInput(name), value);
  }
  await user.click(screen.getByRole('button', { name: /calculate position size/i }));
}

async function alertMessages() {
  const alerts = await screen.findAllByRole('alert');
  return alerts.map((a) => a.textContent ?? '');
}

const validLong: Fields = { entry: '100', leverage: '10', stopLoss: '90', riskAmount: '50' };

describe('PositionSizeCalculator', () => {
  test('should_default_to_long_with_no_results', () => {
    render(<PositionSizeCalculator />);

    expect(document.querySelector<HTMLInputElement>('input[value="LONG"]')!.checked).toBe(true);
    expect(screen.queryByText('Margin Required')).toBeNull();
  });

  test('should_select_short_radio_when_short_is_clicked', async () => {
    const user = userEvent.setup();
    render(<PositionSizeCalculator />);
    const shortRadio = document.querySelector<HTMLInputElement>('input[value="SHORT"]')!;

    await user.click(shortRadio);

    expect(shortRadio.checked).toBe(true);
  });

  describe('form validation', () => {
    test('should_show_required_errors_on_empty_submission', async () => {
      await fillAndSubmit({});

      expect((await alertMessages()).length).toBeGreaterThan(0);
    });

    test.each([
      { name: 'entry_missing', fields: { ...validLong, entry: undefined }, message: 'Entry price is required' },
      { name: 'leverage_below_minimum', fields: { leverage: '0' }, message: 'at least 1x' },
      { name: 'leverage_above_maximum', fields: { leverage: '101' }, message: 'cannot exceed 100x' },
    ])('should_show_error_when_$name', async ({ fields, message }) => {
      await fillAndSubmit(fields);

      expect((await alertMessages()).some((m) => m.includes(message))).toBe(true);
    });

    test.each([
      { name: 'long_stop_loss_above_entry', tradeType: 'LONG', stopLoss: '110' },
      { name: 'short_stop_loss_below_entry', tradeType: 'SHORT', stopLoss: '90' },
    ] as const)('should_show_invalid_price_levels_when_$name', async ({ tradeType, stopLoss }) => {
      await fillAndSubmit({ ...validLong, stopLoss }, tradeType);

      expect((await alertMessages()).some((m) => m.includes('Invalid price levels'))).toBe(true);
    });
  });

  describe('successful calculation', () => {
    test('should_display_result_cards_for_long', async () => {
      await fillAndSubmit(validLong);

      await screen.findByRole('region', { name: /calculation results/i }, { timeout: 2000 });
      for (const label of ['Position Size', 'Margin Required', 'Risk Distance', 'Maximum Loss']) {
        expect(screen.getByText(label)).toBeDefined();
      }
    });

    test('should_display_results_for_valid_short_trade', async () => {
      await fillAndSubmit({ entry: '100', leverage: '5', stopLoss: '110', riskAmount: '100' }, 'SHORT');

      expect(await screen.findByText('Position Size', {}, { timeout: 2000 })).toBeDefined();
    });
  });
});
