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
  sameLeverage: "same",
  longLeverage: "lev",
  shortLeverage: "slev",
  trailingStopEnabled: "atr",
  atrPeriod: "atrp",
  atrMultiplier: "atrk",
  partialClosePercent: "partial",
} as const;

const DEFAULT_VALUES: BacktestFormData = {
  initialCapital: 1000,
  exchangeFeePercent: 0.05,
  gasFeePerTrade: 0,
  smaMin: 2,
  smaMax: 200,
  buyOnLong: true,
  shortOnShort: true,
  sameLeverage: true,
  longLeverage: 1,
  shortLeverage: 1,
  trailingStopEnabled: false,
  atrPeriod: 14,
  atrMultiplier: 2.5,
  partialClosePercent: 100,
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
    const same = searchParams.get(PARAM_KEYS.sameLeverage);
    const lev = searchParams.get(PARAM_KEYS.longLeverage);
    const slev = searchParams.get(PARAM_KEYS.shortLeverage);
    const atr = searchParams.get(PARAM_KEYS.trailingStopEnabled);
    const atrp = searchParams.get(PARAM_KEYS.atrPeriod);
    const atrk = searchParams.get(PARAM_KEYS.atrMultiplier);
    const partial = searchParams.get(PARAM_KEYS.partialClosePercent);

    return {
      initialCapital: capital ? parseFloat(capital) : DEFAULT_VALUES.initialCapital,
      exchangeFeePercent: fee ? parseFloat(fee) : DEFAULT_VALUES.exchangeFeePercent,
      gasFeePerTrade: gas ? parseFloat(gas) : DEFAULT_VALUES.gasFeePerTrade,
      smaMin: min ? parseInt(min) : DEFAULT_VALUES.smaMin,
      smaMax: max ? parseInt(max) : DEFAULT_VALUES.smaMax,
      buyOnLong: long !== null ? long === "1" : DEFAULT_VALUES.buyOnLong,
      shortOnShort: short !== null ? short === "1" : DEFAULT_VALUES.shortOnShort,
      sameLeverage: same !== null ? same === "1" : DEFAULT_VALUES.sameLeverage,
      longLeverage: lev ? parseFloat(lev) : DEFAULT_VALUES.longLeverage,
      shortLeverage: slev ? parseFloat(slev) : DEFAULT_VALUES.shortLeverage,
      trailingStopEnabled: atr !== null ? atr === "1" : DEFAULT_VALUES.trailingStopEnabled,
      atrPeriod: atrp ? parseInt(atrp) : DEFAULT_VALUES.atrPeriod,
      atrMultiplier: atrk ? parseFloat(atrk) : DEFAULT_VALUES.atrMultiplier,
      partialClosePercent: partial ? parseInt(partial) : DEFAULT_VALUES.partialClosePercent,
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
      if (data.sameLeverage !== DEFAULT_VALUES.sameLeverage) {
        params.set(PARAM_KEYS.sameLeverage, data.sameLeverage ? "1" : "0");
      }
      if (data.longLeverage !== DEFAULT_VALUES.longLeverage) {
        params.set(PARAM_KEYS.longLeverage, data.longLeverage.toString());
      }
      if (!data.sameLeverage && data.shortLeverage !== DEFAULT_VALUES.shortLeverage) {
        params.set(PARAM_KEYS.shortLeverage, data.shortLeverage.toString());
      }
      if (data.trailingStopEnabled !== DEFAULT_VALUES.trailingStopEnabled) {
        params.set(PARAM_KEYS.trailingStopEnabled, data.trailingStopEnabled ? "1" : "0");
      }
      if (data.trailingStopEnabled && data.atrPeriod !== DEFAULT_VALUES.atrPeriod) {
        params.set(PARAM_KEYS.atrPeriod, data.atrPeriod.toString());
      }
      if (data.trailingStopEnabled && data.atrMultiplier !== DEFAULT_VALUES.atrMultiplier) {
        params.set(PARAM_KEYS.atrMultiplier, data.atrMultiplier.toString());
      }
      if (data.trailingStopEnabled && data.partialClosePercent !== DEFAULT_VALUES.partialClosePercent) {
        params.set(PARAM_KEYS.partialClosePercent, data.partialClosePercent.toString());
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
