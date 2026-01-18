import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import type { StrategyResult } from "@/lib/types/trading";

interface ReturnsComparisonProps {
  result: StrategyResult;
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
  ema: {
    label: "EMA Strategy",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function ReturnsComparison({ result }: ReturnsComparisonProps) {
  const sampleRate = Math.max(1, Math.floor(result.dataPoints.length / 500));

  const chartData = result.dataPoints
    .filter((_, i) => i % sampleRate === 0)
    .map((point, i) => {
      const actualIndex = i * sampleRate;
      return {
        date: point.date.toISOString().split("T")[0],
        hodl: result.hodlReturns[actualIndex],
        sma: result.smaReturns[actualIndex],
        ema: result.emaReturns[actualIndex],
      };
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Returns Comparison</CardTitle>
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
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `${((value as number) * 100).toFixed(2)}%`,
                    chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                  ]}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="hodl"
              stroke="var(--color-hodl)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="sma"
              stroke="var(--color-sma)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ema"
              stroke="var(--color-ema)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
