import { Queue, Worker } from "bullmq";
import "dotenv/config";

import { generateProjectsJson } from "@/scripts/generateProjectsJson.js";
import { updateProjectsFile } from "@/scripts/syncPortfolioData.js";
import { fetchWithLogging } from "@/utils/fetchWithLogging.js";

const connection = { url: process.env.REDIS_URL };

export const syncQueue = new Queue("syncQueue", { connection });

export async function scheduleWeeklySync() {
  await syncQueue.add(
    "weekly-sync",
    {},
    {
      repeat: { pattern: "0 0 * * 0" },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}

export const syncWorker = new Worker(
  "syncQueue",
  async () => {
    console.log("Running weekly portfolio sync...");

    await manualSync();

    await generateProjectsJson();

    console.log("Updating portfolio repository...");
    await updateProjectsFile();
  },
  { connection, concurrency: 1 }
);

async function manualSync() {
  console.log("Triggering manual sync via /api/manual-sync...");
  const response = await fetchWithLogging(`${process.env.API_BASE_URL}/api/manual-sync`, {
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

console.log("Weekly sync job scheduled (every Sunday at midnight)");
