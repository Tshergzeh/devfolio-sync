import { BadRequestError } from "@/errors/httpError.js";
import { fetchPortfolioRepos } from "@/services/githubFetcher.js";

export async function manualSyncService(username: string) {
  if (!username) throw new BadRequestError("Username is required");

  await fetchPortfolioRepos(username, true);

  return { message: `Manual sync completed for ${username}` };
}
