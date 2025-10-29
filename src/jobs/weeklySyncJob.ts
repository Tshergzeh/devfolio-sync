import nodeCron from "node-cron";
import "dotenv/config";

import { generateProjectsJson } from "@/scripts/generateProjectsJson";
import { updateProjectsFile } from "@/scripts/syncPortfolioData";

async function manualSync() {
  console.log("Triggering manual sync via /api/manual-sync...");
  const response = await fetch(`${process.env.API_BASE_URL}/api/manual-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Manual sync failed: ${errorText}`);
  }

  const data = await response.json();
  console.log("Manual sync response:", data.message);
}

async function runWeeklySync() {
  try {
    console.log("Running weekly portfolio sync...");

    await manualSync();

    await generateProjectsJson();

    console.log("Updating portfolio repository...");
    await updateProjectsFile();
  } catch (error) {
    console.error("Weekly sync failed:", error);
  }
}

nodeCron.schedule("0 9 * * MON", async () => {
  await runWeeklySync();
});

console.log("Weekly sync job scheduled (every Monday at 9 AM)");
