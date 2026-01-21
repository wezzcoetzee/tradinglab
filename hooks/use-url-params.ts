"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { BacktestFormData } from "@/components/backtest";

const PARAM_KEYS = {
  initialCapital: "capital",
  exchangeFeePercent: "fee",
  gasFeePerTrade: "gas",
  smaMin: "min",
  smaMax: "max",
  buyOnLong: "long",
  shortOnShort: "short",
  optimizeLeverage: "optlev",
} as const;

const DEFAULT_VALUES: BacktestFormData = {
  initialCapital: 1000,
  exchangeFeePercent: 0,
  gasFeePerTrade: 0,
  smaMin: 2,
  smaMax: 200,
  buyOnLong: true,
  shortOnShort: false,
  optimizeLeverage: false,
};

export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const formData = useMemo((): BacktestFormData => {
    const capital = searchParams.get(PARAM_KEYS.initialCapital);
    const fee = searchParams.get(PARAM_KEYS.exchangeFeePercent);
    const gas = searchParams.get(PARAM_KEYS.gasFeePerTrade);
    const min = searchParams.get(PARAM_KEYS.smaMin);
    const max = searchParams.get(PARAM_KEYS.smaMax);
    const long = searchParams.get(PARAM_KEYS.buyOnLong);
    const short = searchParams.get(PARAM_KEYS.shortOnShort);
    const optlev = searchParams.get(PARAM_KEYS.optimizeLeverage);

    return {
      initialCapital: capital ? parseFloat(capital) : DEFAULT_VALUES.initialCapital,
      exchangeFeePercent: fee ? parseFloat(fee) : DEFAULT_VALUES.exchangeFeePercent,
      gasFeePerTrade: gas ? parseFloat(gas) : DEFAULT_VALUES.gasFeePerTrade,
      smaMin: min ? parseInt(min) : DEFAULT_VALUES.smaMin,
      smaMax: max ? parseInt(max) : DEFAULT_VALUES.smaMax,
      buyOnLong: long !== null ? long === "1" : DEFAULT_VALUES.buyOnLong,
      shortOnShort: short !== null ? short === "1" : DEFAULT_VALUES.shortOnShort,
      optimizeLeverage: optlev !== null ? optlev === "1" : DEFAULT_VALUES.optimizeLeverage,
    };
  }, [searchParams]);

  const updateUrl = useCallback(
    (data: BacktestFormData) => {
      const params = new URLSearchParams();

      if (data.initialCapital !== DEFAULT_VALUES.initialCapital) {
        params.set(PARAM_KEYS.initialCapital, data.initialCapital.toString());
      }
      if (data.exchangeFeePercent !== DEFAULT_VALUES.exchangeFeePercent) {
        params.set(PARAM_KEYS.exchangeFeePercent, data.exchangeFeePercent.toString());
      }
      if (data.gasFeePerTrade !== DEFAULT_VALUES.gasFeePerTrade) {
        params.set(PARAM_KEYS.gasFeePerTrade, data.gasFeePerTrade.toString());
      }
      if (data.smaMin !== DEFAULT_VALUES.smaMin) {
        params.set(PARAM_KEYS.smaMin, data.smaMin.toString());
      }
      if (data.smaMax !== DEFAULT_VALUES.smaMax) {
        params.set(PARAM_KEYS.smaMax, data.smaMax.toString());
      }
      if (data.buyOnLong !== DEFAULT_VALUES.buyOnLong) {
        params.set(PARAM_KEYS.buyOnLong, data.buyOnLong ? "1" : "0");
      }
      if (data.shortOnShort !== DEFAULT_VALUES.shortOnShort) {
        params.set(PARAM_KEYS.shortOnShort, data.shortOnShort ? "1" : "0");
      }
      if (data.optimizeLeverage !== DEFAULT_VALUES.optimizeLeverage) {
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
