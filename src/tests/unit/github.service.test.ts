import { webhookService } from "@/services/github.service";
import { generateProjectsJson } from "@/scripts/generateProjectsJson";
import { updateProjectsFile } from "@/scripts/syncPortfolioData";

// Mock dependencies
jest.mock("@/scripts/generateProjectsJson", () => ({
  generateProjectsJson: jest.fn(),
}));

jest.mock("@/scripts/syncPortfolioData", () => ({
  updateProjectsFile: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("webhookService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_BASE_URL = "http://localhost:3000";
  });

  it("should do nothing if event is not 'push'", async () => {
    await webhookService("delete", "refs/heads/main");

    expect(fetch).not.toHaveBeenCalled();
    expect(generateProjectsJson).not.toHaveBeenCalled();
    expect(updateProjectsFile).not.toHaveBeenCalled();
  });

  it("should call manual sync, generateProjectsJson, and updateProjectsFile on push", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Manual sync complete" }),
    });

    await webhookService("push", "refs/heads/main");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/manual-sync",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(generateProjectsJson).toHaveBeenCalledTimes(1);
    expect(updateProjectsFile).toHaveBeenCalledTimes(1);
  });

  it("should handle manual sync failure (non-ok response)", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => "Error: Bad Request",
    });

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await webhookService("push", "refs/heads/main");

    expect(consoleErrorSpy).toHaveBeenCalledWith("Sync failed:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it("should retry fetch if it fails the first time", async () => {
    const fetchMock = fetch as jest.Mock;

    fetchMock.mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Manual sync complete" }),
    });

    await webhookService("push", "refs/heads/main");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(generateProjectsJson).toHaveBeenCalled();
    expect(updateProjectsFile).toHaveBeenCalled();
  });
});
