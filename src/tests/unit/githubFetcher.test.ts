import { fetchRepoReadme } from "@/services/githubFetcher";
import { requestWithAuth } from "@/config/octokit";

jest.mock("@/config/octokit", () => ({
  requestWithAuth: jest.fn(),
}));

describe("fetchRepoReadme", () => {
  const username = "segun";
  const repo = "test-repo";

  it("should decode and return README text when successful", async () => {
    const content = Buffer.from("Hello World").toString("base64");
    (requestWithAuth as unknown as jest.Mock).mockResolvedValueOnce({ data: { content } });

    const result = await fetchRepoReadme(username, repo);
    expect(result).toBe("Hello World");
  });

  it("should return null if README not found (404)", async () => {
    (requestWithAuth as unknown as jest.Mock).mockRejectedValueOnce({
      response: { status: 404 },
    });

    const result = await fetchRepoReadme(username, repo);
    expect(result).toBeNull();
  });

  it("should log and return null on other errors", async () => {
    const error = new Error("Network Error");
    (requestWithAuth as unknown as jest.Mock).mockRejectedValueOnce(error);

    const result = await fetchRepoReadme(username, repo);
    expect(result).toBeNull();
  });
});
