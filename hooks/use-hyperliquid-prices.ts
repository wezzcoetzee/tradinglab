"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  WebSocketTransport,
  SubscriptionClient,
  HttpTransport,
  InfoClient,
} from "@nktkas/hyperliquid";
import type { AllMidsWsEvent } from "@nktkas/hyperliquid";

export interface HyperliquidPrices {
  [symbol: string]: number;
}

export interface CoinPrice {
  symbol: string;
  price: number;
  change24h: number;
}

interface AssetContext {
  prevDayPx: string;
  markPx: string;
  midPx: string | null;
}

interface Meta {
  universe: { name: string }[];
}

type MetaAndAssetCtxsResponse = [Meta, AssetContext[]];

interface UseHyperliquidPricesReturn {
  prices: HyperliquidPrices;
  coinPrices: CoinPrice[];
  isConnected: boolean;
  error: Error | null;
}

const TOP_20_COINS = [
  "BTC", "ETH", "SOL", "XRP", "DOGE", "ADA", "AVAX", "LINK",
  "DOT", "MATIC", "UNI", "ATOM", "LTC", "NEAR", "APT",
  "ARB", "OP", "INJ", "SUI", "SEI", "ZEC", "FARTCOIN", "ENA"
];

const POLL_INTERVAL = 5 * 60 * 1000;

export function useHyperliquidPrices(): UseHyperliquidPricesReturn {
  const [prices, setPrices] = useState<HyperliquidPrices>({});
  const [prevDayPrices, setPrevDayPrices] = useState<Record<string, number>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const transportRef = useRef<WebSocketTransport | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => Promise<void> } | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrevDayPrices = useCallback(async () => {
    try {
      const isTestnet = process.env.NEXT_PUBLIC_HYPERLIQUID_TESTNET === "true";
      const httpTransport = new HttpTransport({ isTestnet });
      const infoClient = new InfoClient({ transport: httpTransport });

      const [meta, assetCtxs] = await infoClient.metaAndAssetCtxs() as MetaAndAssetCtxsResponse;

      const prevDay: Record<string, number> = {};
      meta.universe.forEach((asset, index) => {
        const ctx = assetCtxs[index];
        if (ctx?.prevDayPx) {
          prevDay[asset.name] = parseFloat(ctx.prevDayPx);
        }
      });

      setPrevDayPrices(prevDay);
    } catch (err) {
      console.error("Failed to fetch prev day prices:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const connect = async () => {
      try {
        if (subscriptionRef.current) {
          await subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
        if (transportRef.current) {
          await transportRef.current.close();
          transportRef.current = null;
        }

        const isTestnet = process.env.NEXT_PUBLIC_HYPERLIQUID_TESTNET === "true";

        const transport = new WebSocketTransport({ isTestnet });
        transportRef.current = transport;

        const subscriptionClient = new SubscriptionClient({ transport });

        const subscription = await subscriptionClient.allMids((event: AllMidsWsEvent) => {
          if (!isMounted) return;

          const newPrices: HyperliquidPrices = {};
          for (const [symbol, price] of Object.entries(event.mids)) {
            newPrices[symbol] = parseFloat(price);
          }
          setPrices(newPrices);
          setIsConnected(true);
          setError(null);
        });

        subscriptionRef.current = subscription;
      } catch (err) {
        if (!isMounted) return;

        console.error("Failed to connect to Hyperliquid WebSocket:", err);
        setError(err instanceof Error ? err : new Error("Failed to connect"));
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      isMounted = false;

      const cleanup = async () => {
        if (subscriptionRef.current) {
          try {
            await subscriptionRef.current.unsubscribe();
          } catch (err) {
            console.error("Error unsubscribing:", err);
          }
          subscriptionRef.current = null;
        }
        if (transportRef.current) {
          try {
            await transportRef.current.close();
          } catch (err) {
            console.error("Error closing transport:", err);
          }
          transportRef.current = null;
        }
      };
      cleanup();
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(fetchPrevDayPrices, 0);
    pollIntervalRef.current = setInterval(fetchPrevDayPrices, POLL_INTERVAL);

    return () => {
      clearTimeout(id);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [fetchPrevDayPrices]);

  const coinPrices: CoinPrice[] = TOP_20_COINS
    .filter(symbol => prices[symbol] !== undefined)
    .map(symbol => {
      const currentPrice = prices[symbol];
      const prevDayPrice = prevDayPrices[symbol];
      const change24h = prevDayPrice
        ? ((currentPrice - prevDayPrice) / prevDayPrice) * 100
        : 0;

      return {
        symbol,
        price: currentPrice,
        change24h,
      };
    });

  return { prices, coinPrices, isConnected, error };
}
