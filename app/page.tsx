import { Backtester } from '@/components/backtester';

export default function Home() {
  return (
    <div className="flex items-start justify-center px-8 pb-8 pt-22">
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
