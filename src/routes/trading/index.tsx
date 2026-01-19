import { useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getPriceData, getStrategyConfig, calculateStrategy } from "@/data/trading.server";
import type { StrategyParams, StrategyResult, PricePoint } from "@/lib/types/trading";
import {
  ParameterPanel,
  StatsCards,
  ReturnsComparison,
  PriceChart,
} from "@/components/trading";
import { Button } from "@/components/ui/button";

interface LoaderData {
  priceData: PricePoint[];
  config: StrategyParams;
  initialResult: StrategyResult;
}

export const Route = createFileRoute("/trading/")({
  component: TradingDashboard,
  loader: async (): Promise<LoaderData> => {
    const [priceData, config] = await Promise.all([
      getPriceData(),
      getStrategyConfig(),
    ]);
    const initialResult = await calculateStrategy({ data: config });
    return { priceData, config, initialResult };
  },
});

function TradingDashboard() {
  const { config, initialResult } = Route.useLoaderData();
  const [params, setParams] = useState<StrategyParams>(config);
  const [result, setResult] = useState<StrategyResult>(initialResult);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleParamsChange = useCallback((newParams: StrategyParams) => {
    setParams(newParams);
  }, []);

  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    try {
      const newResult = await calculateStrategy({ data: params });
      setResult(newResult);
    } finally {
      setIsCalculating(false);
    }
  }, [params]);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">BTC Trading Strategy Analysis</h1>
        <Link to="/trading/optimize">
          <Button variant="outline">Optimization Analysis</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <ParameterPanel params={params} onParamsChange={handleParamsChange} />
          <Button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full"
          >
            {isCalculating ? "Calculating..." : "Calculate Strategy"}
          </Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <StatsCards result={result} />
          <ReturnsComparison result={result} initialCapital={params.initialCapital} />
          <PriceChart dataPoints={result.dataPoints} />
        </div>
      </div>
    </div>
  );
}
