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
  return returnPercent >= 0 ? 'text-green-600' : 'text-destructive';
}

export function getVsHoldColorClass(vsHold: number): string {
  if (vsHold > 5) return 'text-green-600';
  if (vsHold < -5) return 'text-destructive';
  return 'text-yellow-600';
}

export function formatAtrConfig(atr: { period: number; multiplier: number; closePercent: number } | undefined, emptyValue = '-'): string {
  if (!atr) return emptyValue;
  return `${atr.period}/${atr.multiplier}/${atr.closePercent}%`;
}

export function calculateVsHold(finalBalance: number, baselineFinalValue: number): number {
  return ((finalBalance - baselineFinalValue) / baselineFinalValue) * 100;
}

export function getVsHoldBackgroundClass(vsHold: number): string {
  if (vsHold >= 50) return 'bg-green-100 dark:bg-green-900/30';
  if (vsHold >= 20) return 'bg-green-50 dark:bg-green-900/20';
  if (vsHold >= 0) return 'bg-yellow-50 dark:bg-yellow-900/20';
  if (vsHold >= -20) return 'bg-orange-50 dark:bg-orange-900/20';
  return 'bg-red-50 dark:bg-red-900/20';
}
