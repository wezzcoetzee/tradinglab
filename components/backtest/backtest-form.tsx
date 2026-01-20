"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Backtest Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialCapital">Initial Capital (USD)</Label>
              <Input
                id="initialCapital"
                type="number"
                min={1}
                step={1}
                value={formData.initialCapital}
                onChange={(e) =>
                  updateField("initialCapital", parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exchangeFeePercent">Exchange Fee (%)</Label>
              <Input
                id="exchangeFeePercent"
                type="number"
                min={0}
                step={0.01}
                value={formData.exchangeFeePercent}
                onChange={(e) =>
                  updateField(
                    "exchangeFeePercent",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gasFeePerTrade">Gas Fee / Trade (USD)</Label>
              <Input
                id="gasFeePerTrade"
                type="number"
                min={0}
                step={0.01}
                value={formData.gasFeePerTrade}
                onChange={(e) =>
                  updateField("gasFeePerTrade", parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>SMA Range</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min={2}
                  max={200}
                  value={formData.smaMin}
                  onChange={(e) =>
                    updateField("smaMin", parseInt(e.target.value) || 2)
                  }
                  className="w-20"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  min={2}
                  max={200}
                  value={formData.smaMax}
                  onChange={(e) =>
                    updateField("smaMax", parseInt(e.target.value) || 200)
                  }
                  className="w-20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="buyOnLong"
                checked={formData.buyOnLong}
                onCheckedChange={(checked) =>
                  updateField("buyOnLong", checked === true)
                }
              />
              <Label htmlFor="buyOnLong">Buy on Long Signal</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="shortOnShort"
                checked={formData.shortOnShort}
                onCheckedChange={(checked) =>
                  updateField("shortOnShort", checked === true)
                }
              />
              <Label htmlFor="shortOnShort">Short on Short Signal</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="sameLeverage"
                checked={formData.sameLeverage}
                onCheckedChange={(checked) =>
                  updateField("sameLeverage", checked === true)
                }
              />
              <Label htmlFor="sameLeverage">Same Leverage for Long/Short</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="longLeverage">
                  {formData.sameLeverage ? "Leverage" : "Long Leverage"}
                </Label>
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
                />
              </div>

              {!formData.sameLeverage && (
                <div className="space-y-2">
                  <Label htmlFor="shortLeverage">Short Leverage</Label>
                  <Input
                    id="shortLeverage"
                    type="number"
                    min={1}
                    max={100}
                    step={0.25}
                    value={formData.shortLeverage}
                    onChange={(e) =>
                      updateField(
                        "shortLeverage",
                        parseFloat(e.target.value) || 1
                      )
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Running Backtest..." : "Run Backtest"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
