"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface BacktestFormData {
  initialCapital: number;
  exchangeFeePercent: number;
  gasFeePerTrade: number;
  smaMin: number;
  smaMax: number;
  buyOnLong: boolean;
  shortOnShort: boolean;
  sameLeverage: boolean;
  longLeverage: number;
  shortLeverage: number;
  trailingStopEnabled: boolean;
  atrPeriod: number;
  atrMultiplier: number;
  partialClosePercent: number;
}

interface BacktestFormProps {
  onSubmit: (data: BacktestFormData) => void;
  isLoading: boolean;
  defaultValues?: Partial<BacktestFormData>;
}

export function BacktestForm({
  onSubmit,
  isLoading,
  defaultValues,
}: BacktestFormProps) {
  const [formData, setFormData] = useState<BacktestFormData>({
    initialCapital: defaultValues?.initialCapital ?? 1000,
    exchangeFeePercent: defaultValues?.exchangeFeePercent ?? 0.05,
    gasFeePerTrade: defaultValues?.gasFeePerTrade ?? 0,
    smaMin: defaultValues?.smaMin ?? 2,
    smaMax: defaultValues?.smaMax ?? 200,
    buyOnLong: defaultValues?.buyOnLong ?? true,
    shortOnShort: defaultValues?.shortOnShort ?? true,
    sameLeverage: defaultValues?.sameLeverage ?? true,
    longLeverage: defaultValues?.longLeverage ?? 1,
    shortLeverage: defaultValues?.shortLeverage ?? 1,
    trailingStopEnabled: defaultValues?.trailingStopEnabled ?? false,
    atrPeriod: defaultValues?.atrPeriod ?? 14,
    atrMultiplier: defaultValues?.atrMultiplier ?? 2.5,
    partialClosePercent: defaultValues?.partialClosePercent ?? 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = <K extends keyof BacktestFormData>(
    field: K,
    value: BacktestFormData[K]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "sameLeverage" && value === true) {
        updated.shortLeverage = updated.longLeverage;
      }
      if (field === "longLeverage" && prev.sameLeverage) {
        updated.shortLeverage = value as number;
      }
      return updated;
    });
  };

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800">
      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
        {/* 3 Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4">
          {/* Section 1: Required Data */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
            <div className="space-y-1.5">
              <Label htmlFor="initialCapital" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Capital
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">$</span>
                <Input
                  id="initialCapital"
                  type="number"
                  min={1}
                  step={1}
                  value={formData.initialCapital}
                  onChange={(e) =>
                    updateField("initialCapital", parseFloat(e.target.value) || 0)
                  }
                  className="w-full h-10 pl-7 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exchangeFeePercent" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Fee
              </Label>
              <div className="relative">
                <Input
                  id="exchangeFeePercent"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.exchangeFeePercent}
                  onChange={(e) =>
                    updateField("exchangeFeePercent", parseFloat(e.target.value) || 0)
                  }
                  className="w-full h-10 pr-7 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gasFeePerTrade" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Gas
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">$</span>
                <Input
                  id="gasFeePerTrade"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.gasFeePerTrade}
                  onChange={(e) =>
                    updateField("gasFeePerTrade", parseFloat(e.target.value) || 0)
                  }
                  className="w-full h-10 pl-7 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                SMA Range
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={2}
                  max={200}
                  value={formData.smaMin}
                  onChange={(e) =>
                    updateField("smaMin", parseInt(e.target.value) || 2)
                  }
                  className="w-full h-10 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-center focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                <span className="text-zinc-600 shrink-0">→</span>
                <Input
                  type="number"
                  min={2}
                  max={200}
                  value={formData.smaMax}
                  onChange={(e) =>
                    updateField("smaMax", parseInt(e.target.value) || 200)
                  }
                  className="w-full h-10 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-center focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1 md:col-span-2">
              <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Signals
              </Label>
              <div className="flex items-center gap-6 h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id="buyOnLong"
                    checked={formData.buyOnLong}
                    onCheckedChange={(checked) =>
                      updateField("buyOnLong", checked === true)
                    }
                    className="border-zinc-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <span className="text-sm text-zinc-300">Long</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id="shortOnShort"
                    checked={formData.shortOnShort}
                    onCheckedChange={(checked) =>
                      updateField("shortOnShort", checked === true)
                    }
                    className="border-zinc-700 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                  />
                  <span className="text-sm text-zinc-300">Short</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Leverage */}
          <div className="relative flex items-end gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 rounded hover:bg-zinc-800 transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-zinc-900 border-zinc-700 text-zinc-300" side="bottom" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-zinc-100">Leverage Settings</h4>
                  <p className="text-sm">
                    Configure the leverage multiplier for your long and short positions.
                  </p>
                  <ul className="text-sm space-y-1 text-zinc-400">
                    <li><span className="text-emerald-400">Long</span>: Multiplier when price is above SMA (bullish)</li>
                    <li><span className="text-rose-400">Short</span>: Multiplier when price is below SMA (bearish)</li>
                    <li><span className="text-amber-400">Same</span>: Use identical leverage for both directions</li>
                  </ul>
                  <p className="text-xs text-zinc-500 pt-1">
                    Higher leverage amplifies both gains and losses. Use with caution.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
            <div className="space-y-1.5 w-24">
              <Label htmlFor="longLeverage" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Long
              </Label>
              <div className="relative">
                <Input
                  id="longLeverage"
                  type="number"
                  min={1}
                  max={100}
                  step={0.25}
                  value={formData.longLeverage}
                  onChange={(e) =>
                    updateField("longLeverage", parseFloat(e.target.value) || 1)
                  }
                  className="w-full h-10 pr-6 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">×</span>
              </div>
            </div>

            <div className="space-y-1.5 w-24">
              <Label htmlFor="shortLeverage" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Short
              </Label>
              <div className="relative">
                <Input
                  id="shortLeverage"
                  type="number"
                  min={1}
                  max={100}
                  step={0.25}
                  value={formData.shortLeverage}
                  disabled={formData.sameLeverage}
                  onChange={(e) =>
                    updateField("shortLeverage", parseFloat(e.target.value) || 1)
                  }
                  className="w-full h-10 pr-6 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono focus:border-amber-500/50 focus:ring-amber-500/20 disabled:opacity-50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">×</span>
              </div>
            </div>

            <div className="flex items-center gap-2 h-10">
              <Switch
                id="sameLeverage"
                checked={formData.sameLeverage}
                onCheckedChange={(checked) =>
                  updateField("sameLeverage", checked)
                }
                className="data-[state=checked]:bg-amber-500"
              />
              <Label htmlFor="sameLeverage" className="text-xs text-zinc-500 cursor-pointer whitespace-nowrap">
                Same
              </Label>
            </div>
          </div>

          {/* Section 3: ATR Stop Loss */}
          <div className="relative flex items-end gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 rounded hover:bg-zinc-800 transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-zinc-900 border-zinc-700 text-zinc-300" side="bottom" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-zinc-100">ATR Trailing Stop</h4>
                  <p className="text-sm">
                    A dynamic stop-loss based on Average True Range (ATR) that trails the price as it moves in your favor.
                  </p>
                  <ul className="text-sm space-y-1 text-zinc-400">
                    <li><span className="text-zinc-300">Period</span>: Number of days to calculate ATR (volatility measure)</li>
                    <li><span className="text-zinc-300">Multiplier</span>: ATR × multiplier = stop distance from peak</li>
                    <li><span className="text-zinc-300">Close %</span>: Portion of position to close when stop is hit</li>
                  </ul>
                  <p className="text-xs text-zinc-500 pt-1">
                    Higher multiplier = wider stop (fewer triggers, larger losses). Lower = tighter stop (more triggers, smaller losses).
                  </p>
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2 h-10">
              <Switch
                id="trailingStopEnabled"
                checked={formData.trailingStopEnabled}
                onCheckedChange={(checked) =>
                  updateField("trailingStopEnabled", checked)
                }
                className="data-[state=checked]:bg-amber-500"
              />
              <Label htmlFor="trailingStopEnabled" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium cursor-pointer whitespace-nowrap">
                ATR Stop
              </Label>
            </div>

            <div className="space-y-1.5 w-20">
              <Label htmlFor="atrPeriod" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Period
              </Label>
              <Input
                id="atrPeriod"
                type="number"
                min={5}
                max={50}
                step={1}
                value={formData.atrPeriod}
                disabled={!formData.trailingStopEnabled}
                onChange={(e) =>
                  updateField("atrPeriod", parseInt(e.target.value) || 14)
                }
                className="w-full h-10 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-center focus:border-amber-500/50 focus:ring-amber-500/20 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5 w-20">
              <Label htmlFor="atrMultiplier" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Mult
              </Label>
              <div className="relative">
                <Input
                  id="atrMultiplier"
                  type="number"
                  min={1.0}
                  max={10.0}
                  step={0.1}
                  value={formData.atrMultiplier}
                  disabled={!formData.trailingStopEnabled}
                  onChange={(e) =>
                    updateField("atrMultiplier", parseFloat(e.target.value) || 2.5)
                  }
                  className="w-full h-10 pr-6 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono focus:border-amber-500/50 focus:ring-amber-500/20 disabled:opacity-50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">×</span>
              </div>
            </div>

            <div className="space-y-1.5 w-20">
              <Label htmlFor="partialClosePercent" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Close
              </Label>
              <div className="relative">
                <Input
                  id="partialClosePercent"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={formData.partialClosePercent}
                  disabled={!formData.trailingStopEnabled}
                  onChange={(e) =>
                    updateField("partialClosePercent", parseInt(e.target.value) || 100)
                  }
                  className="w-full h-10 pr-7 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono focus:border-amber-500/50 focus:ring-amber-500/20 disabled:opacity-50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button - Right Aligned */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 px-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold tracking-wide transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                Running...
              </span>
            ) : (
              "Run Backtest"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
