import { fetchPortfolioRepos } from "@/services/githubFetcher";
import { requestWithAuth } from "@/config/octokit";
import { Project } from "@/models/project.model";
import axios from "axios";

jest.mock("@/config/octokit", () => ({
  requestWithAuth: jest.fn(),
}));
jest.mock("@/models/project.model");
jest.mock("axios");

describe("fetchPortfolioRepos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch repos, filter portfolio ones, and update projects", async () => {
    // Mock GitHub repos
    (requestWithAuth as unknown as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            name: "repo1",
            full_name: "segun/repo1",
            topics: ["portfolio"],
            html_url: "url",
            stargazers_count: 5,
            forks_count: 2,
            pushed_at: "2025-10-30",
            homepage: "",
          },
          {
            id: 2,
            name: "repo2",
            full_name: "segun/repo2",
            topics: ["other"],
            html_url: "url",
            stargazers_count: 3,
            forks_count: 1,
            pushed_at: "2025-10-30",
            homepage: "",
          },
        ],
      })
      .mockResolvedValueOnce({ data: [] }); // end of pagination

    // Mock languages
    (requestWithAuth as unknown as jest.Mock).mockResolvedValueOnce({ data: { JS: 123 } });

    // Mock DB operations
    (Project.findOneAndUpdate as jest.Mock).mockResolvedValueOnce({
      lastPushedAt: new Date(),
      curatedAt: null,
    });

    // Mock summarizeReadme + axios
    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { data: "summary text" } });

    await fetchPortfolioRepos("segun", false);

    expect(requestWithAuth).toHaveBeenCalledWith(
      "GET /users/segun/repos",
      expect.objectContaining({ per_page: 100, page: 1 })
    );
    expect(Project.findOneAndUpdate).toHaveBeenCalled();
  });
});
