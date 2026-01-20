import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runBacktest, type BacktestParams, type PricePoint } from "@/lib/backtest";

interface TrailingStopRequest {
  enabled: boolean;
  atrPeriod: number;
  atrMultiplier: number;
  partialClosePercent: number;
}

interface BacktestRequestBody {
  initialCapital: number;
  exchangeFeePercent: number;
  gasFeePerTrade?: number;
  smaMin: number;
  smaMax: number;
  buyOnLong: boolean;
  shortOnShort: boolean;
  longLeverage: number;
  shortLeverage: number;
  selectedPeriod?: number;
  trailingStop?: TrailingStopRequest;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as BacktestRequestBody;

    const {
      initialCapital = 1000,
      exchangeFeePercent = 0.05,
      gasFeePerTrade = 0,
      smaMin = 2,
      smaMax = 200,
      buyOnLong = true,
      shortOnShort = true,
      longLeverage = 1,
      shortLeverage = 1,
      selectedPeriod,
      trailingStop,
    } = body;

    if (smaMin < 2 || smaMax > 200 || smaMin > smaMax) {
      return NextResponse.json(
        { error: "Invalid SMA range. Must be between 2 and 200, and min <= max." },
        { status: 400 }
      );
    }

    if (initialCapital <= 0) {
      return NextResponse.json(
        { error: "Initial capital must be positive." },
        { status: 400 }
      );
    }

    if (longLeverage < 1 || shortLeverage < 1) {
      return NextResponse.json(
        { error: "Leverage must be at least 1." },
        { status: 400 }
      );
    }

    if (trailingStop?.enabled) {
      if (trailingStop.atrPeriod < 5 || trailingStop.atrPeriod > 50) {
        return NextResponse.json(
          { error: "ATR period must be between 5 and 50." },
          { status: 400 }
        );
      }

      if (trailingStop.atrMultiplier < 1.0 || trailingStop.atrMultiplier > 10.0) {
        return NextResponse.json(
          { error: "ATR multiplier must be between 1.0 and 10.0." },
          { status: 400 }
        );
      }

      if (trailingStop.partialClosePercent < 1 || trailingStop.partialClosePercent > 100) {
        return NextResponse.json(
          { error: "Partial close percent must be between 1 and 100." },
          { status: 400 }
        );
      }
    }

    const priceData = await prisma.priceData.findMany({
      orderBy: { date: "asc" },
      select: { date: true, closePrice: true },
    });

    if (priceData.length === 0) {
      return NextResponse.json(
        { error: "No price data available. Please seed the database." },
        { status: 500 }
      );
    }

    const pricePoints: PricePoint[] = priceData.map((p) => ({
      date: p.date,
      closePrice: Number(p.closePrice),
    }));

    const params: BacktestParams = {
      initialCapital,
      exchangeFeePercent,
      gasFeePerTrade,
      smaMin,
      smaMax,
      buyOnLong,
      shortOnShort,
      longLeverage,
      shortLeverage,
      trailingStop: trailingStop?.enabled
        ? {
            enabled: true,
            atrPeriod: trailingStop.atrPeriod,
            atrMultiplier: trailingStop.atrMultiplier,
            partialClosePercent: trailingStop.partialClosePercent,
          }
        : undefined,
    };

    const result = runBacktest(pricePoints, params, selectedPeriod);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Backtest error:", error);
    return NextResponse.json(
      { error: "Failed to run backtest" },
      { status: 500 }
    );
  }
}
