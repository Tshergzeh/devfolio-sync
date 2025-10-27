import axios from "axios";
import { Project } from "@/models/project.model";

const GITHUB_API = "https://api.github.com";

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
  const url = `${GITHUB_API}/users/${username}/repos?per_page=100`;
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-Github-Api-Version": "2022-11-28",
  };

  const { data } = await axios.get<GithubRepo[]>(url, { headers });

  const portfolioRepos = data.filter((repo) => repo.topics?.includes("portfolio"));

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
  const url = `${GITHUB_API}/repos/${username}/${repo}/languages`;
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-Github-Api-Version": "2022-11-28",
  };

  const { data } = await axios.get(url, { headers });
  const languages = Object.keys(data);
  return languages;
}
