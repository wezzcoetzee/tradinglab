import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Shield, Target } from "lucide-react";
import { BreadcrumbStructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Trading Guides - Position Sizing, Risk Management & More",
  description:
    "Free trading guides covering position sizing, risk/reward ratios, and risk management strategies. Learn to trade smarter with step-by-step tutorials.",
  alternates: {
    canonical: "https://tradinglab.vip/guides",
  },
};

const GUIDES = [
  {
    number: "01",
    tag: "RISK-MGMT",
    title: "How to Calculate Position Size in Trading",
    description:
      "Step-by-step guide with formulas and examples for calculating position size in forex, crypto, and stock trading.",
    href: "/guides/how-to-calculate-position-size",
    icon: Shield,
    category: "Risk Management",
  },
  {
    number: "02",
    tag: "STRATEGY",
    title: "Position Sizing Strategies",
    description:
      "Advanced strategies used by professional traders — fixed fractional, Kelly Criterion, volatility-based sizing, and more.",
    href: "/guides/position-sizing-strategies",
    icon: Calculator,
    category: "Strategy",
  },
  {
    number: "03",
    tag: "FUNDAMENTALS",
    title: "Risk Reward Ratio Explained",
    description:
      "Learn what risk/reward ratio is, how to calculate it, and what optimal ratios look like across different trading styles.",
    href: "/guides/risk-reward-ratio",
    icon: Target,
    category: "Fundamentals",
  },
] as const;

export default function GuidesPage() {
  return (
    <div className="flex items-start justify-center px-8 pb-16 pt-22">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://tradinglab.vip" },
          { name: "Guides", url: "https://tradinglab.vip/guides" },
        ]}
      />

      <div className="flex flex-col gap-8 w-full max-w-4xl">
        <section className="flex flex-col gap-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trading Guides
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            In-depth guides to help you manage risk and size positions like a
            professional trader.
          </p>
        </section>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => (
            <Link key={guide.href} href={guide.href} className="group block">
              <div className="terminal-glow flex flex-col border border-[var(--profit-green)]/20 rounded-lg bg-card overflow-hidden h-full">
                <div className="flex items-start justify-between p-5 pb-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--profit-green)]/30 px-2.5 py-0.5 text-xs font-mono text-[var(--profit-green)]">
                    <span className="opacity-60">○</span> {guide.tag}
                  </span>
                  <span className="font-mono text-4xl font-bold text-muted-foreground/20">
                    {guide.number}
                  </span>
                </div>

                <div className="flex flex-col gap-2 p-5 pt-3 flex-1">
                  <h2 className="text-lg font-bold tracking-tight">
                    {guide.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {guide.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--profit-green)]/20 px-5 py-3 mt-auto">
                  <span className="text-xs font-mono font-medium text-[var(--profit-green)]">
                    READ GUIDE
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--profit-green)] transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
