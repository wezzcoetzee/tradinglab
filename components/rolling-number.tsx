"use client";

import { useRef, memo, useEffect, useState } from "react";

interface RollingDigitProps {
  char: string;
  prevChar: string | null;
  direction: "up" | "down" | null;
}

const RollingDigit = memo(function RollingDigit({
  char,
  prevChar,
  direction,
}: RollingDigitProps) {
  const shouldAnimate = prevChar !== null && prevChar !== char && direction !== null;

  if (!shouldAnimate) {
    return <span className="inline-block">{char}</span>;
  }

  return (
    <span className="inline-block relative overflow-hidden">
      <span
        className={`inline-block transition-transform duration-150 ease-out ${
          direction === "up" ? "-translate-y-full" : "translate-y-full"
        } opacity-0`}
      >
        {prevChar}
      </span>
      <span
        className={`absolute left-0 top-0 inline-block ${
          direction === "up" ? "animate-roll-up" : "animate-roll-down"
        }`}
      >
        {char}
      </span>
    </span>
  );
});

interface RollingNumberProps {
  value: string;
  className?: string;
}

interface AnimState {
  displayChars: string[];
  prevChars: (string | null)[];
  direction: "up" | "down" | null;
}

function computeAnimState(value: string, prev: string): AnimState {
  const newChars = value.split("");
  const noPrev: AnimState = { displayChars: newChars, prevChars: newChars.map(() => null), direction: null };

  if (prev === value) return noPrev;

  const prevNum = parseFloat(prev.replace(/[^0-9.-]/g, ""));
  const currNum = parseFloat(value.replace(/[^0-9.-]/g, ""));
  const oldChars = prev.split("");

  const maxLen = Math.max(newChars.length, oldChars.length);
  const paddedNew = newChars.join("").padStart(maxLen, " ").split("");
  const paddedOld = oldChars.join("").padStart(maxLen, " ").split("");

  if (!isNaN(prevNum) && !isNaN(currNum) && prevNum !== currNum) {
    const dir: "up" | "down" = currNum > prevNum ? "up" : "down";
    const prevCharsForAnim: (string | null)[] = paddedNew.map((char, i) =>
      paddedOld[i] !== char ? (paddedOld[i] ?? null) : null
    );
    return { displayChars: newChars, prevChars: prevCharsForAnim, direction: dir };
  }

  return noPrev;
}

export function RollingNumber({ value, className = "" }: RollingNumberProps) {
  const prevValueRef = useRef(value);
  const [animState, setAnimState] = useState<AnimState>(() =>
    computeAnimState(value, value)
  );

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev === value) return;
    prevValueRef.current = value;
    setAnimState(computeAnimState(value, prev));
  }, [value]);

  const { displayChars, prevChars, direction } = animState;
  const offset = prevChars.length - displayChars.length;

  return (
    <span className={`inline-flex ${className}`}>
      {displayChars.map((char, i) => (
        <RollingDigit
          key={`${i}-${char}`}
          char={char}
          prevChar={prevChars[i + offset] ?? null}
          direction={direction}
        />
      ))}
    </span>
  );
}
