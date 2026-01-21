"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { BacktestFormData } from "@/components/backtest";
import { DEFAULT_BACKTEST_VALUES } from "@/lib/backtest/defaults";

const PARAM_KEYS = {
  initialCapital: "capital",
  exchangeFeePercent: "fee",
  smaMin: "min",
  smaMax: "max",
  buyOnLong: "long",
  shortOnShort: "short",
  optimizeLeverage: "optlev",
} as const;

export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const formData = useMemo((): BacktestFormData => {
    const capital = searchParams.get(PARAM_KEYS.initialCapital);
    const fee = searchParams.get(PARAM_KEYS.exchangeFeePercent);
    const min = searchParams.get(PARAM_KEYS.smaMin);
    const max = searchParams.get(PARAM_KEYS.smaMax);
    const long = searchParams.get(PARAM_KEYS.buyOnLong);
    const short = searchParams.get(PARAM_KEYS.shortOnShort);
    const optlev = searchParams.get(PARAM_KEYS.optimizeLeverage);

    return {
      initialCapital: capital ? parseFloat(capital) : DEFAULT_BACKTEST_VALUES.initialCapital,
      exchangeFeePercent: fee ? parseFloat(fee) : DEFAULT_BACKTEST_VALUES.exchangeFeePercent,
      smaMin: min ? parseInt(min) : DEFAULT_BACKTEST_VALUES.smaMin,
      smaMax: max ? parseInt(max) : DEFAULT_BACKTEST_VALUES.smaMax,
      buyOnLong: long !== null ? long === "1" : DEFAULT_BACKTEST_VALUES.buyOnLong,
      shortOnShort: short !== null ? short === "1" : DEFAULT_BACKTEST_VALUES.shortOnShort,
      optimizeLeverage: optlev !== null ? optlev === "1" : DEFAULT_BACKTEST_VALUES.optimizeLeverage,
    };
  }, [searchParams]);

  const updateUrl = useCallback(
    (data: BacktestFormData) => {
      const params = new URLSearchParams();

      if (data.initialCapital !== DEFAULT_BACKTEST_VALUES.initialCapital) {
        params.set(PARAM_KEYS.initialCapital, data.initialCapital.toString());
      }
      if (data.exchangeFeePercent !== DEFAULT_BACKTEST_VALUES.exchangeFeePercent) {
        params.set(PARAM_KEYS.exchangeFeePercent, data.exchangeFeePercent.toString());
      }
      if (data.smaMin !== DEFAULT_BACKTEST_VALUES.smaMin) {
        params.set(PARAM_KEYS.smaMin, data.smaMin.toString());
      }
      if (data.smaMax !== DEFAULT_BACKTEST_VALUES.smaMax) {
        params.set(PARAM_KEYS.smaMax, data.smaMax.toString());
      }
      if (data.buyOnLong !== DEFAULT_BACKTEST_VALUES.buyOnLong) {
        params.set(PARAM_KEYS.buyOnLong, data.buyOnLong ? "1" : "0");
      }
      if (data.shortOnShort !== DEFAULT_BACKTEST_VALUES.shortOnShort) {
        params.set(PARAM_KEYS.shortOnShort, data.shortOnShort ? "1" : "0");
      }
      if (data.optimizeLeverage !== DEFAULT_BACKTEST_VALUES.optimizeLeverage) {
        params.set(PARAM_KEYS.optimizeLeverage, data.optimizeLeverage ? "1" : "0");
      }

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname]
  );

  return { formData, updateUrl };
}
