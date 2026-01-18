import XLSX from "xlsx";
import { writeFileSync } from "fs";
import { join } from "path";

function excelDateToISO(excelDate: number): string {
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(epoch.getTime() + excelDate * 86400000);
  return date.toISOString().split("T")[0];
}

interface PriceDataRow {
  unixTimestamp: number;
  date: string;
  closePrice: number;
}

const EXCEL_PATH = join(import.meta.dirname, "../data/btc 2025-10.xlsm");
const OUTPUT_PATH = join(import.meta.dirname, "../data/btc-price-data.json");

const workbook = XLSX.readFile(EXCEL_PATH);

console.log("Available sheets:", workbook.SheetNames);

const dataSheet = workbook.Sheets["data"];
if (!dataSheet) {
  console.error('Sheet "data" not found');
  process.exit(1);
}

const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(dataSheet);

console.log("Total rows in sheet:", rawData.length);

const priceData: PriceDataRow[] = rawData
  .map((row) => {
    const timestamp = row["Unix TimeStamp"];
    const date = row["Date"];
    const close = row["Close Price"];

    if (timestamp === undefined || close === undefined) {
      return null;
    }

    let dateStr: string;
    if (typeof date === "number") {
      dateStr = excelDateToISO(date);
    } else {
      dateStr = String(date);
    }

    return {
      unixTimestamp: Number(timestamp),
      date: dateStr,
      closePrice: Number(close),
    };
  })
  .filter((row): row is PriceDataRow => row !== null);

console.log("Extracted rows:", priceData.length);
console.log("First extracted row:", priceData[0]);
console.log("Last extracted row:", priceData[priceData.length - 1]);

writeFileSync(OUTPUT_PATH, JSON.stringify(priceData, null, 2));
console.log(`Data written to ${OUTPUT_PATH}`);
