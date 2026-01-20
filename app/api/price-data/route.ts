import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  try {
    const [first, last, count] = await Promise.all([
      prisma.priceData.findFirst({ orderBy: { date: "asc" } }),
      prisma.priceData.findFirst({ orderBy: { date: "desc" } }),
      prisma.priceData.count(),
    ]);

    if (!first || !last) {
      return NextResponse.json(
        { error: "No price data available" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      startDate: first.date,
      endDate: last.date,
      totalRecords: count,
      startPrice: Number(first.closePrice),
      endPrice: Number(last.closePrice),
    });
  } catch (error) {
    console.error("Price data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch price data range" },
      { status: 500 }
    );
  }
}
