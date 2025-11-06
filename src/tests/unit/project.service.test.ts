import {
  getAllProjectsService,
  getProjectByIdService,
  recurateProjectService,
  publishUpdatedProjectService,
  updateProjectSummaryService,
} from "@/services/project.service";

import { Project } from "@/models/project.model";
import { fetchRepoReadme, summarizeReadme } from "@/services/githubFetcher";
import { requestWithAuth } from "@/config/octokit";
import { NotFoundError } from "@/errors/httpError";

jest.mock("@/models/project.model");
jest.mock("@/services/githubFetcher");
jest.mock("@/config/octokit", () => ({
  requestWithAuth: jest.fn(),
}));

describe("project.service", () => {
  const mockProject = {
    _id: "123",
    repoId: 1,
    name: "test-repo",
    summary: "",
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 🧩 getAllProjectsService
  it("should return projects and total count", async () => {
    (Project.find as jest.Mock).mockReturnValue({
      sort: () => ({ skip: () => ({ limit: jest.fn().mockResolvedValue([mockProject]) }) }),
    });
    (Project.countDocuments as jest.Mock).mockResolvedValue(1);

    const result = await getAllProjectsService(0, 10);

    expect(result.projects).toEqual([mockProject]);
    expect(result.total).toBe(1);
  });

  // 🧩 getProjectByIdService
  it("should return project by id", async () => {
    (Project.findById as jest.Mock).mockResolvedValue(mockProject);
    const result = await getProjectByIdService("123");
    expect(result).toEqual(mockProject);
  });

  it("should throw NotFoundError when project not found", async () => {
    (Project.findById as jest.Mock).mockResolvedValue(null);
    await expect(getProjectByIdService("999")).rejects.toThrow(NotFoundError);
  });

  // 🧩 recurateProjectService
  it("should update summary and curatedAt", async () => {
    process.env.GITHUB_USERNAME = "segun";

    (Project.findById as jest.Mock).mockResolvedValue(mockProject);
    (fetchRepoReadme as jest.Mock).mockResolvedValue("readme text");
    (summarizeReadme as jest.Mock).mockResolvedValue({ data: "short summary" });

    const result = await recurateProjectService("123");

    expect(fetchRepoReadme).toHaveBeenCalledWith("segun", "test-repo");
    expect(summarizeReadme).toHaveBeenCalledWith("readme text");
    expect(mockProject.save).toHaveBeenCalled();
    expect(result.summary).toBe("short summary");
  });

  // 🧩 updateProjectSummaryService
  it("should update project summary and curatedAt", async () => {
    (Project.findById as jest.Mock).mockResolvedValue(mockProject);

    const result = await updateProjectSummaryService("123", "updated summary");

    expect(mockProject.summary).toBe("updated summary");
    expect(mockProject.save).toHaveBeenCalled();
    expect(result).toEqual(mockProject);
  });

  it("should throw NotFoundError when updating summary of non-existent project", async () => {
    (Project.findById as jest.Mock).mockResolvedValue(null);
    await expect(updateProjectSummaryService("999", "summary")).rejects.toThrow(NotFoundError);
  });

  // 🧩 publishUpdatedProjectService
  it("should publish updated project successfully", async () => {
    process.env.GITHUB_USERNAME = "segun";
    process.env.GITHUB_PORTFOLIO_REPO = "portfolio";
    process.env.GITHUB_PORTFOLIO_PATH = "data/projects.json";
    process.env.GITHUB_PORTFOLIO_BRANCH = "main";

    (requestWithAuth as unknown as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          content: Buffer.from(
            JSON.stringify({ projects: [mockProject], generatedAt: new Date().toISOString() })
          ).toString("base64"),
          sha: "abc123",
        },
      })
      .mockResolvedValueOnce({ data: { commit: { sha: "newcommitsha" } } });

    (Project.findById as jest.Mock).mockResolvedValue(mockProject);

    const result = await publishUpdatedProjectService("123");

    expect(result).toEqual({ sha: "newcommitsha" });
  });
});
