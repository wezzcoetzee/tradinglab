import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import priceData from "../data/btc-price-data.json";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface PriceDataEntry {
  unixTimestamp: number;
  date: string;
  closePrice: number;
}

async function main(): Promise<void> {
  console.log("Seeding database with BTC price data...");

  const existingCount = await prisma.priceData.count();
  if (existingCount > 0) {
    console.log(`Database already contains ${existingCount} records. Skipping seed.`);
    console.log("To re-seed, run: npx prisma migrate reset");
    return;
  }

  const data = priceData as PriceDataEntry[];
  console.log(`Found ${data.length} price records to insert.`);

  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await prisma.priceData.createMany({
      data: batch.map((entry) => ({
        unixTimestamp: entry.unixTimestamp,
        date: new Date(entry.date),
        closePrice: entry.closePrice,
      })),
      skipDuplicates: true,
    });
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${data.length} records...`);
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
