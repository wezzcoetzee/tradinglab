import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfitCalculator } from "@/components/calculators/profit-calculator";
import { BreadcrumbStructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Profit Calculator",
  description:
    "Free trading profit calculator with multiple take-profit analysis. Calculate P&L, ROI, and risk/reward ratios for forex, crypto, and stock trades.",
  keywords: [
    "profit calculator",
    "trading profit calculator",
    "P&L calculator",
    "risk reward calculator",
    "ROI calculator",
    "take profit calculator",
  ],
  alternates: {
    canonical: "https://tradinglab.vip/calculator/profit",
  },
};

const profitJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Profit Calculator",
  description:
    "Free trading profit calculator with multiple take-profit analysis. Calculate P&L, ROI, and risk/reward ratios for forex, crypto, and stock trades.",
  url: "https://tradinglab.vip/calculator/profit",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function ProfitCalculatorPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profitJsonLd) }}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://tradinglab.vip" },
          {
            name: "Profit Calculator",
            url: "https://tradinglab.vip/calculator/profit",
          },
        ]}
      />
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Profit Calculator
        </h1>
        <p className="text-muted-foreground">
          Analyze potential profits across multiple take-profit levels. Calculate
          ROI, risk/reward ratios, and expected returns before entering any trade.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b border-border/30 pb-4">
          <CardTitle className="text-lg font-bold uppercase tracking-wide">
            Profit Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ProfitCalculator />
        </CardContent>
      </Card>

      <div className="mt-12 rounded-lg border border-[var(--profit-green)]/30 bg-[var(--profit-green)]/5 p-4">
        <p className="text-sm font-medium text-[var(--profit-green)]">
          Trading Tip
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Always aim for a minimum 1:2 risk/reward ratio. This means your
          potential profit should be at least twice your potential loss.
          Professional traders often target 1:3 or higher.
        </p>
      </div>

      <section className="mt-12 space-y-8">
        <h2 className="text-2xl font-bold">Understanding Risk/Reward Ratios</h2>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            The risk/reward ratio is one of the most important metrics in
            trading. It compares the potential profit of a trade to its potential
            loss, helping you make better decisions about which trades to take.
          </p>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              The Risk/Reward Formula
            </h3>
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 data-mono text-sm">
              Risk/Reward Ratio = Potential Profit &divide; Potential Loss
            </div>
            <p className="mt-3">
              A ratio of 2:1 means you stand to make $2 for every $1 you risk.
              The higher the ratio, the better the trade.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Why Risk/Reward Matters
            </h3>
            <p>
              With a 2:1 risk/reward ratio, you only need to win 33% of your
              trades to break even. With a 3:1 ratio, you only need 25% winners.
              This is why professional traders focus on finding high-probability
              setups with favorable risk/reward.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Multiple Take Profit Levels
            </h3>
            <p>
              Many traders use multiple take-profit levels to lock in profits
              while letting winners run. For example, you might take 50% off at
              TP1 (1:1), 30% at TP2 (2:1), and let the remaining 20% run to TP3
              (3:1) or higher.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Calculating ROI with Leverage
            </h3>
            <p>
              ROI (Return on Investment) in leveraged trading is calculated based
              on your margin, not the total position size. A 10% price move with
              10x leverage equals 100% ROI on your margin. Our calculator
              automatically accounts for leverage in all calculations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
