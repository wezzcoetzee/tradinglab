export function calculateSMA(prices: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }

  return result;
}

