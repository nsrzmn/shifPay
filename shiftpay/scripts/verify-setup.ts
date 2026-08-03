import { loadEnvConfig } from "@next/env";
import { verifySheetSetup } from "../src/lib/server/sheets";

loadEnvConfig(process.cwd());

async function main() {
  try {
    const result = await verifySheetSetup();
    console.log(`ShiftPay setup verified: ${result.worksheet} is accessible with ${result.entryCount} entries.`);
    console.log(`Service account: ${result.clientEmail}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown setup error";
    console.error(`ShiftPay setup verification failed: ${message}`);
    process.exitCode = 1;
  }
}

void main();
