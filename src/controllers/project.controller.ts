import { Request, Response } from "express";
import { getAllProjectsService, getProjectByIdService } from "@/services/project.service";

/**
 * @desc Get all projects (with optional pagination)
 * @route GET /api/projects
 */

export const getAllProjects = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching projects" });
  }
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
