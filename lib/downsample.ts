export function downsampleLTTB<T>(
  data: T[],
  threshold: number,
  yAccessor: (item: T) => number
): number[] {
  const length = data.length;
  if (threshold >= length || threshold < 3) {
    return data.map((_, i) => i);
  }

  const sampled: number[] = [0];
  const bucketSize = (length - 2) / (threshold - 2);

  let prevIndex = 0;

  for (let i = 1; i < threshold - 1; i++) {
    const avgStart = Math.floor(i * bucketSize) + 1;
    const avgEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, length);

    let avgX = 0;
    let avgY = 0;
    const avgCount = avgEnd - avgStart;

    for (let j = avgStart; j < avgEnd; j++) {
      avgX += j;
      avgY += yAccessor(data[j]);
    }
    avgX /= avgCount;
    avgY /= avgCount;

    const rangeStart = Math.floor((i - 1) * bucketSize) + 1;
    const rangeEnd = Math.min(Math.floor(i * bucketSize) + 1, length);

    const prevX = prevIndex;
    const prevY = yAccessor(data[prevIndex]);

    let maxArea = -1;
    let maxIndex = rangeStart;

    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (prevX - avgX) * (yAccessor(data[j]) - prevY) -
        (prevX - j) * (avgY - prevY)
      );
      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }

    sampled.push(maxIndex);
    prevIndex = maxIndex;
  }

  sampled.push(length - 1);
  return sampled;
}
