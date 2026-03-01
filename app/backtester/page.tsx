import type { Metadata } from 'next';
import { Backtester } from '@/components/backtester';
import { BreadcrumbStructuredData } from '@/components/structured-data';

export const metadata: Metadata = {
  title: 'Crypto Trading Strategy Backtester',
  description:
    'Test SMA crossover strategies against historical OHLC data with exhaustive parameter optimization. Configure leverage, fees, and ATR-based trailing stops.',
  alternates: {
    canonical: 'https://tradinglab.vip/backtester',
  },
};

export default function BacktesterPage() {
  return (
    <div className="flex items-start justify-center px-8 pb-8 pt-22">
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: 'https://tradinglab.vip' },
          { name: 'Backtester', url: 'https://tradinglab.vip/backtester' },
        ]}
      />
      <div className="flex flex-col gap-8 w-full max-w-7xl">
        <section className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Crypto Trading Strategy Backtester
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Test SMA crossover strategies against historical OHLC data with
            exhaustive parameter optimization. Configure leverage, fees, and
            ATR-based trailing stops to find the best-performing setups.
          </p>
        </section>

        <Backtester />
      </div>
    </div>
  );
}
