import { Project } from "@/models/project.model";

export async function getAllProjectsService(skip: number, limit: number) {
  const [projects, total] = await Promise.all([
    Project.find().sort({ lastPushedAt: -1 }).skip(skip).limit(limit),
    Project.countDocuments(),
  ]);

  return { projects, total };
}
