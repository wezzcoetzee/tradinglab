"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
      <form onSubmit={handleSubmit} className="px-6 py-4">
        <div className="flex items-end gap-8 flex-wrap">
          {/* Capital & Fees Group */}
          <div className="flex items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="initialCapital" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Capital
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">$</span>
                <Input
                  id="initialCapital"
                  type="number"
                  min={1}
                  step={1}
                  value={formData.initialCapital}
                  onChange={(e) =>
                    updateField("initialCapital", parseFloat(e.target.value) || 0)
                  }
                  className="w-28 h-9 pl-6 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm focus:border-amber-500/50 focus:ring-amber-500/20"
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
                  className="w-24 h-9 pr-6 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gasFeePerTrade" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                Gas
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">$</span>
                <Input
                  id="gasFeePerTrade"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.gasFeePerTrade}
                  onChange={(e) =>
                    updateField("gasFeePerTrade", parseFloat(e.target.value) || 0)
                  }
                  className="w-24 h-9 pl-6 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </div>

          <div className="w-px h-9 bg-zinc-800" />

          {/* SMA Range Group */}
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
                className="w-20 h-9 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm text-center focus:border-amber-500/50 focus:ring-amber-500/20"
              />
              <span className="text-zinc-600 text-sm">→</span>
              <Input
                type="number"
                min={2}
                max={200}
                value={formData.smaMax}
                onChange={(e) =>
                  updateField("smaMax", parseInt(e.target.value) || 200)
                }
                className="w-20 h-9 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm text-center focus:border-amber-500/50 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="w-px h-9 bg-zinc-800" />

          {/* Trading Mode Group */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
              Signals
            </Label>
            <div className="flex items-center gap-4 h-9">
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

          <div className="w-px h-9 bg-zinc-800" />

          {/* Leverage Group */}
          <div className="flex items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="longLeverage" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                {formData.sameLeverage ? "Leverage" : "Long Lev"}
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
                  className="w-20 h-9 pr-5 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">×</span>
              </div>
            </div>

            {!formData.sameLeverage && (
              <div className="space-y-1.5">
                <Label htmlFor="shortLeverage" className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                  Short Lev
                </Label>
                <div className="relative">
                  <Input
                    id="shortLeverage"
                    type="number"
                    min={1}
                    max={100}
                    step={0.25}
                    value={formData.shortLeverage}
                    onChange={(e) =>
                      updateField("shortLeverage", parseFloat(e.target.value) || 1)
                    }
                    className="w-20 h-9 pr-5 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm focus:border-amber-500/50 focus:ring-amber-500/20"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">×</span>
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 h-9 cursor-pointer">
              <Checkbox
                id="sameLeverage"
                checked={formData.sameLeverage}
                onCheckedChange={(checked) =>
                  updateField("sameLeverage", checked === true)
                }
                className="border-zinc-700 data-[state=checked]:bg-zinc-600 data-[state=checked]:border-zinc-600"
              />
              <span className="text-xs text-zinc-500">Same</span>
            </label>
          </div>

          <div className="w-px h-9 bg-zinc-800" />

          {/* ATR Trailing Stop Group */}
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 h-9 cursor-pointer">
              <Checkbox
                id="trailingStopEnabled"
                checked={formData.trailingStopEnabled}
                onCheckedChange={(checked) =>
                  updateField("trailingStopEnabled", checked === true)
                }
                className="border-zinc-700 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
              />
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">ATR Stop</span>
            </label>

            {formData.trailingStopEnabled && (
              <>
                <div className="space-y-1.5">
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
                    onChange={(e) =>
                      updateField("atrPeriod", parseInt(e.target.value) || 14)
                    }
                    className="w-20 h-9 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm text-center focus:border-amber-500/50 focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-1.5">
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
                      onChange={(e) =>
                        updateField("atrMultiplier", parseFloat(e.target.value) || 2.5)
                      }
                      className="w-20 h-9 pr-5 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm focus:border-amber-500/50 focus:ring-amber-500/20"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">k</span>
                  </div>
                </div>

                <div className="space-y-1.5">
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
                      onChange={(e) =>
                        updateField("partialClosePercent", parseInt(e.target.value) || 100)
                      }
                      className="w-20 h-9 pr-6 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm focus:border-amber-500/50 focus:ring-amber-500/20"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">%</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-9 px-6 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm tracking-wide transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
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
