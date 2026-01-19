import { useState, useCallback, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getStrategyConfig, getOptimizationData, saveOptimizationResult, calculateStrategy } from "@/data/trading.server";
import type { StrategyParams, OptimizationResult, StrategyResult } from "@/lib/types/trading";
import { ParameterPanel, OptimizationChart, DataTable } from "@/components/trading";
import { computeRunningDrawdowns } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoaderData {
  config: StrategyParams;
  initialResults: OptimizationResult[];
  initialStrategyResult: StrategyResult;
}

export const Route = createFileRoute("/trading/optimize")({
  component: OptimizationPage,
  loader: async (): Promise<LoaderData> => {
    const config = await getStrategyConfig();
    const { maDuration: _, ...baseParams } = config;
    const [initialResults, initialStrategyResult] = await Promise.all([
      getOptimizationData({
        data: { baseParams, minPeriod: 5, maxPeriod: 200 },
      }),
      calculateStrategy({ data: config }),
    ]);
    return { config, initialResults, initialStrategyResult };
  },
});

function OptimizationPage() {
  const { config, initialResults, initialStrategyResult } = Route.useLoaderData();
  const [params, setParams] = useState<StrategyParams>(config);
  const [results, setResults] = useState<OptimizationResult[]>(initialResults);
  const [strategyResult, setStrategyResult] = useState<StrategyResult>(initialStrategyResult);
  const [minPeriod, setMinPeriod] = useState(1);
  const [maxPeriod, setMaxPeriod] = useState(200);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    calculateStrategy({ data: params }).then(setStrategyResult);
  }, [params]);

  const { hodlDrawdowns, smaDrawdowns } = useMemo(() => ({
    hodlDrawdowns: computeRunningDrawdowns(strategyResult.hodlReturns),
    smaDrawdowns: computeRunningDrawdowns(strategyResult.smaReturns),
  }), [strategyResult]);

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

  const handleSaveBest = useCallback(async () => {
    if (!saveName.trim()) return;
    setIsSaving(true);
    try {
      const { maDuration: _, ...baseParams } = params;
      await saveOptimizationResult({
        data: {
          name: saveName.trim(),
          bestSmaPeriod: bestSma.maDuration,
          smaAnnualized: bestSma.smaAnnualized,
          smaMaxDrawdown: bestSma.smaMaxDrawdown,
          params: baseParams,
        },
      });
      setSaveName("");
    } finally {
      setIsSaving(false);
    }
  }, [saveName, params, bestSma]);

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
                  min={1}
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
                  max={200}
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

          <Card>
            <CardHeader>
              <CardTitle>Save Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="saveName">Name</Label>
                <Input
                  id="saveName"
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g., Bull Market Config"
                />
              </div>
              <Button
                onClick={handleSaveBest}
                disabled={isSaving || !saveName.trim()}
                className="w-full"
                variant="secondary"
              >
                {isSaving ? "Saving..." : "Save Best Results"}
              </Button>
            </CardContent>
          </Card>
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
          </div>

          <OptimizationChart results={results} currentMaDuration={params.maDuration} />

          <DataTable
            dataPoints={strategyResult.dataPoints}
            hodlReturns={strategyResult.hodlReturns}
            smaReturns={strategyResult.smaReturns}
            hodlDrawdowns={hodlDrawdowns}
            smaDrawdowns={smaDrawdowns}
            initialCapital={params.initialCapital}
          />
        </div>
      </div>
    </div>
  );
}
