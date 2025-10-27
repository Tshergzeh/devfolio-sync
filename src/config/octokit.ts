import { request } from "@octokit/request";

export const requestWithAuth = request.defaults({
  headers: {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    accept: "application/vnd.github+json",
    "X-Github-Api-Version": "2022-11-28",
  },
});
