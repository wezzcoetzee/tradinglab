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

export function calculateEMA(prices: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  const multiplier = 2 / (period + 1);

  let ema: number | undefined;

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else if (i === period - 1) {
      const slice = prices.slice(0, period);
      ema = slice.reduce((a, b) => a + b, 0) / period;
      result.push(ema);
    } else {
      ema = (prices[i] - ema!) * multiplier + ema!;
      result.push(ema);
    }
  }

  return result;
}
