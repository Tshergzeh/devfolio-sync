import { Octokit } from "octokit";
import "dotenv/config";

const octokit = new Octokit({ auth: `${process.env.GITHUB_TOKEN}` });

export const requestWithAuth = octokit.request.defaults({
  headers: {
    accept: "application/vnd.github+json",
    "X-Github-Api-Version": "2022-11-28",
  },
});
