import { useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getStrategyConfig, getOptimizationData } from "@/data/trading.server";
import type { StrategyParams, OptimizationResult } from "@/lib/types/trading";
import { ParameterPanel, OptimizationChart } from "@/components/trading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoaderData {
  config: StrategyParams;
  initialResults: OptimizationResult[];
}

export const Route = createFileRoute("/trading/optimize")({
  component: OptimizationPage,
  loader: async (): Promise<LoaderData> => {
    const config = await getStrategyConfig();
    const { maDuration: _, ...baseParams } = config;
    const initialResults = await getOptimizationData({
      data: { baseParams, minPeriod: 5, maxPeriod: 200 },
    });
    return { config, initialResults };
  },
});

function OptimizationPage() {
  const { config, initialResults } = Route.useLoaderData();
  const [params, setParams] = useState<StrategyParams>(config);
  const [results, setResults] = useState<OptimizationResult[]>(initialResults);
  const [minPeriod, setMinPeriod] = useState(5);
  const [maxPeriod, setMaxPeriod] = useState(200);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleParamsChange = useCallback((newParams: StrategyParams) => {
    setParams(newParams);
  }, []);

  const handleOptimize = useCallback(async () => {
    setIsCalculating(true);
    try {
      const { maDuration: _, ...baseParams } = params;
      const newResults = await getOptimizationData({
        data: { baseParams, minPeriod, maxPeriod },
      });
      setResults(newResults);
    } finally {
      setIsCalculating(false);
    }
  }, [params, minPeriod, maxPeriod]);

  const bestSma = results.reduce((best, curr) =>
    curr.smaAnnualized > best.smaAnnualized ? curr : best
  );
  const bestEma = results.reduce((best, curr) =>
    curr.emaAnnualized > best.emaAnnualized ? curr : best
  );

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">MA Duration Optimization</h1>
        <Link to="/trading">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <ParameterPanel params={params} onParamsChange={handleParamsChange} />

          <Card>
            <CardHeader>
              <CardTitle>Optimization Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minPeriod">Min Period</Label>
                <Input
                  id="minPeriod"
                  type="number"
                  value={minPeriod}
                  onChange={(e) => setMinPeriod(Number(e.target.value))}
                  min={2}
                  max={maxPeriod - 1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPeriod">Max Period</Label>
                <Input
                  id="maxPeriod"
                  type="number"
                  value={maxPeriod}
                  onChange={(e) => setMaxPeriod(Number(e.target.value))}
                  min={minPeriod + 1}
                  max={500}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleOptimize}
            disabled={isCalculating}
            className="w-full"
          >
            {isCalculating ? "Optimizing..." : "Run Optimization"}
          </Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best SMA Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-bold">{bestSma.maDuration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annualized Return:</span>
                    <span className="font-bold text-green-600">
                      {(bestSma.smaAnnualized * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Drawdown:</span>
                    <span className="font-bold text-red-600">
                      {(bestSma.smaMaxDrawdown * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trade Count:</span>
                    <span className="font-bold">{bestSma.smaTrades}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best EMA Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-bold">{bestEma.maDuration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annualized Return:</span>
                    <span className="font-bold text-green-600">
                      {(bestEma.emaAnnualized * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Drawdown:</span>
                    <span className="font-bold text-red-600">
                      {(bestEma.emaMaxDrawdown * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trade Count:</span>
                    <span className="font-bold">{bestEma.emaTrades}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <OptimizationChart results={results} currentMaDuration={params.maDuration} />
        </div>
      </div>
    </div>
  );
}
