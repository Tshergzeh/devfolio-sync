import "dotenv/config";

import { Project } from "@/models/project.model";
import { NotFoundError } from "@/errors/httpError";
import { fetchRepoReadme, summarizeReadme } from "./githubFetcher";

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

export async function recurateProjectService(id: string) {
  const username = process.env.GITHUB_USERNAME!;
  const project = await Project.findById(id);
  if (!project) throw new NotFoundError("Project not found");

  const readmeText = await fetchRepoReadme(username, project.name);
  const summaryResponse = readmeText ? await summarizeReadme(readmeText) : "";
  const summary = summaryResponse?.data || "";

  project.summary = summary;
  project.curatedAt = new Date();
  await project.save();

  return project;
}
