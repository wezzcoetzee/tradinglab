import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import type { DataPointWithIndicators } from "@/lib/types/trading";

interface PriceChartProps {
  dataPoints: DataPointWithIndicators[];
}

const chartConfig = {
  price: {
    label: "BTC Price",
    color: "var(--chart-4)",
  },
  sma: {
    label: "SMA",
    color: "var(--chart-2)",
  },
  ema: {
    label: "EMA",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function PriceChart({ dataPoints }: PriceChartProps) {
  const [activeMA, setActiveMA] = useState<"sma" | "ema">("sma");
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    price: true,
    sma: true,
    ema: true,
  });

  const toggleLineVisibility = (dataKey: string) => {
    setVisibleLines((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const sampleRate = Math.max(1, Math.floor(dataPoints.length / 500));

  const chartData = dataPoints
    .filter((_, i) => i % sampleRate === 0)
    .map((point) => ({
      date: point.date.toISOString().split("T")[0],
      price: point.closePrice,
      sma: point.sma,
      ema: point.ema,
    }));

  const renderLegend = () => {
    const legendItems = [
      { key: "price", label: chartConfig.price.label, color: chartConfig.price.color },
      ...(activeMA === "sma"
        ? [{ key: "sma", label: chartConfig.sma.label, color: chartConfig.sma.color }]
        : [{ key: "ema", label: chartConfig.ema.label, color: chartConfig.ema.color }]),
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
        <CardTitle>BTC Price with Moving Averages</CardTitle>
        <RadioGroup
          value={activeMA}
          onValueChange={(value: "sma" | "ema") => setActiveMA(value)}
          className="flex flex-row gap-4 w-auto"
        >
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="sma" id="sma" />
            <Label htmlFor="sma" className="cursor-pointer">SMA</Label>
          </div>
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="ema" id="ema" />
            <Label htmlFor="ema" className="cursor-pointer">EMA</Label>
          </div>
        </RadioGroup>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              scale="log"
              domain={["auto", "auto"]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `$${(value as number).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                  ]}
                />
              }
            />
            <Legend content={renderLegend} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--color-price)"
              strokeWidth={2}
              dot={false}
              hide={!visibleLines.price}
            />
            {activeMA === "sma" && (
              <Line
                type="monotone"
                dataKey="sma"
                stroke="var(--color-sma)"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 5"
                hide={!visibleLines.sma}
              />
            )}
            {activeMA === "ema" && (
              <Line
                type="monotone"
                dataKey="ema"
                stroke="var(--color-ema)"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="3 3"
                hide={!visibleLines.ema}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
