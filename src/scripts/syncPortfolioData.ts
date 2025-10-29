import { Octokit } from "octokit";
import { RequestError } from "@octokit/request-error";
import fs from "fs";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

function getEnv(name: string): string {
  const value = process.env[name as keyof NodeJS.ProcessEnv];
  if (!value) throw new Error(`Environment variable ${name} is required`);
  return value;
}

const owner = getEnv("GITHUB_USERNAME");
const repo = getEnv("GITHUB_PORTFOLIO_REPO");
const projectsPath = getEnv("GITHUB_PORTFOLIO_PATH");
const branch = process.env.GITHUB_PORTFOLIO_BRANCH || "main";

async function updateProjectsFile() {
  const content = fs.readFileSync("./public/projects.json", "utf-8");
  const base64Content = Buffer.from(content).toString("base64");

  let sha: any;
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: projectsPath,
      ref: branch,
    });
    sha = Array.isArray(data) ? data[0].sha : data.sha;
    console.log("Existing file found. SHA:", sha);
  } catch (error: unknown) {
    if (error instanceof RequestError && error.status === 404) {
      console.log("No existing projects.json file. Creating a new one...");
    } else {
      throw error;
    }
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: projectsPath,
    message: "Update projects.json from githubFetcher",
    content: base64Content,
    branch,
    sha,
  });

  console.log("projects.json successfully updated in target repo!");
}

updateProjectsFile().catch(console.error);
