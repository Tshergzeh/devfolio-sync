import { Request, Response } from "express";
import {
  getAllProjectsService,
  getProjectByIdService,
  publishUpdatedProjectService,
  recurateProjectService,
  updateProjectSummaryService,
} from "@/services/project.service";

/**
 * @desc Get all projects (with optional pagination)
 * @route GET /api/projects
 */

export const getAllProjects = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const { projects, total } = await getAllProjectsService(skip, limit);

  res.status(200).json({
    data: projects,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  });
};

/**
 * @desc Get a single project by ID
 * @route GET /api/projects/:id
 */
export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await getProjectByIdService(id);
  res.status(200).json(project);
};

/**
 * @desc Recurate specific project summary
 * @route POST /api/projects/:id/recurate
 */
export const recurateProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await recurateProjectService(id);

  res.status(200).json({
    message: "Project successfully re-curated",
    data: project,
  });
};

/**
 * @desc Publish updated project
 * @route POST /api/projects/:id/publish
 */
export const publishUpdatedProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const commit = await publishUpdatedProjectService(id);

  res.status(200).json({
    message: "Project successfully published",
    data: commit,
  });
};

/**
 * @desc Manually update specific project summary
 * @route PUT /api/projects/:id
 */
export const updateProjectSummary = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { summary } = req.body;

  if (!summary || typeof summary !== "string") {
    return res.status(400).json({ error: "Summary is required and must be a string" });
  }

  const updatedProject = await updateProjectSummaryService(id, summary);
  res.status(200).json(updatedProject);
};
