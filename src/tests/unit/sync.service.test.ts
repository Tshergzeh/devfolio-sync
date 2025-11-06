import { manualSyncService } from "@/services/sync.service";
import { fetchPortfolioRepos } from "@/services/githubFetcher";
import { BadRequestError } from "@/errors/httpError";

jest.mock("@/services/githubFetcher");
jest.mock("@/config/octokit", () => ({
  requestWithAuth: jest.fn(),
}));

describe("manualSyncService", () => {
  const mockFetchPortfolioRepos = fetchPortfolioRepos as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw BadRequestError if username is missing", async () => {
    await expect(manualSyncService("")).rejects.toThrow(BadRequestError);
    await expect(manualSyncService("")).rejects.toThrow("Username is required");
  });

  it("should call fetchPortfolioRepos with username and manualSync=true", async () => {
    mockFetchPortfolioRepos.mockResolvedValueOnce(undefined);

    const result = await manualSyncService("segun");

    expect(mockFetchPortfolioRepos).toHaveBeenCalledWith("segun", true);
    expect(result).toEqual({ message: "Manual sync completed for segun" });
  });

  it("should propagate errors from fetchPortfolioRepos", async () => {
    mockFetchPortfolioRepos.mockRejectedValueOnce(new Error("GitHub API failed"));

    await expect(manualSyncService("segun")).rejects.toThrow("GitHub API failed");
  });
});
