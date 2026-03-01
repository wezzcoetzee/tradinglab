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

async function submitForm(values: {
  entry: string;
  leverage: string;
  stopLoss: string;
  riskAmount: string;
  tradeType?: 'LONG' | 'SHORT';
}) {
  const user = userEvent.setup();

  render(<PositionSizeCalculator />);

  if (values.tradeType === 'SHORT') {
    await user.click(getInput('tradeType[1]') ?? screen.getByDisplayValue('SHORT'));
  }

  await user.type(getInput('entry'), values.entry);
  await user.type(getInput('leverage'), values.leverage);
  await user.type(getInput('stopLoss'), values.stopLoss);
  await user.type(getInput('riskAmount'), values.riskAmount);
  await user.click(screen.getByRole('button', { name: /calculate position size/i }));

  return user;
}

describe('PositionSizeCalculator', () => {
  describe('initial render', () => {
    test('should_render_long_and_short_radio_buttons', () => {
      render(<PositionSizeCalculator />);
      expect(document.querySelector('input[value="LONG"]')).toBeDefined();
      expect(document.querySelector('input[value="SHORT"]')).toBeDefined();
    });

    test('should_default_to_long_trade_type', () => {
      render(<PositionSizeCalculator />);
      const longRadio = document.querySelector<HTMLInputElement>('input[value="LONG"]')!;
      expect(longRadio.checked).toBe(true);
    });

    test('should_render_entry_price_input', () => {
      render(<PositionSizeCalculator />);
      expect(getInput('entry')).not.toBeNull();
    });

    test('should_render_leverage_input', () => {
      render(<PositionSizeCalculator />);
      expect(getInput('leverage')).not.toBeNull();
    });

    test('should_render_stop_loss_input', () => {
      render(<PositionSizeCalculator />);
      expect(getInput('stopLoss')).not.toBeNull();
    });

    test('should_render_risk_amount_input', () => {
      render(<PositionSizeCalculator />);
      expect(getInput('riskAmount')).not.toBeNull();
    });

    test('should_render_calculate_button', () => {
      render(<PositionSizeCalculator />);
      expect(screen.getByRole('button', { name: /calculate position size/i })).toBeDefined();
    });

    test('should_not_show_results_section_on_initial_render', () => {
      render(<PositionSizeCalculator />);
      expect(screen.queryByText('Position Size')).toBeNull();
      expect(screen.queryByText('Margin Required')).toBeNull();
    });
  });

  describe('form validation', () => {
    test('should_show_required_errors_on_empty_submission', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      const alerts = await screen.findAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('should_show_error_when_entry_price_is_missing', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '90');
      await user.type(getInput('riskAmount'), '50');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      const alerts = await screen.findAllByRole('alert');
      const messages = alerts.map((a) => a.textContent);
      expect(messages.some((m) => m?.includes('Entry price is required'))).toBe(true);
    });

    test('should_show_error_when_leverage_below_minimum', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.type(getInput('leverage'), '0');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      const alerts = await screen.findAllByRole('alert');
      const messages = alerts.map((a) => a.textContent);
      expect(messages.some((m) => m?.includes('at least 1x'))).toBe(true);
    });

    test('should_show_error_when_leverage_exceeds_maximum', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.type(getInput('leverage'), '101');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      const alerts = await screen.findAllByRole('alert');
      const messages = alerts.map((a) => a.textContent);
      expect(messages.some((m) => m?.includes('cannot exceed 100x'))).toBe(true);
    });

    test('should_show_error_when_long_stop_loss_is_above_entry', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '110');
      await user.type(getInput('riskAmount'), '50');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      const alerts = await screen.findAllByRole('alert');
      const messages = alerts.map((a) => a.textContent);
      expect(messages.some((m) => m?.includes('Invalid price levels'))).toBe(true);
    });

    test('should_show_error_when_short_stop_loss_is_below_entry', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.click(document.querySelector<HTMLInputElement>('input[value="SHORT"]')!);
      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '90');
      await user.type(getInput('riskAmount'), '50');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      const alerts = await screen.findAllByRole('alert');
      const messages = alerts.map((a) => a.textContent);
      expect(messages.some((m) => m?.includes('Invalid price levels'))).toBe(true);
    });
  });

  describe('successful calculation', () => {
    test('should_display_results_region_after_valid_long_submission', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '90');
      await user.type(getInput('riskAmount'), '50');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      const region = await screen.findByRole('region', { name: /calculation results/i }, { timeout: 2000 });
      expect(region).toBeDefined();
    });

    test('should_display_position_size_result_card', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '90');
      await user.type(getInput('riskAmount'), '50');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      expect(await screen.findByText('Position Size', {}, { timeout: 2000 })).toBeDefined();
    });

    test('should_display_margin_required_result_card', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '90');
      await user.type(getInput('riskAmount'), '50');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      expect(await screen.findByText('Margin Required', {}, { timeout: 2000 })).toBeDefined();
    });

    test('should_display_risk_distance_result_card', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '90');
      await user.type(getInput('riskAmount'), '50');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      expect(await screen.findByText('Risk Distance', {}, { timeout: 2000 })).toBeDefined();
    });

    test('should_display_maximum_loss_result_card', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '90');
      await user.type(getInput('riskAmount'), '50');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      expect(await screen.findByText('Maximum Loss', {}, { timeout: 2000 })).toBeDefined();
    });

    test('should_display_results_for_valid_short_trade', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      await user.click(document.querySelector<HTMLInputElement>('input[value="SHORT"]')!);
      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '5');
      await user.type(getInput('stopLoss'), '110');
      await user.type(getInput('riskAmount'), '100');
      await user.click(screen.getByRole('button', { name: /calculate position size/i }));

      expect(await screen.findByText('Position Size', {}, { timeout: 2000 })).toBeDefined();
    });

    test('should_select_short_radio_when_short_is_clicked', async () => {
      const user = userEvent.setup();
      render(<PositionSizeCalculator />);

      const shortRadio = document.querySelector<HTMLInputElement>('input[value="SHORT"]')!;
      await user.click(shortRadio);

      expect(shortRadio.checked).toBe(true);
    });
  });
});
