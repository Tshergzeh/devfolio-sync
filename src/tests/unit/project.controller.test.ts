/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import {
  getAllProjects,
  getProjectById,
  recurateProject,
  publishUpdatedProject,
  updateProjectSummary,
} from "@/controllers/project.controller";

import * as projectService from "@/services/project.service";

jest.mock("@/services/project.service");

jest.mock("@/config/octokit", () => ({
  requestWithAuth: jest.fn(),
}));

describe("project.controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    mockRes = { status: statusMock as any } as Response;
    jest.clearAllMocks();
  });

  describe("getAllProjects", () => {
    it("should return paginated projects", async () => {
      const mockProjects = [{ name: "Test Project" }];
      const mockTotal = 15;

      (projectService.getAllProjectsService as jest.Mock).mockResolvedValue({
        projects: mockProjects,
        total: mockTotal,
      });

      mockReq = { query: { page: "2", limit: "5" } };

      await getAllProjects(mockReq as Request, mockRes as Response);

      expect(projectService.getAllProjectsService).toHaveBeenCalledWith(5, 5);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        data: mockProjects,
        pagination: {
          total: mockTotal,
          page: 2,
          pages: 3,
          hasNextPage: true,
        },
      });
    });
  });

  describe("getProjectById", () => {
    it("should return a project by id", async () => {
      const mockProject = { _id: "123", name: "Project A" };
      (projectService.getProjectByIdService as jest.Mock).mockResolvedValue(mockProject);

      mockReq = { params: { id: "123" } };

      await getProjectById(mockReq as Request, mockRes as Response);

      expect(projectService.getProjectByIdService).toHaveBeenCalledWith("123");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockProject);
    });
  });

  describe("recurateProject", () => {
    it("should re-curate a project", async () => {
      const mockProject = { _id: "456", name: "Curated Project" };
      (projectService.recurateProjectService as jest.Mock).mockResolvedValue(mockProject);

      mockReq = { params: { id: "456" } };

      await recurateProject(mockReq as Request, mockRes as Response);

      expect(projectService.recurateProjectService).toHaveBeenCalledWith("456");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Project successfully re-curated",
        data: mockProject,
      });
    });
  });

  describe("publishUpdatedProject", () => {
    it("should publish an updated project", async () => {
      const mockCommit = { sha: "abc123" };
      (projectService.publishUpdatedProjectService as jest.Mock).mockResolvedValue(mockCommit);

      mockReq = { params: { id: "789" } };

      await publishUpdatedProject(mockReq as Request, mockRes as Response);

      expect(projectService.publishUpdatedProjectService).toHaveBeenCalledWith("789");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Project successfully published",
        data: mockCommit,
      });
    });
  });

  describe("updateProjectSummary", () => {
    it("should return 400 if summary is missing or invalid", async () => {
      mockReq = { params: { id: "999" }, body: {} };
      await updateProjectSummary(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Summary is required and must be a string",
      });
    });

    it("should update project summary successfully", async () => {
      const mockProject = { _id: "999", summary: "New summary" };
      (projectService.updateProjectSummaryService as jest.Mock).mockResolvedValue(mockProject);

      mockReq = { params: { id: "999" }, body: { summary: "New summary" } };

      await updateProjectSummary(mockReq as Request, mockRes as Response);

      expect(projectService.updateProjectSummaryService).toHaveBeenCalledWith("999", "New summary");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockProject);
    });
  });
});
