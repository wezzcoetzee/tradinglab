import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runBacktest, type BacktestParams, type PricePoint, type SelectedConfig } from "@/lib/backtest";

interface BacktestRequestBody {
  initialCapital: number;
  exchangeFeePercent: number;
  gasFeePerTrade?: number;
  smaMin: number;
  smaMax: number;
  buyOnLong: boolean;
  shortOnShort: boolean;
  optimizeLeverage?: boolean;
  selectedConfig?: SelectedConfig;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as BacktestRequestBody;

    const {
      initialCapital = 1000,
      exchangeFeePercent = 0,
      gasFeePerTrade = 0,
      smaMin = 2,
      smaMax = 200,
      buyOnLong = true,
      shortOnShort = false,
      optimizeLeverage = false,
      selectedConfig,
    } = body;

    if (smaMin < 2 || smaMax > 200 || smaMin > smaMax) {
      return NextResponse.json(
        { error: "Invalid MA range. Must be between 2 and 200, and min <= max." },
        { status: 400 }
      );
    }

    if (initialCapital <= 0) {
      return NextResponse.json(
        { error: "Initial capital must be positive." },
        { status: 400 }
      );
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
      leverage: { long: 1, short: 1 },
      optimizeLeverage,
    };

    const result = runBacktest(pricePoints, params, selectedConfig);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Backtest error:", error);
    return NextResponse.json(
      { error: "Failed to run backtest" },
      { status: 500 }
    );
  }
}
