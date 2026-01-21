"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { DailyData } from "@/lib/backtest";
import { formatDate, formatPrice } from "@/lib/formatting";

interface DataTableVirtualizedProps {
  data: DailyData[];
  smaPeriod: number;
}

function formatMa(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function DataTableVirtualized({ data, smaPeriod }: DataTableVirtualizedProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 20,
  });

  const columns = [
    { key: "day", label: "Day", width: "w-16" },
    { key: "date", label: "Date", width: "w-28" },
    { key: "close", label: "Close", width: "w-28" },
    { key: "sma", label: `SMA(${smaPeriod})`, width: "w-28" },
    { key: "smaSignal", label: "Signal", width: "w-20" },
    { key: "hodl", label: "HODL", width: "w-28" },
    { key: "smaBalance", label: "SMA Bal", width: "w-28" },
  ];

  return (
    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800/50">
      <div className="px-4 py-3 border-b border-zinc-800/50">
        <h3 className="text-sm font-medium text-zinc-300">
          Daily Data — SMA Period: {smaPeriod}
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          {data.length.toLocaleString()} rows
        </p>
      </div>

      <div className="border-b border-zinc-800/50">
        <div className="flex text-zinc-500 text-xs uppercase tracking-wider bg-zinc-900">
          {columns.map((col) => (
            <div
              key={col.key}
              className={`${col.width} px-3 py-2.5 font-medium shrink-0`}
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>

      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: "500px" }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = data[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`flex items-center text-sm ${
                  virtualRow.index % 2 === 0 ? "bg-zinc-900/30" : ""
                } hover:bg-zinc-800/30`}
              >
                <div className="w-16 px-3 text-zinc-400 font-mono shrink-0">
                  {row.day}
                </div>
                <div className="w-28 px-3 text-zinc-300 shrink-0">
                  {formatDate(row.date)}
                </div>
                <div className="w-28 px-3 text-zinc-100 font-mono shrink-0">
                  {formatPrice(row.closePrice)}
                </div>
                <div className="w-28 px-3 text-zinc-400 font-mono shrink-0">
                  {formatMa(row.sma)}
                </div>
                <div className="w-20 px-3 shrink-0">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium ${
                      row.smaSignal === 1
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {row.smaSignal}
                  </span>
                </div>
                <div className="w-28 px-3 text-zinc-300 font-mono shrink-0">
                  {formatPrice(row.hodlValue)}
                </div>
                <div className="w-28 px-3 font-mono shrink-0">
                  <span
                    className={
                      row.smaBalance >= row.hodlValue
                        ? "text-emerald-400"
                        : "text-zinc-300"
                    }
                  >
                    {formatPrice(row.smaBalance)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
