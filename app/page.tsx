import Link from "next/link";
import { ArrowRight, Shield, BarChart3, Zap } from "lucide-react";

const TOOL_CARDS = [
  {
    number: "01",
    tag: "RISK-CALC",
    title: "Position Size Calculator",
    description:
      "Calculate optimal position size based on your risk tolerance, stop loss distance, and leverage. Never risk more than you can afford.",
    href: "/calculator/position-size",
    features: [
      { label: "RISK", value: "1-5% Rules" },
      { label: "LEVERAGE", value: "Up to 125x" },
      { label: "STOP LOSS", value: "Auto-Calc" },
      { label: "MARGIN", value: "Real-Time" },
    ],
  },
  {
    number: "02",
    tag: "PROFIT-CALC",
    title: "Profit Analysis",
    description:
      "Analyze P&L across multiple take-profit levels with ROI projections and risk/reward ratios. Plan your exits before you enter.",
    href: "/calculator/profit",
    features: [
      { label: "TARGETS", value: "Multi-TP" },
      { label: "R:R RATIO", value: "Auto-Calc" },
      { label: "ROI", value: "Per Level" },
      { label: "PNL", value: "Net/Gross" },
    ],
  },
] as const;

const BACKTESTER = {
  number: "03",
  tag: "BACKTESTER",
  title: "Strategy Backtester",
  description:
    "Test SMA crossover strategies against historical OHLC data with exhaustive parameter optimization. Find edge before risking capital.",
  href: "/backtester",
  features: [
    { label: "STRATEGY", value: "SMA Cross" },
    { label: "STOPS", value: "ATR-Based" },
    { label: "OPTIMIZE", value: "Grid Search" },
    { label: "LEVERAGE", value: "Testing" },
  ],
} as const;

const CAPABILITIES = [
  {
    number: "01",
    title: "Capital Protection",
    description:
      "Position sizing algorithms that enforce risk limits per trade. Never blow up an account.",
    icon: Shield,
  },
  {
    number: "02",
    title: "Return Optimization",
    description:
      "Multi-target profit analysis with compounding projections and risk-adjusted returns.",
    icon: BarChart3,
  },
  {
    number: "03",
    title: "Precision Analytics",
    description:
      "Real-time calculations with zero rounding errors. Every basis point accounted for.",
    icon: Zap,
  },
] as const;

function TerminalCard({
  number,
  tag,
  title,
  description,
  href,
  features,
}: (typeof TOOL_CARDS)[number] | typeof BACKTESTER) {
  return (
    <Link href={href} className="group block">
      <div className="terminal-glow flex flex-col border border-[var(--profit-green)]/20 rounded-lg bg-card overflow-hidden">
        <div className="flex items-start justify-between p-5 pb-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--profit-green)]/30 px-2.5 py-0.5 text-xs font-mono text-[var(--profit-green)]">
            <span className="opacity-60">○</span> {tag}
          </span>
          <span className="font-mono text-4xl font-bold text-muted-foreground/20">
            {number}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-5 pt-3">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 border-t border-border/50 mx-5">
          {features.map((f, i) => (
            <div
              key={f.label}
              className={`flex flex-col gap-0.5 py-3 px-3 ${
                i % 2 === 0 ? "border-r border-border/50" : ""
              } ${i < 2 ? "border-b border-border/50" : ""}`}
            >
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                {f.label}
              </span>
              <span className="text-xs font-bold">{f.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--profit-green)]/20 px-5 py-3 mt-auto">
          <span className="text-xs font-mono font-medium text-[var(--profit-green)]">
            LAUNCH TERMINAL
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-[var(--profit-green)] transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="flex items-start justify-center px-8 pb-16 pt-22">
      <div className="flex flex-col gap-16 w-full max-w-4xl">
        <section className="flex flex-col gap-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Trade with precision, not guesswork
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Free tools for position sizing, profit analysis, and strategy
            backtesting. Manage risk like a professional.
          </p>
        </section>

        <div className="grid gap-5 sm:grid-cols-2">
          {TOOL_CARDS.map((card) => (
            <TerminalCard key={card.number} {...card} />
          ))}
        </div>

        <TerminalCard {...BACKTESTER} />

        <section className="flex flex-col gap-8">
          <h2 className="flex items-baseline gap-1 font-mono">
            <span className="text-sm text-muted-foreground tracking-wider">
              SYSTEM_
            </span>
            <span className="text-2xl font-bold tracking-tight">
              CAPABILITIES
            </span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {CAPABILITIES.map((cap) => (
              <div key={cap.number} className="flex flex-col gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/50">
                  <cap.icon className="h-5 w-5 text-[var(--profit-green)]" />
                </div>
                <h3 className="text-sm font-bold">
                  <span className="font-mono text-muted-foreground font-normal">
                    {cap.number}_
                  </span>
                  {cap.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
