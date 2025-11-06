import "dotenv/config";
import { updateProjectsFile } from "@/scripts/syncPortfolioData";
import { generateProjectsJson } from "@/scripts/generateProjectsJson";
import { fetchWithLogging } from "@/utils/fetchWithLogging";

async function retry(fn, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      {
        return await fn();
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retrying... (${i + 1}/${retries})`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

export async function webhookService(event: string, ref: string) {
  if (event !== "push") return;

  console.log("Push event detected:", ref);

  try {
    console.log("Triggering manual sync via /api/manual-sync");
    const syncResponse = await retry(() =>
      fetchWithLogging(`${process.env.API_BASE_URL}/api/manual-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      throw new Error(`Manual sync failed: ${errorText}`);
    }

    const data = await syncResponse.json();
    console.log("Manual sync response:", data.message);

    await generateProjectsJson();

    console.log("Updating portfolio repository...");
    await updateProjectsFile();

    console.log("Sync complete after push event");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
