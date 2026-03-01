import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PositionSizeCalculator } from "@/components/calculators/position-size-calculator";
import { BreadcrumbStructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Position Size Calculator",
  description:
    "Free position size calculator for forex, crypto, and stock trading. Calculate optimal position size based on risk tolerance, stop loss, and leverage.",
  keywords: [
    "position size calculator",
    "lot size calculator",
    "forex position calculator",
    "crypto position size",
    "risk based position sizing",
    "leverage calculator",
    "margin calculator",
  ],
  alternates: {
    canonical: "https://tradinglab.vip/calculator/position-size",
  },
};

const positionSizeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Position Size Calculator",
  description:
    "Free position size calculator for forex, crypto, and stock trading. Calculate optimal position size based on risk tolerance, stop loss, and leverage.",
  url: "https://tradinglab.vip/calculator/position-size",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function PositionSizeCalculatorPage() {
  return (
    <div className="flex items-start justify-center px-8 pb-16 pt-22">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(positionSizeJsonLd) }}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://tradinglab.vip" },
          {
            name: "Position Size Calculator",
            url: "https://tradinglab.vip/calculator/position-size",
          },
        ]}
      />
      <div className="flex flex-col gap-8 w-full max-w-4xl">
      <section className="flex flex-col gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Position Size Calculator
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Calculate your optimal position size based on risk tolerance, stop loss
          distance, and leverage. Never risk more than you can afford to lose.
        </p>
      </section>

      <Card>
        <CardHeader className="border-b border-border/30 pb-4">
          <CardTitle className="text-lg font-bold uppercase tracking-wide">
            Position Sizing
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <PositionSizeCalculator />
        </CardContent>
      </Card>

      <div className="mt-12 rounded-lg border border-[var(--loss-red)]/30 bg-[var(--loss-red)]/5 p-4">
        <p className="text-sm font-medium text-[var(--loss-red)]">
          Risk Warning
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Professional risk management protocol: Maximum 1-2% account risk per
          position. Always define exit parameters before trade execution. Capital
          preservation is paramount.
        </p>
      </div>

      <section className="mt-12 space-y-8">
        <h2 className="text-2xl font-bold">How to Calculate Position Size</h2>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Position sizing is the most critical aspect of risk management in
            trading. It determines how many units of an asset you should buy or
            sell based on your risk tolerance and the distance to your stop loss.
          </p>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              The Position Size Formula
            </h3>
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 data-mono text-sm">
              Position Size = Risk Amount &divide; (Risk Per Unit &times; Leverage)
            </div>
            <p className="mt-3">
              Where Risk Per Unit is the absolute difference between your entry
              price and stop loss price.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Example Calculation
            </h3>
            <p>
              Let&apos;s say you have a $10,000 account and want to risk 1%
              ($100) on a trade:
            </p>
            <div className="mt-3 rounded-lg border border-border/50 bg-card/50 p-4 data-mono text-sm space-y-1">
              <p>Entry Price: $50,000 (Bitcoin)</p>
              <p>Stop Loss: $49,000</p>
              <p>Risk Per Unit: $1,000</p>
              <p>Leverage: 10x</p>
              <p className="pt-2 border-t border-border/30 font-medium text-foreground">
                Position Size: $100 &divide; ($1,000 &times; 10) = 0.01 BTC
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Why Position Sizing Matters
            </h3>
            <p>
              Even with a 50% win rate, proper position sizing can make you
              profitable. The key is to never risk more than a small percentage
              of your account on any single trade. This ensures that a string of
              losses won&apos;t wipe out your account.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              The 1% Rule
            </h3>
            <p>
              Most professional traders follow the 1% rule: never risk more than
              1% of your total account on a single trade. Some aggressive traders
              may risk up to 2%, but anything beyond that significantly increases
              the risk of ruin.
            </p>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
}
