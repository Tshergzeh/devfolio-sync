import { updateProjectsFile } from "@/scripts/syncPortfolioData";

export async function webhookService(event: string, ref: string) {
  if (event === "push") {
    console.log("Push event detected:", ref);

    try {
      await updateProjectsFile();
      console.log("Sync complete after push event");
    } catch (error) {
      console.error("Sync failed:", error);
    }
  }
}
