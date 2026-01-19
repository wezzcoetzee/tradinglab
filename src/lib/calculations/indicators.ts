export function calculateSMA(prices: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  let sum = 0;

  for (let i = 0; i < prices.length; i++) {
    sum += prices[i];
    if (i < period - 1) {
      result.push(undefined);
    } else {
      if (i >= period) sum -= prices[i - period];
      result.push(sum / period);
    }
  }

  return result;
}

