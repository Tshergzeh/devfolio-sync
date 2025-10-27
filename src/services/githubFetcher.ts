import { Project } from "@/models/project.model";
import { requestWithAuth } from "@/config/octokit";

interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  topics?: [string];
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  homepage?: string | null;
}

export async function fetchPortfolioRepos(username: string) {
  const allRepos: GithubRepo[] = [];

  let page = 1;
  const per_page = 100;

  while (true) {
    const { data } = await requestWithAuth(`GET /users/${username}/repos`, {
      per_page,
      page,
    });

    if (data.length === 0) break;

    allRepos.push(...data);
    page++;
  }

  const portfolioRepos = allRepos.filter((repo) => repo.topics?.includes("portfolio"));

  for (const repo of portfolioRepos) {
    const repo_languages = await fetchRepoLanguages(username, repo.name);

    await Project.findOneAndUpdate(
      { repoId: repo.id },
      {
        repoId: repo.id,
        name: repo.name,
        fullname: repo.full_name,
        description: repo.description,
        repoUrl: repo.html_url,
        languages: repo_languages,
        topics: repo.topics,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        lastPushedAt: repo.pushed_at,
        pathToDemo: repo.homepage,
      },
      { upsert: true, new: true }
    );
  }

  console.log(`Synced ${portfolioRepos.length} portfolio repos for ${username}`);
}

async function fetchRepoLanguages(username: string, repo: string) {
  const { data } = await requestWithAuth(`GET /repos/${username}/${repo}/languages`);
  return Object.keys(data);
}
