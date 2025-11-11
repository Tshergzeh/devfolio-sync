import { BadRequestError } from "@/errors/httpError.js";
import { generateProjectsJson } from "@/scripts/generateProjectsJson.js";
import { updateProjectsFile } from "@/scripts/syncPortfolioData.js";
import { fetchPortfolioRepos } from "@/services/githubFetcher.js";

export async function manualSyncService(username: string) {
  if (!username) throw new BadRequestError("Username is required");

  await fetchPortfolioRepos(username, true);
  await generateProjectsJson();
  console.log("Updating portfolio repository...");
  await updateProjectsFile();

  return { message: `Manual sync completed for ${username}` };
}
