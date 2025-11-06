import { Request, Response } from "express";
import { manualSync } from "@/controllers/sync.controller";
import { manualSyncService } from "@/services/sync.service";

jest.mock("@/services/sync.service");

jest.mock("@/config/octokit", () => ({
  requestWithAuth: jest.fn(),
}));

describe("manualSync controller", () => {
  const mockManualSyncService = manualSyncService as jest.Mock;

  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should call manualSyncService and return 200 with result", async () => {
    process.env.GITHUB_USERNAME = "testuser";
    const mockResult = { message: "Manual sync completed for testuser" };
    mockManualSyncService.mockResolvedValue(mockResult);

    await manualSync(req as Request, res as Response);

    expect(mockManualSyncService).toHaveBeenCalledWith("testuser");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it("should return 500 if GITHUB_USERNAME is missing", async () => {
    delete process.env.GITHUB_USERNAME;

    await manualSync(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to perform manual sync",
    });
  });

  it("should return 500 if manualSyncService throws an error", async () => {
    process.env.GITHUB_USERNAME = "testuser";
    mockManualSyncService.mockRejectedValue(new Error("Service error"));

    await manualSync(req as Request, res as Response);

    expect(mockManualSyncService).toHaveBeenCalledWith("testuser");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to perform manual sync",
    });
  });
});
