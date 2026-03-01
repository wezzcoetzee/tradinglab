"use client";

import { useState, useEffect, useRef } from "react";

export function useAnimatedNumber(value: number, duration = 500): number {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (previousValue.current === value) return;

    const startValue = previousValue.current;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return displayValue;
}
