import { Project } from "@/models/project.model";
import { NotFoundError } from "@/errors/httpError";

export async function getAllProjectsService(skip: number, limit: number) {
  const [projects, total] = await Promise.all([
    Project.find().sort({ lastPushedAt: -1 }).skip(skip).limit(limit),
    Project.countDocuments(),
  ]);

  return { projects, total };
}

export async function getProjectByIdService(id: string) {
  const project = await Project.findById(id);

  if (!project) throw new NotFoundError("Project not found");

  return project;
}
