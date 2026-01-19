import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import type { DataPointWithIndicators } from "@/lib/types/trading";

interface PriceChartProps {
  dataPoints: DataPointWithIndicators[];
}

const chartConfig = {
  price: {
    label: "BTC Price",
    color: "#F7931A",
  },
  sma: {
    label: "SMA",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function PriceChart({ dataPoints }: PriceChartProps) {
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    price: true,
    sma: true,
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
    }));

  const renderLegend = () => {
    const legendItems = [
      { key: "price", label: chartConfig.price.label, color: chartConfig.price.color },
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
      <CardHeader>
        <CardTitle>BTC Price with SMA</CardTitle>
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
            <Line
              type="monotone"
              dataKey="sma"
              stroke="var(--color-sma)"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="5 5"
              hide={!visibleLines.sma}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
