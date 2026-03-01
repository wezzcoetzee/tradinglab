import type { Metadata } from "next";
import Link from "next/link";
import { Target, Calculator, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { BreadcrumbStructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Risk Reward Ratio Explained - How to Calculate R:R in Trading",
  description:
    "Learn what risk/reward ratio is and how to calculate it for forex, crypto, and stock trading. Complete guide with examples, optimal ratios, and a free R:R calculator.",
  keywords: [
    "risk reward ratio",
    "risk to reward ratio",
    "R:R ratio trading",
    "how to calculate risk reward",
    "risk reward calculator",
  ],
  alternates: {
    canonical: "https://tradinglab.vip/guides/risk-reward-ratio",
  },
};

function ArticleStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Risk Reward Ratio Explained - How to Calculate R:R in Trading",
    description:
      "Complete guide to understanding and calculating risk/reward ratios.",
    author: { "@type": "Organization", name: "TradingLab" },
    publisher: {
      "@type": "Organization",
      name: "TradingLab",
      url: "https://tradinglab.vip",
    },
    datePublished: "2025-01-15",
    dateModified: new Date().toISOString().split("T")[0],
    mainEntityOfPage: "https://tradinglab.vip/guides/risk-reward-ratio",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function RiskRewardRatioPage() {
  return (
    <>
      <ArticleStructuredData />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://tradinglab.vip" },
          { name: "Guides", url: "https://tradinglab.vip/guides" },
          {
            name: "Risk Reward Ratio",
            url: "https://tradinglab.vip/guides/risk-reward-ratio",
          },
        ]}
      />

      <article className="container mx-auto py-8 px-4 max-w-4xl">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-card/50 border border-border/50 rounded mb-6">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs data-mono text-muted-foreground tracking-wider">
              TRADING_GUIDE
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Risk Reward Ratio Explained
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            The risk/reward ratio is the most important metric for evaluating
            trade quality. Learn how to calculate it and why professional traders
            never take trades below 1:2.
          </p>

          <div className="mt-8 p-4 bg-[var(--profit-green)]/5 border border-[var(--profit-green)]/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-[var(--profit-green)]" />
              <span className="font-semibold">Quick Calculator</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Calculate your risk/reward ratio instantly with our profit
              calculator.
            </p>
            <Link
              href="/calculator/profit"
              className="inline-flex items-center gap-2 mt-3 text-[var(--profit-green)] hover:underline"
            >
              Open Profit Calculator <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>What is Risk/Reward Ratio?</h2>
          <p>
            The risk/reward ratio compares the potential profit of a trade to its
            potential loss. A ratio of 1:2 means you stand to make $2 for every
            $1 you risk.
          </p>

          <h2>The Risk/Reward Formula</h2>

          <div className="not-prose my-8">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-6">
              <code className="text-foreground text-xl block text-center">
                Risk/Reward Ratio = Potential Profit ÷ Potential Loss
              </code>
            </div>
          </div>

          <h2>Risk/Reward Calculation Examples</h2>

          <h3>Example 1: Long Trade</h3>
          <div className="not-prose my-6">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-[var(--profit-green)]" />
                <span className="font-semibold">Bitcoin Long Trade</span>
              </div>
              <p>Entry Price: $50,000</p>
              <p>Stop Loss: $48,000 (risking $2,000 per BTC)</p>
              <p>Take Profit: $56,000 (potential gain $6,000 per BTC)</p>
              <p className="mt-3">R:R = $6,000 ÷ $2,000</p>
              <p className="text-[var(--profit-green)] font-semibold">
                Risk/Reward = 1:3
              </p>
            </div>
          </div>

          <h3>Example 2: Short Trade</h3>
          <div className="not-prose my-6">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-5 w-5 text-[var(--loss-red)]" />
                <span className="font-semibold">EUR/USD Short Trade</span>
              </div>
              <p>Entry Price: 1.1000</p>
              <p>Stop Loss: 1.1050 (risking 50 pips)</p>
              <p>Take Profit: 1.0900 (potential gain 100 pips)</p>
              <p className="mt-3">R:R = 100 pips ÷ 50 pips</p>
              <p className="text-[var(--profit-green)] font-semibold">
                Risk/Reward = 1:2
              </p>
            </div>
          </div>

          <h2>Why Risk/Reward Ratio Matters</h2>

          <div className="not-prose my-8">
            <div className="overflow-x-auto">
              <table className="w-full border border-border/50 rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">Risk/Reward</th>
                    <th className="px-4 py-3 text-left">Required Win Rate</th>
                    <th className="px-4 py-3 text-left">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/50">
                    <td className="px-4 py-3">1:1</td>
                    <td className="px-4 py-3">50%</td>
                    <td className="px-4 py-3 text-amber-500">Breakeven</td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="px-4 py-3">1:2</td>
                    <td className="px-4 py-3">33%</td>
                    <td className="px-4 py-3 text-[var(--profit-green)]">
                      Good
                    </td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="px-4 py-3">1:3</td>
                    <td className="px-4 py-3">25%</td>
                    <td className="px-4 py-3 text-[var(--profit-green)]">
                      Excellent
                    </td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="px-4 py-3">1:4</td>
                    <td className="px-4 py-3">20%</td>
                    <td className="px-4 py-3 text-[var(--profit-green)]">
                      Outstanding
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h2>Using Multiple Take Profit Levels</h2>
          <p>
            Many traders use multiple take profit targets to optimize their
            average R:R:
          </p>
          <ul>
            <li>
              <strong>TP1 (50%)</strong>: 1:1 - Lock in some profit
            </li>
            <li>
              <strong>TP2 (30%)</strong>: 1:2 - Secure good returns
            </li>
            <li>
              <strong>TP3 (20%)</strong>: 1:4+ - Let winners run
            </li>
          </ul>

          <h2>Expected Value: The Complete Picture</h2>

          <div className="not-prose my-8">
            <div className="bg-muted/50 border border-border/50 rounded-lg p-6">
              <code className="text-foreground text-lg block text-center">
                EV = (Win Rate × Reward) - (Loss Rate × Risk)
              </code>
            </div>
          </div>

          <h2>Calculate Your Risk/Reward Now</h2>

          <div className="not-prose mt-8">
            <Link
              href="/calculator/profit"
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Target className="h-5 w-5" />
              Open Profit Calculator
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
                Master the position sizing formula with our complete guide.
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
