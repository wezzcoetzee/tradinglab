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

const guides = [
  {
    title: "How to Calculate Position Size in Trading",
    description:
      "Step-by-step guide with formulas and examples for calculating position size in forex, crypto, and stock trading.",
    href: "/guides/how-to-calculate-position-size",
    icon: Shield,
    category: "Risk Management",
  },
  {
    title: "Position Sizing Strategies",
    description:
      "Advanced strategies used by professional traders — fixed fractional, Kelly Criterion, volatility-based sizing, and more.",
    href: "/guides/position-sizing-strategies",
    icon: Calculator,
    category: "Strategy",
  },
  {
    title: "Risk Reward Ratio Explained",
    description:
      "Learn what risk/reward ratio is, how to calculate it, and what optimal ratios look like across different trading styles.",
    href: "/guides/risk-reward-ratio",
    icon: Target,
    category: "Fundamentals",
  },
];

export default function GuidesPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://tradinglab.vip" },
          { name: "Guides", url: "https://tradinglab.vip/guides" },
        ]}
      />

      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trading Guides
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            In-depth guides to help you manage risk and size positions like a
            professional trader.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-foreground/20 hover:bg-accent/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <guide.icon className="h-5 w-5 text-muted-foreground" />
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {guide.category}
                </span>
              </div>
              <h2 className="text-base font-semibold leading-snug">
                {guide.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {guide.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground/80 group-hover:text-foreground">
                Read guide
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
