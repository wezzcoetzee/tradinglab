import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { StrategyParams } from "@/lib/types/trading";

interface ParameterPanelProps {
  params: StrategyParams;
  onParamsChange: (params: StrategyParams) => void;
  dateRange?: { minTimestamp: number; maxTimestamp: number };
}

function timestampToDateString(timestamp: number | undefined): string {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toISOString().split("T")[0];
}

function dateStringToTimestamp(dateStr: string): number | undefined {
  if (!dateStr) return undefined;
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

export function ParameterPanel({ params, onParamsChange, dateRange }: ParameterPanelProps) {
  const updateParam = <K extends keyof StrategyParams>(
    key: K,
    value: StrategyParams[K]
  ) => {
    onParamsChange({ ...params, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {dateRange && (
          <div className="space-y-2">
            <Label htmlFor="simulationStartDate">Simulation Start Date</Label>
            <Input
              id="simulationStartDate"
              type="date"
              value={timestampToDateString(params.simulationStartDate)}
              onChange={(e) => updateParam("simulationStartDate", dateStringToTimestamp(e.target.value))}
              min={timestampToDateString(dateRange.minTimestamp)}
              max={timestampToDateString(dateRange.maxTimestamp)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use all data
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="maDuration">MA Duration</Label>
            <span className="text-sm text-muted-foreground">{params.maDuration}</span>
          </div>
          <Slider
            id="maDuration"
            value={[params.maDuration]}
            onValueChange={([value]) => updateParam("maDuration", value)}
            min={5}
            max={200}
            step={1}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="buyOnLongSignal">Buy on Long Signal</Label>
          <Switch
            id="buyOnLongSignal"
            checked={params.buyOnLongSignal}
            onCheckedChange={(checked) => updateParam("buyOnLongSignal", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="shortOnShort">Short on Short Signal</Label>
          <Switch
            id="shortOnShort"
            checked={params.shortOnShort}
            onCheckedChange={(checked) => updateParam("shortOnShort", checked)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="longLeverage">Long Leverage</Label>
            <span className="text-sm text-muted-foreground">{params.longLeverage}x</span>
          </div>
          <Slider
            id="longLeverage"
            value={[params.longLeverage]}
            onValueChange={([value]) => updateParam("longLeverage", value)}
            min={1}
            max={5}
            step={0.25}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="shortLeverage">Short Leverage</Label>
            <span className="text-sm text-muted-foreground">{params.shortLeverage}x</span>
          </div>
          <Slider
            id="shortLeverage"
            value={[params.shortLeverage]}
            onValueChange={([value]) => updateParam("shortLeverage", value)}
            min={1}
            max={5}
            step={0.25}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="initialCapital">Initial Capital ($)</Label>
          <Input
            id="initialCapital"
            type="number"
            value={params.initialCapital}
            onChange={(e) => updateParam("initialCapital", Number(e.target.value))}
            min={0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gasFeePerTrade">Gas Fee per Trade ($)</Label>
          <Input
            id="gasFeePerTrade"
            type="number"
            value={params.gasFeePerTrade}
            onChange={(e) => updateParam("gasFeePerTrade", Number(e.target.value))}
            min={0}
            step={0.01}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exchangeFee">Exchange Fee (%)</Label>
          <Input
            id="exchangeFee"
            type="number"
            value={params.exchangeFee * 100}
            onChange={(e) => updateParam("exchangeFee", Number(e.target.value) / 100)}
            min={0}
            step={0.01}
          />
        </div>
      </CardContent>
    </Card>
  );
}
