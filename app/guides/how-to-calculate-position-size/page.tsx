import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Calculator, ArrowRight, CheckCircle2 } from "lucide-react";
import { BreadcrumbStructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "How to Calculate Position Size in Trading - Complete Guide",
  description:
    "Learn how to calculate position size for forex, crypto, and stock trading. Step-by-step guide with formulas, examples, and a free position size calculator.",
  keywords: [
    "how to calculate position size",
    "position size formula",
    "position sizing guide",
    "trading position size",
    "risk management trading",
  ],
  alternates: {
    canonical: "https://tradinglab.vip/guides/how-to-calculate-position-size",
  },
};

function ArticleStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Calculate Position Size in Trading - Complete Guide",
    description:
      "Learn how to calculate position size for forex, crypto, and stock trading with step-by-step instructions, formulas, and examples.",
    author: { "@type": "Organization", name: "TradingLab" },
    publisher: {
      "@type": "Organization",
      name: "TradingLab",
      url: "https://tradinglab.vip",
    },
    datePublished: "2025-01-15",
    dateModified: new Date().toISOString().split("T")[0],
    mainEntityOfPage:
      "https://tradinglab.vip/guides/how-to-calculate-position-size",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function HowToCalculatePositionSizePage() {
  return (
    <>
      <ArticleStructuredData />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://tradinglab.vip" },
          { name: "Guides", url: "https://tradinglab.vip/guides" },
          {
            name: "How to Calculate Position Size",
            url: "https://tradinglab.vip/guides/how-to-calculate-position-size",
          },
        ]}
      />

      <article className="container mx-auto py-8 px-4 max-w-4xl">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-card/50 border border-border/50 rounded mb-6">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs data-mono text-muted-foreground tracking-wider">
              TRADING_GUIDE
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            How to Calculate Position Size in Trading
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            Position sizing is the single most important skill in trading. Learn
            the exact formula professional traders use to protect their capital
            and maximize returns.
          </p>

          <div className="mt-8 p-4 bg-muted/50 border border-border/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-foreground" />
              <span className="font-semibold">Quick Calculator</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Skip the math and use our free position size calculator.
            </p>
            <Link
              href="/calculator/position-size"
              className="inline-flex items-center gap-2 mt-3 text-foreground hover:underline"
            >
              Open Position Size Calculator{" "}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>What is Position Sizing?</h2>
          <p>
            Position sizing determines how many units of an asset (shares,
            contracts, lots, or coins) you should buy or sell on any given trade.
            It&apos;s the cornerstone of risk management and the difference
            between professional traders and gamblers.
          </p>
          <p>
            Without proper position sizing, even a strategy with a 70% win rate
            can blow up your account. With proper position sizing, even a
            strategy with a 40% win rate can be profitable.
          </p>

          <h2>The Position Size Formula</h2>
          <p>The formula for calculating position size is:</p>

          <div className="not-prose my-8">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-6">
              <code className="text-foreground text-xl block text-center">
                Position Size = Risk Amount ÷ Risk Per Unit
              </code>
            </div>
          </div>

          <p>Where:</p>
          <ul>
            <li>
              <strong>Risk Amount</strong> = The dollar amount you&apos;re
              willing to lose on this trade
            </li>
            <li>
              <strong>Risk Per Unit</strong> = |Entry Price - Stop Loss Price|
            </li>
          </ul>
          <p>
            <strong>Note:</strong> Leverage does not affect position size or
            P&L—it only determines how much margin (collateral) you need.
          </p>

          <h2>Step-by-Step Position Size Calculation</h2>

          <h3>Step 1: Determine Your Risk Amount</h3>
          <p>
            First, decide how much of your account you&apos;re willing to risk
            on this single trade. The industry standard is{" "}
            <strong>1-2% of your total account</strong>.
          </p>

          <div className="not-prose my-6">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Example:</p>
              <p>Account Size: $10,000</p>
              <p>Risk Percentage: 1%</p>
              <p className="font-semibold">Risk Amount: $100</p>
            </div>
          </div>

          <h3>Step 2: Calculate Risk Per Unit</h3>
          <p>
            Find the absolute difference between your entry price and stop loss
            price.
          </p>

          <div className="not-prose my-6">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Example (Long Trade):
              </p>
              <p>Entry Price: $50,000</p>
              <p>Stop Loss: $49,000</p>
              <p className="font-semibold">Risk Per Unit: $1,000</p>
            </div>
          </div>

          <h3>Step 3: Apply the Formula</h3>

          <div className="not-prose my-6">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
              <p>Risk Amount: $100</p>
              <p>Risk Per Unit: $1,000</p>
              <p className="mt-2">Position Size = $100 ÷ $1,000</p>
              <p className="font-semibold">Position Size = 0.1 BTC</p>
            </div>
          </div>

          <h3>Step 4: Verify Your Margin</h3>
          <p>
            Make sure you have enough capital to open this position. With 10x
            leverage, 0.1 BTC at $50,000 (notional value $5,000) requires $500
            in margin.
          </p>

          <h2>Why the 1% Rule Matters</h2>

          <div className="not-prose my-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[var(--loss-red)]/5 border border-[var(--loss-red)]/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Risking 10% Per Trade</h4>
                <p className="text-sm text-muted-foreground">
                  After 7 consecutive losses, you&apos;ve lost 52% of your
                  account. You need a 108% return just to break even.
                </p>
              </div>
              <div className="bg-[var(--profit-green)]/5 border border-[var(--profit-green)]/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Risking 1% Per Trade</h4>
                <p className="text-sm text-muted-foreground">
                  After 7 consecutive losses, you&apos;ve lost only 6.8%.
                  You need just a 7.3% return to break even.
                </p>
              </div>
            </div>
          </div>

          <h2>Common Position Sizing Mistakes</h2>

          <div className="not-prose my-8 space-y-4">
            {[
              {
                mistake: "Not using a stop loss",
                solution:
                  "Always define your exit before entering a trade. No stop loss = no way to calculate position size.",
              },
              {
                mistake: "Risking too much per trade",
                solution:
                  "Stick to 1-2% maximum. Even with a 60% win rate, you'll face losing streaks.",
              },
              {
                mistake: "Confusing leverage with position size",
                solution:
                  "Leverage only affects margin requirements, not your position size or P&L.",
              },
              {
                mistake: "Moving stop losses further away",
                solution:
                  "If you move your stop, you must reduce your position size proportionally.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 bg-muted/50 border border-border/50 rounded-lg"
              >
                <CheckCircle2 className="h-5 w-5 text-[var(--profit-green)] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{item.mistake}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h2>Calculate Your Position Size Now</h2>
          <p>
            Ready to apply what you&apos;ve learned? Use our free position size
            calculator to instantly calculate the optimal position size for your
            next trade.
          </p>

          <div className="not-prose mt-8">
            <Link
              href="/calculator/position-size"
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Calculator className="h-5 w-5" />
              Open Position Size Calculator
            </Link>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-border/50">
          <h3 className="font-semibold mb-4">Related Guides</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/guides/risk-reward-ratio"
              className="p-4 bg-card/50 border border-border/50 rounded-lg hover:border-primary/50 transition-colors"
            >
              <h4 className="font-medium">Understanding Risk/Reward Ratios</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Learn how to evaluate trade quality using R:R ratios.
              </p>
            </Link>
            <Link
              href="/guides/position-sizing-strategies"
              className="p-4 bg-card/50 border border-border/50 rounded-lg hover:border-primary/50 transition-colors"
            >
              <h4 className="font-medium">Position Sizing Strategies</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced techniques for optimal capital allocation.
              </p>
            </Link>
          </div>
        </footer>
      </article>
    </>
  );
}
