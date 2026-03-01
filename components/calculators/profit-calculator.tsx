"use client";

import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TrendingUp, Calculator, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { ResultCard } from "@/components/calculators/result-card";
import {
  calculateProfitMetrics,
  validateTradingParameters,
  formatCurrency,
  formatPercentage,
  safeParseFloat,
  type ProfitCalculationResult,
} from "@/lib/calculations";

const defaultFormValues = {
  tradeType: "LONG" as const,
  entry: "",
  leverage: "",
  stopLoss: "",
  positionSize: "",
  tp1: "",
  tp2: "",
  tp3: "",
  tp4: "",
};

const profitCalculatorSchema = z
  .object({
    tradeType: z.enum(["LONG", "SHORT"]),
    entry: z
      .string()
      .min(1, "Entry price is required")
      .refine((val) => !isNaN(safeParseFloat(val)), "Must be a valid number")
      .refine((val) => safeParseFloat(val) > 0, "Entry price must be greater than 0")
      .refine((val) => safeParseFloat(val) < 1000000, "Entry price too large"),
    leverage: z
      .string()
      .min(1, "Leverage is required")
      .refine((val) => !isNaN(safeParseFloat(val)), "Must be a valid number")
      .refine((val) => safeParseFloat(val) >= 1, "Leverage must be at least 1x")
      .refine((val) => safeParseFloat(val) <= 100, "Leverage cannot exceed 100x"),
    stopLoss: z
      .string()
      .min(1, "Stop loss is required")
      .refine((val) => !isNaN(safeParseFloat(val)), "Must be a valid number")
      .refine((val) => safeParseFloat(val) > 0, "Stop loss must be greater than 0")
      .refine((val) => safeParseFloat(val) < 1000000, "Stop loss price too large"),
    positionSize: z
      .string()
      .min(1, "Position size is required")
      .refine((val) => !isNaN(safeParseFloat(val)), "Must be a valid number")
      .refine((val) => safeParseFloat(val) > 0, "Position size must be greater than 0")
      .refine((val) => safeParseFloat(val) < 10000000, "Position size too large"),
    tp1: z
      .string()
      .min(1, "Take profit 1 is required")
      .refine((val) => !isNaN(safeParseFloat(val)), "Must be a valid number")
      .refine((val) => safeParseFloat(val) > 0, "Take profit 1 must be greater than 0")
      .refine((val) => safeParseFloat(val) < 1000000, "Take profit 1 price too large"),
    tp2: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(safeParseFloat(val)), "Must be a valid number")
      .refine((val) => !val || safeParseFloat(val) > 0, "Must be greater than 0"),
    tp3: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(safeParseFloat(val)), "Must be a valid number")
      .refine((val) => !val || safeParseFloat(val) > 0, "Must be greater than 0"),
    tp4: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(safeParseFloat(val)), "Must be a valid number")
      .refine((val) => !val || safeParseFloat(val) > 0, "Must be greater than 0"),
  })
  .refine(
    (data) => {
      const entry = safeParseFloat(data.entry);
      const stopLoss = safeParseFloat(data.stopLoss);
      const takeProfits = [
        safeParseFloat(data.tp1),
        data.tp2 ? safeParseFloat(data.tp2) : 0,
        data.tp3 ? safeParseFloat(data.tp3) : 0,
        data.tp4 ? safeParseFloat(data.tp4) : 0,
      ].filter((tp) => tp > 0);

      return validateTradingParameters(data.tradeType, entry, stopLoss, takeProfits).isValid;
    },
    {
      message: "Invalid price levels for the selected trade type",
      path: ["tp1"],
    }
  );

type ProfitCalculatorForm = z.infer<typeof profitCalculatorSchema>;

export function ProfitCalculator() {
  const [results, setResults] = useState<ProfitCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<ProfitCalculatorForm>({
    resolver: zodResolver(profitCalculatorSchema),
    defaultValues: defaultFormValues,
  });

  const handleCalculateProfit = useCallback((data: ProfitCalculatorForm) => {
    setIsCalculating(true);
    setShowResults(false);

    setTimeout(() => {
      try {
        const input = {
          tradeType: data.tradeType,
          entryPrice: safeParseFloat(data.entry),
          stopLossPrice: safeParseFloat(data.stopLoss),
          leverage: safeParseFloat(data.leverage),
          positionSize: safeParseFloat(data.positionSize),
          takeProfits: [
            safeParseFloat(data.tp1),
            data.tp2 ? safeParseFloat(data.tp2) : 0,
            data.tp3 ? safeParseFloat(data.tp3) : 0,
            data.tp4 ? safeParseFloat(data.tp4) : 0,
          ],
        };

        const validation = validateTradingParameters(
          input.tradeType,
          input.entryPrice,
          input.stopLossPrice,
          input.takeProfits.filter((tp) => tp > 0)
        );

        if (!validation.isValid) {
          setIsCalculating(false);
          return;
        }

        const result = calculateProfitMetrics(input);
        setResults(result);
        setIsCalculating(false);

        requestAnimationFrame(() => {
          setShowResults(true);
        });
      } catch {
        setResults(null);
        setIsCalculating(false);
      }
    }, 300);
  }, []);

  const inputField = (
    name: "entry" | "leverage" | "stopLoss" | "positionSize",
    label: string,
    placeholder: string,
    suffix: string,
    extra?: { step?: string; min?: string; max?: string }
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="data-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="number"
                placeholder={placeholder}
                step={extra?.step ?? "0.01"}
                min={extra?.min ?? "0"}
                max={extra?.max}
                className="h-12 data-mono text-lg bg-background border-border/50 transition-all pl-3 pr-12"
                {...field}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 data-mono text-xs text-muted-foreground pointer-events-none">
                {suffix}
              </div>
            </div>
          </FormControl>
          <FormMessage className="mt-1 text-xs" role="alert" />
        </FormItem>
      )}
    />
  );

  const tpField = (name: "tp1" | "tp2" | "tp3" | "tp4", label: string, required?: boolean) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="data-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {label}
            {required && (
              <span className="text-[var(--profit-green)]" aria-hidden="true">
                {" "}
                *
              </span>
            )}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="number"
                placeholder={required ? "0.00" : "Optional"}
                step="0.01"
                min="0"
                aria-required={required}
                className="h-12 data-mono text-lg bg-background border-border/50 transition-all pl-3 pr-12"
                {...field}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 data-mono text-xs text-muted-foreground pointer-events-none">
                USD
              </div>
            </div>
          </FormControl>
          <FormMessage className="mt-1 text-xs" role="alert" />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="data-mono text-xs text-muted-foreground uppercase tracking-wider">
              INPUT_PARAMETERS
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <FormField
            control={form.control}
            name="tradeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="data-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Trade Direction
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-3 mt-2"
                  >
                    <div className="flex-1">
                      <input
                        type="radio"
                        id="profit-long"
                        value="LONG"
                        checked={field.value === "LONG"}
                        onChange={() => field.onChange("LONG")}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="profit-long"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border bg-background/50 rounded cursor-pointer transition-all peer-checked:border-[var(--profit-green)] peer-checked:bg-[var(--profit-green)]/5 peer-checked:text-[var(--profit-green)] hover:border-[var(--profit-green)]/50"
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span className="data-mono text-sm font-medium">LONG</span>
                      </label>
                    </div>
                    <div className="flex-1">
                      <input
                        type="radio"
                        id="profit-short"
                        value="SHORT"
                        checked={field.value === "SHORT"}
                        onChange={() => field.onChange("SHORT")}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="profit-short"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border bg-background/50 rounded cursor-pointer transition-all peer-checked:border-[var(--loss-red)] peer-checked:bg-[var(--loss-red)]/5 peer-checked:text-[var(--loss-red)] hover:border-[var(--loss-red)]/50"
                      >
                        <TrendingUp className="h-4 w-4 rotate-180" />
                        <span className="data-mono text-sm font-medium">SHORT</span>
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            {inputField("entry", "Entry Price", "0.00", "USD")}
            {inputField("leverage", "Leverage", "1", "×", { step: "0.1", min: "1", max: "100" })}
            {inputField("stopLoss", "Stop Loss", "0.00", "USD")}
            {inputField("positionSize", "Position Size", "1000.00", "USD")}
          </div>

          <div className="flex items-baseline gap-2 mt-6 mb-4">
            <span className="data-mono text-xs text-muted-foreground uppercase tracking-wider">
              TARGET_LEVELS
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {tpField("tp1", "Take Profit 1", true)}
            {tpField("tp2", "Take Profit 2")}
            {tpField("tp3", "Take Profit 3")}
            {tpField("tp4", "Take Profit 4")}
          </div>

          <Button
            type="submit"
            disabled={isCalculating}
            className="w-full h-14 data-mono text-sm font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 relative overflow-hidden group btn-press disabled:opacity-70"
            onClick={form.handleSubmit(handleCalculateProfit)}
            aria-busy={isCalculating}
          >
            <span className="relative z-10 flex items-center gap-2">
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Calculate Profit
                </>
              )}
            </span>
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ${isCalculating ? "btn-processing" : "translate-x-[-100%] group-hover:translate-x-[100%]"}`}
            />
          </Button>
        </div>

        {results && (
          <div
            ref={resultsRef}
            className="border-t border-border/30 pt-6 space-y-6"
            role="region"
            aria-live="polite"
            aria-label="Profit analysis results"
          >
            <div
              className={`flex items-baseline gap-2 mb-4 ${showResults ? "animate-fade-slide-in" : "opacity-0"}`}
            >
              <span className="data-mono text-xs text-muted-foreground uppercase tracking-wider">
                P&L_ANALYSIS
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ResultCard
                label="Total Profit"
                value={results.totalProfit}
                unit="AGGREGATE_PNL"
                color="green"
                formatFn={formatCurrency}
                showResults={showResults}
                staggerIndex={1}
              />
              <ResultCard
                label="Average Profit"
                value={results.averageProfit}
                unit="PER_TARGET"
                color="green"
                formatFn={formatCurrency}
                showResults={showResults}
                staggerIndex={2}
              />
              <ResultCard
                label="ROI"
                value={results.roi}
                unit="RETURN_ON_MARGIN"
                color="neutral"
                formatFn={formatPercentage}
                showResults={showResults}
                staggerIndex={3}
              />
              <ResultCard
                label="Maximum Loss"
                value={results.potentialLoss}
                unit="DOWNSIDE_RISK"
                color="red"
                formatFn={formatCurrency}
                showResults={showResults}
                staggerIndex={4}
              />
              <ResultCard
                label="Primary R:R"
                value={results.primaryRiskReward}
                unit="FIRST_TARGET"
                color="neutral"
                formatFn={(v) => `${v.toFixed(2)}:1`}
                showResults={showResults}
                staggerIndex={5}
              />
              <ResultCard
                label="Average R:R"
                value={results.averageRiskReward}
                unit="ALL_TARGETS"
                color="neutral"
                formatFn={(v) => `${v.toFixed(2)}:1`}
                showResults={showResults}
                staggerIndex={6}
              />
            </div>

            {results.takeProfitBreakdown.length > 0 && (
              <div
                className={`mt-6 space-y-3 ${showResults ? "animate-fade-slide-in stagger-6" : "opacity-0"}`}
              >
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="data-mono text-xs text-muted-foreground uppercase tracking-wider">
                    TARGET_BREAKDOWN
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                </div>

                <div className="space-y-2" role="list" aria-label="Take profit targets">
                  {results.takeProfitBreakdown.map((tp, index) => (
                    <div
                      key={index}
                      role="listitem"
                      className="flex items-center justify-between p-4 border border-border/30 bg-card/30 rounded hover:border-border/60 card-hover-lift transition-all"
                      style={{ animationDelay: `${450 + index * 75}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="data-mono text-xs text-muted-foreground w-12">
                          TP{index + 1}
                        </div>
                        <div className="data-mono text-sm font-medium">
                          {formatCurrency(tp.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="data-mono text-sm font-bold text-[var(--profit-green)]">
                            {formatCurrency(tp.profit)}
                          </div>
                          <div className="data-mono text-[10px] text-muted-foreground">PROFIT</div>
                        </div>
                        <div className="text-right">
                          <div className="data-mono text-sm font-bold">
                            {tp.riskReward.toFixed(2)}:1
                          </div>
                          <div className="data-mono text-[10px] text-muted-foreground">R:R</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Form>
  );
}
