export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function getReturnColorClass(returnPercent: number): string {
  return returnPercent >= 0 ? 'text-[var(--profit-green)]' : 'text-destructive';
}

export function getVsHoldColorClass(vsHold: number): string {
  if (vsHold > 5) return 'text-[var(--profit-green)]';
  if (vsHold < -5) return 'text-destructive';
  return 'text-muted-foreground';
}

export function formatAtrConfig(atr: { period: number; multiplier: number; closePercent: number } | undefined, emptyValue = '-'): string {
  if (!atr) return emptyValue;
  return `${atr.period}/${atr.multiplier}/${atr.closePercent}%`;
}

export function calculateVsHold(finalBalance: number, baselineFinalValue: number): number {
  return ((finalBalance - baselineFinalValue) / baselineFinalValue) * 100;
}

export function getVsHoldBackgroundClass(vsHold: number): string {
  if (vsHold >= 50) return 'bg-[var(--profit-green)]/10';
  if (vsHold >= 20) return 'bg-[var(--profit-green)]/5';
  if (vsHold >= 0) return 'bg-muted/50';
  if (vsHold >= -20) return 'bg-[var(--loss-red)]/5';
  return 'bg-[var(--loss-red)]/10';
}

export function formatDateTick(dateStr: string): string {
  const [, month, year] = dateStr.split('/');
  return `${month}/${year.slice(2)}`;
}

export function currencyTickFormatter(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function calculateCollateralValue(day: {
  portfolioValue: number;
  balance: number;
  sidelineValue?: number;
  position: { leverage: number } | null;
}): number {
  const leverage = day.position?.leverage ?? 1;
  if (leverage === 1) return day.portfolioValue;
  const sidelineValue = day.sidelineValue ?? 0;
  const unrealizedPnl = day.portfolioValue - day.balance - sidelineValue;
  return day.balance + unrealizedPnl / leverage + sidelineValue;
}

export function calculateBuyHoldValue(
  startingCapital: number,
  purchasePrice: number,
  currentPrice: number
): number {
  const sharesAcquired = startingCapital / purchasePrice;
  return sharesAcquired * currentPrice;
}
