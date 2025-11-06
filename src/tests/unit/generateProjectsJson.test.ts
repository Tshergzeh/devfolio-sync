import fs from "fs";
import path from "path";
import axios from "axios";
import { generateProjectsJson } from "@/scripts/generateProjectsJson";

// 🧩 Mock external dependencies
jest.mock("axios");
jest.mock("fs", () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));
jest.spyOn(global.console, "log").mockImplementation(() => {});
jest.spyOn(global.console, "error").mockImplementation(() => {});

describe("generateProjectsJson", () => {
  const mockAxiosGet = axios.get as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch all projects and write to projects.json", async () => {
    // Mock API with pagination
    mockAxiosGet
      .mockResolvedValueOnce({
        data: {
          data: [{ repoId: 1, name: "Project One" }],
          pagination: { total: 2, page: 1, pages: 2, hasNextPage: true },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [{ repoId: 2, name: "Project Two" }],
          pagination: { total: 2, page: 2, pages: 2, hasNextPage: false },
        },
      });

    await generateProjectsJson();

    // ✅ API called for both pages
    expect(mockAxiosGet).toHaveBeenCalledTimes(2);
    expect(mockAxiosGet).toHaveBeenCalledWith(expect.stringContaining("?page=1"));
    expect(mockAxiosGet).toHaveBeenCalledWith(expect.stringContaining("?page=2"));

    // ✅ File creation
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining("public"), {
      recursive: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.join("public", "projects.json")),
      expect.stringContaining('"projects"'),
      "utf-8"
    );

    // ✅ Logs success
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("projects.json generated successfully")
    );
  });

  it("should handle API errors gracefully", async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error("Network error"));

    await generateProjectsJson();

    expect(console.error).toHaveBeenCalledWith(
      "Failed to generate projects.json:",
      expect.any(Error)
    );
  });

  it("should handle fs.writeFileSync errors gracefully", async () => {
    mockAxiosGet.mockResolvedValueOnce({
      data: {
        data: [{ repoId: 3, name: "Failing Project" }],
        pagination: { total: 1, page: 1, pages: 1, hasNextPage: false },
      },
    });
    (fs.writeFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Disk full");
    });

    await generateProjectsJson();

    expect(console.error).toHaveBeenCalledWith(
      "Failed to generate projects.json:",
      expect.any(Error)
    );
  });
});
