"use client";

import { useState } from "react";
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
  optimizeLeverage: boolean;
}

interface BacktestFormProps {
  onSubmit: (data: BacktestFormData) => void;
  defaultValues?: Partial<BacktestFormData>;
}

export function BacktestForm({
  onSubmit,
  defaultValues,
}: BacktestFormProps) {
  const [formData, setFormData] = useState<BacktestFormData>({
    initialCapital: defaultValues?.initialCapital ?? 1000,
    exchangeFeePercent: defaultValues?.exchangeFeePercent ?? 0,
    gasFeePerTrade: defaultValues?.gasFeePerTrade ?? 0,
    smaMin: defaultValues?.smaMin ?? 2,
    smaMax: defaultValues?.smaMax ?? 200,
    buyOnLong: defaultValues?.buyOnLong ?? true,
    shortOnShort: defaultValues?.shortOnShort ?? false,
    optimizeLeverage: defaultValues?.optimizeLeverage ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = <K extends keyof BacktestFormData>(
    field: K,
    value: BacktestFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800">
      <form id="backtest-form" onSubmit={handleSubmit} className="px-6 py-4">
        <div className="flex flex-wrap items-end gap-4">
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
                className="w-28 h-10 pl-7 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono focus:border-amber-500/50 focus:ring-amber-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                className="w-20 h-10 pr-7 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono focus:border-amber-500/50 focus:ring-amber-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                className="w-20 h-10 pl-7 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono focus:border-amber-500/50 focus:ring-amber-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
              MA Range
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
                className="w-16 h-10 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-center focus:border-amber-500/50 focus:ring-amber-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                className="w-16 h-10 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-center focus:border-amber-500/50 focus:ring-amber-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
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

          <div className="h-8 w-px bg-zinc-800 mx-2" />

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
              Optimize
            </Label>
            <div className="flex items-center h-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="optimizeLeverage"
                  checked={formData.optimizeLeverage}
                  onCheckedChange={(checked) =>
                    updateField("optimizeLeverage", checked === true)
                  }
                  className="border-zinc-700 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <span className="text-sm text-zinc-300">Leverage</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
