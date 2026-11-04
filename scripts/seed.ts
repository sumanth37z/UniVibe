import "dotenv/config";
import { seed, seedIfEmpty } from "../src/lib/seed";

async function main() {
  const force = process.argv.includes("--force");
  const result = force ? await seed() : await seedIfEmpty();
  console.log("[seed] result:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
