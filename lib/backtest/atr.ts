export function calculateTrueRange(closePrices: number[]): (number | null)[] {
  const trValues: (number | null)[] = [];

  for (let i = 0; i < closePrices.length; i++) {
    if (i === 0) {
      trValues.push(null);
      continue;
    }
    trValues.push(Math.abs(closePrices[i] - closePrices[i - 1]));
  }

  return trValues;
}

export function calculateAtr(
  closePrices: number[],
  period: number
): (number | null)[] {
  const trValues = calculateTrueRange(closePrices);
  const atrValues: (number | null)[] = [];

  for (let i = 0; i < closePrices.length; i++) {
    if (i < period) {
      atrValues.push(null);
      continue;
    }

    let sum = 0;
    let validCount = 0;
    for (let j = 0; j < period; j++) {
      const tr = trValues[i - j];
      if (tr !== null) {
        sum += tr;
        validCount++;
      }
    }

    if (validCount === period) {
      atrValues.push(sum / period);
    } else {
      atrValues.push(null);
    }
  }

  return atrValues;
}
