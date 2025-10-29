import fs from "fs";
import path from "path";
import axios, { all } from "axios";
import { IProject, PaginatedResponse } from "@/types";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/";
const PORTFOLIO_BASE_URL = `${API_BASE_URL}/api/projects`;

async function fetchAllProjects(): Promise<IProject[]> {
  let allProjects: IProject[] = [];
  let page = 1;
  let hasNextPage = true;

  console.log("Fetching projects from API...");

  while (hasNextPage) {
    const { data } = await axios.get<PaginatedResponse>(`${PORTFOLIO_BASE_URL}?page=${page}`);

    allProjects = allProjects.concat(data.data);

    console.log(`Fetched page ${page}/${data.pagination.pages} (${data.data.length} projects)`);

    hasNextPage = data.pagination.hasNextPage;
    page += 1;
  }

  console.log(`Total projects fetched: ${allProjects.length}`);
  return allProjects;
}

export async function generateProjectsJson() {
  try {
    const projects = await fetchAllProjects();

    const outputPath = path.join(process.cwd(), "public", "projects.json");
    const jsonData = JSON.stringify({ projects, generatedAt: new Date().toISOString() }, null, 2);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, jsonData, "utf-8");

    console.log(`projects.json generated successfully at ${outputPath}`);
  } catch (error) {
    console.error("Failed to generate projects.json:", error);
  }
}
