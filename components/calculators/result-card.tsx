"use client";

import { useAnimatedNumber } from "@/hooks/use-animated-number";

export type ResultColor = "green" | "red" | "neutral";

interface ResultCardProps {
  label: string;
  value: number;
  unit: string;
  color: ResultColor;
  formatFn: (value: number) => string;
  showResults: boolean;
  staggerIndex: number;
}

const COLOR_CLASSES: Record<
  ResultColor,
  { border: string; bg: string; text: string; accent: string }
> = {
  green: {
    border: "border-[var(--profit-green)]/30 hover:border-[var(--profit-green)]/50",
    bg: "bg-[var(--profit-green)]/5",
    text: "text-[var(--profit-green)]",
    accent: "bg-[var(--profit-green)]",
  },
  red: {
    border: "border-[var(--loss-red)]/30 hover:border-[var(--loss-red)]/50",
    bg: "bg-[var(--loss-red)]/5",
    text: "text-[var(--loss-red)]",
    accent: "bg-[var(--loss-red)]",
  },
  neutral: {
    border: "border-border hover:border-border/80",
    bg: "bg-muted/30",
    text: "text-foreground",
    accent: "bg-foreground/50",
  },
};

export function ResultCard({
  label,
  value,
  unit,
  color,
  formatFn,
  showResults,
  staggerIndex,
}: ResultCardProps) {
  const animatedValue = useAnimatedNumber(value, 600);
  const styles = COLOR_CLASSES[color];

  return (
    <div
      className={`relative ${styles.border} ${styles.bg} p-5 rounded card-hover-lift transition-all ${showResults ? `animate-fade-slide-in stagger-${staggerIndex}` : "opacity-0"}`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${styles.accent} rounded-l`} />
      <div className="mb-3">
        <span className="data-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="space-y-1">
        <p className={`data-mono text-3xl font-bold ${styles.text}`}>
          {formatFn(animatedValue)}
        </p>
        <p className="data-mono text-xs text-muted-foreground">{unit}</p>
      </div>
    </div>
  );
}
