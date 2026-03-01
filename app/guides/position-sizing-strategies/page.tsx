import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Calculator,
  ArrowRight,
  BarChart3,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { BreadcrumbStructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Position Sizing Strategies for Trading - Complete Guide",
  description:
    "Learn advanced position sizing strategies used by professional traders. Fixed fractional, Kelly Criterion, volatility-based sizing, and more.",
  keywords: [
    "position sizing strategies",
    "fixed fractional position sizing",
    "kelly criterion trading",
    "volatility position sizing",
    "risk management strategies",
  ],
  alternates: {
    canonical: "https://tradinglab.vip/guides/position-sizing-strategies",
  },
};

function ArticleStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Position Sizing Strategies for Trading - Complete Guide",
    description:
      "Learn advanced position sizing strategies used by professional traders.",
    author: { "@type": "Organization", name: "TradingLab" },
    publisher: {
      "@type": "Organization",
      name: "TradingLab",
      url: "https://tradinglab.vip",
    },
    datePublished: "2025-01-15",
    dateModified: new Date().toISOString().split("T")[0],
    mainEntityOfPage:
      "https://tradinglab.vip/guides/position-sizing-strategies",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function PositionSizingStrategiesPage() {
  return (
    <>
      <ArticleStructuredData />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://tradinglab.vip" },
          { name: "Guides", url: "https://tradinglab.vip/guides" },
          {
            name: "Position Sizing Strategies",
            url: "https://tradinglab.vip/guides/position-sizing-strategies",
          },
        ]}
      />

      <article className="container mx-auto py-8 px-4 max-w-4xl">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-card/50 border border-border/50 rounded mb-6">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs data-mono text-muted-foreground tracking-wider">
              ADVANCED_GUIDE
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Position Sizing Strategies for Traders
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            Beyond the basic formula lies a world of sophisticated position
            sizing techniques. Learn the strategies used by hedge funds and
            professional traders.
          </p>

          <div className="mt-8 p-4 bg-muted/50 border border-border/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-foreground" />
              <span className="font-semibold">Apply These Strategies</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Use our calculator to implement any of these sizing strategies.
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
          <h2>Why Position Sizing Strategy Matters</h2>
          <p>
            Two traders with identical entry and exit signals can have vastly
            different results based solely on their position sizing strategy.
          </p>

          <h2>1. Fixed Fractional Position Sizing</h2>
          <p>
            <strong>Fixed fractional</strong> is the most widely used
            professional method. You risk a fixed percentage of your current
            account balance on every trade.
          </p>

          <div className="not-prose my-8">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-6">
              <code className="text-foreground text-lg block text-center">
                Position Size = (Account × Risk%) ÷ Risk Per Unit
              </code>
            </div>
          </div>

          <h3>How It Works</h3>
          <ul>
            <li>Choose a fixed risk percentage (typically 1-2%)</li>
            <li>Calculate risk amount from current account balance</li>
            <li>
              Position size automatically scales with account growth/decline
            </li>
          </ul>

          <div className="not-prose my-6">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Example:</p>
              <p>Account: $50,000 → Risk 1% = $500</p>
              <p>After growth to $60,000 → Risk 1% = $600</p>
              <p>After drawdown to $40,000 → Risk 1% = $400</p>
              <p className="text-[var(--profit-green)] mt-3 font-semibold">
                Automatic position scaling protects capital during drawdowns
              </p>
            </div>
          </div>

          <div className="not-prose my-6">
            <div className="p-4 bg-[var(--profit-green)]/5 border border-[var(--profit-green)]/30 rounded-lg">
              <p className="font-semibold">Best For:</p>
              <p className="text-sm text-muted-foreground mt-1">
                Most traders. This should be your default strategy.
              </p>
            </div>
          </div>

          <h2>2. Kelly Criterion</h2>
          <p>
            The <strong>Kelly Criterion</strong> calculates the optimal position
            size to maximize long-term growth rate while avoiding ruin.
          </p>

          <div className="not-prose my-8">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-6">
              <code className="text-foreground text-lg block text-center">
                Kelly % = W - [(1-W) / R]
              </code>
              <p className="text-sm text-muted-foreground text-center mt-3">
                Where W = Win Rate, R = Win/Loss Ratio
              </p>
            </div>
          </div>

          <div className="not-prose my-6">
            <div className="p-4 bg-amber-500/5 border border-amber-500/30 rounded-lg flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Use Fractional Kelly</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Most professionals use &quot;half-Kelly&quot; (50%) or
                  &quot;quarter-Kelly&quot; (25%). Half-Kelly achieves 75% of
                  the growth rate with much smoother equity curves.
                </p>
              </div>
            </div>
          </div>

          <h2>3. Volatility-Based Position Sizing</h2>
          <p>
            Adjusts position size based on the asset&apos;s current volatility
            using the ATR indicator.
          </p>

          <div className="not-prose my-8">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-6">
              <code className="text-foreground text-lg block text-center">
                Position Size = (Account × Risk%) ÷ (ATR × ATR Multiplier)
              </code>
            </div>
          </div>

          <h2>4. Fixed Ratio Position Sizing</h2>
          <p>
            Developed by Ryan Jones, <strong>fixed ratio</strong> increases
            position size only after achieving a specific profit target (delta).
          </p>

          <h2>Comparing the Strategies</h2>

          <div className="not-prose my-8">
            <div className="overflow-x-auto">
              <table className="w-full border border-border/50 rounded-lg overflow-hidden text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Strategy</th>
                    <th className="px-4 py-3 text-left">Complexity</th>
                    <th className="px-4 py-3 text-left">Risk Level</th>
                    <th className="px-4 py-3 text-left">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/50">
                    <td className="px-4 py-3">Fixed Fractional</td>
                    <td className="px-4 py-3 text-[var(--profit-green)]">
                      Low
                    </td>
                    <td className="px-4 py-3">Moderate</td>
                    <td className="px-4 py-3">Everyone</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="px-4 py-3">Kelly Criterion</td>
                    <td className="px-4 py-3 text-amber-500">Medium</td>
                    <td className="px-4 py-3">High (if full)</td>
                    <td className="px-4 py-3">Experienced traders</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="px-4 py-3">Volatility-Based</td>
                    <td className="px-4 py-3 text-amber-500">Medium</td>
                    <td className="px-4 py-3">Moderate</td>
                    <td className="px-4 py-3">Multi-asset traders</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="px-4 py-3">Fixed Ratio</td>
                    <td className="px-4 py-3 text-[var(--loss-red)]">High</td>
                    <td className="px-4 py-3">Conservative</td>
                    <td className="px-4 py-3">Futures traders</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h2>Our Recommendation</h2>
          <p>
            For most traders,{" "}
            <strong>fixed fractional position sizing at 1-2% risk</strong> is
            the optimal choice.
          </p>

          <div className="not-prose my-6">
            <div className="p-4 bg-muted/50 border border-border/50 rounded-lg flex gap-3">
              <TrendingUp className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">The Most Important Rule</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Whatever strategy you choose, the key is consistency.
                  Switching between methods mid-drawdown will hurt your results.
                </p>
              </div>
            </div>
          </div>

          <div className="not-prose mt-8">
            <Link
              href="/calculator/position-size"
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Shield className="h-5 w-5" />
              Open Position Size Calculator
            </Link>
          </div>
        </div>

        <footer className="mt-16 pt-8 border-t border-border/50">
          <h3 className="font-semibold mb-4">Related Guides</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/guides/how-to-calculate-position-size"
              className="p-4 bg-card/50 border border-border/50 rounded-lg hover:border-primary/50 transition-colors"
            >
              <h4 className="font-medium">How to Calculate Position Size</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Master the basic position sizing formula with examples.
              </p>
            </Link>
            <Link
              href="/guides/risk-reward-ratio"
              className="p-4 bg-card/50 border border-border/50 rounded-lg hover:border-primary/50 transition-colors"
            >
              <h4 className="font-medium">
                Understanding Risk/Reward Ratios
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Learn how to evaluate trade quality using R:R ratios.
              </p>
            </Link>
          </div>
        </footer>
      </article>
    </>
  );
}
