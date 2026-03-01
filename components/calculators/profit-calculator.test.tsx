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

async function submitValidLongTrade() {
  const user = userEvent.setup();
  render(<ProfitCalculator />);

  await user.type(getInput('entry'), '100');
  await user.type(getInput('leverage'), '10');
  await user.type(getInput('stopLoss'), '90');
  await user.type(getInput('positionSize'), '500');
  await user.type(getInput('tp1'), '120');
  await user.click(screen.getByRole('button', { name: /calculate profit/i }));

  return user;
}

describe('ProfitCalculator', () => {
  describe('initial render', () => {
    test('should_render_long_and_short_radio_buttons', () => {
      render(<ProfitCalculator />);
      expect(document.querySelector('input[value="LONG"]')).not.toBeNull();
      expect(document.querySelector('input[value="SHORT"]')).not.toBeNull();
    });

    test('should_default_to_long_trade_type', () => {
      render(<ProfitCalculator />);
      const longRadio = document.querySelector<HTMLInputElement>('input[value="LONG"]')!;
      expect(longRadio.checked).toBe(true);
    });

    test('should_render_entry_price_input', () => {
      render(<ProfitCalculator />);
      expect(getInput('entry')).not.toBeNull();
    });

    test('should_render_leverage_input', () => {
      render(<ProfitCalculator />);
      expect(getInput('leverage')).not.toBeNull();
    });

    test('should_render_stop_loss_input', () => {
      render(<ProfitCalculator />);
      expect(getInput('stopLoss')).not.toBeNull();
    });

    test('should_render_position_size_input', () => {
      render(<ProfitCalculator />);
      expect(getInput('positionSize')).not.toBeNull();
    });

    test('should_render_tp1_through_tp4_inputs', () => {
      render(<ProfitCalculator />);
      expect(getInput('tp1')).not.toBeNull();
      expect(getInput('tp2')).not.toBeNull();
      expect(getInput('tp3')).not.toBeNull();
      expect(getInput('tp4')).not.toBeNull();
    });

    test('should_mark_tp1_as_aria_required', () => {
      render(<ProfitCalculator />);
      expect(getInput('tp1').getAttribute('aria-required')).toBe('true');
    });

    test('should_render_calculate_button', () => {
      render(<ProfitCalculator />);
      expect(screen.getByRole('button', { name: /calculate profit/i })).toBeDefined();
    });

    test('should_not_show_results_section_on_initial_render', () => {
      render(<ProfitCalculator />);
      expect(screen.queryByText('Total Profit')).toBeNull();
      expect(screen.queryByText('ROI')).toBeNull();
    });
  });

  describe('form validation', () => {
    test('should_show_required_errors_on_empty_submission', async () => {
      const user = userEvent.setup();
      render(<ProfitCalculator />);

      await user.click(screen.getByRole('button', { name: /calculate profit/i }));

      const alerts = await screen.findAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('should_require_tp1_when_other_fields_are_filled', async () => {
      const user = userEvent.setup();
      render(<ProfitCalculator />);

      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '90');
      await user.type(getInput('positionSize'), '500');
      await user.click(screen.getByRole('button', { name: /calculate profit/i }));

      const alerts = await screen.findAllByRole('alert');
      const messages = alerts.map((a) => a.textContent);
      expect(messages.some((m) => m?.includes('Take profit 1 is required'))).toBe(true);
    });

    test('should_show_error_when_leverage_below_minimum', async () => {
      const user = userEvent.setup();
      render(<ProfitCalculator />);

      await user.type(getInput('leverage'), '0');
      await user.click(screen.getByRole('button', { name: /calculate profit/i }));

      const alerts = await screen.findAllByRole('alert');
      const messages = alerts.map((a) => a.textContent);
      expect(messages.some((m) => m?.includes('at least 1x'))).toBe(true);
    });

    test('should_show_error_when_leverage_exceeds_maximum', async () => {
      const user = userEvent.setup();
      render(<ProfitCalculator />);

      await user.type(getInput('leverage'), '101');
      await user.click(screen.getByRole('button', { name: /calculate profit/i }));

      const alerts = await screen.findAllByRole('alert');
      const messages = alerts.map((a) => a.textContent);
      expect(messages.some((m) => m?.includes('cannot exceed 100x'))).toBe(true);
    });

    test('should_show_error_when_long_tp1_is_below_entry', async () => {
      const user = userEvent.setup();
      render(<ProfitCalculator />);

      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '90');
      await user.type(getInput('positionSize'), '500');
      await user.type(getInput('tp1'), '80');
      await user.click(screen.getByRole('button', { name: /calculate profit/i }));

      const alerts = await screen.findAllByRole('alert');
      const messages = alerts.map((a) => a.textContent);
      expect(messages.some((m) => m?.includes('Invalid price levels'))).toBe(true);
    });

    test('should_show_error_when_short_tp1_is_above_entry', async () => {
      const user = userEvent.setup();
      render(<ProfitCalculator />);

      await user.click(document.querySelector<HTMLInputElement>('input[value="SHORT"]')!);
      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '110');
      await user.type(getInput('positionSize'), '500');
      await user.type(getInput('tp1'), '120');
      await user.click(screen.getByRole('button', { name: /calculate profit/i }));

      const alerts = await screen.findAllByRole('alert');
      const messages = alerts.map((a) => a.textContent);
      expect(messages.some((m) => m?.includes('Invalid price levels'))).toBe(true);
    });
  });

  describe('successful calculation', () => {
    test('should_display_results_region_after_valid_long_submission', async () => {
      await submitValidLongTrade();
      const region = await screen.findByRole('region', { name: /profit analysis results/i });
      expect(region).toBeDefined();
    });

    test('should_display_total_profit_result_card', async () => {
      await submitValidLongTrade();
      expect(await screen.findByText('Total Profit')).toBeDefined();
    });

    test('should_display_average_profit_result_card', async () => {
      await submitValidLongTrade();
      expect(await screen.findByText('Average Profit')).toBeDefined();
    });

    test('should_display_roi_result_card', async () => {
      await submitValidLongTrade();
      expect(await screen.findByText('ROI')).toBeDefined();
    });

    test('should_display_maximum_loss_result_card', async () => {
      await submitValidLongTrade();
      expect(await screen.findByText('Maximum Loss')).toBeDefined();
    });

    test('should_display_primary_risk_reward_result_card', async () => {
      await submitValidLongTrade();
      expect(await screen.findByText('Primary R:R')).toBeDefined();
    });

    test('should_display_average_risk_reward_result_card', async () => {
      await submitValidLongTrade();
      expect(await screen.findByText('Average R:R')).toBeDefined();
    });

    test('should_display_take_profit_breakdown_list', async () => {
      await submitValidLongTrade();
      const list = await screen.findByRole('list', { name: /take profit targets/i });
      expect(list).toBeDefined();
    });

    test('should_display_tp1_breakdown_row', async () => {
      await submitValidLongTrade();
      expect(await screen.findByText('TP1')).toBeDefined();
    });

    test('should_display_multiple_breakdown_rows_when_optional_tps_provided', async () => {
      const user = userEvent.setup();
      render(<ProfitCalculator />);

      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '10');
      await user.type(getInput('stopLoss'), '90');
      await user.type(getInput('positionSize'), '500');
      await user.type(getInput('tp1'), '120');
      await user.type(getInput('tp2'), '130');
      await user.type(getInput('tp3'), '140');
      await user.click(screen.getByRole('button', { name: /calculate profit/i }));

      const items = await screen.findAllByRole('listitem');
      expect(items.length).toBe(3);
    });

    test('should_display_results_for_valid_short_trade', async () => {
      const user = userEvent.setup();
      render(<ProfitCalculator />);

      await user.click(document.querySelector<HTMLInputElement>('input[value="SHORT"]')!);
      await user.type(getInput('entry'), '100');
      await user.type(getInput('leverage'), '5');
      await user.type(getInput('stopLoss'), '110');
      await user.type(getInput('positionSize'), '500');
      await user.type(getInput('tp1'), '80');
      await user.click(screen.getByRole('button', { name: /calculate profit/i }));

      expect(await screen.findByText('Total Profit')).toBeDefined();
    });

    test('should_select_short_radio_when_short_is_clicked', async () => {
      const user = userEvent.setup();
      render(<ProfitCalculator />);

      const shortRadio = document.querySelector<HTMLInputElement>('input[value="SHORT"]')!;
      await user.click(shortRadio);

      expect(shortRadio.checked).toBe(true);
    });
  });
});
