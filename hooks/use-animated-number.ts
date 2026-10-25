"use client";

import { useState, useEffect, useRef } from "react";

export function useAnimatedNumber(value: number, duration = 500): number {
  const [displayValue, setDisplayValue] = useState(value);
  // Tracks what is on screen so a mid-animation change eases on from there instead of jumping back.
  const displayedRef = useRef(value);

  useEffect(() => {
    const startValue = displayedRef.current;
    if (startValue === value) return;

    const startTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * easeOut;

      displayedRef.current = current;
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return displayValue;
}
