import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import type { OptimizationResult } from "@/lib/types/trading";

interface OptimizationChartProps {
  results: OptimizationResult[];
  currentMaDuration?: number;
}

const chartConfig = {
  smaAnnualized: {
    label: "SMA Annualized",
    color: "var(--chart-2)",
  },
  hodlAnnualized: {
    label: "HODL Baseline",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function OptimizationChart({ results, currentMaDuration }: OptimizationChartProps) {
  const chartData = results.map((r) => ({
    maDuration: r.maDuration,
    smaAnnualized: r.smaAnnualized * 100,
    hodlAnnualized: r.hodlAnnualized * 100,
  }));

  const bestSma = results.reduce((best, curr) =>
    curr.smaAnnualized > best.smaAnnualized ? curr : best
  );

  const hodlAnnualizedPct = results.length > 0 ? results[0].hodlAnnualized * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>MA Duration Optimization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="rounded-lg bg-muted p-3">
            <div className="text-muted-foreground">Best SMA Period</div>
            <div className="text-xl font-bold">
              {bestSma.maDuration} days ({(bestSma.smaAnnualized * 100).toFixed(1)}%)
            </div>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="maDuration"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{ value: "MA Duration (days)", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              label={{ value: "Annualized Return", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `${(value as number).toFixed(2)}%`,
                    chartConfig[name as keyof typeof chartConfig]?.label ?? name,
                  ]}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {currentMaDuration && (
              <ReferenceLine
                x={currentMaDuration}
                stroke="var(--chart-5)"
                strokeDasharray="3 3"
                label={{ value: "Current", position: "top" }}
              />
            )}
            <ReferenceLine
              y={hodlAnnualizedPct}
              stroke="var(--color-hodlAnnualized)"
              strokeDasharray="5 5"
              label={{ value: `HODL ${hodlAnnualizedPct.toFixed(0)}%`, position: "right" }}
            />
            <Line
              type="monotone"
              dataKey="smaAnnualized"
              stroke="var(--color-smaAnnualized)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
