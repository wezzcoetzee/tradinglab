import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DataPointWithIndicators } from "@/lib/types/trading";

interface DataTableProps {
  dataPoints: DataPointWithIndicators[];
  hodlReturns: number[];
  smaReturns: number[];
  hodlDrawdowns: number[];
  smaDrawdowns: number[];
  initialCapital: number;
}

const ROWS_PER_PAGE = 100;

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatPrice(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function DataTable({
  dataPoints,
  hodlReturns,
  smaReturns,
  hodlDrawdowns,
  smaDrawdowns,
  initialCapital,
}: DataTableProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(dataPoints.length / ROWS_PER_PAGE);
  const startIndex = page * ROWS_PER_PAGE;
  const endIndex = Math.min(startIndex + ROWS_PER_PAGE, dataPoints.length);

  const pageData = useMemo(() => {
    return dataPoints.slice(startIndex, endIndex).map((point, i) => {
      const idx = startIndex + i;
      return {
        date: formatDate(point.date),
        closePrice: point.closePrice,
        sma: point.sma,
        longSma: point.smaSignal === "long" ? 1 : 0,
        hodlDollars: hodlReturns[idx] * initialCapital,
        smaDollars: smaReturns[idx] * initialCapital,
        smaMaxDD: smaDrawdowns[idx],
        hodlMaxDD: hodlDrawdowns[idx],
      };
    });
  }, [dataPoints, startIndex, endIndex, hodlReturns, smaReturns, hodlDrawdowns, smaDrawdowns, initialCapital]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-2 text-left font-medium">Date</th>
                <th className="px-2 py-2 text-right font-medium">Close Price</th>
                <th className="px-2 py-2 text-right font-medium">SMA</th>
                <th className="px-2 py-2 text-center font-medium">Trade Direction</th>
                <th className="px-2 py-2 text-right font-medium">HODL ($)</th>
                <th className="px-2 py-2 text-right font-medium">SMA Trading ($)</th>
                <th className="px-2 py-2 text-right font-medium">Max DD SMA (%)</th>
                <th className="px-2 py-2 text-right font-medium">Max DD HODL (%)</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, i) => (
                <tr key={startIndex + i} className="border-b hover:bg-muted/50">
                  <td className="px-2 py-1.5 font-mono">{row.date}</td>
                  <td className="px-2 py-1.5 text-right font-mono">
                    {formatPrice(row.closePrice)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono">
                    {row.sma !== undefined ? formatPrice(row.sma) : "-"}
                  </td>
                  <td className="px-2 py-1.5 text-center">{row.longSma ? "LONG" : "SHORT"}</td>
                  <td className="px-2 py-1.5 text-right font-mono">
                    {formatPrice(row.hodlDollars)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono">
                    {formatPrice(row.smaDollars)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-red-600">
                    {formatPercent(row.smaMaxDD)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-red-600">
                    {formatPercent(row.hodlMaxDD)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{endIndex} of {dataPoints.length} rows
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
