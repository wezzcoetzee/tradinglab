export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function safeParseFloat(value: string | number): number {
  const parsed = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
}
