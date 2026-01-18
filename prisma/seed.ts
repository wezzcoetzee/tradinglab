import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import priceDataJson from "../data/btc-price-data.json";

interface PriceDataRow {
  unixTimestamp: number;
  date: string;
  closePrice: number;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log("Seeding database...");

  const priceData = priceDataJson as PriceDataRow[];
  console.log(`Loading ${priceData.length} price records...`);

  const existingCount = await prisma.priceData.count();
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing records. Clearing table...`);
    await prisma.priceData.deleteMany();
  }

  const batchSize = 500;
  for (let i = 0; i < priceData.length; i += batchSize) {
    const batch = priceData.slice(i, i + batchSize);
    await prisma.priceData.createMany({
      data: batch.map((row) => ({
        unixTimestamp: BigInt(row.unixTimestamp),
        date: new Date(row.date),
        closePrice: row.closePrice,
      })),
    });
    console.log(`Inserted ${Math.min(i + batchSize, priceData.length)} / ${priceData.length} records`);
  }

  const defaultConfig = await prisma.strategyConfig.findUnique({
    where: { name: "default" },
  });

  if (!defaultConfig) {
    await prisma.strategyConfig.create({
      data: {
        name: "default",
        maDuration: 44,
        buyOnLongSignal: true,
        shortOnShort: false,
        longLeverage: 2.25,
        shortLeverage: 1.0,
        initialCapital: 1000,
        gasFeePerTrade: 0,
        exchangeFee: 0.0005,
      },
    });
    console.log("Created default strategy configuration");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
