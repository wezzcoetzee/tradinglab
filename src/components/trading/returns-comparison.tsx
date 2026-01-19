import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import type { StrategyResult } from "@/lib/types/trading";

interface ReturnsComparisonProps {
  result: StrategyResult;
  initialCapital: number;
}

const chartConfig = {
  hodl: {
    label: "HODL",
    color: "var(--chart-1)",
  },
  sma: {
    label: "SMA Strategy",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ReturnsComparison({ result, initialCapital }: ReturnsComparisonProps) {
  const [valueFormat, setValueFormat] = useState<"percent" | "dollar">("percent");
  const [useLogScale, setUseLogScale] = useState(false);
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    hodl: true,
    sma: true,
  });

  const toggleLineVisibility = (dataKey: string) => {
    setVisibleLines((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const sampleRate = Math.max(1, Math.floor(result.dataPoints.length / 500));

  const chartData = result.dataPoints
    .filter((_, i) => i % sampleRate === 0)
    .map((point, i) => {
      const actualIndex = i * sampleRate;
      return {
        date: point.date.toISOString().split("T")[0],
        hodl: result.hodlReturns[actualIndex],
        sma: result.smaReturns[actualIndex],
      };
    });

  const formatValue = (value: number) => {
    if (valueFormat === "dollar") {
      return `$${(initialCapital * value).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: "compact",
      } as Intl.NumberFormatOptions)}`;
    }
    const percentReturn = (value - 1) * 100;
    if (Math.abs(percentReturn) >= 1_000_000) {
      return `${(percentReturn / 1_000_000).toFixed(1)}M%`;
    }
    if (Math.abs(percentReturn) >= 1_000) {
      return `${(percentReturn / 1_000).toFixed(0)}K%`;
    }
    return `${percentReturn.toFixed(0)}%`;
  };

  const formatTooltipValue = (value: number) => {
    if (valueFormat === "dollar") {
      return `$${(initialCapital * value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    const percentReturn = (value - 1) * 100;
    return `${percentReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  };

  const renderLegend = () => {
    const legendItems = [
      { key: "hodl", label: chartConfig.hodl.label, color: chartConfig.hodl.color },
      { key: "sma", label: chartConfig.sma.label, color: chartConfig.sma.color },
    ];

    return (
      <div className="flex justify-center gap-4 mt-2">
        {legendItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => toggleLineVisibility(item.key)}
            className="flex items-center gap-1.5 text-sm cursor-pointer hover:opacity-80 transition-opacity"
            style={{ opacity: visibleLines[item.key] ? 1 : 0.4 }}
          >
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Returns Comparison</CardTitle>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="log-scale"
              checked={useLogScale}
              onCheckedChange={setUseLogScale}
            />
            <Label htmlFor="log-scale" className="cursor-pointer text-sm">Log</Label>
          </div>
          <RadioGroup
            value={valueFormat}
            onValueChange={(value: "percent" | "dollar") => setValueFormat(value)}
            className="flex flex-row gap-4 w-auto"
          >
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="percent" id="format-percent" />
              <Label htmlFor="format-percent" className="cursor-pointer">%</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="dollar" id="format-dollar" />
              <Label htmlFor="format-dollar" className="cursor-pointer">$</Label>
            </div>
          </RadioGroup>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 7)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatValue}
              scale={useLogScale ? "log" : "auto"}
              domain={useLogScale ? ["auto", "auto"] : undefined}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    formatTooltipValue(value as number),
                    chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                  ]}
                />
              }
            />
            <Legend content={renderLegend} />
            <Line
              type="monotone"
              dataKey="hodl"
              stroke="var(--color-hodl)"
              strokeWidth={2}
              dot={false}
              hide={!visibleLines.hodl}
            />
            <Line
              type="monotone"
              dataKey="sma"
              stroke="var(--color-sma)"
              strokeWidth={2}
              dot={false}
              hide={!visibleLines.sma}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
