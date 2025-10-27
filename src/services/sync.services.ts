import { BadRequestError } from "@/errors/httpError";
import { fetchPortfolioRepos } from "./githubFetcher";

export async function manualSyncService(username: string) {
  if (!username) throw new BadRequestError("Username is required");

  await fetchPortfolioRepos(username);

  return { message: `Manual sync completed for ${username}` };
}
