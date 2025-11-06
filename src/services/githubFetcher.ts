import axios from "axios";

import { Project } from "@/models/project.model";
import { requestWithAuth } from "@/config/octokit";
import { GithubRepo } from "@/types";
import { logger } from "@/utils/logger";

export async function fetchPortfolioRepos(username: string, manualSync: boolean) {
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

    const project = await Project.findOneAndUpdate(
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

    if (project.lastPushedAt > (project.curatedAt || 0) || manualSync) {
      const readme_text = await fetchRepoReadme(username, repo.name);
      const repo_summary = readme_text ? await summarizeReadme(readme_text) : "";
      const curated_at = Date.now();

      await Project.findOneAndUpdate(
        { repoId: repo.id },
        {
          summary: repo_summary.data,
          curatedAt: curated_at,
        }
      );
    }
  }

  console.log(`Synced ${portfolioRepos.length} portfolio repos for ${username}`);
}

async function fetchRepoLanguages(username: string, repo: string) {
  const { data } = await requestWithAuth(`GET /repos/${username}/${repo}/languages`);
  return Object.keys(data);
}

export async function fetchRepoReadme(username: string, repo: string) {
  try {
    const { data } = await requestWithAuth(`GET /repos/${username}/${repo}/readme`);
    let readmeText = Buffer.from(data.content, "base64").toString("utf-8");

    if (readmeText.length > 2000) readmeText = readmeText.substring(0, 2000);

    return readmeText;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const err = error as { response?: { status?: number }; message?: string };
      if (err.response?.status === 404) return null;
      console.error(`Failed to fetch README for ${username}/${repo}:`, err.message);
    } else {
      console.error(`Unknown error fetching README for ${username}/${repo}:`, error);
    }
    return null;
  }
}

export async function summarizeReadme(readme_text: string) {
  const start = Date.now();
  logger.info("Summarization started", { length: readme_text.length });

  const response = await axios.post(
    `${process.env.SUMMARIZER_BASE_URL}/${process.env.SUMMARIZER_ENDPOINT}`,
    {
      readme_text,
    }
  );

  const duration = Date.now() - start;
  logger.info("Summarization completed", { durationMs: duration });
  return response.data;
}
