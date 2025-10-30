import "dotenv/config";

import { Project } from "@/models/project.model";
import { NotFoundError } from "@/errors/httpError";
import { fetchRepoReadme, summarizeReadme } from "./githubFetcher";
import { requestWithAuth } from "@/config/octokit";
import { IProject, ProjectsFileData } from "@/types";

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

async function fetchProjectsFile() {
  const username = process.env.GITHUB_USERNAME!;
  const repoName = process.env.GITHUB_PORTFOLIO_REPO!;
  const projectsPath = process.env.GITHUB_PORTFOLIO_PATH!;
  const branch = process.env.GITHUB_PORTFOLIO_BRANCH!;

  try {
    const { data } = await requestWithAuth(
      `GET /repos/${username}/${repoName}/contents/${projectsPath}`,
      {
        ref: branch,
      }
    );
    const projectsFile = data;
    return projectsFile;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const err = error as { response?: { status?: number }; message?: string };
      if (err.response?.status === 404) return null;
      console.error(`Failed to fetch projects file for ${username}/${repoName}:`, err.message);
    } else {
      console.error(`Unknown error fetching projects file for ${username}/${repoName}:`, error);
    }
    return null;
  }
}

async function modifyProjectsFileWithUpdatedProject(id: string, encodedProjectsFile: string) {
  const project = await Project.findById(id);
  if (!project) throw new NotFoundError("Project not found");

  const projectsFileText = Buffer.from(encodedProjectsFile, "base64").toString("utf-8");
  if (!projectsFileText) return null;

  let projectsData: ProjectsFileData;
  try {
    projectsData = JSON.parse(projectsFileText);
  } catch (e) {
    console.error("Failed to parse projects file JSON:", e);
    return null;
  }

  const updatedProjects = Array.isArray(projectsData.projects)
    ? projectsData.projects.map((p: IProject) =>
        p.repoId === project.repoId
          ? { ...p, summary: project.summary, curatedAt: project.curatedAt }
          : p
      )
    : projectsData.projects;

  const updatedFile = {
    ...projectsData,
    projects: updatedProjects,
    generatedAt: new Date().toISOString(),
  };

  const base64Content = Buffer.from(JSON.stringify(updatedFile)).toString("base64");
  return base64Content;
}

async function commitUpdatedProjectsFile(id: string, sha: string, updatedBase64File: string) {
  const username = process.env.GITHUB_USERNAME!;
  const repoName = process.env.GITHUB_PORTFOLIO_REPO!;
  const projectsPath = process.env.GITHUB_PORTFOLIO_PATH!;
  const branch = process.env.GITHUB_PORTFOLIO_BRANCH!;

  const project = await Project.findById(id);
  if (!project) throw new NotFoundError("Project not found");

  const { data } = await requestWithAuth(
    `PUT /repos/${username}/${repoName}/contents/${projectsPath}`,
    {
      message: `Update summary for ${project.name}`,
      content: updatedBase64File,
      sha,
      branch,
    }
  );

  return data.commit;
}

export async function publishUpdatedProjectService(id: string) {
  const projectsFile = await fetchProjectsFile();
  const encodedProjectsFile = projectsFile.content;

  const updatedBase64File = await modifyProjectsFileWithUpdatedProject(id, encodedProjectsFile);
  if (!updatedBase64File) throw new Error("Failed to generate updated projects file");

  const commit = commitUpdatedProjectsFile(id, projectsFile.sha, updatedBase64File);
  return commit;
}

export async function updateProjectSummaryService(id: string, summary: string) {
  const project = await Project.findById(id);
  if (!project) throw new NotFoundError("Project not found");

  project.summary = summary;
  project.curatedAt = new Date();
  await project.save();

  return project;
}
